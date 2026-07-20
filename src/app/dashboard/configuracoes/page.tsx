/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getCompanySettingsAction,
  updateCompanySettingsAction,
} from "@/src/actions/settings";
import { Building2, Save, RefreshCw, ShieldAlert } from "lucide-react";

/**
 * Client Component de página para gestão das configurações institucionais corporativas.
 * Carrega e hidrata os dados cadastrais da empresa (Razão Social, Nome Fantasia, CNPJ, Contatos)
 * via Server Action, permitindo atualizações em lote com feedbacks visuais de carregamento e confirmação.
 */
export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function loadSettings() {
    setIsLoading(true);
    const data = await getCompanySettingsAction();
    if (data) setSettings(data);
    setIsLoading(false);
  }

  useEffect(() => {
    (async () => {
      await loadSettings();
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setIsSaving(true);
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateCompanySettingsAction(formData);

    setIsSaving(false);
    if (result.success) {
      setSaveSuccess(true);
      await loadSettings();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setFormErrors(result.errors || {});
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground bg-background">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando parâmetros globais...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl text-foreground">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Configurações do Sistema
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie o cadastro institucional corporativo da fábrica.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md text-sm font-medium">
          ✓ Configurações salvas e aplicadas com sucesso!
        </div>
      )}

      {formErrors.global && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm font-medium">
          {formErrors.global[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações Jurídicas */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Perfil da Empresa</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Razão Social</label>
              <input
                type="text"
                name="companyName"
                defaultValue={settings?.companyName}
                required
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {formErrors.companyName && (
                <p className="text-xs text-red-600">
                  {formErrors.companyName[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Nome Fantasia</label>
              <input
                type="text"
                name="tradeName"
                defaultValue={settings?.tradeName}
                required
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {formErrors.tradeName && (
                <p className="text-xs text-red-600">
                  {formErrors.tradeName[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">CNPJ</label>
              <input
                type="text"
                name="cnpj"
                defaultValue={settings?.cnpj}
                required
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              {formErrors.cnpj && (
                <p className="text-xs text-red-600">{formErrors.cnpj[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 2: Contato e Endereço */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Contato & Localização</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Telefone Comercial</label>
              <input
                type="text"
                name="phone"
                defaultValue={settings?.phone || ""}
                placeholder="(81) 98888-8888"
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">
                E-mail de Faturamento
              </label>
              <input
                type="email"
                name="email"
                defaultValue={settings?.email || ""}
                placeholder="comercial@empresa.com"
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {formErrors.email && (
                <p className="text-xs text-red-600">{formErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium">
                Endereço da Fábrica / Depósito
              </label>
              <input
                type="text"
                name="address"
                defaultValue={settings?.address || ""}
                placeholder="Av. Exemplo, 123 - Distrito Industrial"
                className="w-full px-3 py-2 border rounded-md bg-transparent text-sm border-input focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Ação do Formulário */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
