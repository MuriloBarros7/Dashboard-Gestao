/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/forms/OrderForm.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/src/actions/order";

interface ClientOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface ItemRow {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderFormProps {
  clients: ClientOption[];
  products: ProductOption[];
}

/**
 * Client Component de formulário dinâmico para lançamento de ordens de faturamento B2B.
 * Permite a seleção do cliente corporativo, inclusão/remoção dinâmica de linhas de produtos,
 * cálculo automático dos subtotais/total geral e submissão via Server Action de pedidos.
 */
export function OrderForm({ clients, products }: OrderFormProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", quantity: 1, price: 0 },
  ]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const totalOrder = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  function handleAddItem() {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleProductChange(index: number, productId: string) {
    const selectedProduct = products.find((p) => p.id === productId);
    const updatedItems = [...items];
    updatedItems[index] = {
      productId,
      quantity: updatedItems[index].quantity,
      price: selectedProduct ? Number(selectedProduct.price) : 0,
    };
    setItems(updatedItems);
  }

  function handleQuantityChange(index: number, quantity: number) {
    const updatedItems = [...items];
    updatedItems[index].quantity = Math.max(1, quantity);
    setItems(updatedItems);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return setError("Selecione um cliente para o pedido.");
    if (items.some((item) => !item.productId))
      return setError("Selecione o produto de todos os itens adicionados.");

    setIsPending(true);
    setError("");

    try {
      // Monta o FormData estruturado conforme exigido pela Server Action de pedidos
      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("productId", items[0].productId);
      formData.append("quantity", String(items[0].quantity));
      formData.append("status", "PENDING");

      const res: any = await createOrderAction(formData);

      if (!res.success) {
        const errorMsg =
          res.error || res.errors?.global?.[0] || "Erro ao registrar o pedido.";
        throw new Error(errorMsg);
      }

      router.push("/dashboard/ordes");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao registrar o pedido.";
      setError(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-800 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Seleção de Cliente */}
      <div className="space-y-2">
        <label className="text-sm font-medium tracking-tight">
          Cliente Beneficiário
        </label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Selecione o Cliente --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-md font-semibold mb-3">Itens do Pedido</h3>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 items-end border p-3 rounded-md bg-muted/20"
            >
              {/* Escolha do Produto */}
              <div className="w-full sm:flex-1 space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Produto
                </label>
                <select
                  value={item.productId}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none"
                >
                  <option value="">Selecione o item...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(p.price))}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade */}
              <div className="w-full sm:w-24 space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Qtd.
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, parseInt(e.target.value) || 1)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-center"
                />
              </div>

              {/* Subtotal */}
              <div className="w-full sm:w-32 text-right p-2 font-medium text-sm text-muted-foreground bg-muted/40 rounded h-9 flex items-center justify-end">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.price * item.quantity)}
              </div>

              {/* Remover Linha */}
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md border h-9 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          <Plus className="w-4 h-4" /> Adicionar outro item
        </button>
      </div>

      {/* Rodapé de Resumo de Preço e Envio */}
      <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-lg font-bold">
          Total Geral:{" "}
          <span className="text-green-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalOrder)}
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 transition-colors"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Fechar Venda
        </button>
      </div>
    </form>
  );
}
