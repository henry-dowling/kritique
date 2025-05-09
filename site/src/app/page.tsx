import { Conversation } from "./components/conversation";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-5xl font-extrabold mb-2 text-center tracking-tight drop-shadow-lg">
          Lex Fridman Podcast
        </h1>
        <h2 className="text-2xl font-medium mb-10 text-center text-gray-700/80 tracking-wide">
          Primeagen
        </h2>
        <Conversation />
      </div>
    </main>
  );
}
