/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { jsPDF } from "jspdf";
import { getSalesReportDataAction } from "@/src/actions/report";

/**
 * Função utilitária interna para sanitização de strings.
 * Remove acentos e caracteres diacríticos para evitar falhas de codificação
 * ou caracteres corrompidos ao renderizar com as fontes padrão da biblioteca jsPDF.
 */
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-");
}

/**
 * Route Handler de API (GET) para geração e download nativo do relatório corporativo em PDF.
 * Consome os dados de vendas e configurações da empresa, monta o layout milimétrico
 * com jsPDF e devolve uma resposta HTTP (NextResponse) do tipo 'application/pdf' com
 * cabeçalho 'Content-Disposition: attachment' para disparo imediato do download no navegador.
 */
export async function GET() {
  try {
    // 1. Coleta os dados com segurança
    const reportData = await getSalesReportDataAction().catch(() => ({
      metrics: {
        totalRevenue: 0,
        pendingRevenue: 0,
        completedOrdersCount: 0,
        totalOrdersCount: 0,
        averageOrderValue: 0,
      },
      topProducts: [],
      criticalStockProducts: [],
    }));

    const settings = await (prisma as any).companySettings
      .findFirst()
      .catch(() => null);

    // 2. Cria a instância do jsPDF (A4, orientação vertical, unidade em milímetros)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // --- CONTEÚDO DO DOCUMENTO (Totalmente genérico) ---
    const tradeName = settings?.tradeName || "MINHA EMPRESA";
    const companyName = settings?.companyName || "Razao Social Nao Cadastrada";
    const cnpj = settings?.cnpj || "00.000.000/0000-00";

    // --- MONTAGEM DO CONTEÚDO ---
    let y = 15; // Controlador de linha (margem vertical)

    // Cabeçalho Corporativo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(sanitizeText(tradeName), 15, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Razao Social: ${sanitizeText(companyName)}`, 15, y);

    y += 4;
    doc.text(`CNPJ: ${sanitizeText(cnpj)}`, 15, y);
    if (settings?.address) {
      y += 4;
      doc.text(`Endereco: ${sanitizeText(settings.address)}`, 15, y);
    }

    // Linha Divisória
    y += 6;
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(15, y, 195, y);

    // Título do Relatório
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("RELATORIO DE DESEMPENHO COMERCIAL E ESTOQUE", 15, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Emitido em: ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`,
      15,
      y,
    );

    // Seção 1: Resumo Financeiro
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Resumo Financeiro", 15, y);

    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);
    const m = reportData.metrics || {};

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text(
      `* Faturamento Real (Entregues): ${formatBRL(m.totalRevenue || 0)}`,
      15,
      y,
    );
    y += 5;
    doc.text(
      `* Faturamento Projetado (Em Carteira): ${formatBRL(m.pendingRevenue || 0)}`,
      15,
      y,
    );
    y += 5;
    doc.text(
      `* Volume de Pedidos Concluidos: ${m.completedOrdersCount || 0} de ${m.totalOrdersCount || 0}`,
      15,
      y,
    );
    y += 5;
    doc.text(
      `* Ticket Medio B2B: ${formatBRL(m.averageOrderValue || 0)}`,
      15,
      y,
    );

    // Seção 2: Top Produtos
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Ranking - Top Produtos Campeoes", 15, y);

    y += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      reportData.topProducts.forEach((prod: any, idx: number) => {
        y += 5;
        doc.text(
          `${idx + 1}. ${sanitizeText(prod.name)} - ${prod.quantity || 0} un - Total: ${formatBRL(prod.revenue || 0)}`,
          15,
          y,
        );
      });
    } else {
      y += 5;
      doc.setTextColor(100, 116, 139);
      doc.text("Nenhuma movimentacao faturada no periodo.", 15, y);
    }

    // Seção 3: Alertas de Estoque
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Alertas de Ruptura de Estoque (<= 10 un)", 15, y);

    y += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (
      reportData.criticalStockProducts &&
      reportData.criticalStockProducts.length > 0
    ) {
      doc.setTextColor(220, 38, 38); // Vermelho
      reportData.criticalStockProducts.forEach((prod: any) => {
        y += 5;
        doc.text(
          `* [ALERTA ESTOQUE] ${sanitizeText(prod.name)} - Restam apenas ${prod.stock || 0} unidades.`,
          15,
          y,
        );
      });
    } else {
      y += 5;
      doc.setTextColor(22, 163, 74); // Verde
      doc.text(
        "Todos os produtos encontram-se com niveis estaveis de estoque.",
        15,
        y,
      );
    }

    // 3. Gera o arquivo final como um ArrayBuffer binário nativo
    const pdfArrayBuffer = doc.output("arraybuffer");

    return new NextResponse(new Uint8Array(pdfArrayBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Relatorio_Performance_${new Date().toISOString().split("T")[0]}.pdf`,
      },
    });
  } catch (error) {
    console.error("Erro interno no Route Handler PDF:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
