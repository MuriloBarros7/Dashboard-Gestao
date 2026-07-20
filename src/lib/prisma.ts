import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Puxa a string de conexão das variáveis de ambiente (.env)
const connectionString = `${process.env.DATABASE_URL}`;

// Cria o pool de conexão nativo do PostgreSQL via node-postgres
const pool = new Pool({ connectionString });

// Envolve o pool de conexão no adaptador oficial do Prisma
const adapter = new PrismaPg(pool);

/**
 * Instancia o PrismaClient injetando o adaptador PG nativo.
 * Evita a multiplicação desnecessária de instâncias durante o Hot Reloading do Next.js.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
