"use client";

import { useActionState, useState } from "react";
import { login, register, type AuthFormState } from "@/app/actions/auth";
import { btnPrimaryClassName, inputClassName, labelClassName } from "@/lib/ui-classes";

type AuthMode = "login" | "register";

const initialState: AuthFormState = {};

type AuthFormProps = {
  redirectTo?: string;
};

export function AuthForm({ redirectTo = "/" }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginState, loginAction, isLoginPending] = useActionState(
    login,
    initialState,
  );
  const [registerState, registerAction, isRegisterPending] = useActionState(
    register,
    initialState,
  );

  const state = mode === "login" ? loginState : registerState;
  const formAction = mode === "login" ? loginAction : registerAction;
  const isPending = mode === "login" ? isLoginPending : isRegisterPending;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-700">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            mode === "login"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          Bejelentkezés
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            mode === "register"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          Regisztráció
        </button>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />

        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {state.success}
          </div>
        )}

        {mode === "register" && (
          <div className="space-y-2">
            <label htmlFor="full_name" className={labelClassName}>
              Teljes név
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="Kovács János"
              className={inputClassName}
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className={labelClassName}>
            E-mail cím
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nev@email.hu"
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className={labelClassName}>
            Jelszó
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            className={inputClassName}
          />
        </div>

        {mode === "register" && (
          <div className="space-y-2">
            <span className={labelClassName}>Fiók típusa</span>
            <div className="grid gap-3 sm:grid-cols-1">
              <label className="flex cursor-pointer items-center rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  defaultChecked
                  className="mr-3 accent-amber-500"
                />
                Segítséget keresek
              </label>
              <label className="flex cursor-pointer items-center rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400">
                <input
                  type="radio"
                  name="role"
                  value="craftsman"
                  className="mr-3 accent-amber-500"
                />
                Fusizni akarok (pénzt keresnék)
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`w-full ${btnPrimaryClassName}`}
        >
          {isPending
            ? "Folyamatban…"
            : mode === "login"
              ? "Bejelentkezés"
              : "Fiók létrehozása"}
        </button>
      </form>
    </div>
  );
}
