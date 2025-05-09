"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useEffect, useRef, useState } from "react";

type DynamicVariables = {
  podcast_context: string;
};

export function Conversation() {
  const [dynamicVariables] = useState<DynamicVariables>({
    podcast_context: `ThePrimeagen\n(01:31:06) I've always just been good at print off debugging because one of my first kind of side quest jobs that I got was writing robots for the government when I was still at school. And so I'd kind of do this contractually for so many hours a week. And my boss, Hunter Lloyd, great professor by the way, he just said, "Hey, here's your computer, here's the robot, here's how you plug it in. Here's how you run the code. Can you write the flash driver, the ethernet driver. Can you write the planetary pancake motor? Here's some manuals, I'm missing some. Just figure it out, I'll be back." So that was government work for me. So I was like, okay, I'll figure all these things out. And I figured them all out and the only way to really get anything out of the machine was to print. And so it's like I had to become really good at printing my way through problems. And so that kind of became this skill I guess I adopted is that I can just kind of print off debug my way through a lot of these problems.\n`,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Minimal conversation logic (no buttons)
  const conversation = useConversation({
    onConnect: () => {},
    onDisconnect: () => {},
    onMessage: () => {},
    onError: () => {},
  });

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  // Scrubber interaction
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Format time (mm:ss)
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // Play/pause handlers
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  // Spacebar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 py-8">
      {/* Pulsing animation with play/pause button */}
      <div className="flex flex-col items-center w-full">
        <div className="relative flex items-center justify-center mb-6 mt-4">
          <span
            className={`block w-16 h-16 rounded-full bg-blue-500/80 ${isPlaying ? "animate-pulse-podcast" : "opacity-40"}`}
            aria-label={isPlaying ? "Audio playing" : "Audio paused"}
          ></span>
          {/* Play/Pause button overlay */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className="absolute inset-0 flex items-center justify-center focus:outline-none"
            style={{ background: "none", border: "none" }}
          >
            {isPlaying ? (
              // Pause icon
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="8" width="4" height="16" rx="2" fill="#fff"/>
                <rect x="19" y="8" width="4" height="16" rx="2" fill="#fff"/>
              </svg>
            ) : (
              // Play icon
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,8 24,16 12,24" fill="#fff"/>
              </svg>
            )}
          </button>
        </div>
        {/* Custom scrubber */}
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            step={0.01}
            onChange={handleScrubberChange}
            className="w-full accent-blue-500 h-2 rounded-lg appearance-none bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ touchAction: "none" }}
            aria-label="Seek audio"
          />
          <div className="flex w-full justify-between text-xs text-gray-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          {isPlaying && (
            <div className="w-full text-center mt-2 text-base text-blue-700 font-semibold animate-pulse">
              Say Hey Lex to Interrupt!
            </div>
          )}
        </div>
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src="https://media.blubrry.com/takeituneasy/content.blubrry.com/takeituneasy/lex_ai_theprimeagen.mp3"
          preload="auto"
        />
      </div>
    </div>
  );
}
