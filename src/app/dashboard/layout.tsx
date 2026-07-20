import { Sidebar } from "@/src/components/sidebar"; // ou o caminho correto do seu componente de Sidebar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* 1. Barra Lateral Fixa com o botão de voltar ao topo */}
      <Sidebar />

      {/* 2. Área de Conteúdo */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
