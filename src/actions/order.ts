/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Schema de validação Zod para os dados de entrada de um pedido.
 * Valida os identificadores únicos (UUID) do cliente e do produto,
 * bem como a quantidade mínima vendida e os estados válidos de status.
 */
const orderSchema = z.object({
  clientId: z.string().uuid("Selecione um cliente válido"),
  productId: z.string().uuid("Selecione um produto válido"),
  quantity: z.number().int().min(1, "A quantidade mínima é 1"),
  status: z.enum(["PENDING", "DELIVERED", "CANCELED"]).default("PENDING"),
});

/**
 * Recupera e serializa todos os pedidos cadastrados na base de dados pertencentes ao usuário autenticado.
 * Inclui os relacionamentos de cliente e itens de produto, convertendo os campos do tipo
 * Decimal do Prisma e instâncias de Date para tipos primitivos aceitos por Client Components.
 */
export async function getOrdersAction() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return [];
    }

    const orders = await (prisma.order as any).findMany({
      where: {
        userId: session.userId,
      },
      include: {
        client: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sanitiza e converte os objetos Decimal/Date em tipos simples aceitos pelo React Client Components
    return orders.map((order: any) => ({
      ...order,
      id: order.id,
      clientId: order.clientId,
      total: Number(order.total), // Converte o Decimal do total para Number comum
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      client: order.client
        ? {
            ...order.client,
            id: order.client.id,
          }
        : null,
      items: order.items.map((item: any) => ({
        ...item,
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price), // Converte o Decimal do preço do item para Number comum
        product: item.product
          ? {
              ...item.product,
              id: item.product.id,
              price: Number(item.product.price), // Garante que o preço dentro do produto também vire Number
              stock: Number(item.product.stock || 0),
            }
          : null,
      })),
    }));
  } catch (error) {
    console.error("Erro ao buscar e serializar pedidos:", error);
    return [];
  }
}

/**
 * Registra um novo pedido B2B de forma atômica no banco de dados para o usuário autenticado.
 * Executa uma transação que verifica a existência do produto, valida o limite de estoque
 * disponível se o status inicial for 'DELIVERED', calcula o total e decrementa o inventário.
 */
export async function createOrderAction(formData: FormData) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      errors: { global: ["Sessão inválida ou não autorizada."] },
    };
  }

  const rawFields = {
    clientId: formData.get("clientId") as string,
    productId: formData.get("productId") as string,
    quantity: Number(formData.get("quantity")),
    status: (formData.get("status") as string) || "PENDING",
  };

  const validatedFields = orderSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { clientId, productId, quantity, status } = validatedFields.data;

  try {
    await (prisma as any).$transaction(async (tx: any) => {
      const product = await tx.product.findFirst({
        where: { id: productId, userId: session.userId },
      });
      if (!product) throw new Error("Produto não encontrado.");

      if (status === "DELIVERED" && product.stock < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
      }

      const totalCalculated = Number(product.price) * quantity;

      const order = await tx.order.create({
        data: {
          clientId,
          total: totalCalculated,
          status,
          userId: session.userId,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId,
          quantity,
          price: product.price,
        },
      });

      if (status === "DELIVERED") {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
      }

      return order;
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true, errors: {} };
  } catch (error: any) {
    console.error("Erro na transação de pedido:", error);
    return {
      success: false,
      errors: {
        global: [error.message || "Erro ao processar baixa de estoque."],
      },
    };
  }
}

/**
 * Atualiza o status de transição de um pedido específico (PENDING, DELIVERED, CANCELED).
 * Roda dentro de uma transação de banco controlando os estornos de estoque caso um pedido
 * seja cancelado, ou realizando baixas tardias de inventário no momento da conclusão,
 * validando que a ordem pertence ao usuário autenticado.
 */
export async function updateOrderStatusAction(
  id: string,
  nextStatus: "PENDING" | "DELIVERED" | "CANCELED",
) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return { success: false, error: "Sessão inválida ou não autorizada." };
    }

    await (prisma as any).$transaction(async (tx: any) => {
      const order = await tx.order.findFirst({
        where: { id, userId: session.userId },
        include: { items: true },
      });

      if (!order) throw new Error("Pedido não encontrado");
      if (order.status === nextStatus) return;

      if (nextStatus === "DELIVERED") {
        for (const item of order.items) {
          const prod = await tx.product.findFirst({
            where: { id: item.productId, userId: session.userId },
          });
          if (!prod || prod.stock < item.quantity)
            throw new Error(
              `Estoque insuficiente para o produto ${prod?.name || ""}`,
            );

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      if (order.status === "DELIVERED" && nextStatus === "CANCELED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id },
        data: { status: nextStatus },
      });
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove fisicamente uma ordem de venda baseada em seu ID identificador,
 * garantindo o pertencimento ao usuário logado.
 */
export async function deleteOrderAction(id: string) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return { success: false, error: "Sessão inválida ou não autorizada." };
    }

    await (prisma.order as any).deleteMany({
      where: { id, userId: session.userId },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: "Erro ao deletar." };
  }
}
