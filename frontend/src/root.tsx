import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import theme from "./scripts/theme.ts?raw";
import type { Route } from "./+types/root";
import "./styles/index.css";
import type { ReactNode } from "react";
import { FilterProvider } from "./context/FilterProvider";
import { IS_STATIC_DATA, installStaticApi } from "./lib/staticApi";

// the deployed build has no backend; answer /api requests from the snapshot files
if (IS_STATIC_DATA && typeof window !== "undefined") installStaticApi();

// eslint-disable-next-line react-refresh/only-export-components
export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070d" />
        <meta
          name="description"
          content="Explore 311 complaint patterns and response times across New York City using interactive maps and data visualizations."
        />
        <title>NYC311 · 3D complaint explorer</title>
        <Meta />
        <Links />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: theme }} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <FilterProvider>
      <Outlet />
    </FilterProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-gradient text-6xl font-bold">{message}</h1>
      <p className="mt-4 text-slate-400">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
