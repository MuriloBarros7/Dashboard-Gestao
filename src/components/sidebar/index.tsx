"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/src/actions/auth";

import {
  PanelBottom,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  Package,
  Home,
  Landmark,
} from "lucide-react";

/**
 * Client Component de barra de navegação lateral (Sidebar e Navigation Rail).
 * Disponibiliza gaveta de menu retrátil via 'Sheet' com atalhos para todas as áreas
 * administrativas do ERP, além de ícones fixos e botão de encerramento de sessão (logout).
 */
export function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAction();
      router.push("/login"); // ← Rota correta de login
      router.refresh();
    } catch (error) {
      console.error("Erro ao tentar deslogar:", error);
    }
  }

  return (
    <div className="flex flex-col border-r bg-slate-100 h-screen w-16 items-center pt-8">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              className="p-0 h-auto w-auto rounded-none bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
            />
          }
        >
          <span title="Menu" className="flex items-center justify-center">
            <PanelBottom className="h-5 w-5" />
          </span>
          <span className="sr-only">Menu</span>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-75 sm:w-100 bg-slate-100 border-r flex flex-col"
        >
          <SheetHeader className="mb-8 hover:bg-slate-300 rounded-md transition-colors">
            <SheetTitle className="flex items-center gap-5 text-lg font-bold text-foreground">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              Menu de Gestão
            </SheetTitle>
            <SheetDescription>
              Navegue pelo seu painel administrativo.
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col gap-4 flex-1">
            <Link
              href="/"
              className="flex items-center gap-3 p-2 bg-slate-200/50 text-slate-700 hover:bg-slate-300 rounded-md transition-colors font-medium border border-slate-300/50"
            >
              <Home className="h-5 w-5 text-slate-600" />
              Voltar ao Site
            </Link>

            <hr className="my-1 border-slate-300" />

            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </Link>

            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <Package className="h-5 w-5" />
              Produtos
            </Link>

            <Link
              href="/dashboard/clients"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <Users className="h-5 w-5" />
              Clientes
            </Link>

            <Link
              href="/dashboard/relatorios"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <FileText className="h-5 w-5" />
              Relatórios
            </Link>

            <Link
              href="/dashboard/financial"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <Landmark className="h-5 w-5" />
              Finanças
            </Link>

            <div className="mt-auto flex flex-col gap-4 pb-4">
              <hr className="my-2 border-slate-300" />

              <Link
                href="/configuracoes"
                className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left font-medium cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* --- Ícones Fixos Rápidos (Navigation Rail) --- */}
      <nav className="mt-8 flex flex-1 flex-col items-center gap-8 w-full">
        <Link
          href="/"
          className="text-slate-500 transition-colors hover:text-foreground bg-slate-200/60 p-2 rounded-full hover:bg-slate-300/80"
          title="Voltar ao Site Principal"
        >
          <span className="flex items-center justify-center">
            <Home className="h-5 w-5" />
          </span>
          <span className="sr-only">Voltar ao Site</span>
        </Link>

        <hr className="w-8 border-slate-300" />

        <Link
          href="/dashboard"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Dashboard" className="flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <span className="sr-only">Dashboard</span>
        </Link>

        <Link
          href="/dashboard/orders"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Pedidos" className="flex items-center justify-center">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <span className="sr-only">Pedidos</span>
        </Link>

        <Link
          href="/dashboard/products"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Produtos" className="flex items-center justify-center">
            <Package className="h-5 w-5" />
          </span>
          <span className="sr-only">Produtos</span>
        </Link>

        <Link
          href="/dashboard/clients"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Clientes" className="flex items-center justify-center">
            <Users className="h-5 w-5" />
          </span>
          <span className="sr-only">Clientes</span>
        </Link>

        <Link
          href="/dashboard/relatorios"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Relatórios" className="flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </span>
          <span className="sr-only">Relatórios</span>
        </Link>

        <Link
          href="/dashboard/financial"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Finanças" className="flex items-center justify-center">
            <Landmark className="h-5 w-5" />
          </span>
          <span className="sr-only">Finanças</span>
        </Link>
      </nav>
    </div>
  );
}
