import { z } from "zod";

/**
 * Schema Zod de validação profissional para o formulário de Clientes B2B.
 * Valida a Razão Social, sanitiza o CNPJ mantendo apenas números (14 dígitos),
 * aceita e-mail/telefone opcionais e valida o status operacional (ACTIVE / INACTIVE).
 */
export const clientSchema = z.object({
  name: z
    .string()
    .min(3, "O nome ou razão social deve ter pelo menos 3 caracteres")
    .max(100, "O nome não pode exceder 100 caracteres"),

  cnpj: z
    .string()
    .min(1, "O CNPJ é obrigatório")
    .transform((val) => val.replace(/\D/g, "")) // Limpa pontos, traços e barras automaticamente
    .refine((val) => val.length === 14, {
      message: "O CNPJ deve conter exatamente 14 dígitos",
    }),

  email: z
    .string()
    .email("Insira um endereço de e-mail válido")
    .optional()
    .or(z.literal("")), // Permite campo vazio sem quebrar a validação

  phone: z.string().optional().or(z.literal("")), // Permite campo vazio ou incompletos na criação

  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// Exporta a tipagem inferida automaticamente pelo Zod para uso no ClientForm e Server Actions
export type ClientFormValues = z.infer<typeof clientSchema>;
