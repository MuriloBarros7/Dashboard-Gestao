"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getOrdersAction } from "@/src/actions/order";
import { Printer, FileText, Factory } from "lucide-react";

/**
 * Client Component de página para emissão do Livro de Registro e Relatórios Gerenciais.
 * Estruturado com regras de CSS de mídia de impressão ('print:*') para alternar entre
 * o modo de visualização em tela e a formatação oficial de documento impresso/PDF
 * disparado nativamente por 'window.print()'.
 */
export default function ReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);

  // Carrega a listagem de ordens de venda direta para consolidar o relatório
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getOrdersAction();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Erro ao carregar relatório gerencial:", error);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return "-";
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Cabeçalho - Escondido na impressão */}
      <div className="flex items-center justify-between space-y-2 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Relatórios Gerenciais
          </h2>
          <p className="text-sm text-muted-foreground">
            Exporte e imprima o fechamento de vendas e saídas da fábrica.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Espelho do Relatório Oficial (Estilizado para Tela e Otimizado para Impressão) */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        {/* Cabeçalho do Relatório Físico - Visível APENAS na impressão */}
        <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Factory className="h-5 w-5 text-foreground" /> Utah Gourmet -
              Sistema ERP
            </h1>
            <p className="text-xs text-muted-foreground">
              Relatório Oficial de Fechamento de Vendas Corporativas
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>Escopo: Empresa Única (Faturamento Local)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 print:hidden">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-base">
            Livro de Registro de Ordens de Venda
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-md">
            Nenhum registro encontrado no banco local para consolidação.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-foreground text-xs uppercase font-bold print:bg-gray-100">
                  <th className="px-4 py-3">Cód. Venda</th>
                  <th className="px-4 py-3">Cliente / CNPJ</th>
                  <th className="px-4 py-3">Data/Hora</th>
                  <th className="px-4 py-3">Itens Compostos</th>
                  <th className="px-4 py-3 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors page-break-inside-avoid"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-foreground font-semibold">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {order.client?.name}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatCNPJ(order.client?.cnpj)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}{" "}
                      <br />
                      <span className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs max-w-xs">
                      <div className="space-y-0.5">
                        {order.items?.map((item: any, idx: number) => (
                          <p key={idx} className="text-foreground">
                            • {item.quantity}x - {item.product?.name} (
                            {formatCurrency(item.price)})
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-foreground text-right align-top">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé de Validação - Visível APENAS na impressão */}
        <div className="hidden print:block text-center text-[10px] text-gray-400 mt-12 border-t pt-4">
          Fim do documento gerencial • Autenticado via Middleware Local do
          Sistema ERP Utah Gourmet.
        </div>
      </div>
    </div>
  );
}
