import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <a href="/users" className="font-semibold">User Management</a>
        <nav className="flex items-center gap-2">
          <a href="/users" className="text-sm">Users</a>
          <a href="/users/new" className="text-sm">New</a>
          <a href="/users/analytics" className="text-sm">Analytics</a>
          <Button variant="outline" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "Dark" : "Light"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
