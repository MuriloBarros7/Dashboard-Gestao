/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/clients/[id]/edit/page.tsx
import prisma from "@/src/lib/prisma";
import { ClientForm } from "@/src/components/forms/ClientForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Server Component de página para edição dinâmica de dados do cliente por ID.
 * Resolve a Promise dos parâmetros de rota do Next.js, realiza a busca direta
 * no banco via Prisma para hidratar o formulário e gerencia o fallback de 'notFound()'
 * caso o identificador fornecido na URL seja inválido ou inexistente.
 */
export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  // Busca direta do registro no Prisma para evitar erros de declarações ausentes
  const client = await (prisma as any).client.findUnique({
    where: { id },
  });

  if (!client) {
    notFound();
  }

  const initialData = {
    name: client.name,
    cnpj: client.cnpj,
    email: client.email,
    phone: client.phone || "",
    status: client.status as "ACTIVE" | "INACTIVE",
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/clients"
          className="p-2 border rounded-md hover:bg-muted transition-colors flex items-center justify-center"
          title="Voltar para a listagem"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Atualize as informações do cliente abaixo.
          </p>
        </div>
      </div>

      {/* Renderiza o Formulário passando os dados completos */}
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <ClientForm initialData={initialData} clientId={client.id} />
      </div>
    </div>
  );
}
