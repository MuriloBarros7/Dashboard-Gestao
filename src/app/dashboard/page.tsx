/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getDashboardMetrics } from "@/src/actions/dashboard";
import { getCompanySettingsAction } from "@/src/actions/settings";
import {
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

/**
 * Client Component de página principal (Home Operacional do Dashboard).
 * Consolida e exibe em tempo real as métricas executivas da fábrica: faturamento acumulado,
 * tamanho da carteira de clientes, volume de ordens emitidas, alertas visuais para produtos
 * com estoque crítico (< 15 unidades) e atalhos de navegação para os módulos do ERP.
 * Exibe a mensagem de boas-vindas personalizada com o Nome Fantasia / Razão Social da empresa.
 */
export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [, setCompanyName] = useState<string>("Empresa");
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboardData() {
    setIsLoading(true);

    // Executa as chamadas em paralelo para otimizar o tempo de carregamento
    const [metrics, settings] = await Promise.all([
      getDashboardMetrics(),
      getCompanySettingsAction(),
    ]);

    // Define o nome de exibição priorizando Nome Fantasia > Razão Social > Fallback
    const displayName =
      settings?.tradeName || settings?.companyName || "Empresa";

    setCompanyName(displayName);
    setData(metrics);
    setIsLoading(false);
  }

  useEffect(() => {
    (async () => {
      await loadDashboardData();
    })();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando painel operacional...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            ✨ Core ERP • Sistema de Gestão
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Painel de Controle
          </h2>
          <p className="text-sm text-muted-foreground">
            Visão geral do faturamento, carteira e inventário comercial.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Painel
        </button>
      </div>

      {/* GRID DE KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: FATURAMENTO REAL */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Faturamento Acumulado
            </p>
            <div className="text-2xl font-bold text-green-600 font-mono">
              {formatCurrency(data?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bruto faturado
            </p>
          </div>
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>

        {/* CARD 2: CARTEIRA DE CLIENTES INTEGRADO À PASTA REAL */}
        <Link
          href="/dashboard/clients"
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground group-hover:text-primary transition-colors">
              Carteira de Clientes
            </p>
            <div className="text-2xl font-bold">{data?.clientsCount || 0}</div>
            <p className="text-xs text-primary font-medium flex items-center gap-0.5 mt-1">
              Ver sub-abas ativos / inativos{" "}
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        {/* CARD 3: VOLUME DE ORDENS */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Volume de Vendas
            </p>
            <div className="text-2xl font-bold">{data?.ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de ordens emitidas
            </p>
          </div>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* CARD 4: ALERTAS DE ESTOQUE CRÍTICO */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Alertas de Estoque
            </p>
            <div
              className={`text-2xl font-bold ${data?.criticalStockCount > 0 ? "text-red-600" : "text-foreground"}`}
            >
              {data?.criticalStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens com estoque baixo (&lt; 15 un)
            </p>
          </div>
          <AlertTriangle
            className={`h-5 w-5 ${data?.criticalStockCount > 0 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ATALHOS OPERACIONAIS */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 md:col-span-2">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Atalhos Operacionais
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse rapidamente os módulos de gerenciamento.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/orders"
              className="group flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/70 transition-all"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  Lançar Novo Pedido
                </span>
                <p className="text-xs text-muted-foreground">
                  Faturar e dar baixa automática
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/relatorios"
              className="group flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/70 transition-all"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  Ver Relatórios Analíticos
                </span>
                <p className="text-xs text-muted-foreground">
                  Auditar ticket médio e ranking
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ALERTA DE PRODUÇÃO / ESTOQUE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight flex items-center gap-1.5 text-foreground">
              <AlertTriangle className="h-4 w-4 text-yellow-500" /> Atenção na
              Produção
            </h3>
            <p className="text-xs text-muted-foreground pt-1">
              Repor estoque imediatamente.
            </p>
          </div>

          {!data?.lowStockProducts || data.lowStockProducts.length === 0 ? (
            <p className="text-xs text-green-600 bg-green-50 p-2.5 rounded border border-green-100 font-medium">
              ✓ Estoque totalmente regulado.
            </p>
          ) : (
            <div className="space-y-2 max-h-35 overflow-y-auto pr-1">
              {data.lowStockProducts.map((prod: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 bg-muted/50 border rounded"
                >
                  <span className="font-medium truncate max-w-35">
                    {prod.name}
                  </span>
                  <span className="font-mono bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">
                    {prod.stock} un
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
