"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row bg-bg overflow-hidden">
      {/* MOBILE HEADER (Step 6) */}
      <header className="flex h-14 shrink-0 items-center border-b border-border/60 bg-surface px-4 lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="-ml-2 mr-2 h-9 w-9 text-text-3"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-90" />
          <span className="tracking-[-0.01em]">ThinkIT</span>
        </div>
      </header>

      {/* SIDEBAR (Step 1-8) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex min-w-0 flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
