'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSample = () => {
    setQuery("Lex Fridman Primeagen");
    router.push("/conversation");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-3xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-5xl font-extrabold mb-8 text-center tracking-tight drop-shadow-lg">
          Kritique
        </h1>
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for an episode..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-sm"
          />
          <button
            onClick={handleSample}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          >
            Try: Lex Fridman Primeagen
          </button>
        </div>
      </div>
    </main>
  );
} 