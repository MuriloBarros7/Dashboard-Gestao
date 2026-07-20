/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesReportDataAction } from "@/src/actions/report";
import {
  DollarSign,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  PackageCheck,
  RefreshCw,
  FileDown,
  Calendar,
} from "lucide-react";

/**
 * Client Component de página para apresentação do relatório executivo de desempenho.
 * Agrupa indicadores chave (KPIs) de faturamento real/projetado, volume de ordens e ticket médio B2B.
 * Exibe o ranking de produtos mais vendidos e alertas de estoque crítico com opção de exportação em PDF.
 */
export default function RelatoriosPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [reportMonth, setReportMonth] = useState<string>("2026-07");

  // Encapsulado em useCallback para evitar loops de renderização
  const loadReport = useCallback(async (month: string) => {
    try {
      const data = await getSalesReportDataAction(month);
      setReportData(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport(reportMonth);
    }, 0);

    return () => clearTimeout(timer);
  }, [reportMonth, loadReport]);

  async function handleDownloadPDF() {
    setIsExporting(true);
    try {
      window.location.href = `/api/reports/pdf?month=${reportMonth}`;
    } catch (error) {
      console.error("Erro ao tentar baixar PDF:", error);
      alert("Ocorreu um erro interno ao exportar o documento.");
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  }

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
          <span>Consolidando métricas e movimentações...</span>
        </div>
      </div>
    );
  }

  // Fallback seguro para evitar erros de propriedade undefined
  const { metrics, topProducts, criticalStockProducts } = reportData || {
    metrics: {
      totalRevenue: 0,
      pendingRevenue: 0,
      completedOrdersCount: 0,
      totalOrdersCount: 0,
      averageOrderValue: 0,
    },
    topProducts: [],
    criticalStockProducts: [],
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background text-foreground">
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Relatórios de Desempenho
          </h2>
          <p className="text-sm text-muted-foreground">
            Análise comercial e balanço de estoque em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* CONTROLE FILTRO TEMPORAL MENSAL */}
          <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 shadow-sm border-input">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer text-foreground"
            >
              <option value="">Todos os Períodos</option>
              <option value="2026-07">Julho / 2026</option>
              <option value="2026-06">Junho / 2026</option>
              <option value="2026-05">Maio / 2026</option>
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Gerando
                PDF...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsLoading(true);
              loadReport(reportMonth);
            }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
          </button>
        </div>
      </div>

      {/* --- CARDS DE PERFORMANCE FINANCEIRA --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Faturamento Real
            </p>
            <div className="text-2xl font-bold text-green-600 font-mono">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos faturados e entregues
            </p>
          </div>
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Faturamento Projetado
            </p>
            <div className="text-2xl font-bold text-yellow-600 font-mono">
              {formatCurrency(metrics.pendingRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos em andamento na carteira
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-yellow-600" />
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Volume de Vendas
            </p>
            <div className="text-2xl font-bold">
              {metrics.completedOrdersCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {metrics.totalOrdersCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ordens concluídas vs total criado
            </p>
          </div>
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Ticket Médio B2B
            </p>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por contrato fechado
            </p>
          </div>
          <PackageCheck className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* --- PRODUTOS MAIS VENDIDOS --- */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Top 5 Produtos Campeões
            </h3>
            <p className="text-sm text-muted-foreground">
              Itens com maior saída em volume e receita gerada.
            </p>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhuma venda faturada para análise no período.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {index + 1}. {prod.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prod.quantity} unidades despachadas
                    </p>
                  </div>
                  <div className="text-sm font-semibold font-mono text-foreground">
                    {formatCurrency(prod.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- ALERTAS DE ESTOQUE CRÍTICO --- */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Estoque Alerta / Crítico
              </h3>
              <p className="text-sm text-muted-foreground">
                Produtos com 10 unidades ou menos disponíveis no depósito.
              </p>
            </div>
          </div>
          {criticalStockProducts.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm font-medium">
              ✓ Todos os produtos encontram-se com níveis estáveis de estoque.
            </div>
          ) : (
            <div className="space-y-2 max-h-55 overflow-y-auto pr-1">
              {criticalStockProducts.map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 bg-red-50/50 border border-red-100 rounded-lg"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {prod.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${prod.stock === 0 ? "bg-red-200 text-red-900" : "bg-yellow-200 text-yellow-900"}`}
                  >
                    {prod.stock === 0 ? "ZERADO" : `${prod.stock} un`}
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
