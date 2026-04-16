"use client";

import * as React from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

function SidebarToggle() {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  const { isSignedIn } = useUser();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isSidebarOpen = isMobile ? openMobile : open;

  if (!mounted) return null;

  if (isSidebarOpen) return null;

  const buttonStyles = `relative w-14 h-14 md:w-16 md:h-16 rounded-full 
    bg-neutral-50 dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-800
    shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)]
    transition-all duration-500 ease-out
    hover:scale-110 active:scale-95
    flex items-center justify-center
    overflow-hidden`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Animated subtle glow rings */}
      <div className="absolute inset-0 rounded-full bg-linear-to-r from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      {/* Sparkle badge */}
      <div className="absolute -top-1 -right-1 z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
        <div className="h-6 w-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/40 dark:border-white/20 text-sm font-medium text-neutral-800 dark:text-neutral-200 whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        Chat with My AI Twin
        {/* Tooltip arrow */}
        <div className="absolute -bottom-1 right-6 w-2 h-2 rotate-45 bg-white/90 dark:bg-black/90 border-r border-b border-white/40 dark:border-white/20" />
      </div>

      {isSignedIn ? (
        <button
          type="button"
          onClick={toggleSidebar}
          className={buttonStyles}
          aria-label="Chat with AI Twin"
        >
          {/* Soft background glow */}
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800 opacity-50" />

          {/* Letter Q */}
          <span className="relative text-3xl md:text-4xl font-serif italic text-neutral-800 dark:text-neutral-100 transition-transform duration-500 group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 font-bold tracking-tighter">
            Q
          </span>
        </button>
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className={buttonStyles}
            aria-label="Sign in to chat with AI Twin"
          >
            {/* Soft background glow */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800 opacity-50" />

            {/* Letter Q */}
            <span className="relative text-3xl md:text-4xl font-serif italic text-neutral-800 dark:text-neutral-100 transition-transform duration-500 group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 font-bold tracking-tighter">
              Q
            </span>
          </button>
        </SignInButton>
      )}
    </div>
  );
}

export default SidebarToggle;
