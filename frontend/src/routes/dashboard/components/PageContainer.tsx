import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => (
  <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
    {children}
  </div>
);

export default PageContainer;
