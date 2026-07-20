/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Schema de validação Zod para os dados cadastrais do catálogo de produtos.
 * Preprocessa os valores de preço e estoque enviados via formulário para convertê-los
 * em tipos numéricos válidos e garantir restrições de valores positivos e não-negativos.
 */
const productSchema = z.object({
  name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres"),
  price: z.preprocess(
    (val) => Number(val),
    z.number().positive("O preço deve ser um valor maior que zero"),
  ),
  stock: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative("O estoque não pode ser negativo"),
  ),
});

/**
 * Busca todos os produtos ativos do inventário do usuário autenticado no banco de dados.
 * Transforma o tipo Decimal interno do banco para o tipo Number do JavaScript,
 * sanitizando os dados para consumo sem erros por parte de React Client Components.
 */
// 1. AÇÃO: Buscar catálogo de produtos completo (Isolado por Usuário)
export async function getProductsAction() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return [];
    }

    const products = await (prisma.product as any).findMany({
      where: {
        userId: session.userId,
      },
      orderBy: { name: "asc" },
    });

    // Converte o tipo Decimal do Prisma para Number antes de enviar ao Client Component
    return products.map((product: any) => ({
      ...product,
      id: product.id,
      price: Number(product.price),
      stock: Number(product.stock || 0),
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar e serializar produtos:", error);
    return [];
  }
}

/**
 * Cadastra um novo produto na base de dados vinculando ao usuário autenticado.
 * Valida os dados brutos de entrada contra o productSchema e realiza a persistência física.
 * Ao finalizar, limpa o cache da rota do catálogo de produtos para refletir a adição.
 */
// 2. AÇÃO: Criar Novo Produto (Isolado por Usuário)
export async function createProductAction(formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    name: formData.get("name") as string,
    price: formData.get("price"),
    stock: formData.get("stock"),
  };

  const validatedFields = productSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, price, stock } = validatedFields.data;

  try {
    await (prisma.product as any).create({
      data: {
        name,
        price,
        stock,
        userId: session.userId,
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true, errors: {} };
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    return {
      success: false,
      errors: { global: ["Erro interno ao salvar o produto no catálogo."] },
    };
  }
}

/**
 * Edita as informações de um produto existente no catálogo local por meio do seu ID único,
 * garantindo que o produto pertença ao usuário logado.
 */
// 3. AÇÃO: Atualizar / Editar Produto Existente (Isolado por Usuário)
export async function updateProductAction(id: string, formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    name: formData.get("name") as string,
    price: formData.get("price"),
    stock: formData.get("stock"),
  };

  const validatedFields = productSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, price, stock } = validatedFields.data;

  try {
    await (prisma.product as any).updateMany({
      where: {
        id,
        userId: session.userId,
      },
      data: {
        name,
        price,
        stock,
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true, errors: {} };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return {
      success: false,
      errors: { global: ["Erro interno ao atualizar o produto no catálogo."] },
    };
  }
}

/**
 * Remove um item do catálogo de produtos garantindo o isolamento pelo ID do usuário.
 * Dispara a revalidação imediata do cache de renderização no path do inventário.
 */
// 4. AÇÃO: Excluir Produto (Isolado por Usuário)
export async function deleteProductAction(id: string) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Sessão inválida ou não autorizada.",
      };
    }

    await (prisma.product as any).deleteMany({
      where: {
        id,
        userId: session.userId,
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return {
      success: false,
      error: "Erro interno ao remover o produto do catálogo.",
    };
  }
}
