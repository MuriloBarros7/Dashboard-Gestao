import { ClientForm } from "@/src/components/forms/ClientForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Server Component de página para cadastro de um novo cliente na organização.
 * Estrutura o layout container com botão de navegação para retorno à listagem
 * e renderiza o componente reutilizável 'ClientForm' em modo de criação (sem 'initialData').
 */
export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/clients"
          className="p-2 border rounded-md hover:bg-muted transition-colors flex items-center justify-center"
          title="Voltar para a listagem"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente para a sua organização.
          </p>
        </div>
      </div>

      {/* Container do Formulário */}
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <ClientForm />
      </div>
    </div>
  );
}
