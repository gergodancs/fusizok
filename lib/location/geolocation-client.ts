export type GeolocationResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; code: "denied" | "unavailable" | "timeout" | "unsupported" };

export function requestCurrentPosition(): Promise<GeolocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, code: "unsupported" });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ ok: false, code: "denied" });
          return;
        }
        if (error.code === error.TIMEOUT) {
          resolve({ ok: false, code: "timeout" });
          return;
        }
        resolve({ ok: false, code: "unavailable" });
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 60_000,
      },
    );
  });
}

export function geolocationErrorMessage(
  code: "denied" | "unavailable" | "timeout" | "unsupported",
): string {
  switch (code) {
    case "denied":
      return "A helymeghatározás engedélyezése elutasítva. Add meg kézzel a helyszínt.";
    case "timeout":
      return "A helymeghatározás túl sokáig tartott. Próbáld újra, vagy add meg kézzel.";
    case "unsupported":
      return "A böngésző nem támogatja a helymeghatározást. Add meg kézzel a helyszínt.";
    default:
      return "Nem sikerült lekérni a pozíciót. Add meg kézzel a helyszínt.";
  }
}
