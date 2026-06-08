import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

export function PageContainer({
  children,
  className = "",
  narrow = false,
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto px-4 py-10 sm:px-6 sm:py-14 ${
        narrow ? "max-w-2xl" : "max-w-6xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
