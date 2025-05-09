'use client';
import { Combobox } from '@headlessui/react';
import { lexPodcasts as rawLexPodcasts } from '../lib/lex_podcasts';
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the type for podcast episodes
interface PodcastEpisode {
  title: string;
  guest: string;
  episode: number;
  url: string;
}

const lexPodcasts: PodcastEpisode[] = rawLexPodcasts;

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const router = useRouter();

  const filteredEpisodes =
    query === ""
      ? lexPodcasts
      : lexPodcasts.filter((ep) =>
          ep.title.toLowerCase().includes(query.toLowerCase()) ||
          ep.guest.toLowerCase().includes(query.toLowerCase())
        );

  const handleSample = () => {
    setQuery("Lex Fridman Primeagen");
    router.push("/conversation");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioUrl) {
      router.push(`/conversation?audioUrl=${encodeURIComponent(audioUrl)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-3xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-5xl font-extrabold mb-8 text-center tracking-tight drop-shadow-lg">
          Kritique
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
          <Combobox value={selectedEpisode} onChange={ep => {
            setSelectedEpisode(ep);
            setQuery(ep ? ep.title : "");
            setAudioUrl(ep ? ep.url : "");
          }}>
            <div className="relative w-full max-w-md">
              <Combobox.Input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-sm"
                displayValue={(ep: PodcastEpisode | null) => (ep ? ep.title : query)}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedEpisode(null);
                }}
                placeholder="Search for an episode..."
              />
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                {filteredEpisodes.length === 0 && query !== "" ? (
                  <div className="cursor-default select-none px-4 py-2 text-gray-700">
                    No episodes found.
                  </div>
                ) : (
                  filteredEpisodes.map((ep) => (
                    <Combobox.Option
                      key={ep.episode}
                      value={ep}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {ep.title} <span className="text-gray-400">({ep.guest})</span>
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-white' : 'text-blue-600'
                              }`}
                            >
                              ✓
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>
          <input
            type="text"
            value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)}
            placeholder="Paste Lex Fridman podcast audio URL here..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg shadow-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
          >
            Play Podcast
          </button>
        </form>
      </div>
    </main>
  );
} 