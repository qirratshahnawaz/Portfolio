"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { ChatKitOptions, HeaderIcon } from "@openai/chatkit-react";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import { useSidebar } from "../ui/sidebar";
import { useTheme } from "next-themes";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DOMAIN_KEY } from "@/lib/config";


/**
 * 🚀 OFFICIAL CHATKIT INTEGRATION
 *
 * Reverted to the official React hooks for better state management.
 * Fixed "Invalid Input" by using the official dev domain key.
 */

function ChatComponent({
  profile,
}: Readonly<{
  profile: CHAT_PROFILE_QUERYResult | null;
}>) {
  const { toggleSidebar } = useSidebar();
  const { resolvedTheme, theme: activeTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark" || activeTheme === "dark";

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    console.log(
      "ChatKit initialized with Backend URL:",
      `${backendUrl.replace(/\/$/, "")}/chatkit`,
    );
  }, [backendUrl]);

  // Stabilize options to prevent re-initialization loops
  const chatkitOptions: ChatKitOptions = useMemo(
    () => ({
      api: {
        url: `${backendUrl.replace(/\/$/, "")}/chatkit`,
        domainKey: DOMAIN_KEY, // ✅ Safe domain key from config (guaranteed string)
      },
      header: {
        title: {
          text: profile?.firstName
            ? `${profile.firstName}'s AI Twin`
            : "Portfolio Assistant",
        },
        leftAction: {
          icon: "close" as HeaderIcon,
          onClick: toggleSidebar,
        },
      },
      theme: isDark ? "dark" : "light",
    }),
    [backendUrl, profile?.firstName, toggleSidebar, isDark],
  );

  // Initialize ChatKit once with stable options
  const { control } = useChatKit(chatkitOptions);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Loading chat...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <ChatKit control={control} />
    </div>
  );
}

// Dynamically import to avoid SSR issues
const Chat = dynamic(() => Promise.resolve(ChatComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-muted-foreground">
        Initializing chat...
      </div>
    </div>
  ),
});

export default Chat;
