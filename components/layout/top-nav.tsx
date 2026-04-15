"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/room", label: "Room" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !isDark;

    root.classList.toggle("dark", nextDark);
    setIsDark(nextDark);
  };

  return (
    <header className="h-14 border-b border-border bg-surface px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-350 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-text"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            ThinkIT
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary-muted text-primary"
                      : "text-text-2 hover:bg-surface2 hover:text-text",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-text-2 transition-colors hover:text-text"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
