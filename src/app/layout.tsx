import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Utah Gourmet - ERP & Gestão",
  description:
    "Sistema ERP de gestão de faturamento, clientes e estoque da fábrica Utah Gourmet.",
};

/**
 * Root Layout global do Next.js App Router.
 * Configura os provedores de fontes 'Geist', importa os estilos globais CSS,
 * define o idioma da aplicação para 'pt-BR' e disponibiliza o container reativo
 * 'Toaster' para exibições de notificações de toast em toda a aplicação.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
