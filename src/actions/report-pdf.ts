/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import PDFDocument from "pdfkit";
import { getSalesReportDataAction } from "./report";

/**
 * Função utilitária interna para higienização de strings.
 * Remove acentos e caracteres especiais (substituindo-os por equivalentes simples do padrão ASCII),
 * evitando erros de renderização ou quebras de texto (glifos ausentes) ao utilizar as fontes nativas do PDFKit.
 */
// Função utilitária para higienizar strings removendo acentos para fontes padrão do PDFKit
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[–—]/g, "-"); // Substitui travessões especiais por hífen comum
}

/**
 * Core Action para geração do relatório operacional em formato PDF.
 * Consome os dados analíticos consolidados de vendas do usuário autenticado,
 * coleta informações institucionais do banco isoladas por usuário,
 * renderiza o layout da folha A4 em memória através do PDFKit e retorna o binário codificado em Base64.
 */
export async function exportReportToPDFAction() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return { success: false, pdfBase64: null };
    }

    // 1. Puxa os dados analíticos do relatório existente
    const reportData = await getSalesReportDataAction();

    // 2. Puxa os dados institucionais do usuário logado protegendo contra nulo
    const settings = await (prisma as any).companySettings.findFirst({
      where: { userId: session.userId },
    });

    // 3. Inicializa o documento PDFKit em memória
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<string>((resolve, reject) => {
      doc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result.toString("base64"));
      });
      doc.on("error", (err) => {
        reject(err);
      });
    });

    // --- MONTAGEM DO LAYOUT DO PDF (Higienizado) ---

    // Cabeçalho Institucional Corporativo
    const tradeName = settings?.tradeName || "UTAH GOURMET";
    const companyName = settings?.companyName || "Utah Gourmet Ltda";
    const cnpj = settings?.cnpj || "00.000.000/0001-00";

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(sanitizeText(tradeName), { align: "left" });
    doc.fontSize(9).font("Helvetica").fillColor("#64748b");
    doc.text(`Razao Social: ${sanitizeText(companyName)}`);
    doc.text(`CNPJ: ${sanitizeText(cnpj)}`);
    if (settings?.address) {
      doc.text(`Endereco: ${sanitizeText(settings.address)}`);
    }

    doc.moveDown();
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    doc.moveDown();

    // Título do Relatório
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("RELATORIO DE DESEMPENHO COMERCIAL E ESTOQUE");
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748b")
      .text(
        `Emitido em: ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`,
      );
    doc.moveDown(2);

    // Bloco 1: Métricas Financeiras Básicas
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("1. Resumo Financeiro");
    doc.moveDown(0.5);

    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

    doc.fontSize(10).font("Helvetica").fillColor("#334155");
    doc.text(
      `* Faturamento Real (Entregues): ${formatBRL(reportData.metrics.totalRevenue)}`,
    );
    doc.text(
      `* Faturamento Projetado (Em Carteira): ${formatBRL(reportData.metrics.pendingRevenue)}`,
    );
    doc.text(
      `* Volume de Pedidos Concluidos: ${reportData.metrics.completedOrdersCount} de ${reportData.metrics.totalOrdersCount}`,
    );
    doc.text(
      `* Ticket Medio B2B: ${formatBRL(reportData.metrics.averageOrderValue)}`,
    );

    doc.moveDown(2);

    // Bloco 2: Produtos Mais Vendidos
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("2. Ranking - Top Produtos Campeoes");
    doc.moveDown(0.5);

    if (!reportData.topProducts || reportData.topProducts.length === 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("Nenhuma movimentacao faturada no periodo.");
    } else {
      reportData.topProducts.forEach((prod: any, idx: number) => {
        const cleanName = sanitizeText(prod.name);
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#334155")
          .text(
            `${idx + 1}. ${cleanName} - ${prod.quantity} un vendidas - Total: ${formatBRL(prod.revenue)}`,
          );
      });
    }

    doc.moveDown(2);

    // Bloco 3: Alertas Críticos de Depósito
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#0f172a")
      .text("3. Alertas de Ruptura de Estoque (<= 10 un)");
    doc.moveDown(0.5);

    if (
      !reportData.criticalStockProducts ||
      reportData.criticalStockProducts.length === 0
    ) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#16a34a")
        .text("All products found with safe inventory levels.");
    } else {
      reportData.criticalStockProducts.forEach((prod: any) => {
        const cleanProdName = sanitizeText(prod.name);
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#dc2626")
          .text(
            `* [ALERTA ESTOQUE] ${cleanProdName} - Restam apenas ${prod.stock} unidades no deposito.`,
          );
      });
    }

    // Finaliza a escrita com segurança
    doc.end();

    const base64Data = await pdfPromise;
    return { success: true, pdfBase64: base64Data };
  } catch (error) {
    console.error("Erro interno catastrófico ao gerar PDF:", error);
    return { success: false, pdfBase64: null };
  }
}
