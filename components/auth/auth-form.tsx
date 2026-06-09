"use client";

import { useActionState, useState } from "react";
import { login, register, type AuthFormState } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { HybridLocationPicker } from "@/components/location/hybrid-location-picker";
import { ServiceRadiusSlider } from "@/components/location/service-radius-slider";
import type { UserRole } from "@/lib/types/profile";
import { btnPrimaryClassName, inputClassName, labelClassName } from "@/lib/ui-classes";

type AuthMode = "login" | "register";

const initialState: AuthFormState = {};

type AuthFormProps = {
  redirectTo?: string;
  authError?: string;
};

function RoleSelection({
  selectedRole,
  onRoleChange,
}: {
  selectedRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
}) {
  return (
    <div className="space-y-2">
      <span className={labelClassName}>
        Mit szeretnél csinálni a fusizok.hu-n?{" "}
        <span className="text-amber-500">*</span>
      </span>
      <div className="grid gap-3 sm:grid-cols-1">
        <label className="flex cursor-pointer items-center rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400">
          <input
            type="radio"
            name="role_choice"
            value="client"
            checked={selectedRole === "client"}
            onChange={() => onRoleChange("client")}
            className="mr-3 accent-amber-500"
          />
          Segítséget keresek – munkát akarok feladni
        </label>
        <label className="flex cursor-pointer items-center rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400">
          <input
            type="radio"
            name="role_choice"
            value="craftsman"
            checked={selectedRole === "craftsman"}
            onChange={() => onRoleChange("craftsman")}
            className="mr-3 accent-amber-500"
          />
          Fusizni akarok – munkákat vállalnék
        </label>
      </div>
      {!selectedRole && (
        <p className="text-xs text-zinc-500">
          A bejelentkezéshez előbb válaszd ki az egyik opciót.
        </p>
      )}
    </div>
  );
}

export function AuthForm({ redirectTo = "/", authError }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [craftsmanHasLocation, setCraftsmanHasLocation] = useState(false);
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
  const isBusy = isPending;
  const canAuthenticate = selectedRole !== null;

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <RoleSelection
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </div>

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

      <GoogleSignInButton
        redirectTo={redirectTo}
        role={selectedRole ?? undefined}
        disabled={isBusy || !canAuthenticate}
      />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-zinc-800/90 px-3 text-zinc-500">vagy e-maillel</span>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />
        {selectedRole && <input type="hidden" name="role" value={selectedRole} />}

        {(state.error || authError) && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {state.error ??
              (authError === "auth_callback_failed"
                ? "A Google bejelentkezés sikertelen. Próbáld újra."
                : authError)}
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
              disabled={!canAuthenticate}
              placeholder="Kovács János"
              className={inputClassName}
            />
          </div>
        )}

        {mode === "register" && selectedRole === "craftsman" && (
          <div className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4">
            <p className="text-sm text-zinc-400">
              Hol vállalnál munkát? GPS-sel pontosan, vagy kézzel is megadhatod
              – később a profilodban módosíthatod.
            </p>
            <HybridLocationPicker
              label="Bázis helyszín"
              required={false}
              onChange={(value) => setCraftsmanHasLocation(value.mode !== null)}
            />
            {craftsmanHasLocation && <ServiceRadiusSlider />}
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
            disabled={!canAuthenticate}
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
            disabled={!canAuthenticate}
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !canAuthenticate}
          className={`w-full ${btnPrimaryClassName}`}
        >
          {isPending
            ? "Folyamatban…"
            : !canAuthenticate
              ? "Válassz fiók típust a folytatáshoz"
              : mode === "login"
                ? "Bejelentkezés"
                : "Fiók létrehozása"}
        </button>
      </form>
    </div>
  );
}
