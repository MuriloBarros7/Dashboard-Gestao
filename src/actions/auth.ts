"use server"; //Roda estritamente no servidor

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcrypt";

import prisma from "../lib/prisma";
import { signToken } from "../lib/auth";

export async function loginAction(formData: FormData) {
  // 1. Extração dos dados do formulário
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  try {
    // 2. Busca do usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        organizationId: true, // Crucial para o nosso isolamento B2B
      },
    });

    // 3. Defesa contra Enumeração de Usuários
    if (!user) {
      return { error: "Credenciais inválidas." };
    }

    // 4. Verificação do Hash com Bcrypt
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Credenciais inválidas." };
    }

    // 5. Geração do Token JWT (A emissão do crachá)
    const token = await signToken({
      userId: user.id,
      organizationId: user.organizationId,
    });

    // 6. Armazenamento Seguro via Cookie HTTP-Only
    // Correção: Aguarda a promessa resolver antes de chamar o set()
    const cookieStore = await cookies();
    cookieStore.set({
      name: "b2b_session",
      value: token,
      httpOnly: true, // Impede que o JavaScript (XSS) roube o token
      secure: process.env.NODE_ENV === "production", // Usa HTTPS obrigatoriamente em produção
      sameSite: "strict", // Proteção CSRF
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });
  } catch (error) {
    console.error("Erro no processo de login:", error);
    return { error: "Ocorreu um erro interno. Tente novamente mais tarde." };
  }

  // 7. Redirecionamento (Fora do try/catch)
  redirect("/dashboard");
}
