'use client';
import React from "react";
import { Combobox } from '@headlessui/react';
import { lexPodcasts as rawLexPodcasts } from '../lib/lex_podcasts';
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";

// Define the type for podcast episodes
interface PodcastEpisode {
  title: string;
  guest: string;
  uuid: string;
  url: string;
}

const lexPodcasts: PodcastEpisode[] = rawLexPodcasts;

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const router = useRouter();

  // Debounce the query update
  const debouncedSetQuery = useMemo(
    () => debounce(setDebouncedQuery, 200),
    []
  );

  const filteredEpisodes =
    debouncedQuery === ""
      ? lexPodcasts.slice(0, 20)
      : lexPodcasts
          .filter((ep) =>
            ep.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            ep.guest.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEpisode && selectedEpisode.url) {
      router.push(`/conversation?audioUrl=${encodeURIComponent(selectedEpisode.url)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-3xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-5xl font-extrabold mb-4 text-center tracking-tight drop-shadow-lg">
          Argue With Lex
        </h1>
        <h2 className="text-xl font-medium mb-8 text-center text-gray-600 dark:text-gray-300">
          Interrupt and debate podcast episodes in real time using AI.
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
          <Combobox value={selectedEpisode} onChange={ep => {
            setSelectedEpisode(ep);
            setQuery(ep ? ep.title : "");
            setDebouncedQuery(ep ? ep.title : ""); // keep debouncedQuery in sync if selected
          }}>
            <div className="relative w-full max-w-md">
              <Combobox.Input
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow-sm"
                displayValue={(ep: PodcastEpisode | null) => (ep ? ep.title : query)}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedEpisode(null);
                  debouncedSetQuery(e.target.value);
                }}
                placeholder="Try: ThePrimeagen"
              />
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                {filteredEpisodes.length === 0 && query !== "" ? (
                  <div className="cursor-default select-none px-4 py-2 text-gray-700">
                    No episodes found.
                  </div>
                ) : (
                  filteredEpisodes.map((ep) => (
                    <Combobox.Option
                      key={ep.uuid}
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
          <button
            type="submit"
            className="group relative flex items-center justify-center gap-2 px-7 py-3 rounded-full border-2 border-black bg-transparent text-black font-bold text-lg shadow-sm transition-all duration-200 cursor-pointer hover:bg-black hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-black/30 active:scale-95"
            aria-label="Begin Discussion"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.5 5.5v9l8-4.5-8-4.5z" />
              </svg>
              Begin Discussion
            </span>
          </button>
        </form>
      </div>
    </main>
  );
} 