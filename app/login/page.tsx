import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/layout/page-container";
import { resolvePostLoginPath } from "@/lib/auth/resolve-post-login-path";
import { getAuthContext } from "@/lib/auth/session";
import { cardClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Bejelentkezés – fusizok.hu",
  description: "Csatlakozz a fusizok.hu közösségéhez.",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectParam, error: authError } = await searchParams;
  const { user, profile } = await getAuthContext();

  if (user) {
    redirect(resolvePostLoginPath(redirectParam, profile?.role));
  }

  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow className="flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-50">
            Üdv a fusizok.hu-n!
          </h1>
          <p className="mt-2 text-zinc-400">
            Jelentkezz be, vagy regisztrálj – fusizz vagy kérj segítséget.
          </p>
          {redirectTo === "/lakos" && (
            <p className="mt-2 text-sm text-amber-500">
              A munkafeladáshoz bejelentkezés kell. Az űrlap adatai megmaradnak.
            </p>
          )}
          {redirectTo === "/szaki" && (
            <p className="mt-2 text-sm text-amber-500">
              Fusizóként regisztrálj vagy jelentkezz be a munkák böngészéséhez.
            </p>
          )}
        </div>

        <div className={`w-full max-w-md ${cardClassName} p-6 sm:p-8`}>
          <AuthForm redirectTo={redirectTo} authError={authError} />
        </div>
      </PageContainer>
    </div>
  );
}
