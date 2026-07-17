// import { Sidebar } from "@/components/sidebar";
import { Sidebar } from "../components/sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* O main agora tem um container interno para centralizar e limitar a largura */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 border-b pb-4">
            <h1 className="text-4xl font-bold">Dashboard de Gestão</h1>
          </header>

          {/* Aqui entrará o corpo do seu dashboard (gráficos, tabelas, etc.) */}
          <div className="grid gap-6">
            <p>Conteúdo do sistema será renderizado aqui.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
