/**
 * Utilitários de formatação e sanitização de dados para o ERP.
 */

/**
 * Formata uma string numérica para a máscara padrão de CNPJ (XX.XXX.XXX/XXXX-XX).
 * @param cnpj String de CNPJ sem tratamento
 * @returns CNPJ formatado ou limpo
 */
export function formatCNPJ(cnpj: string) {
  const cleanCNPJ = cnpj.replace(/\D/g, "").slice(0, 14);
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

/**
 * Formata um valor numérico para a moeda corrente brasileira (R$).
 * @param value Valor em number ou string
 * @returns Valor formatado em BRL (ex: R$ 1.500,00)
 */
export function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(amount)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Formata um número de telefone com DDD (celular de 9 dígitos ou fixo de 8 dígitos).
 * @param phone String contendo os dígitos do telefone
 * @returns Telefone formatado no padrão (81) 99999-9999 ou (81) 3333-4444
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length <= 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  }
  return cleanPhone.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
}
