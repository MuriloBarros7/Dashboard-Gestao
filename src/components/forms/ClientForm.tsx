"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  clientSchema,
  type ClientFormValues,
} from "../../lib/validations/client";
import { createClient, updateClient } from "../../actions/client";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";

// 1. Tipamos as propriedades que o formulário pode receber
interface ClientFormProps {
  initialData?: ClientFormValues;
  clientId?: string;
}

export function ClientForm({ initialData, clientId }: ClientFormProps) {
  const router = useRouter();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    // 2. Se receber initialData (modo edição), preenche os campos. Senão, começa vazio.
    defaultValues: initialData || { name: "", cnpj: "", email: "", phone: "" },
  });

  async function onSubmit(data: ClientFormValues) {
    try {
      // 3. Bifurcação da Lógica (Create vs Update)
      if (clientId) {
        await updateClient(clientId, data);
        toast.success("Cliente atualizado com sucesso!");
        router.push("/dashboard/clients"); // Redireciona de volta para a tabela
        router.refresh(); // Força o Next.js a buscar os dados atualizados no banco
      } else {
        await createClient(data);
        toast.success("Cliente cadastrado com sucesso!");
        form.reset();
      }
    } catch {
      toast.error(
        clientId ? "Erro ao atualizar cliente." : "Erro ao cadastrar cliente.",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  {...field}
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {/* 4. Feedback visual dinâmico no botão */}
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
