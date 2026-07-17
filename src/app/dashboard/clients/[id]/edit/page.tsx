import { getClientById } from "@/src/actions/client";
import { ClientForm } from "@/src/components/forms/ClientForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// O params agora é uma Promise (Next.js 15+ convention)
interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  // 1. Desempacota o params com await
  const { id } = await params;

  // 2. Busca os dados atuais do cliente direto no servidor
  const client = await getClientById(id);

  // 3. Se o cliente não existir ou for de outra empresa, devolve um 404
  if (!client) {
    notFound();
  }

  // 4. Formata os dados para o formato exato que o formulário (Zod) espera
  const initialData = {
    name: client.name,
    cnpj: client.cnpj,
    email: client.email,
    phone: client.phone || "",
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

      {/* Renderiza o Formulário passando os dados e o ID */}
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <ClientForm initialData={initialData} clientId={client.id} />
      </div>
    </div>
  );
}
