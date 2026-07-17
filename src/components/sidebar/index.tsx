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

import {
  PanelBottom,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  Package,
} from "lucide-react";

//Menu
export function Sidebar() {
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
          // Adicionado flex e flex-col para garantir que o conteúdo interno possa esticar
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

          {/* Adicionado flex-1 para que o nav ocupe todo o espaço restante verticalmente */}
          <nav className="flex flex-col gap-4 flex-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </a>
            <a
              href="/pedidos"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </a>
            <a
              href="/produtos"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <Package className="h-5 w-5" />
              Produtos
            </a>
            <a
              href="/clientes"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <Users className="h-5 w-5" />
              Clientes
            </a>
            <a
              href="/relatorios"
              className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
            >
              <FileText className="h-5 w-5" />
              Relatórios
            </a>

            {/* Agrupado o hr, Configurações e Sair nesta div com mt-auto para empurrar tudo para baixo */}
            <div className="mt-auto flex flex-col gap-4 pb-4">
              <hr className="my-2 border-slate-300" />
              <a
                href="/configuracoes"
                className="flex items-center gap-3 p-2 hover:bg-slate-300 rounded-md transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </a>
              <button className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left">
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* --- Ícones da Home Inicial (Navigation Rail) --- */}
      <nav className="mt-8 flex flex-1 flex-col items-center gap-8 w-full">
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
          href="/pedidos"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Pedidos" className="flex items-center justify-center">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <span className="sr-only">Pedidos</span>
        </Link>
        <Link
          href="/produtos"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Produtos" className="flex items-center justify-center">
            <Package className="h-5 w-5" />
          </span>
          <span className="sr-only">Produtos</span>
        </Link>
        <Link
          href="/clientes"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Clientes" className="flex items-center justify-center">
            <Users className="h-5 w-5" />
          </span>
          <span className="sr-only">Clientes</span>
        </Link>
        <Link
          href="/relatorios"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span title="Relatórios" className="flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </span>
          <span className="sr-only">Relatórios</span>
        </Link>
      </nav>
    </div>
  );
}
