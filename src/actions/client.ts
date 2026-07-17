"use server";

import prisma from "../lib/prisma";
//import { verifyToken } from "../lib/auth";
//import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { clientSchema, type ClientFormValues } from "../lib/validations/client";

export async function createClient(data: ClientFormValues) {
  // 1. Verificação de sessão (Contexto de Segurança) | Se o token for não for válido será barrado
  /*const cookieStore = await cookies();
  const token = cookieStore.get("b2b_session")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) throw new Error("Não autorizado");*/

  const user = { organizationId: "123e4567-e89b-12d3-a456-426614174000" };

  // 2. Segurança em dose dupla (validação Zod no backend)
  const validatedData = clientSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error("Dados inválidos fornecidos ao servidor.");
  }

  // 3. Sanitização do CNPJ (Regra BR-CLI-01) | Mesmo que o user digite o cnpj coom traços e barras o banco recebe apenas os 14 números
  const sanitizedCnpj = validatedData.data.cnpj.replace(/\D/g, "");

  // 4. Persistência com isolamento (Regra BR-CRUD-04)
  const newClient = await prisma.client.create({
    data: {
      name: validatedData.data.name,
      cnpj: sanitizedCnpj,
      email: validatedData.data.email,
      phone: validatedData.data.phone,
      organizationId: user.organizationId, // Injeção automática do contexto
      status: "ACTIVE", // Padrão conforme BR-CLI-02
    },
  });

  // 5. Atualiza o cache da listagem para refletir a mudança
  revalidatePath("/dashboard/clients");

  return newClient;
}

export async function getClients() {
  // Use o exato mesmo UUID do createClient
  const user = { organizationId: "123e4567-e89b-12d3-a456-426614174000" };

  try {
    const clients = await prisma.client.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        cnpj: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return clients;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw new Error("Falha ao carregar a lista de clientes.");
  }
}

export async function deleteClient(id: string) {
  // ATENÇÃO: Cole o mesmo UUID real da sua organização aqui
  const user = { organizationId: "123e4567-e89b-12d3-a456-426614174000" };

  try {
    await prisma.client.delete({
      where: {
        id: id,
        // Segurança Multitenant: Garante que só deleta se for da própria empresa
        organizationId: user.organizationId,
      },
    });

    // Avisa o Next.js para atualizar a tabela na tela imediatamente
    revalidatePath("/dashboard/clients");
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw new Error(
      "Não foi possível excluir o cliente. Verifique se ele existe.",
    );
  }
}

// ==========================================
// 4. FUNÇÃO DE BUSCA ÚNICA (READ ONE - PARA O EDIT)
// ==========================================
export async function getClientById(id: string) {
  // ATENÇÃO: Use o mesmo UUID da sua organização
  const user = { organizationId: "123e4567-e89b-12d3-a456-426614174000" };

  try {
    const client = await prisma.client.findUnique({
      where: { id: String(id) },
    });

    // Barreira de Segurança Multitenant:
    // Garante que o cliente existe e pertence à empresa do usuário logado
    if (!client || client.organizationId !== user.organizationId) {
      return null;
    }

    return client;
  } catch (error) {
    console.error("Erro ao buscar o cliente para edição:", error);
    return null;
  }
}

// ==========================================
// 5. FUNÇÃO DE ATUALIZAÇÃO (UPDATE)
// ==========================================
export async function updateClient(id: string, data: ClientFormValues) {
  // ATENÇÃO: Use o mesmo UUID da sua organização
  const user = { organizationId: "123e4567-e89b-12d3-a456-426614174000" };

  // 1. Validar a estrutura dos dados novos com o Zod
  const validatedData = clientSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error("Dados inválidos fornecidos para atualização.");
  }

  // 2. Checagem de segurança no banco de dados
  const existingClient = await prisma.client.findUnique({
    where: { id: id },
  });

  if (
    !existingClient ||
    existingClient.organizationId !== user.organizationId
  ) {
    throw new Error(
      "Acesso negado. Você não tem permissão para editar este cliente.",
    );
  }

  // 3. Sanitização
  const sanitizedCnpj = validatedData.data.cnpj.replace(/\D/g, "");

  try {
    // 4. Atualização efetiva no banco
    const updatedClient = await prisma.client.update({
      where: { id: id },
      data: {
        name: validatedData.data.name,
        cnpj: sanitizedCnpj,
        email: validatedData.data.email,
        phone: validatedData.data.phone,
      },
    });

    // Atualiza a tabela na tela
    revalidatePath("/dashboard/clients");

    return updatedClient;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw new Error("Falha ao atualizar os dados do cliente.");
  }
}
