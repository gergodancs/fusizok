"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PioneerZoneModal,
  type PioneerZoneVariant,
} from "@/components/zone/pioneer-zone-modal";

export function PioneerZoneFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<PioneerZoneVariant>("craftsman");

  useEffect(() => {
    const pioneer = searchParams.get("pioneerZone");
    if (pioneer === "craftsman" || pioneer === "client") {
      setVariant(pioneer);
      setOpen(true);
    }
  }, [searchParams]);

  function handleClose() {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pioneerZone");
    const query = params.toString();
    router.replace(query ? `?${query}` : window.location.pathname, {
      scroll: false,
    });
  }

  return (
    <PioneerZoneModal open={open} variant={variant} onClose={handleClose} />
  );
}
