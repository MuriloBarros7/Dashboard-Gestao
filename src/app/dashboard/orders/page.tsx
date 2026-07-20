/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getOrdersAction,
  createOrderAction,
  updateOrderStatusAction,
  deleteOrderAction,
} from "@/src/actions/order";
import { getClientsAction } from "@/src/actions/client";
import { getProductsAction } from "@/src/actions/product";
import { Plus, Trash2, X, Package, ChevronDown, Calendar } from "lucide-react";

/**
 * Client Component de página para faturamento e gestão de pedidos B2B.
 * Controla o lançamento de vendas, associação de produtos e clientes ativos,
 * filtragem por competência mensal, atualização rápida de status via dropdown
 * e integra as baixas e estornos automáticos de estoque no banco de dados.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // FILTRO TEMPORAL POR MÊS (Formato: "YYYY-MM")
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Estado para controlar qual menu dropdown de status está aberto (guarda o ID do pedido)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  async function loadData() {
    try {
      const ordersData = await getOrdersAction();
      const clientsData = await getClientsAction();
      const productsData = await getProductsAction();

      setOrders(ordersData);
      setClients(clientsData.filter((c: any) => c.status === "ACTIVE"));
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dados de faturamento:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadData();
    })();

    // Fecha o dropdown se o usuário clicar em qualquer outro lugar da tela
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // FILTRAGEM EM TEMPO REAL POR COMPETÊNCIA MENSAL
  const filteredOrders = orders.filter((order: any) => {
    if (!selectedMonth) return true;
    const orderDate = new Date(order.createdAt).toISOString().substring(0, 7);
    return orderDate === selectedMonth;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.currentTarget);

    const result = await createOrderAction(formData);

    if (result.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setFormErrors(result.errors || {});
    }
  }

  // Altera diretamente para o status que o usuário clicou no menu
  async function handleSetStatus(
    id: string,
    targetStatus: "PENDING" | "DELIVERED" | "CANCELED",
  ) {
    const result = await updateOrderStatusAction(id, targetStatus);
    if (!result.success) {
      alert(result.error);
    } else {
      await loadData();
    }
    setActiveDropdownId(null);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Pedidos de Faturamento
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitore saídas, itens vendidos e controle automático de estoque.
          </p>
        </div>

        {/* BARRA DE CONTROLES (SELETOR MENSAL + BOTÃO NOVO PEDIDO) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 shadow-sm border-input">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer text-foreground"
            >
              <option value="">Todos os Meses</option>
              <option value="2026-07">Julho / 2026</option>
              <option value="2026-06">Junho / 2026</option>
              <option value="2026-05">Maio / 2026</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFormErrors({});
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido
          </button>
        </div>
      </div>

      {formErrors.global && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm font-medium">
          {formErrors.global[0]}
        </div>
      )}

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground min-h-50">
              <thead className="text-xs uppercase bg-secondary text-secondary-foreground font-semibold">
                <tr>
                  <th className="px-6 py-3 rounded-l-md">Cliente</th>
                  <th className="px-6 py-3">Item / Qtd</th>
                  <th className="px-6 py-3">Valor Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right rounded-r-md">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      Carregando pedidos de faturamento...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      {selectedMonth
                        ? `Nenhum pedido faturado encontrado para a competência ${selectedMonth}.`
                        : "Nenhum pedido corporativo registrado no momento."}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {order.client?.name || "Cliente Removido"}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5"
                          >
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.product?.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({item.quantity} un)
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 font-mono text-foreground font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(order.total))}
                      </td>

                      {/* COLUNA DE STATUS COM DROPDOWN INTUITIVO */}
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(
                              activeDropdownId === order.id ? null : order.id,
                            );
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all border shadow-sm ${
                            order.status === "DELIVERED"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : order.status === "CANCELED"
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                          }`}
                        >
                          {order.status === "DELIVERED"
                            ? "Concluído"
                            : order.status === "CANCELED"
                              ? "Cancelado"
                              : "Em andamento"}
                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </button>

                        {/* CAIXA DE OPÇÕES DO DROPDOWN (FLUTUANTE) */}
                        {activeDropdownId === order.id && (
                          <div className="absolute left-6 mt-1.5 w-40 rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 z-50 py-1 flex flex-col">
                            <button
                              type="button"
                              onClick={() =>
                                handleSetStatus(order.id, "PENDING")
                              }
                              className="px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                            >
                              • Em andamento
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSetStatus(order.id, "DELIVERED")
                              }
                              className="px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-green-50 hover:text-green-800 transition-colors"
                            >
                              • Concluído
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSetStatus(order.id, "CANCELED")
                              }
                              className="px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                            >
                              • Cancelado
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            deleteOrderAction(order.id).then(() => loadData())
                          }
                          className="p-2 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                          title="Excluir Registro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL LANÇAR PEDIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div>
              <h3 className="text-lg font-semibold">Lançar Novo Pedido B2B</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Selecione o Cliente
                </label>
                <select
                  name="clientId"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none border-input cursor-pointer"
                >
                  <option value="">Escolha uma conta comercial...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Selecione o Produto
                </label>
                <select
                  name="productId"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none border-input cursor-pointer"
                >
                  <option value="">Escolha o produto em estoque...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Disponível: {p.stock || 0} un (R${" "}
                      {Number(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Quantidade Vendida
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  defaultValue="1"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Situação Inicial</label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none border-input cursor-pointer"
                >
                  <option value="PENDING">Em andamento (Reserva)</option>
                  <option value="DELIVERED">
                    Concluído (Dará baixa no estoque imediatamente)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md border-input cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow cursor-pointer"
                >
                  Registrar e Processar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
