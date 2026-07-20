/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/products/[id]/edit/page.tsx
import prisma from "@/src/lib/prisma";
import { ProductForm } from "@/src/components/forms/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Server Component para a página de edição de produto por ID.
 * Resolve a Promise dos parâmetros dinâmicos de rota, busca o produto diretamente no banco
 * de dados via Prisma e repassa os valores hidratados para o componente reativo 'ProductForm'.
 */
export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  // Busca direta do registro no Prisma para sanar a ausência da exportação nas actions
  const product = await (prisma as any).product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // Prepara o dado convertendo o preço (Decimal do Prisma) para string para o formulário
  const initialData = {
    name: product.name,
    price: product.price ? product.price.toString() : "0",
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
          <p className="text-muted-foreground text-sm">
            Atualize as informações do produto abaixo.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="p-6 border rounded-lg bg-card shadow-sm">
        <ProductForm initialData={initialData} productId={product.id} />
      </div>
    </div>
  );
}
