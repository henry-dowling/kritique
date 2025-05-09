"use client";
import React, { Suspense } from "react";
import { Conversation } from "../components/conversation";
import { useTheme } from "../lib/ThemeContext";
import { useSearchParams } from "next/navigation";

function ConversationWithParams() {
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get("audioUrl") || undefined;
  return <Conversation audioUrl={audioUrl} />;
}

export default function ConversationPage() {
  const { theme } = useTheme();

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${
        theme === "dark" && "bg-neutral-900"
      }`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <Suspense fallback={null}>
          <ConversationWithParams />
        </Suspense>
      </div>
    </main>
  );
}
