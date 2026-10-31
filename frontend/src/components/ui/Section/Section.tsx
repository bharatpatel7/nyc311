import { cn } from "@/lib/util";
import type { SectionProps } from "@/types/Section";

/** Reusable page section with consistent max-width, padding, and optional heading.
 * @param title - Title of section
 * @param subtitle - Subtitle of section
 */
export default function Section({ title, subtitle, children, className }: SectionProps) {
  return (
    <section className={cn("mx-auto max-w-6xl px-6 py-20", className)}>
      {(title || subtitle) && (
        <div className="mb-12 text-center">
          {title && <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-4 text-lg text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
