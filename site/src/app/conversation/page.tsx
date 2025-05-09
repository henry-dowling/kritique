"use client";
import { Conversation } from "../components/conversation";
import { useTheme } from "../lib/ThemeContext";
import { useSearchParams } from "next/navigation";

export default function ConversationPage() {
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get("audioUrl") || undefined;

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${
        theme === "dark" && "bg-neutral-900"
      }`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <Conversation audioUrl={audioUrl} />
      </div>
    </main>
  );
}
