export function formatCNPJ(cnpj: string) {
  const cleanCNPJ = cnpj.replace(/\D/g, "").slice(0, 14);
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}
