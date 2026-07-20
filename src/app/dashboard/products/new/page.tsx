// src/app/dashboard/products/new/page.tsx
import { ProductForm } from "@/src/components/forms/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Server Component de página para cadastro de novos produtos no catálogo da fábrica.
 * Renderiza o cabeçalho de navegação com link de retorno à listagem e acopla o
 * componente reutilizável 'ProductForm' em modo de criação.
 */
export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 border rounded-md hover:bg-muted transition-colors flex items-center justify-center"
          title="Voltar para a listagem"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre um novo item no catálogo da sua fábrica.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
