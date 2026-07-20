/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getClientsAction } from "@/src/actions/client";
import { Building2 } from "lucide-react";

/**
 * Client Component de página para exibição do relatório geral de todos os clientes cadastrados.
 * Consome a lista completa da carteira comercial via Server Action e renderiza os status de cada
 * parceiro de forma dinâmica (badges coloridos para 'ACTIVE' e 'INACTIVE') na tabela.
 */
export default function TotalClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca todos os clientes cadastrados de forma geral
  async function loadClients() {
    try {
      const data = await getClientsAction();
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar lista geral de clientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Carga assíncrona isolada em conformidade com o compilador do Next.js
  useEffect(() => {
    (async () => {
      await loadClients();
    })();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Todos os Clientes Cadastrados
        </h2>
        <p className="text-sm text-muted-foreground">
          Relatório geral e consolidado de todas as contas corporativas da
          fábrica.
        </p>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-75 items-center justify-center text-sm text-muted-foreground">
              Carregando carteira de clientes...
            </div>
          ) : clients.length === 0 ? (
            <div className="flex h-75 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Nenhum cliente corporativo cadastrado no sistema.
            </div>
          ) : (
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
                    <th className="px-6 py-3 rounded-r-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client: any) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
