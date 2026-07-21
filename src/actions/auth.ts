"use server";

import prisma from "@/src/lib/prisma";
import { signToken } from "@/src/lib/auth";
import * as bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Encerra a sessão ativa do usuário limpando o cookie de autenticação.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("b2b_session");
  revalidatePath("/");
  return { success: true, message: "Sessão encerrada com sucesso." };
}

/**
 * Realiza a autenticação do usuário comparando a senha informada com o hash Bcrypt.
 */
export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Credenciais inválidas." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Credenciais inválidas." };
    }

    // Gera o token assinado contendo userId e email no payload
    const token = await signToken({
      userId: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set("b2b_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    revalidatePath("/");
    return { success: true, message: "Login realizado com sucesso!" };
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Ocorreu um erro interno no servidor." };
  }
}

/**
 * Registra um novo usuário armazenando a Razão Social/Empresa e inicializando
 * as configurações padrão institucionais associadas ao ID da conta.
 */
export async function registerAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const companyName = (formData.get("companyName") as string)?.trim();

  if (!email || !password) {
    return { error: "Preencha os campos de e-mail e senha." };
  }

  // Validação de senha forte (mínimo 8 caracteres, 1 maiúscula e 1 caractere especial)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%!&*?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error:
        "A senha precisa ter no mínimo 8 caracteres, 1 letra maiúscula e 1 caractere especial (@#$%).",
    };
  }

  try {
    // 1. Verifica se e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado no sistema." };
    }

    // 2. Hash da Senha com Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Definindo o nome padrão da empresa/razão social
    const displayName = companyName || email.split("@")[0];

    // 3. Cria o usuário com e-mail, senha e o nome da empresa
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: displayName,
      },
    });

    // 4. Cria automaticamente o registro de configurações da empresa para o novo usuário
    await prisma.companySettings.create({
      data: {
        userId: newUser.id,
        companyName: displayName,
        tradeName: displayName,
        cnpj: "00.000.000/0001-00",
      },
    });

    // 5. Gera o token JWT para a nova sessão
    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // 6. Grava o cookie 'b2b_session' de autenticação
    const cookieStore = await cookies();
    cookieStore.set("b2b_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Bem-vindo(a), ${displayName}! Conta criada com sucesso.`,
    };
  } catch (error: unknown) {
    console.error("Erro no cadastro:", error);
    return { error: "Falha ao criar conta. Tente novamente." };
  }
}
