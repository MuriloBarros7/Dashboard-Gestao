import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Puxa a string de conexão das variáveis de ambiente
const connectionString = `${process.env.DATABASE_URL}`;

// Cria o pool de conexão nativo do PostgreSQL
const pool = new Pool({ connectionString });

// Envolve o pool no adaptador do Prisma
const adapter = new PrismaPg(pool);

// Injeta o adaptador no construtor do PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
