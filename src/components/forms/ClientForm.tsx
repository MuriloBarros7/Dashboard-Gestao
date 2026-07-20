/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { clientSchema } from "@/src/lib/validations/client";
import { createClientAction, updateClientAction } from "@/src/actions/client";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

interface ClientFormProps {
  initialData?: any;
  clientId?: string;
}

/**
 * Client Component de formulário reativo para criação e edição de clientes.
 * Gerencia a validação de Razão Social, CNPJ, e-mail, telefone com máscara e status do cliente,
 * utilizando tipagem flexibilizada para acomodar os campos do banco e Server Actions.
 */
export function ClientForm({ initialData, clientId }: ClientFormProps) {
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      status: "ACTIVE",
    },
  });

  async function onSubmit(data: any) {
    try {
      // Converte os dados do formulário para FormData exigido pelas Server Actions
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("cnpj", data.cnpj);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.status) formData.append("status", data.status);

      if (clientId) {
        const result = await updateClientAction(clientId, formData);
        if (result.success) {
          toast.success("Cliente atualizado com sucesso!");
          router.push("/dashboard/clients");
          router.refresh();
        } else {
          toast.error("Erro ao atualizar cliente.");
        }
      } else {
        const result = await createClientAction(formData);
        if (result.success) {
          toast.success("Cliente cadastrado com sucesso!");
          form.reset({
            name: "",
            cnpj: "",
            email: "",
            phone: "",
            status: "ACTIVE",
          });
        } else {
          toast.error("Erro ao cadastrar cliente.");
        }
      }
    } catch (error) {
      console.error("Erro no envio do formulário de cliente:", error);
      toast.error(
        clientId ? "Erro ao atualizar cliente." : "Erro ao cadastrar cliente.",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Razão Social */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razão Social</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CNPJ */}
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ (apenas números)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="00000000000000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* E-mail */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telefone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");

                    if (value.length <= 11) {
                      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
                      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
                    }

                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status do Cliente */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status do Cliente</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão de Envio */}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting
            ? clientId
              ? "Salvando..."
              : "Cadastrando..."
            : clientId
              ? "Salvar Alterações"
              : "Cadastrar Cliente"}
        </Button>
      </form>
    </Form>
  );
}
