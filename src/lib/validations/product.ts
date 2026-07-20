import { z } from "zod";

/**
 * Schema Zod de validação para o formulário de Produtos/Itens do Catálogo.
 * Valida o nome do item e garante que o preço seja uma string conversível
 * para um valor numérico válido e não negativo (suportando vírgula como separador decimal).
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(2, "O nome do produto deve ter pelo menos 2 caracteres")
    .max(255, "O nome do produto não pode exceder 255 caracteres"),
  price: z
    .string()
    .min(1, "O preço é obrigatório")
    .refine(
      (val) => !isNaN(parseFloat(val.replace(",", "."))),
      "Preço inválido",
    )
    .refine(
      (val) => parseFloat(val.replace(",", ".")) >= 0,
      "O preço não pode ser negativo",
    ),
});

// Exporta a tipagem inferida automaticamente pelo Zod para uso nos formulários e Server Actions
export type ProductFormValues = z.infer<typeof productSchema>;
