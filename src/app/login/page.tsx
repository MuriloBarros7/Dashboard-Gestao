"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "@/src/actions/auth";
import {
  LayoutDashboard,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  Info,
} from "lucide-react";

/**
 * Client Component de tela de autenticação centralizada (Login e Cadastro).
 * Gerencia alternância de telas, estados de validação, exibição/ocultação de senha,
 * aplicação de máscara dinâmica para telefone de contato, validação de senha forte
 * com orientação ao usuário e navegação para o painel.
 */
export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ESTADO DO CAMPO DE TELEFONE COM MÁSCARA DINÂMICA
  const [phoneValue, setPhoneValue] = useState("");

  // Função utilitária para formatação de telefone no padrão (XX) XXXXX-XXXX
  const maskPhone = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").substring(0, 11);

    if (digits.length > 6) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    } else if (digits.length > 2) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    } else if (digits.length > 0) {
      return `(${digits}`;
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(maskPhone(e.target.value));
  };

  // Handler de Login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res?.error) {
      setErrorMessage(res.error);
      setIsLoading(false);
    } else {
      setSuccessMessage("Autenticado! Entrando no painel...");
      setTimeout(() => {
        router.push("/"); // ← Redirecionamento para o Hub Principal
        router.refresh();
      }, 1000);
    }
  }

  // Handler de Cadastro Profissional
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const companyName = (formData.get("companyName") as string)?.trim();

    // REGRA DE SENHA FORTE: mín. 8 caracteres, 1 maiúscula e 1 caractere especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%!&*?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "A senha não atende aos requisitos mínimos de segurança (8+ caracteres, 1 maiúscula e 1 caractere especial).",
      );
      setIsLoading(false);
      return;
    }

    const res = await registerAction(formData);

    if (res?.error) {
      setErrorMessage(res.error);
      setIsLoading(false);
    } else {
      const welcomeName = companyName || "Empresa";
      setSuccessMessage(
        `Seja bem-vindo(a), ${welcomeName}! Redirecionando para o painel...`,
      );

      setTimeout(() => {
        router.push("/"); // ← Redirecionamento para o Hub Principal
        router.refresh();
      }, 1400);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm transition-all relative">
        {/* Header com Ícone e Título */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="p-3 bg-slate-100 rounded-xl text-foreground">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegister ? "Criar Nova Conta" : "Painel de Gestão"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRegister
              ? "Preencha os dados da sua fábrica e crie seu acesso."
              : "Entre com suas credenciais de acesso."}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Banner Profissional de Sucesso */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* --- TELA DE LOGIN --- */}
        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Endereço de e-mail
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue="murilo@email.com"
                placeholder="seu@email.com"
                disabled={isLoading}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  defaultValue="123456"
                  placeholder="••••••"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 bg-foreground text-background font-medium text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Acessando..." : "Acessar Painel"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Não tem uma conta? Criar novo cadastro
              </button>
            </div>
          </form>
        ) : (
          /* --- TELA DE NOVO CADASTRO --- */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Seu Nome Completo
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: Fabio Murilo"
                disabled={isLoading}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Empresa / Razão Social
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Ex: Utah Gourmet B2B"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  required
                  placeholder="00.000.000/0001-00"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Endereço de e-mail
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  name="phone"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="(81) 99999-9999"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 pr-9 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* OBSERVAÇÃO ORIENTATIVA DE SENHA FORTE */}
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <Info className="h-3 w-3 text-slate-400 shrink-0" />
                Mínimo de 8 caracteres, 1 maiúscula e 1 caractere especial
                (@#$%).
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-3 bg-foreground text-background font-medium text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {isLoading ? "Criando conta..." : "Cadastrar Empresa"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage("");
                  setSuccessMessage("");
                  setPhoneValue("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                Já possui conta? Voltar ao login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
