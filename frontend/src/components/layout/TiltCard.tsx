import { useRef, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/util";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  max?: number;
}

/**
 * Glass card that tilts toward the pointer in 3D and shows a soft spotlight
 * where the pointer is. Falls back to a flat card for touch and reduced motion.
 */
const TiltCard = ({ children, className, max = 8 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
    el.style.setProperty("--spot-x", `${x * 100}%`);
    el.style.setProperty("--spot-y", `${y * 100}%`);
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "glass group relative overflow-hidden rounded-2xl transition-transform duration-200 ease-out will-change-transform",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(34,211,238,0.12), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

export default TiltCard;
