/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/src/actions/product";
import { Plus, Package, Pencil, Trash2, X } from "lucide-react";

/**
 * Client Component de página para a gestão do catálogo e controle de estoque de produtos.
 * Permite a visualização detalhada do inventário, formatação monetária em BRL, alertas de
 * estoque crítico e um modal unificado para ações de criação e edição com validação de erros.
 */
export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Carrega os produtos do banco ao montar a tela
  async function loadProducts() {
    try {
      const data = await getProductsAction();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Carga inicial assíncrona limpa para zerar o warning do React
  useEffect(() => {
    (async () => {
      await loadProducts();
    })();
  }, []);

  // Formatador profissional de moeda local (Real)
  const formatCurrency = (value: any) => {
    const priceAsNumber = Number(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceAsNumber);
  };

  // Envio do formulário (Salvar Novo ou Atualizar Existente)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.currentTarget);

    let result;
    if (editingProduct) {
      result = await updateProductAction(editingProduct.id, formData);
    } else {
      result = await createProductAction(formData);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      setFormErrors(result.errors || {});
    }
  }

  // Ação de Exclusão direta com confirmação nativa
  async function handleDelete(id: string, name: string) {
    if (confirm(`Tem certeza que deseja remover "${name}" do catálogo?`)) {
      const result = await deleteProductAction(id);
      if (result.success) {
        loadProducts();
      } else {
        alert(result.error || "Erro ao deletar produto");
      }
    }
  }

  // Gatilho para abrir o modal em modo de Edição
  function handleEditClick(product: any) {
    setEditingProduct(product);
    setFormErrors({});
    setIsModalOpen(true);
  }

  // Gatilho para abrir o modal em modo de Criação
  function handleCreateClick() {
    setEditingProduct(null);
    setFormErrors({});
    setIsModalOpen(true);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Catálogo e Estoque
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitore o inventário local de doces e salgados produzidos pela
            fábrica.
          </p>
        </div>
        <div>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </button>
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-75 items-center justify-center text-sm text-muted-foreground">
              Carregando catálogo...
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-75 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Nenhum item cadastrado no catálogo até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs uppercase bg-secondary text-secondary-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3 rounded-l-md">Item / Produto</th>
                    <th className="px-6 py-3">Preço Unitário</th>
                    <th className="px-6 py-3">Saldo em Estoque</th>
                    <th className="px-6 py-3 text-right rounded-r-md">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product: any) => (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {product.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar Produto"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Excluir Produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE FORMULÁRIO (CRIAR / EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-lg font-semibold">
                {editingProduct ? "Editar Produto" : "Adicionar Produto"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Preencha os campos abaixo para atualizar o catálogo da fábrica.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formErrors.global && (
                <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-medium">
                  {formErrors.global[0]}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  required
                  placeholder="Ex: Cento de Coxinha de Frango"
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-input"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {formErrors.name[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    defaultValue={
                      editingProduct ? Number(editingProduct.price) : ""
                    }
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-input"
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-500 font-medium">
                      {formErrors.price[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock ?? ""}
                    required
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-input"
                  />
                  {formErrors.stock && (
                    <p className="text-xs text-red-500 font-medium">
                      {formErrors.stock[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors border-input"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 shadow transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
