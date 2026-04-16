"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

interface NavbarClientProps {
  navItems: { label: string; href: string }[];
}

export function NavbarClient({ navItems }: NavbarClientProps) {
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navItems.map((item) => item.href.substring(1));
      let current = "";
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = section;
            break;
          }
        }
      }

      if (window.scrollY < 100 && navItems.length > 0) {
        current = navItems[0].href.substring(1);
      }
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 z-100 transition-all duration-300 px-4 
          sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-fit
          left-0 w-auto translate-x-0
          ${isScrolled ? "scale-100" : "scale-100 mt-2"}
        `}
      >
        {/* Desktop Navbar - Hidden on Mobile */}
        <nav className="hidden sm:flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-white/5">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.substring(1);
            return (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive}
                onClick={(e) => scrollToSection(e, item.href)}
              />
            );
          })}
          
          <SignedIn>
            <div className="ml-8 pl-8 border-l border-neutral-300 dark:border-neutral-700 flex items-center h-6">
              <UserButton />
            </div>
          </SignedIn>
        </nav>

        {/* Mobile Navbar Controls - Visible only on Mobile */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center p-3 rounded-full bg-white/80 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg text-foreground hover:bg-white/90 dark:hover:bg-black/40 transition-all duration-300"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <SignedIn>
            <div className="flex items-center justify-center h-[46px] w-[46px] rounded-full bg-white/80 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay - Opens to the Right Bottom */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-4 z-99 sm:hidden w-[260px]"
          >
            <nav className="flex flex-col gap-1 p-2 rounded-3xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl">
              {navItems.map((item, index) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => scrollToSection(e, item.href)}
                      className={`block w-full px-5 py-3 rounded-2xl text-sm font-medium transition-all border ${
                        isActive 
                          ? "bg-card text-foreground border-primary" 
                          : "text-foreground/70 active:bg-black/5 dark:active:bg-white/5 border-transparent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: { label: string; href: string }; 
  isActive: boolean; 
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void 
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap outline-none ${
        isActive 
          ? "text-foreground font-semibold" 
          : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeSectionIndicator"
          className="absolute inset-0 rounded-full bg-card border border-primary shadow-sm -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {item.label}
    </Link>
  );
}
