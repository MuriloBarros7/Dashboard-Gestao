// src/app/api/seed/route.ts
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Route Handler de API (GET) para povoamento e reset controlado do banco de dados (Database Seeding).
 * Executa o truncamento em cascata da tabela de usuários (limpando dependências relacionais em cascata),
 * cria os usuários padrões de teste para autenticação no painel e inicializa suas configurações institucionais.
 */
export async function GET() {
  try {
    // 1. Limpa os dados em cascata da tabela de usuários de forma segura
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE users CASCADE;`);

    // 2. Cria o usuário oficial de teste do painel (Senha: 123456)
    const user1 = await prisma.user.create({
      data: {
        email: "murilo@email.com",
        name: "Utah Gourmet LTDA",
        password:
          "$2a$12$ZmxN0xR8v3H4mU6VbX/y/.Z2P3xGhzW8f9k7GzW3Y6E3nB8V2aH6.",
      },
    });

    // Inicializa as configurações corporativas do primeiro usuário
    await prisma.companySettings.create({
      data: {
        userId: user1.id,
        companyName: "Utah Gourmet LTDA",
        tradeName: "Utah Gourmet",
        cnpj: "12.345.678/0001-99",
      },
    });

    // 3. Cria o segundo usuário de teste (Painel Vazio)
    const user2 = await prisma.user.create({
      data: {
        email: "outro@email.com",
        name: "Outra Empresa LTDA",
        password:
          "$2a$12$ZmxN0xR8v3H4mU6VbX/y/.Z2P3xGhzW8f9k7GzW3Y6E3nB8V2aH6.",
      },
    });

    // Inicializa as configurações corporativas do segundo usuário
    await prisma.companySettings.create({
      data: {
        userId: user2.id,
        companyName: "Outra Empresa LTDA",
        tradeName: "Outra Empresa",
        cnpj: "98.765.432/0001-11",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Banco de dados semeado com sucesso via API! Os usuários murilo@email.com e outro@email.com foram criados.",
    });
  } catch (error) {
    console.error("Erro no seed:", error);

    // Tratamento seguro do tipo 'unknown' do catch
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido durante a semeadura.";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
