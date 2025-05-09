"use client";
import { Conversation } from "../components/conversation";
import { useTheme } from "../lib/ThemeContext";

export default function ConversationPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${
        theme === "dark" && "bg-neutral-900"
      }`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <Conversation />
      </div>
    </main>
  );
}
