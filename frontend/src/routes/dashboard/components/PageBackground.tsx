import type { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
}

const PageBackground = ({ children }: PageBackgroundProps) => (
  <div className="relative min-h-screen w-full overflow-hidden bg-ink">
    <div className="aurora" aria-hidden />
    <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
    {children}
  </div>
);

export default PageBackground;
