import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

// 1. Definição das rotas do sistema
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"]; // Removi a '/' daqui para ela ser tratada como regra de redirecionamento

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Verifica qual é o tipo da rota atual
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 2. Busca do Crachá (Cookie)
  const token = req.cookies.get("b2b_session")?.value;

  // 3. Validação do Token
  const verifiedToken = token ? await verifyToken(token) : null;

  // REGRA ESPECIAL: Redirecionar a raiz
  if (path === "/") {
    return NextResponse.redirect(
      new URL(verifiedToken ? "/dashboard" : "/login", req.nextUrl),
    );
  }

  // 4. Regra 1: Sem acesso VIP
  if (isProtectedRoute && !verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Regra 2: Já está dentro do prédio
  if (isPublicRoute && verifiedToken) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
