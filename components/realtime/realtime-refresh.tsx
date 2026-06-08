"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RealtimeRefreshProps = {
  table: "job_bids" | "messages" | "conversations";
  filter?: string;
  event?: "INSERT" | "UPDATE" | "*";
  debounceMs?: number;
};

export function RealtimeRefresh({
  table,
  filter,
  event = "*",
  debounceMs = 400,
}: RealtimeRefreshProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const scheduleRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), debounceMs);
    };

    const channel = supabase
      .channel(`refresh:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [table, filter, event, debounceMs, router]);

  return null;
}
