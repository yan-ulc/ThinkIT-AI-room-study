"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/room", label: "Room" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="h-13 border-b border-border/60 bg-surface/95 backdrop-blur-sm px-4 md:px-8 sticky top-0 z-50">
      <div className="mx-auto flex h-full max-w-350 items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-7">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-text group"
          >
            {/* Slightly organic dot — feels handcrafted, not robotic */}
            <span className="inline-block h-2 w-2 rounded-full bg-primary opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="tracking-[-0.01em]">ThinkIT</span>
          </Link>

          <nav
            className="hidden items-center md:flex"
            aria-label="Main navigation"
          >
            {/* Subtle vertical divider before nav */}
            <span className="mr-5 h-4 w-px bg-border/80" aria-hidden />

            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                      isActive ? "text-primary" : "text-text-2 hover:text-text",
                    )}
                  >
                    {/* Active underline instead of bg pill — more editorial, less tab-like */}
                    {isActive && (
                      <span
                        className="absolute inset-x-3 -bottom-px h-[1.5px] rounded-full bg-primary"
                        aria-hidden
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Right: Theme toggle + User */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle className="relative flex h-7.5 w-7.5 items-center justify-center rounded-md text-text-3 transition-colors duration-300 hover:bg-muted hover:text-text-2" />

          {/* Subtle divider before avatar */}
          <span className="h-4 w-px bg-border/80" aria-hidden />

          <UserButton />
        </div>
      </div>
    </header>
  );
}
