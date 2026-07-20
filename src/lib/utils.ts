import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário central para mesclagem condicional e resolução de conflitos de classes do Tailwind CSS.
 * Combina 'clsx' para manipulação condicional de strings/objetos de classes e
 * 'tailwind-merge' para garantir a sobrescrita limpa de estilos em componentes reutilizáveis.
 *
 * @param inputs Lista de classes, objetos condicionais ou arrays de estilos.
 * @returns String de classes otimizada e sanitizada para a propriedade 'className'.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
