/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getClientsAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "@/src/actions/client";
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  X,
  UserCheck,
  UserX,
  Search,
} from "lucide-react";
import Link from "next/link";

/**
 * Client Component de página principal para a gestão completa da carteira de clientes B2B.
 * Reúne em uma única interface as operações de listagem com busca reativa em tempo real,
 * modal interativo para criação/edição com aplicação de máscaras dinâmicas de telefone,
 * gatilhos de exclusão lógica/física e navegação para sub-relatórios por status.
 */
export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [phoneValue, setPhoneValue] = useState("");

  // ESTADO DA FILTRAGEM POR TEXTO
  const [searchTerm, setSearchTerm] = useState("");

  async function loadClients() {
    try {
      const data = await getClientsAction();
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadClients();
    })();
  }, []);

  // FILTRAGEM EM TEMPO REAL (Client-side para performance instantânea)
  const filteredClients = clients.filter((client: any) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(term) ||
      client.cnpj?.replace(/\D/g, "").includes(term) ||
      client.cnpj?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term)
    );
  });

  const maskPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.substring(0, 11);

    if (value.length > 6) {
      return `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      return `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      return `(${value}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(maskPhone(e.target.value));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    const formData = new FormData(e.currentTarget);

    let result;
    if (editingClient) {
      result = await updateClientAction(editingClient.id, formData);
    } else {
      result = await createClientAction(formData);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingClient(null);
      setPhoneValue("");
      await loadClients();
    } else {
      setFormErrors(result.errors || {});
    }
  }

  async function handleDelete(id: string, name: string) {
    if (
      confirm(`Tem certeza que deseja remover o cliente corporativo "${name}"?`)
    ) {
      const result = await deleteClientAction(id);
      if (result.success) {
        await loadClients();
      } else {
        alert(result.error || "Erro ao deletar cliente");
      }
    }
  }

  function handleEditClick(client: any) {
    setEditingClient(client);
    setPhoneValue(client.phone || "");
    setFormErrors({});
    setIsModalOpen(true);
  }

  function handleCreateClick() {
    setEditingClient(null);
    setPhoneValue("");
    setFormErrors({});
    setIsModalOpen(true);
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* HEADER DA TELA */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciamento de Clientes
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre, edite e monitore a carteira completa de compradores
            corporativos.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {/* BARRA DE FILTRAGEM INTEGRADA (SUB-ABAS + CAMPO DE BUSCA) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Sub-abas de rotas físicas */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients/active"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
          >
            <UserCheck className="h-3.5 w-3.5" /> Clientes Ativos
          </Link>
          <Link
            href="/dashboard/clients/inactive"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <UserX className="h-3.5 w-3.5" /> Clientes Inativos
          </Link>
        </div>

        {/* Input de pesquisa inteligente em tempo real */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-secondary text-secondary-foreground font-semibold">
                <tr>
                  <th className="px-6 py-3 rounded-l-md">
                    Razão Social / Nome
                  </th>
                  <th className="px-6 py-3">CNPJ</th>
                  <th className="px-6 py-3">E-mail Comercial</th>
                  <th className="px-6 py-3">Telefone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right rounded-r-md">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      Carregando carteira de clientes...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      {searchTerm
                        ? `Nenhum resultado encontrado para a busca "${searchTerm}".`
                        : "Nenhum cliente cadastrado no sistema até o momento."}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client: any) => (
                    <tr
                      key={client.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {client.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-foreground">
                        {client.cnpj || "—"}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {client.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-foreground font-mono text-xs">
                        {client.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            client.status === "INACTIVE"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {client.status === "INACTIVE" ? "Inativo" : "Ativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(client)}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar Cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Excluir Cliente"
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

      {/* MODAL (FORMULÁRIO CRIAR/EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-lg font-semibold">
                {editingClient
                  ? "Editar Cadastro"
                  : "Cadastrar Novo Cliente B2B"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editingClient && (
                <input type="hidden" name="id" value={editingClient.id} />
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium">Razão Social</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClient?.name || ""}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">CNPJ (Opcional)</label>
                <input
                  type="text"
                  name="cnpj"
                  defaultValue={editingClient?.cnpj || ""}
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  E-mail Comercial (Opcional)
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingClient?.email || ""}
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Telefone de Contato
                </label>
                <input
                  type="text"
                  name="phone"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  required
                  placeholder="(81) 99999-9999"
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none"
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Status do Cliente
                </label>
                <select
                  name="status"
                  defaultValue={editingClient?.status || "ACTIVE"}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none border-input"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md border-input"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
