/** VAPID public key tisztítása (.env idézőjelek, sortörések). */
export function sanitizeVapidPublicKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}

/**
 * URL-safe base64 VAPID public key → Uint8Array.
 * Érvényes P-256 uncompressed kulcs: pontosan 65 bájt.
 */
export function decodeVapidPublicKey(base64String: string): Uint8Array | null {
  try {
    const sanitized = sanitizeVapidPublicKey(base64String);
    if (!sanitized) {
      return null;
    }

    const padding = "=".repeat((4 - (sanitized.length % 4)) % 4);
    const base64 = (sanitized + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    let bytes: Uint8Array;

    if (typeof Buffer !== "undefined") {
      bytes = new Uint8Array(Buffer.from(base64, "base64"));
    } else {
      const rawData = atob(base64);
      bytes = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i += 1) {
        bytes[i] = rawData.charCodeAt(i);
      }
    }

    return bytes.length === 65 ? bytes : null;
  } catch {
    return null;
  }
}

export function isValidVapidPublicKey(base64String: string): boolean {
  return decodeVapidPublicKey(base64String) !== null;
}
