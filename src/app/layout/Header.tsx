import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Moon, 
  Sun, 
  Users, 
  UserPlus, 
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useLocation } from "react-router-dom";

export function Header() {
  // Theme state management
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current location for active link styling
  const location = useLocation();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Check if link is active
  const isActive = (path: string) => {
    if (path === "/users") {
      return location.pathname === "/users" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Navigation items configuration
  const navItems = [
    {
      path: "/users",
      label: "Users",
      icon: Users,
    },
    {
      path: "/users/new",
      label: "New User",
      icon: UserPlus,
    },
    {
      path: "/users/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo / Brand */}
        <a
          href="/users"
          className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">User Management</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <a
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200
                  ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}

          {/* Theme Toggle - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Toggle - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium
                    transition-colors duration-200
                    ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}