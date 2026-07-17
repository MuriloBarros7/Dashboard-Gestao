import { SignJWT, jwtVerify } from "jose";

// Função utilitária para buscar e encodar a chave secreta
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error("A variável de ambiente JWT_SECRET não está definida.");
  }

  return new TextEncoder().encode(secret);
};

// Interface para garantir a tipagem correta do payload (Dicionário de Dados)
interface TokenPayload {
  userId: string;
  organizationId: string;
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
    return payload as TokenPayload;
  } catch (error) {
    // Se o token for inválido, adulterado ou estiver expirado, a promessa é rejeitada
    return null;
  }
}
