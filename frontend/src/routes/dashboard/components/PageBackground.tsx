import type { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
}

const PageBackground = ({ children }: PageBackgroundProps) => (
  <div className="relative min-h-screen w-full bg-[#f8f9fb] dark:bg-[#0d0d0d]">{children}</div>
);

export default PageBackground;
