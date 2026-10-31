import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-center">
      <div>
        <h1 className="text-gradient text-8xl font-bold">404</h1>
        <p className="mt-4 text-slate-400">This block isn&apos;t on our map.</p>
        <Link
          to="/"
          className="glass mt-8 inline-block rounded-full px-6 py-2.5 font-medium text-white hover:bg-white/10"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
