"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  uploadProfileAvatar,
  type AvatarUploadState,
} from "@/app/actions/profile";
import { UserAvatar } from "@/components/profile/user-avatar";
import { btnSecondaryClassName, labelClassName } from "@/lib/ui-classes";

const initialState: AvatarUploadState = {};

type AvatarUploadProps = {
  userName: string | null;
  avatarUrl: string | null;
};

export function AvatarUpload({ userName, avatarUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    uploadProfileAvatar,
    initialState,
  );

  const displayUrl = state.avatarUrl ?? avatarUrl;

  useEffect(() => {
    if (state.success && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [state.success]);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <UserAvatar name={userName} avatarUrl={displayUrl} size="xl" />

      <form action={formAction} className="flex-1 space-y-3">
        <div>
          <span className={labelClassName}>Profilkép</span>
          <p className="mt-1 text-sm text-zinc-500">
            JPG, PNG, WEBP vagy GIF, max. 5 MB.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              e.target.form?.requestSubmit();
            }
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={btnSecondaryClassName}
          disabled={isPending}
        >
          {isPending ? "Feltöltés…" : "Kép kiválasztása"}
        </button>

        {isPending && (
          <p className="text-sm text-zinc-400">Feltöltés…</p>
        )}

        {state.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-emerald-400" role="status">
            Profilkép frissítve!
          </p>
        )}
      </form>
    </div>
  );
}
