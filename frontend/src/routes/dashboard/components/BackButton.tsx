import Button from "@/components/ui/Button";
import { Link } from "react-router";

interface BackButtonProps {
  disabled: boolean;
}

const BackButton = ({ disabled }: BackButtonProps) => (
  <Button aria-label="Go to home" variant="icon" title="Go Home" disabled={disabled}>
    {disabled ? (
      <span className="text-slate-400 text-4xl leading-none cursor-not-allowed opacity-50">←</span>
    ) : (
      <Link
        to="/"
        className="text-slate-400 text-4xl leading-none hover:text-slate-900 transition-colors"
        aria-label="Back to home"
      >
        <span>←</span>
      </Link>
    )}
  </Button>
);

export default BackButton;
