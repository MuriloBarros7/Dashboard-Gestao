"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  productSchema,
  type ProductFormValues,
} from "@/src/lib/validations/product";
import {
  createProductAction,
  updateProductAction,
} from "@/src/actions/product";
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

interface ProductFormProps {
  initialData?: {
    name: string;
    price: string;
  };
  productId?: string;
}

/**
 * Client Component de formulário reativo (com React Hook Form e Zod) para criação e edição de produtos.
 * Valida nome e preço do item, convertendo a entrada em FormData para ser consumido
 * de forma consistente pelas Server Actions do catálogo de produtos.
 */
export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      price: "",
    },
  });

  async function onSubmit(data: ProductFormValues) {
    try {
      // Converte os dados validados em FormData para as Server Actions
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append(
        "price",
        data.price.toString().replace(".", "").replace(",", "."),
      );
      formData.append("stock", "10"); // Valor padrão de estoque para novos cadastros

      if (productId) {
        const result = await updateProductAction(productId, formData);
        if (result.success) {
          toast.success("Produto atualizado com sucesso!");
          router.push("/dashboard/products");
          router.refresh();
        } else {
          toast.error("Erro ao atualizar produto.");
        }
      } else {
        const result = await createProductAction(formData);
        if (result.success) {
          toast.success("Produto cadastrado com sucesso!");
          form.reset({ name: "", price: "" });
          router.push("/dashboard/products");
          router.refresh();
        } else {
          toast.error("Erro ao cadastrar produto.");
        }
      }
    } catch (error) {
      console.error("Erro no envio do formulário de produto:", error);
      toast.error(
        productId ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome do Produto */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Coxinha de Frango, Brigadeiro Gourmet"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preço */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de Venda (R$)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting
            ? productId
              ? "Salvando..."
              : "Cadastrando..."
            : productId
              ? "Salvar Alterações"
              : "Cadastrar Produto"}
        </Button>
      </form>
    </Form>
  );
}
