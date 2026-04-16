"use client";

import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import type { PortableTextComponents } from "@portabletext/react";

const PortableTextNormal = ({ children }: { children?: React.ReactNode }) => (
  <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
    {children}
  </p>
);

const PortableTextH2 = ({ children }: { children?: React.ReactNode }) => (
  <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight text-foreground">
    {children}
  </h2>
);

const PortableTextH3 = ({ children }: { children?: React.ReactNode }) => (
  <h3 className="text-2xl font-semibold mt-8 mb-4 tracking-tight text-foreground">
    {children}
  </h3>
);

const PortableTextBlockquote = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <div className="relative py-4 pl-8 mb-8">
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary to-primary/30 rounded-full" />
    <blockquote className="italic text-xl text-foreground font-medium">
      {children}
    </blockquote>
  </div>
);

const PortableTextStrong = ({ children }: { children?: React.ReactNode }) => (
  <strong className="font-bold text-foreground">{children}</strong>
);

const PortableTextEm = ({ children }: { children?: React.ReactNode }) => (
  <em className="italic text-foreground font-medium">{children}</em>
);

const PortableTextLink = ({
  children,
  value,
}: {
  children?: React.ReactNode;
  value?: { href?: string };
}) => {
  const href = value?.href || "";
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="text-foreground font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground transition-all"
    >
      {children}
    </Link>
  );
};

const PortableTextListBullet = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">{children}</ul>
);

const PortableTextListItemBullet = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <li className="flex items-center gap-3 text-foreground bg-muted p-4 rounded-xl border border-border hover:border-foreground/20 transition-all">
    <span className="h-2 w-2 rounded-full bg-foreground shrink-0" />
    {children}
  </li>
);

const PORTABLE_TEXT_COMPONENTS: PortableTextComponents = {
  block: {
    normal: PortableTextNormal,
    h2: PortableTextH2,
    h3: PortableTextH3,
    blockquote: PortableTextBlockquote,
  },
  marks: {
    strong: PortableTextStrong,
    em: PortableTextEm,
    link: PortableTextLink,
  },
  list: {
    bullet: PortableTextListBullet,
  },
  listItem: {
    bullet: PortableTextListItemBullet,
  },
};

interface Stat {
  label?: string;
  value?: string;
}

interface AboutSectionClientProps {
  profile: {
    firstName: string | null;
    lastName: string | null;
    fullBio: import("@portabletext/types").PortableTextBlock[] | null;
    yearsOfExperience: number | null;
    stats: Stat[] | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  };
}

export function AboutSectionClient({
  profile,
}: Readonly<AboutSectionClientProps>) {
  return (
    <section
      id="about"
      className="relative py-24 px-6 overflow-hidden bg-transparent"
    >
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          {/* Left Column: Title & Stats */}
          <div className="space-y-12">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-foreground font-bold tracking-wider uppercase text-sm mb-4 block"
              >
                Information
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-foreground"
              >
                About Me
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="h-1 w-20 bg-foreground rounded-full origin-left opacity-80"
              />
            </div>

            {/* Stats Grid */}
            {profile.stats && profile.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {profile.stats.map((stat, idx) => (
                  <motion.div
                    key={`${stat.label}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm border-border hover:border-foreground/50 hover:shadow-xl transition-all group"
                  >
                    <div className="text-3xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform origin-left">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-foreground font-medium opacity-70">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Bio Content */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none relative"
            >
              {profile.fullBio && (
                <PortableText
                  value={profile.fullBio}
                  components={PORTABLE_TEXT_COMPONENTS}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
