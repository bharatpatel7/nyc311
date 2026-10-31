import { Link } from "react-router";

/** Wordmark with a small isometric "column" mark that echoes the 3D map. */
const Logo = () => (
  <Link to="/" className="group flex items-center gap-2.5" aria-label="NYC311 home">
    <span className="relative grid size-8 place-items-center rounded-lg bg-linear-to-br from-cyan-400 to-violet-500 shadow-[0_0_24px_-4px_rgba(34,211,238,0.7)] transition-transform group-hover:-rotate-6">
      <svg viewBox="0 0 24 24" className="size-5 text-ink" fill="currentColor" aria-hidden>
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="6" width="4" height="15" rx="1" />
        <rect x="17" y="9" width="4" height="12" rx="1" />
      </svg>
    </span>
    <span className="font-display text-lg font-semibold tracking-tight text-white">
      NYC<span className="text-cyan-300">311</span>
    </span>
  </Link>
);

export default Logo;
