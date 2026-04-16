import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./../globals.css";
import { draftMode } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { AppSidebar } from "@/components/app-sidebar";
import { FloatingModeToggle } from "@/components/FloatingModeToggle";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { FloatingDock } from "@/components/FloatingDock";
import SidebarToggle from "@/components/SidebarToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { PreloaderWrapper } from "@/components/PreloaderWrapper";
import LeafTrail from "@/components/LeafTrail";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const PROFILE_QUERY = defineQuery(`*[_id == "singleton-profile"][0]{
  firstName,
  lastName
}`);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muhammad Hamza | Agentic AI Portfolio",
  description: "A premium agentic AI portfolio showcasing engineering excellence.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: profile } = await sanityFetch({ query: PROFILE_QUERY });
  const first = profile?.firstName || "YOUR";
  const last = profile?.lastName || "NAME";
  const fullName = `${first} ${last}`.toUpperCase();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PreloaderWrapper name={fullName}>
              <LeafTrail />
              <Script
                src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                strategy="lazyOnload"
              />

              <SidebarProvider defaultOpen={false}>
                <SidebarInset className="">{children}</SidebarInset>

                <AppSidebar side="right" />

                <FloatingDock />
                <SidebarToggle />

                {/* Mode Toggle - Responsive and aware of Sidebar state */}
                <FloatingModeToggle />
              </SidebarProvider>
            </PreloaderWrapper>

            {/* Live content API */}
            <SanityLive />

            {(await draftMode()).isEnabled && (
              <>
                <VisualEditing />
                <DisableDraftMode />
              </>
            )}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
