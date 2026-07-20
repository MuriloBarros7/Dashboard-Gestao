// src/app/api/temp-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma"; // Importa o seu Prisma já configurado pelo Next.js
import bcrypt from "bcrypt";

/**
 * Route Handler de API (GET) para atualização emergencial de senha de acesso em ambiente dev.
 * Gera um novo hash Bcrypt para uma senha padrão ("123456") e atualiza o registro do usuário
 * especificado no banco de dados, devolvendo uma resposta JSON com o resultado da operação.
 */
export async function GET() {
  try {
    const hash = await bcrypt.hash("123456", 10);

    const updatedUser = await prisma.user.update({
      where: { email: "murilo@email.com" },
      data: { password: hash },
    });

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso no banco de dados!",
      user: updatedUser.email,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
