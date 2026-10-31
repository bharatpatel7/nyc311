import type { ReactNode } from "react";
import { cn } from "@/lib/util";

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/** Glass card used for every block on the dashboard pages. */
const Panel = ({ children, className, title, subtitle }: PanelProps) => (
  <section className={cn("glass overflow-hidden rounded-2xl", className)}>
    {title && (
      <header className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </header>
    )}
    {children}
  </section>
);

export default Panel;
