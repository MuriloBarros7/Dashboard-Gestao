/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/lib/auth";

/**
 * Consulta e consolida o fluxo de caixa da empresa com base em um escopo temporal (7d, 30d, 90d ou ano).
 * Esta função busca as movimentações manuais e injeta dinamicamente os pedidos faturados ('DELIVERED')
 * como entradas virtuais, ordenando tudo de forma cronológica para compor o extrato e o balanço líquido,
 * garantindo o isolamento multi-tenant por usuário autenticado.
 */
export async function getFinancialDataAction(period: string) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        transactions: [],
        summary: { incomes: 0, expenses: 0, balance: 0 },
      };
    }

    const now = new Date();
    let startDate = new Date();

    // Aplica a lógica de filtragem por tempo
    if (period === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(now.getDate() - 90);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1); // 1º de Janeiro
    } else {
      startDate.setDate(now.getDate() - 30); // Padrão: 30 dias
    }

    // 1. Busca as movimentações financeiras manuais do caixa filtradas pelo usuário
    const transactions = await (prisma as any).financialTransaction.findMany({
      where: {
        userId: session.userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: "desc" },
    });

    // 2. Busca os pedidos B2B CONCLUÍDOS do mesmo período e do mesmo usuário
    const orders = await (prisma as any).order.findMany({
      where: {
        userId: session.userId,
        status: "DELIVERED",
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let totalIncomes = 0;
    let totalExpenses = 0;

    // 3. Serializa as transações manuais e soma os acumulados
    const serializedTransactions = transactions.map((t: any) => {
      const amountNum = Number(t.amount);
      if (t.type === "INCOME") totalIncomes += amountNum;
      if (t.type === "EXPENSE") totalExpenses += amountNum;

      return {
        id: t.id,
        description: t.description,
        amount: amountNum,
        type: t.type,
        category: t.category,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
      };
    });

    // 4. Converte os pedidos faturados em entradas virtuais do extrato financeiro
    orders.forEach((order: any) => {
      const orderAmount = Number(order.total);
      totalIncomes += orderAmount; // Soma direto no painel de Entradas do período

      serializedTransactions.push({
        id: order.id,
        description: `Fat. Pedido — ${order.client?.name || "Cliente Corporativo"}`,
        amount: orderAmount,
        type: "INCOME",
        category: "SALE",
        date: order.createdAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
      });
    });

    // 5. Reordena tudo por data decrescente para manter o extrato cronológico correto
    serializedTransactions.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return {
      transactions: serializedTransactions,
      summary: {
        incomes: totalIncomes,
        expenses: totalExpenses,
        balance: totalIncomes - totalExpenses,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar transações financeiras:", error);
    return {
      transactions: [],
      summary: { incomes: 0, expenses: 0, balance: 0 },
    };
  }
}

/**
 * Cria um novo lançamento financeiro (Receita ou Despesa) manualmente no caixa,
 * associando a transação ao usuário logado na sessão.
 */
export async function createTransactionAction(formData: FormData) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const description = formData.get("description") as string;
    const amount = formData.get("amount") as string;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const dateStr = formData.get("date") as string;

    await (prisma as any).financialTransaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: dateStr ? new Date(dateStr) : new Date(),
        userId: session.userId, // <--- Conecta ao usuário autenticado (Multi-tenant)
      },
    });

    revalidatePath("/dashboard/financial");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar transação financeira:", error);
    return { success: false };
  }
}

/**
 * Atualiza os dados de uma movimentação financeira existente na base de dados.
 */
export async function updateTransactionAction(id: string, formData: FormData) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const description = formData.get("description") as string;
    const amount = formData.get("amount") as string;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const dateStr = formData.get("date") as string;

    await (prisma as any).financialTransaction.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount.replace(",", ".")),
        type,
        category,
        date: dateStr ? new Date(dateStr) : new Date(),
      },
    });

    revalidatePath("/dashboard/financial");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar transação financeira:", error);
    return { success: false };
  }
}

/**
 * Remove em definitivo uma transação financeira do caixa a partir de seu ID único.
 * Trata exclusões manuais e descarta de forma limpa os registros virtuais de pedidos.
 */
export async function deleteTransactionAction(id: string) {
  try {
    // Tenta deletar diretamente da tabela de transações manuais
    await (prisma as any).financialTransaction.delete({
      where: { id },
    });

    revalidatePath("/dashboard/financial");
    return { success: true };
  } catch (error: any) {
    // Se o registro não for encontrado na tabela de transações (ex: IDs de pedidos virtuais),
    // tratamos como sucesso para que a interface remova o item da lista visualmente sem erros.
    if (error.code === "P2025") {
      revalidatePath("/dashboard/financial");
      return { success: true };
    }

    console.error("Erro ao excluir transação:", error);
    return { success: false, error: "Não foi possível excluir o registro." };
  }
}
