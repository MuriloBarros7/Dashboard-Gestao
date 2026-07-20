/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Schema de validação Zod para os dados cadastrais do cliente comercial.
 * Garante a integridade de tipos e regras de tamanho mínimo para campos obrigatórios
 * e permite valores vazios/nulos controlados para campos opcionais (CNPJ e E-mail).
 */
// Schema ajustado para validação sem transformações conflitantes
const clientSchema = z.object({
  name: z.string().min(3, "O nome do cliente deve ter pelo menos 3 caracteres"),
  cnpj: z
    .string()
    .min(11, "Documento inválido")
    .optional()
    .nullable()
    .or(z.string().length(0)),
  email: z
    .string()
    .email("Endereço de e-mail inválido")
    .optional()
    .nullable()
    .or(z.string().length(0)),
  phone: z.string().min(8, "Telefone inválido"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

/**
 * Recupera todos os clientes da carteira cadastrada pertencentes ao usuário autenticado.
 * Retorna os registros ordenados de forma alfabética crescente pelo nome.
 */
export async function getClientsAction() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return [];
    }

    return await (prisma.client as any).findMany({
      where: {
        userId: session.userId,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
}

/**
 * Cria um novo registro de cliente na base de dados vinculado ao usuário autenticado.
 * Coleta os campos brutos, executa o safeParse contra o schema Zod e,
 * em caso de sucesso, persiste no banco tratando erros de violação de chave única (CNPJ).
 */
export async function createClientAction(formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    name: formData.get("name") as string,
    cnpj: (formData.get("cnpj") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: formData.get("phone") as string,
    status: (formData.get("status") as string) || "ACTIVE",
  };

  const validatedFields = clientSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    await (prisma.client as any).create({
      data: {
        name: data.name,
        cnpj: data.cnpj || null,
        email: data.email || null,
        phone: data.phone,
        status: data.status,
        userId: session.userId,
      },
    });

    revalidatePath("/dashboard/clients");
    return { success: true, errors: {} };
  } catch (error: any) {
    console.error("DEBUGER - Erro ao cadastrar cliente:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        errors: { cnpj: ["Este CNPJ já está cadastrado no sistema."] },
      };
    }
    return {
      success: false,
      errors: {
        global: [
          `Erro no banco: ${error.message || "Verifique as constraints"}`,
        ],
      },
    };
  }
}

/**
 * Atualiza os dados cadastrais e de status de um cliente existente com base em seu ID,
 * garantindo o isolamento de pertença ao usuário autenticado.
 */
export async function updateClientAction(id: string, formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    name: formData.get("name") as string,
    cnpj: (formData.get("cnpj") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: formData.get("phone") as string,
    status: formData.get("status") as string,
  };

  const validatedFields = clientSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    await (prisma.client as any).updateMany({
      where: {
        id,
        userId: session.userId,
      },
      data: {
        name: data.name,
        cnpj: data.cnpj || null,
        email: data.email || null,
        phone: data.phone,
        status: data.status,
      },
    });

    revalidatePath("/dashboard/clients");
    return { success: true, errors: {} };
  } catch (error: any) {
    console.error("DEBUGER - Erro ao atualizar cliente:", error);
    return {
      success: false,
      errors: { global: [`Erro ao atualizar: ${error.message}`] },
    };
  }
}

/**
 * Remove um cliente do banco de dados utilizando o identificador único e validando o usuário.
 * Ao finalizar com sucesso, força a atualização da rota do dashboard de clientes.
 */
export async function deleteClientAction(id: string) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Sessão inválida ou não autorizada.",
      };
    }

    await (prisma.client as any).deleteMany({
      where: {
        id,
        userId: session.userId,
      },
    });

    revalidatePath("/dashboard/clients");
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro interno ao remover o cliente.",
    };
  }
}
