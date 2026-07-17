import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Páginas acessíveis sem sessão.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/termos",
];

// Páginas de onde um usuário já autenticado deve ser tirado (mas não
// /redefinir-senha: durante o fluxo de recuperação de senha o Supabase cria
// uma sessão temporária e o usuário precisa continuar nessa página).
const REDIRECT_IF_AUTHENTICATED = ["/login", "/cadastro", "/esqueci-senha"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/cadastro/") ||
    pathname.startsWith("/esqueci-senha/")
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[proxy] variáveis de ambiente do Supabase ausentes:", {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
      pathname: request.nextUrl.pathname,
    });
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalida contra o Auth server — nunca usar getSession() aqui.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (userError) {
    console.error("[proxy] getUser() falhou:", {
      pathname,
      message: userError.message,
      status: userError.status,
      code: userError.code,
    });
  }

  if (!user && !isPublicPath(pathname)) {
    console.log("[proxy] sem sessão em rota protegida, redirecionando pra /login:", pathname);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && REDIRECT_IF_AUTHENTICATED.includes(pathname)) {
    console.log("[proxy] sessão ativa em rota pública de auth, redirecionando pra /:", pathname);
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
