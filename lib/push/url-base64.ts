import { decodeVapidPublicKey } from "@/lib/push/vapid";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const decoded = decodeVapidPublicKey(base64String);
  if (!decoded) {
    throw new Error("Érvénytelen VAPID public key formátum.");
  }
  return decoded;
}
