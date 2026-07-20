/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

/**
 * Consolida os dados analíticos de desempenho comercial e balanceamento de estoque da fábrica.
 * A função aceita um escopo opcional de competência mensal ("YYYY-MM"), isolando de forma
 * robusta o início e o fim do período em horário local para gerar métricas de faturamento real/projetado,
 * ticket médio B2B, top 5 produtos campeões de vendas e alertas de estoque crítico,
 * garantindo o isolamento multi-tenant por usuário autenticado.
 */
export async function getSalesReportDataAction(month?: string) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        metrics: {
          totalRevenue: 0,
          pendingRevenue: 0,
          totalOrdersCount: 0,
          completedOrdersCount: 0,
          averageOrderValue: 0,
        },
        topProducts: [],
        criticalStockProducts: [],
      };
    }

    const whereClause: any = {
      userId: session.userId,
    };

    // Se um mês específico for selecionado (Formato: "YYYY-MM"), aplica o escopo temporal robusto
    if (month) {
      const [year, monthStr] = month.split("-");
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(monthStr, 10) - 1; // Meses no JavaScript começam em 0 (Janeiro = 0)

      // Define o primeiro milissegundo do mês em horário local puro
      const startDate = new Date(yearNum, monthNum, 1, 0, 0, 0, 0);

      // Define o último milissegundo do mês correspondente em horário local puro
      const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // 1. Busca os pedidos do usuário filtrados pela competência temporal selecionada
    const orders = await (prisma.order as any).findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // 2. Busca o estado atual dos produtos do usuário para monitoramento de estoque crítico
    const products = await (prisma.product as any).findMany({
      where: {
        userId: session.userId,
      },
    });

    // Instancia os acumuladores de faturamento
    let totalRevenue = 0; // Concluídos (Faturamento Real)
    let pendingRevenue = 0; // Em andamento (Faturamento Projetado)
    const totalOrdersCount = orders.length;
    let completedOrdersCount = 0;

    // Mapa para consolidar os produtos campeões de vendas no período
    const productSalesMap: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    orders.forEach((order: any) => {
      const orderTotal = Number(order.total);

      if (order.status === "DELIVERED") {
        totalRevenue += orderTotal;
        completedOrdersCount++;

        // Contabiliza itens vendidos apenas de pedidos concluídos
        order.items?.forEach((item: any) => {
          const prodId = item.productId;
          const qty = Number(item.quantity);
          const itemRevenue = Number(item.price) * qty;
          const prodName = item.product?.name || "Produto Removido";

          if (!productSalesMap[prodId]) {
            productSalesMap[prodId] = {
              name: prodName,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[prodId].quantity += qty;
          productSalesMap[prodId].revenue += itemRevenue;
        });
      } else if (order.status === "PENDING") {
        pendingRevenue += orderTotal;
      }
    });

    // Transforma o mapa de produtos em uma lista ordenada pelos mais vendidos
    const topProducts = Object.values(productSalesMap)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5); // Retorna o Top 5 do período isolado

    // Identifica produtos com estoque zerado ou em estado crítico (menos de 10 unidades)
    const criticalStockProducts = products
      .filter((p: any) => Number(p.stock || 0) <= 10)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: Number(p.stock || 0),
      }));

    return {
      metrics: {
        totalRevenue,
        pendingRevenue,
        totalOrdersCount,
        completedOrdersCount,
        averageOrderValue:
          completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0,
      },
      topProducts,
      criticalStockProducts,
    };
  } catch (error) {
    console.error("Erro ao gerar dados do relatório:", error);
    return {
      metrics: {
        totalRevenue: 0,
        pendingRevenue: 0,
        totalOrdersCount: 0,
        completedOrdersCount: 0,
        averageOrderValue: 0,
      },
      topProducts: [],
      criticalStockProducts: [],
    };
  }
}
