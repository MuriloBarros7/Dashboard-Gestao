import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

/**
 * Middleware global de segurança e controle de navegação da aplicação.
 * Intercepta as requisições HTTP em tempo de execução para validar a presença e a integridade
 * do cookie de sessão JWT ('b2b_session'). Gerencia o fluxo de autenticação redirecionando
 * usuários não autenticados para a tela de login e impedindo que usuários logados
 * acessem páginas públicas desnecessariamente.
 */

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Busca o token de sessão
  const token = req.cookies.get("b2b_session")?.value;
  const verifiedToken = token ? await verifyToken(token) : null;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 1. Se acessar a Raiz "/" SEM estar logado -> vai para /login
  if (path === "/" && !verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Tentar acessar rotas /dashboard SEM estar logado -> vai para /login
  if (isProtectedRoute && !verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 3. Se estiver logado e tentar acessar /login -> manda para a raiz "/" (Hub de entrada)
  if (isPublicRoute && verifiedToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
