"use client";

import * as React from "react";
import { Moon, Sun, ChevronUp, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSakuraExpanded, setIsSakuraExpanded] = React.useState(false);
  const [isMomijiExpanded, setIsMomijiExpanded] = React.useState(false);
  const [mode, setMode] = React.useState<"sakura" | "momiji">("sakura");

  React.useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("portfolio-mode") as "sakura" | "momiji";
    if (savedMode) {
      setMode(savedMode);
      document.documentElement.setAttribute("data-mode", savedMode);
    } else {
      document.documentElement.setAttribute("data-mode", "sakura");
    }
  }, []);

  const toggleMode = (newMode: "sakura" | "momiji") => {
    setMode(newMode);
    document.documentElement.setAttribute("data-mode", newMode);
    localStorage.setItem("portfolio-mode", newMode);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="w-full h-full rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-all duration-300"
        aria-label="Loading theme toggle"
      >
        <Sun className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    );
  }

  return (
    <DropdownMenu modal={false} onOpenChange={() => {
      setIsSakuraExpanded(false);
      setIsMomijiExpanded(false);
    }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full h-full rounded-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 md:h-6 md:w-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-5 w-5 md:h-6 md:w-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[200px] p-1 transition-all duration-300 overflow-hidden"
      >
        {/* --- Sakura Mode Section --- */}
        <div className="hidden sm:block">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger 
              className={`cursor-pointer ${mode === "sakura" ? "font-bold" : ""}`}
              onClick={() => toggleMode("sakura")}
            >
              Sakura mode 🌸
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={12} alignOffset={-4}>
                <DropdownMenuItem onClick={() => { setTheme("light"); toggleMode("sakura"); }} className="cursor-pointer">Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("dark"); toggleMode("sakura"); }} className="cursor-pointer">Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("system"); toggleMode("sakura"); }} className="cursor-pointer">System</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </div>

        {/* --- Momiji Mode Section --- */}
        <div className="hidden sm:block">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger 
              className={`cursor-pointer ${mode === "momiji" ? "font-bold" : ""}`}
              onClick={() => toggleMode("momiji")}
            >
              Momiji mode 🍁
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={12} alignOffset={-44}>
                <DropdownMenuItem onClick={() => { setTheme("light"); toggleMode("momiji"); }} className="cursor-pointer">Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("dark"); toggleMode("momiji"); }} className="cursor-pointer">Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("system"); toggleMode("momiji"); }} className="cursor-pointer">System</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </div>

        {/* --- Mobile View --- */}
        <div className="sm:hidden flex flex-col gap-1">
          {/* Mobile Sakura */}
          <div 
            onClick={() => {
              toggleMode("sakura");
              setIsSakuraExpanded(!isSakuraExpanded);
              setIsMomijiExpanded(false);
            }}
            className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer transition-colors ${mode === "sakura" ? "font-bold" : ""}`}
          >
            <span>Sakura mode 🌸</span>
            {isSakuraExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <AnimatePresence>
            {isSakuraExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5 border-t pt-1 border-white/10 ml-2">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer pl-6">Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer pl-6">Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer pl-6">System</DropdownMenuItem>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Momiji */}
          <div 
            onClick={() => {
              toggleMode("momiji");
              setIsMomijiExpanded(!isMomijiExpanded);
              setIsSakuraExpanded(false);
            }}
            className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer transition-colors ${mode === "momiji" ? "font-bold" : ""}`}
          >
            <span>Momiji mode 🍁</span>
            {isMomijiExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <AnimatePresence>
            {isMomijiExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5 border-t pt-1 border-white/10 ml-2">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer pl-6">Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer pl-6">Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer pl-6">System</DropdownMenuItem>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}