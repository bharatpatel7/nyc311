/**
 * Initialization script to apply the correct light/dark theme class
 * to the document root based on localStorage or system preferences.
 */

const theme = localStorage.getItem("theme") ?? "system";
const resolved =
  theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme;
document.documentElement.classList.add(resolved);

export const isDark = () => false;
