"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { urlFor } from "@/sanity/lib/image";
import { ProfileImage } from "./ProfileImage";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import React, { useRef, useState, useEffect } from "react";

interface HeroSectionClientProps {
  profile: {
    firstName: string | null;
    lastName: string | null;
    headline: string | null;
    headlineStaticText?: string | null;
    headlineAnimatedWords?: string[] | null;
    headlineAnimationDuration?: number | null;
    shortBio: string | null;
    email: string | null;
    location: string | null;
    availability: string | null;
    socialLinks?: Record<string, string | null> | null;
    profileImage?: any;
  };
}

const SOCIAL_LABEL_MAPPING: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  x: "X",
};

/**
 * Magnetic Component for smooth, high-end button interactions
 */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    if (ref.current) {
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      x.set(middleX * 0.3);
      y.set(middleY * 0.3);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3D Tilt Wrapper for images
 */
function TiltWrapper({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-full perspective-distant"
    >
      {children}
    </motion.div>
  );
}

/**
 * Dynamic Glow Aura behind the profile image
 */
function DynamicGlowAura() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[80px] rounded-full"
      />
    </div>
  );
}

/**
 * Minimal Detail Item
 */
function MinimalDetail({
  label,
  value,
  icon,
}: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 py-1 transition-opacity hover:opacity-100 opacity-80 group">
      <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.2em] text-primary/70 uppercase">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground/90">{value}</span>
      </div>
    </div>
  );
}

export function HeroSectionClient({
  profile,
}: Readonly<HeroSectionClientProps>) {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const words = fullName.split(" ");

  return (
    <section
      id="home"
      className="relative overflow-hidden selection:bg-primary/30"
    >
      <ShootingStars />

      {/* Background Ambient Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="min-h-screen py-24 px-6 flex items-center justify-center bg-transparent">
        <div className="relative z-10 container mx-auto max-w-6xl w-full">
          <div className="@container">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 @lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-8 @md/hero:space-y-10">
                <div className="space-y-4">
                  <h1 className="text-5xl @md/hero:text-7xl @lg/hero:text-8xl @2xl/hero:text-9xl font-bold tracking-tighter whitespace-nowrap text-foreground leading-none">
                  {words.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className="inline-block mr-3 md:mr-5 last:mr-0"
                    >
                      {word.split("").map((letter, letterIndex) => (
                        <motion.span
                          key={`${wordIndex}-${letterIndex}`}
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: wordIndex * 0.1 + letterIndex * 0.03,
                            type: "spring",
                            stiffness: 150,
                            damping: 25,
                          }}
                          className="inline-block"
                        >
                          {letter}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </h1>

                  {profile.headlineStaticText &&
                  profile.headlineAnimatedWords &&
                  profile.headlineAnimatedWords.length > 0 ? (
                    <div className="pt-2">
                      <LayoutTextFlip
                        text={profile.headlineStaticText}
                        words={profile.headlineAnimatedWords}
                        duration={profile.headlineAnimationDuration || 3000}
                        className="text-xl @md/hero:text-2xl @lg/hero:text-3xl text-primary font-bold tracking-tight"
                      />
                    </div>
                  ) : (
                    <p className="text-xl @md/hero:text-2xl @lg/hero:text-3xl text-primary font-bold tracking-tight pt-2">
                      {profile.headline}
                    </p>
                  )}
                </div>

                <p className="text-base @md/hero:text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
                  {profile.shortBio}
                </p>

                {/* Minimal Details List */}
                <div className="flex flex-wrap gap-x-12 gap-y-6 max-w-2xl w-full">
                  {profile.location && (
                    <MinimalDetail
                      label="Location"
                      value={profile.location}
                      icon="📍"
                    />
                  )}
                  {profile.availability && (
                    <MinimalDetail
                      label="Status"
                      value={profile.availability}
                      icon="✅"
                    />
                  )}
                  {profile.email && (
                    <MinimalDetail
                      label="Email"
                      value={profile.email}
                      icon="📩"
                    />
                  )}
                </div>

                {profile.socialLinks && (
                  <div className="flex flex-wrap gap-4 pt-4">
                    {Object.entries(profile.socialLinks).map(([key, url]) => {
                      if (!url || typeof url !== "string") return null;
                      if (key === "website" || key === "_type") return null;

                      const label =
                        SOCIAL_LABEL_MAPPING[key.toLowerCase()] ||
                        key.charAt(0).toUpperCase() + key.slice(1);

                      return (
                        <Magnetic key={key}>
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-xl px-6 py-5 text-sm font-bold bg-white/[0.03] dark:bg-black/[0.2] border-black/10 dark:border-white/10 hover:border-primary/50 transition-all duration-300 h-auto backdrop-blur-md"
                          >
                            <Link
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="opacity-90">{label}</span>
                              <span className="ml-2 group-hover:translate-x-1 transition-transform opacity-70">
                                →
                              </span>
                            </Link>
                          </Button>
                        </Magnetic>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Profile Image & Visuals */}
              <div className="relative flex items-center justify-center">
                <TiltWrapper>
                  <div className="relative z-10 w-full max-w-[420px] group">
                    <DynamicGlowAura />
                    {profile.profileImage && (
                      <div className="relative z-10 transform-3d transition-transform duration-500 group-hover:scale-[1.02]">
                        <ProfileImage
                          imageUrl={urlFor(profile.profileImage)
                            .width(800)
                            .height(800)
                            .url()}
                          firstName={profile.firstName || ""}
                          lastName={profile.lastName || ""}
                        />
                      </div>
                    )}
                  </div>
                </TiltWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
