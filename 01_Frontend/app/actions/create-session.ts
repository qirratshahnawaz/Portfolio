"use server";

import { auth } from "@clerk/nextjs/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * createSession - Connects to the LOCAL FastAPI backend to initialize
 * an AI Twin session instead of the generic OpenAI Cloud session.
 */
export async function createSession() {
  const { userId } = await auth();

  // Note: userId is optional for the local backend dev mode,
  // but we pass it if available for tracking.

  try {
    console.log(
      `[Action] Creating session at ${BACKEND_URL}/api/create-session`
    );

    const response = await fetch(
      `${BACKEND_URL.replace(/\/$/, "")}/api/create-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId || "anonymous",
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Action] Backend Session Error:", errorText);
      throw new Error(`Backend failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Returns { session_id, client_secret, expires_at }
    return data;
  } catch (error) {
    console.error("[Action] Connection to Chat Backend failed:", error);
    throw new Error(
      "AI Twin Backend is offline. Please ensure the FastAPI server is running."
    );
  }
}
