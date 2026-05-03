"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-surface md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-3">
            <Menu className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="fixed top-0 left-0 bottom-0 z-200 h-full w-64 translate-x-0 translate-y-0 rounded-none border-none p-0 outline-none data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left duration-300 sm:max-w-none shadow-2xl"
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <div className="flex h-full w-full flex-col bg-surface">
             <div className="contents [&>aside]:flex [&>aside]:w-full [&>aside]:border-none">
                <Sidebar />
             </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-text">
        <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-90" />
        <span className="tracking-[-0.01em]">ThinkIT</span>
      </div>
    </div>
  );
}
