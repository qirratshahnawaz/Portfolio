"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/DarkModeToggle";

export function FloatingModeToggle() {
  const { open, isMobile, openMobile } = useSidebar();

  // Determine if sidebar is open (either desktop or mobile)
  const isSidebarOpen = isMobile ? openMobile : open;

  if (isSidebarOpen) return null;

  return (
    <div className="fixed top-6 right-6 md:top-auto md:bottom-6 md:right-24 z-50 transition-opacity duration-300">
      <div className="w-10 h-10 md:w-12 md:h-12">
        <ModeToggle />
      </div>
    </div>
  );
}
