import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => (
  <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
);

export default PageContainer;
