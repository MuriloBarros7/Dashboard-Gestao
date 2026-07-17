import { getClients, deleteClient } from "../../../actions/client";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { formatCNPJ } from "@/src/lib/formatters";

export default async function ClientsPage() {
  // Chamada direta ao banco de dados no lado do servidor
  const clients = await getClients();

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão da base de clientes da sua organização.
          </p>
        </div>

        {/* Botão para a tela de Novo Cliente */}
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
        >
          Novo Cliente
        </Link>
      </div>

      {/* Tabela de Dados */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Razão Social</th>
                <th className="px-4 py-3 font-medium">CNPJ</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Renderização Condicional: Verifica se a lista de clientes está vazia */}
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              ) : (
                /* Se houver clientes, faz um map para renderizar cada linha */
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium">{client.name}</td>

                    {/* AQUI: Aplicação da máscara do CNPJ */}
                    <td className="px-4 py-4">{formatCNPJ(client.cnpj)}</td>

                    <td className="px-4 py-4">{client.email}</td>
                    <td className="px-4 py-4">{client.phone}</td>

                    {/* AQUI: Status Dinâmico */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          client.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* Coluna de Ações com os botões de Editar e Excluir nativo */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão de Editar */}
                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex"
                          title="Editar Cliente"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {/* Botão de Excluir Nativo */}
                        <form action={deleteClient.bind(null, client.id)}>
                          <button
                            type="submit"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors inline-flex"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
