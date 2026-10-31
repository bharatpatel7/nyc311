const theme = localStorage.getItem("theme") ?? "system";
const resolved =
  theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme;
document.documentElement.classList.add(resolved);
