import { ImageResponse } from "next/og";

export const alt = "Fusizok.hu – Írd ki a munkát, ajánlatok jönnek";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #09090b 0%, #18181b 55%, #292524 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            fontSize: 28,
            color: "#fbbf24",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
              fontSize: 32,
              fontWeight: 900,
            }}
          >
            F
          </div>
          Fusizok.hu
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Írd ki a munkát ingyen
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            lineHeight: 1.4,
            color: "#d4d4d8",
            maxWidth: 820,
          }}
        >
          Helyi fusizók pályáznak rád – te választasz a legjobb ajánlat közül.
        </div>
      </div>
    ),
    { ...size },
  );
}
