/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Schema de validação Zod para os dados institucionais e de contato da empresa.
 * Garante tamanho mínimo para a Razão Social e Nome Fantasia, valida o tamanho básico do CNPJ
 * e aceita strings de e-mail padronizadas ou literais vazios de forma controlada.
 */
const settingsSchema = z.object({
  companyName: z
    .string()
    .min(3, "A Razão Social deve ter pelo menos 3 caracteres"),
  tradeName: z
    .string()
    .min(3, "O Nome Fantasia deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  address: z.string().optional(),
});

/**
 * Recupera o registro de configurações institucionais do usuário autenticado no banco de dados.
 * Caso nenhum registro exista (primeiro acesso do usuário logado), cria automaticamente
 * uma linha padrão contendo os dados iniciais pré-definidos para assegurar a consistência da UI.
 */
export async function getCompanySettingsAction() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return null;
    }

    // Busca as configurações especificamente do usuário autenticado
    let settings = await (prisma as any).companySettings.findFirst({
      where: { userId: session.userId },
    });

    if (!settings) {
      settings = await (prisma as any).companySettings.create({
        data: {
          userId: session.userId,
          companyName: "Minha Empresa LTDA",
          tradeName: "Minha Empresa",
          cnpj: "00.000.000/0001-00",
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return null;
  }
}

/**
 * Salva ou atualiza os dados corporativos da empresa na base de dados a partir de um FormData.
 * Coleta os parâmetros, valida com o settingsSchema e verifica a existência prévia do registro:
 * realiza um update se ele já existir ou cria uma nova linha caso o banco esteja vazio,
 * garantindo sempre o vínculo com o userId logado.
 */
export async function updateCompanySettingsAction(formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    companyName: formData.get("companyName") as string,
    tradeName: formData.get("tradeName") as string,
    cnpj: formData.get("cnpj") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
  };

  const validatedFields = settingsSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const currentSettings = await (prisma as any).companySettings.findFirst({
      where: { userId: session.userId },
    });

    if (currentSettings) {
      await (prisma as any).companySettings.update({
        where: { id: currentSettings.id },
        data: validatedFields.data,
      });
    } else {
      await (prisma as any).companySettings.create({
        data: {
          ...validatedFields.data,
          userId: session.userId,
        },
      });
    }

    revalidatePath("/configuracoes");
    return { success: true, errors: {} };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return {
      success: false,
      errors: { global: ["Erro interno ao salvar dados."] },
    };
  }
}
