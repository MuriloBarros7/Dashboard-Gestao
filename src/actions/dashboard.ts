/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

/**
 * Concentra e calcula as métricas consolidadas da fábrica para renderização do dashboard principal.
 * Utiliza transação concorrente paralela do Prisma para extrair receitas agregadas, contagem
 * de ordens, volume de carteira de clientes e monitoramento preditivo de estoque baixo em uma só chamada,
 * garantindo o isolamento multi-tenant por usuário autenticado.
 */
export async function getDashboardMetrics() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        revenue: 0,
        ordersCount: 0,
        clientsCount: 0,
        criticalStockCount: 0,
        lowStockProducts: [],
      };
    }

    // Executa todas as agregações em paralelo no banco local isoladas por usuário
    const [aggregateTotal, totalOrders, totalClients, lowStockProducts] =
      await (prisma as any).$transaction([
        // 1. Soma o faturamento bruto real considerando APENAS os pedidos concluídos/faturados ('DELIVERED')
        (prisma.order as any).aggregate({
          where: {
            userId: session.userId,
            status: "DELIVERED",
          },
          _sum: {
            total: true,
          },
        }),
        // 2. Conta o volume total de ordens de venda emitidas pelo usuário (inclui em andamento)
        (prisma.order as any).count({
          where: { userId: session.userId },
        }),
        // 3. Conta a carteira de clientes B2B cadastrados do usuário
        (prisma.client as any).count({
          where: { userId: session.userId },
        }),
        // 4. Busca produtos com menos de 15 unidades no inventário local do usuário
        (prisma.product as any).findMany({
          where: {
            userId: session.userId,
            stock: {
              lt: 15,
            },
          },
          select: {
            name: true,
            stock: true,
          },
          orderBy: {
            stock: "asc",
          },
        }),
      ]);

    return {
      revenue: Number(aggregateTotal._sum?.total || 0),
      ordersCount: totalOrders,
      clientsCount: totalClients,
      criticalStockCount: lowStockProducts.length,
      lowStockProducts,
    };
  } catch (error) {
    console.error("Erro ao calcular métricas do dashboard:", error);
    return {
      revenue: 0,
      ordersCount: 0,
      clientsCount: 0,
      criticalStockCount: 0,
      lowStockProducts: [],
    };
  }
}
