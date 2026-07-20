/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getFinancialDataAction,
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/src/actions/financial";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  RefreshCw,
  Landmark,
  Pencil,
  Trash2,
} from "lucide-react";

/**
 * Client Component de página para gestão financeira e fluxo de caixa da empresa.
 * Exibe balanço consolidado (entradas, saídas e saldo líquido), permitindo filtragem
 * por escopos temporais (7d, 30d, 90d, ano), além da criação, edição e exclusão de lançamentos.
 */
export default function FinancasPage() {
  const [finData, setFinData] = useState<any>(null);
  const [period, setPeriod] = useState("30d");
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Estados para gerenciar a Edição
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Efeito para sincronizar os dados baseados no filtro de período
  async function fetchFinancialData() {
    const data = await getFinancialDataAction(period);
    setFinData(data);
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getFinancialDataAction(period);
      if (isMounted) setFinData(data);
    })();
    return () => {
      isMounted = false;
    };
  }, [period]);

  // Manipulador para criação ou edição de registros
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    let result;
    if (isEditMode && selectedTransaction) {
      result = await updateTransactionAction(selectedTransaction.id, formData);
    } else {
      result = await createTransactionAction(formData);
    }

    if (result.success) {
      setIsOpenModal(false);
      setIsEditMode(false);
      setSelectedTransaction(null);
      form.reset();
      await fetchFinancialData();
    }
  }

  // Manipulador para deletar registros com confirmação nativa de segurança
  async function handleDelete(id: string, description: string) {
    if (
      confirm(
        `Tem certeza que deseja estornar/deletar a movimentação: "${description}"?`,
      )
    ) {
      const result = await deleteTransactionAction(id);
      if (result.success) {
        await fetchFinancialData();
      } else {
        alert("Não foi possível excluir o registro.");
      }
    }
  }

  // Abre o modal carregando as informações do item selecionado para edição
  function openEditModal(transaction: any) {
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsOpenModal(true);
  }

  // Reseta os estados ao fechar o modal
  function closeTransactionModal() {
    setIsOpenModal(false);
    setIsEditMode(false);
    setSelectedTransaction(null);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const categoryLabels: Record<string, string> = {
    SALE: "Vendas B2B",
    TAX: "Impostos",
    SALARY: "Salários",
    SUPPLIES: "Insumos",
    MAINTENANCE: "Manutenção",
    OTHER: "Outros",
  };

  if (!finData) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span>Conciliando fluxo de caixa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 text-foreground">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestão Financeira
          </h2>
          <p className="text-sm text-muted-foreground">
            Controle de receitas corporativas, folhas de pagamento e impostos da
            Utah Gourmet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border rounded-md px-2 py-1.5 bg-background shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-medium bg-transparent outline-none cursor-pointer"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="year">Ano Atual</option>
            </select>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setIsOpenModal(true);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Nova Movimentação
          </button>
        </div>
      </div>

      {/* CARDS INDICADORES */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 flex flex-row items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Entradas do Período
            </p>
            <div className="text-2xl font-bold text-green-600 font-mono pt-1">
              {formatCurrency(finData.summary.incomes)}
            </div>
          </div>
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-row items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Saídas do Período
            </p>
            <div className="text-2xl font-bold text-red-600 font-mono pt-1">
              {formatCurrency(finData.summary.expenses)}
            </div>
          </div>
          <TrendingDown className="h-6 w-6 text-red-600" />
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-row items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Saldo Líquido Caixa
            </p>
            <div
              className={`text-2xl font-bold font-mono pt-1 ${finData.summary.balance >= 0 ? "text-blue-600" : "text-amber-600"}`}
            >
              {formatCurrency(finData.summary.balance)}
            </div>
          </div>
          <DollarSign className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* EXTRATO / TABELA */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Extrato de Movimentações</h3>
          <p className="text-sm text-muted-foreground">
            Listagem detalhada das operações financeiras selecionadas.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-y">
              <tr>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {finData.transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Nenhuma transação encontrada para este período.
                  </td>
                </tr>
              ) : (
                finData.transactions.map((t: any) => (
                  <tr
                    key={t.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {categoryLabels[t.category] || t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-semibold font-mono ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}{" "}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          title="Editar Registro"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.description)}
                          className="p-1 rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DINÂMICO (CRIAR VS EDITAR) */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border w-full max-w-md rounded-xl p-6 shadow-lg space-y-4 text-foreground">
            <div className="flex items-center gap-2 border-b pb-2">
              <Landmark className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">
                {isEditMode
                  ? "Alterar Lançamento de Caixa"
                  : "Lançar Fluxo de Caixa"}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Descrição da Operação
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={
                    isEditMode ? selectedTransaction?.description : ""
                  }
                  placeholder="Ex: Pagamento DAS-Simples, Folha Junho"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Tipo</label>
                  <select
                    name="type"
                    defaultValue={
                      isEditMode ? selectedTransaction?.type : "EXPENSE"
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm"
                  >
                    <option value="EXPENSE">Saída (Despesa)</option>
                    <option value="INCOME">Entrada (Receita)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Categoria</label>
                  <select
                    name="category"
                    defaultValue={
                      isEditMode ? selectedTransaction?.category : "TAX"
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm"
                  >
                    <option value="TAX">Impostos</option>
                    <option value="SALARY">Salários</option>
                    <option value="SUPPLIES">Insumos</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="OTHER">Outros</option>
                    <option value="SALE">Vendas B2B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    defaultValue={isEditMode ? selectedTransaction?.amount : ""}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border rounded-md bg-transparent text-sm font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Data Competência
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={
                      isEditMode && selectedTransaction?.date
                        ? selectedTransaction.date.split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow"
                >
                  {isEditMode ? "Salvar Alterações" : "Confirmar Lançamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
