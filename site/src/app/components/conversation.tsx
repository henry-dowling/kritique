"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
// https://picovoice.ai/docs/api/porcupine-react/
import { usePorcupine } from "@picovoice/porcupine-react";
import porcupineKeywords from "../lib/porcupineKeywords";
import porcupineModel from "../lib/porcupineModel";
import { useTheme } from "../lib/ThemeContext";
// Import icons
import {
  FiSun,
  FiMoon,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";
import { contextToText, getRollingContext, TranscriptEntry } from "./context";

type DynamicVariables = {
  podcast_context: string;
};

export function Conversation() {
  const { theme, toggleTheme } = useTheme();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  // Wake word detection components
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const { keywordDetection, isLoaded, isListening, error, init, start, stop } =
    usePorcupine();

  const startPorcupine = useCallback(async () => {
    // Start porcupine
    const accessKey = process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY;
    if (!accessKey) {
      throw new Error("PicoVoice access key is not set");
    }

    await init(accessKey, [porcupineKeywords[0]], porcupineModel);
    await start();
  }, [init, start]);

  const stopPorcupine = useCallback(async () => {
    await stop();
  }, [stop]);

  const conversation = useConversation({
    onConnect: () => console.debug("ElevenLabs Connected"),
    onDisconnect: () => {
      // Elevenlabs agent will auto end the call when it feels the conversation has concluded
      // This triggers porcupine to reset (stop and start)
      stopPorcupine();
      startPorcupine();
      // Reset wake word detection
      setWakeWordDetected(false);
      audioRef.current?.play();
    },
    onMessage: (message) => console.debug("ElevenLabs Message:", message),
    onError: (error) => console.error("ElevenLabs Error:", error),
  });

  useEffect(() => {
    const fetchTranscript = async () => {
      const response = await fetch("/lex_primeagen_segments.json");
      const data = await response.json();
      setTranscript(data);
    };
    fetchTranscript();
  }, []);

  const startConversation = useCallback(async () => {
    try {
      // Start the conversation with your agent
      if (!process.env.NEXT_PUBLIC_AGENT_ID) {
        throw new Error("Agent ID is not set");
      }

      const context = getRollingContext(transcript, currentTime);
      const contextText = contextToText(context);

      const dynamicVariables: DynamicVariables = {
        podcast_context: contextText,
      };
      console.log("Dynamic variables:", dynamicVariables);

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID,
        dynamicVariables,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
    // Deliberately not include currentTime in the dependency array
    // Simply take the latest currentTime to calculate context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  // Request microphone permission on page load
  useEffect(() => {
    const initMicrophone = async () => {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Start porcupine on page load
      startPorcupine();
    };
    initMicrophone();
  }, [startPorcupine]);

  useEffect(() => {
    if (keywordDetection !== null) {
      setWakeWordDetected(true);
      // Automatically start the conversation when wake word is detected
      startConversation();
      audioRef.current?.pause();
    } else {
      setWakeWordDetected(false);
    }
    // Deliberately only load when the keyword detection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordDetection]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => {
      setIsPlaying(true);
      console.log("Is playing:", isPlaying);
    };
    const onPause = () => {
      setIsPlaying(false);
      console.log("Is playing:", isPlaying);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      console.log("Current time:", audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log("Audio duration set to:", audio.duration);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    // Initial setup - ensure we get metadata if audio is already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
      console.log("Audio duration set to:", audio.duration);
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedMetadata", onLoadedMetadata);
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
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    console.log("Audio:", audio);
    if (!audio) return;
    console.log("Audio paused:", audio.paused);
    if (audio.paused) {
      console.log("Playing audio");
      audio.play();
      setIsPlaying(true);
    } else {
      console.log("Pausing audio");
      audio.pause();
      setIsPlaying(false);
    }
  }, [audioRef]);

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

  // Theme toggle button
  const ThemeToggle = () => {
    return (
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-4 rounded-full transition-colors duration-200 cursor-pointer"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          // Sun icon for dark mode (clicking will switch to light)
          <FiSun className="text-white" size={24} />
        ) : (
          // Moon icon for light mode (clicking will switch to dark)
          <FiMoon className="text-black" size={24} />
        )}
      </button>
    );
  };

  const Player = useCallback(
    () => (
      <div
        className={`fixed bottom-0 left-0 right-0 shadow-lg z-40 ${
          theme === "dark" ? "bg-[#181818]" : "bg-white"
        } transition-colors duration-300`}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Track info */}
            <div className="flex items-center space-x-4 w-1/4">
              <div className="h-14 w-14 bg-gradient-to-br from-pink-300 to-green-300 rounded flex items-center justify-center shadow"></div>
              <div>
                <h3
                  className={`font-medium text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } transition-colors duration-300`}
                >
                  The Primeagen
                </h3>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } transition-colors duration-300`}
                >
                  Lex Fridman Podcast
                </p>
              </div>
            </div>

            {/* Player controls */}
            <div className="flex flex-col items-center w-2/4">
              <div className="flex items-center justify-center space-x-6 mb-1">
                <button
                  className={`${
                    theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-black"
                  } transition-colors cursor-pointer`}
                >
                  <FiSkipBack size={20} />
                </button>

                <button
                  onClick={togglePlay}
                  className={`${
                    theme === "dark" ? "bg-white" : "bg-black"
                  } rounded-full p-2 hover:scale-105 transition-transform cursor-pointer`}
                >
                  {isPlaying ? (
                    <FiPause
                      size={24}
                      color={theme === "dark" ? "black" : "white"}
                    />
                  ) : (
                    <FiPlay
                      size={24}
                      color={theme === "dark" ? "black" : "white"}
                    />
                  )}
                </button>

                <button
                  className={`${
                    theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-black"
                  } transition-colors cursor-pointer`}
                >
                  <FiSkipForward size={20} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full flex items-center space-x-2">
                <span
                  className={`text-xs font-mono w-10 text-right ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } transition-colors duration-300`}
                >
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    step={0.01}
                    onChange={handleScrubberChange}
                    className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${
                        theme === "dark" ? "#f9f9f9" : "#1e1e1e"
                      } ${(currentTime / (duration || 1)) * 100}%, ${
                        theme === "dark" ? "#4D4D4D" : "#d9d9d9"
                      } ${(currentTime / (duration || 1)) * 100}%)`,
                      WebkitAppearance: "none",
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-mono w-10 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } transition-colors duration-300`}
                >
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Extra controls */}
            <div className="w-1/4 flex justify-end space-x-3">
              <div
                className={`px-3 py-1 rounded-full text-xs ${
                  theme === "dark"
                    ? "bg-white/20 text-white"
                    : "bg-black/10 text-gray-900"
                } transition-colors duration-300`}
              >
                SAY "HEY LEX" TO INTERRUPT
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [theme, isPlaying, currentTime, duration]
  );

  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center justify-center gap-8 py-8 mb-24 transition-colors duration-300`}
    >
      {/* Theme toggle button */}
      <ThemeToggle />
      {/* Debugging info */}
      <div
        className={`flex flex-col items-center p-6 rounded-lg ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <p className="font-medium mb-2">Debugging info:</p>
        {wakeWordDetected ? (
          <p className="text-green-500">Wake word detected!</p>
        ) : (
          <p>Wake word not detected yet</p>
        )}
        {/* Should be connected when the conversation is "speaking" */}
        <p>EleventLabs Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
        {/* Should be true, true, null */}
        <p>Pico Voice Loaded: {JSON.stringify(isLoaded)}</p>
        <p>Pico Voice Listening: {JSON.stringify(isListening)}</p>
        <p>Pico Voice Error: {JSON.stringify(error)}</p>
      </div>

      <Player />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="https://media.blubrry.com/takeituneasy/content.blubrry.com/takeituneasy/lex_ai_theprimeagen.mp3"
        preload="auto"
        onLoadedMetadata={(e) => {
          setDuration((e.target as HTMLAudioElement).duration);
        }}
      />

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 opacity-30 dark:opacity-25 rounded-full filter blur-3xl animate-blob1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-pink-300 via-yellow-300 to-blue-300 opacity-25 dark:opacity-20 rounded-full filter blur-2xl animate-blob2" />
        <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] bg-gradient-to-tl from-green-300 via-blue-300 to-purple-300 opacity-20 dark:opacity-15 rounded-full filter blur-2xl animate-blob3" />
      </div>
    </div>
  );
}
