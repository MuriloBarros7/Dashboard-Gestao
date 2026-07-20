/* eslint-disable @typescript-eslint/no-explicit-any */
// prisma/seed.ts
import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma";
import * as bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Criação do Usuário Administrador
  await (prisma.user as any).upsert({
    where: { email: "murilo@email.com" },
    update: {},
    create: {
      email: "murilo@email.com",
      password: hashedPassword,
    },
  });
  console.log("✅ Usuário administrador estruturado.");

  // 2. Cadastro de Clientes Corporativos
  console.log("👥 Cadastrando clientes B2B de teste...");

  await (prisma.client as any).upsert({
    where: { cnpj: "12345678000199" },
    update: {},
    create: {
      name: "Distribuidora de Doces Recife LTDA",
      cnpj: "12345678000199",
      email: "compras@docesrecife.com",
      phone: "81999991111",
    },
  });

  await (prisma.client as any).upsert({
    where: { cnpj: "98765432000188" },
    update: {},
    create: {
      name: "Supermercado Olinda Gourmet",
      cnpj: "98765432000188",
      email: "financeiro@olindagourmet.com",
      phone: "81988882222",
    },
  });

  // 3. Catálogo de Produtos da Fábrica
  console.log("📦 Limpando e cadastrando itens no catálogo...");

  // Remove produtos antigos para evitar erros de restrição ao usar .create()
  await (prisma.product as any).deleteMany({});

  const productsToSeed = [
    { name: "Cento de Coxinha de Frango (Festa)", price: 65.0, stock: 15 },
    { name: "Cento de Brigadeiro Tradicional Gourmet", price: 80.0, stock: 20 },
    {
      name: "Bolo de Rolo Pernambucano Tradicional (1kg)",
      price: 45.0,
      stock: 40,
    },
    { name: "Cento de Quibe com Requeijão", price: 70.0, stock: 12 },
    { name: "Surpresa de Uva Caixa (50 unidades)", price: 50.0, stock: 25 },
  ];

  for (const prod of productsToSeed) {
    await (prisma.product as any).create({
      data: prod,
    });
  }

  console.log("🏁 Seed finalizado com sucesso! Banco alimentado localmente.");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
