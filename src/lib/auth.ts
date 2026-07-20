import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Recupera e codifica a chave secreta JWT (JWT_SECRET) para o formato Uint8Array exigido pelo 'jose'.
 * Possui suporte a chave temporária fallback exclusiva para ambiente de desenvolvimento.
 */
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length === 0) {
    if (process.env.NODE_ENV === "development") {
      return new TextEncoder().encode(
        "chave-secreta-temporaria-desenvolvimento-32-caracteres",
      );
    }
    throw new Error("A variável de ambiente JWT_SECRET não está definida.");
  }

  return new TextEncoder().encode(secret);
};

/**
 * Contrato de interface para a estrutura dos dados embutidos no token JWT.
 */
export interface TokenPayload {
  userId: string;
  organizationId?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Gera um novo JWT assinado para o usuário.
 * @param payload Dados que serão embutidos no token (ex: id do usuário e da empresa)
 * @returns String do token JWT
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Tempo de sessão definido para 24 horas
    .sign(getJwtSecretKey());

  return token;
}

/**
 * Verifica a validade e a assinatura de um JWT.
 * @param token String do token JWT recuperado dos cookies
 * @returns O payload decodificado se válido, ou null se for inválido/expirado
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Helper para Server Actions e Server Components:
 * Obtém os dados do usuário/organização autenticado diretamente do cookie 'b2b_session'.
 * Utilizado para filtrar consultas no banco de dados garantindo o isolamento multi-tenant.
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("b2b_session")?.value;

  if (!token) return null;

  return await verifyToken(token);
}
