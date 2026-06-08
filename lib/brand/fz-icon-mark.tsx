type FzIconMarkProps = {
  size: number;
  /** Android maskable ikonokhoz – sötét háttér + kisebb amber négyzet */
  maskable?: boolean;
};

export function FzIconMark({ size, maskable = false }: FzIconMarkProps) {
  const box = maskable ? Math.round(size * 0.82) : size;
  const radius = Math.round(box * 0.22);
  const fontSize = Math.round(box * 0.36);

  const mark = (
    <div
      style={{
        width: box,
        height: box,
        background: "#f59e0b",
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#18181b",
        fontSize,
        fontWeight: 900,
        fontFamily: "system-ui, -apple-system, sans-serif",
        letterSpacing: "-0.05em",
      }}
    >
      FZ
    </div>
  );

  if (!maskable) {
    return mark;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090b",
      }}
    >
      {mark}
    </div>
  );
}
