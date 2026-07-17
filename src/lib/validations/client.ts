import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(3, "A Razão Social deve ter pelo menos 3 caracteres."),

  cnpj: z
    .string()
    .min(14, "O CNPJ deve ter no mínimo 14 números.")
    .max(18, "O CNPJ digitado é muito longo."),

  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Por favor, digite um endereço de e-mail válido."),

  phone: z.string().optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
