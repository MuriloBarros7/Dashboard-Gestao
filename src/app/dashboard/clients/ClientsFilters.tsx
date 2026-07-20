// src/app/dashboard/clients/ClientsFilters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useRef } from "react";

/**
 * Client Component reativo para filtragem e pesquisa de clientes via Query Strings na URL.
 * Gerencia a sincronização do campo de busca por texto utilizando debounce (evitando requisições excessivas
 * a cada tecla digitada) e dispara atualizações imediatas ao alterar o status do filtro no select.
 */
export function ClientsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // UseRef mantém a referência do timer segura e isolada entre as renderizações
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lê os valores diretamente da URL em tempo real
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  // Controla a digitação com debounce seguro
  function handleSearchChange(text: string) {
    // Se já houver um temporizador rodando, limpa ele
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Define o novo timeout na referência persistente
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (text) {
        params.set("search", text);
      } else {
        params.delete("search");
      }

      params.set("page", "1"); // Reseta para a página 1 ao buscar novo termo
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
  }

  // Controla a mudança do select de status de forma instantânea
  function handleStatusChange(newStatus: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus !== "ALL") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    params.set("page", "1"); // Reseta para a página 1 ao mudar o status
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
      {/* Campo de Busca por Texto */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Dropdown de Filtragem por Status */}
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
      >
        <option value="ALL">Todos os Status</option>
        <option value="ACTIVE">Ativos</option>
        <option value="INACTIVE">Inativos</option>
      </select>
    </div>
  );
}
