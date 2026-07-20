// src/app/dashboard/products/ProductsFilters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useRef } from "react";

/**
 * Client Component reativo para filtragem e pesquisa de produtos no catálogo via URL.
 * Captura as entradas do usuário e aplica um debounce de 400ms para atualizar o parâmetro
 * 'search' na Query String sem disparar re-renderizações ou buscas excessivas.
 */
export function ProductsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearch = searchParams.get("search") || "";

  function handleSearchChange(text: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (text) {
        params.set("search", text);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produto por nome..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}
