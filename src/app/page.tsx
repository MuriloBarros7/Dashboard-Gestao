import { getCurrentUser } from "@/src/lib/auth";
import { getCompanySettingsAction } from "@/src/actions/settings";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  FileSpreadsheet,
  Settings,
  ArrowRight,
} from "lucide-react";

/**
 * Server Component - Página Inicial de Navegação do ERP (Home Hub).
 *
 * Funcionalidade:
 * - Atua como a central de navegação rápida e porta de entrada da aplicação após a autenticação.
 * - Resgata o usuário logado via sessão JWT e consulta de forma assíncrona as configurações
 *   institucionais da empresa no banco de dados (Multi-Tenant).
 * - Exibe a mensagem de boas-vindas personalizada dinamicamente com o Nome Fantasia ou
 *   Razão Social da empresa cadastrada.
 * - Apresenta os cards operacionais de acesso direto aos módulos principais:
 *   1. Painel Analítico (/dashboard)
 *   2. Gestão Financeira (/dashboard/financial)
 *   3. Relatórios Comerciais (/dashboard/relatorios)
 *   4. Configurações da Fábrica (/configuracoes)
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const settings = await getCompanySettingsAction();

  // Prioriza o Nome Fantasia > Razão Social > Nome do Usuário > Fallback
  const companyDisplayName =
    settings?.tradeName || settings?.companyName || user?.name || "Empresa";

  return (
    <main className="min-h-screen bg-slate-50/50 p-8 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* CABEÇALHO COM A SAUDAÇÃO DA RAZÃO SOCIAL / NOME FANTASIA */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            ✨ Core ERP • Sistema de Gestão
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-serif">
            Boa Tarde, {companyDisplayName}!
          </h1>
          <p className="text-slate-600 max-w-2xl text-base">
            Seja bem-vindo ao seu painel integrado administrativo. Selecione uma
            das áreas operacionais abaixo para iniciar o gerenciamento.
          </p>
        </div>

        {/* MÓDULOS PRINCIPAIS DO SISTEMA */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Painel Analítico */}
          <Link
            href="/dashboard"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all duration-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Painel Analítico
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Visualize faturamento, volume de vendas corporativas e
                  gráficos de desempenho.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-blue-600 gap-1 pt-2">
                Acessar Módulo{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Gestão Financeira */}
          <Link
            href="/dashboard/financial"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all duration-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Gestão Financeira
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Controle o fluxo de caixa, lance receitas, salários, despesas
                  e faça conciliações.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-emerald-600 gap-1 pt-2">
                Acessar Módulo{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Relatórios Comerciais */}
          <Link
            href="/dashboard/relatorios"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-rose-500/50 transition-all duration-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Relatórios Comerciais
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Monitore o ranking de produtos campeões, alertas de estoque e
                  exporte balanços em PDF.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-rose-600 gap-1 pt-2">
                Acessar Módulo{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 4: Configurações da Fábrica */}
          <Link
            href="/dashboard/configuracoes"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-500/50 transition-all duration-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                  Configurações da Fábrica
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Atualize os dados institucionais, razão social, CNPJ e
                  preferências do sistema.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-slate-700 gap-1 pt-2">
                Acessar Módulo{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* RODAPÉ INFORMATIVO DE STATUS */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center text-xs text-slate-500 shadow-sm flex items-center justify-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
            N
          </span>
          Ambiente de produção local ativo. Última sincronização com o banco de
          dados realizada em tempo real.
        </div>
      </div>
    </main>
  );
}
