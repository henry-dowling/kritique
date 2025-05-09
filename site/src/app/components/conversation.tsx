"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useState } from "react";

type DynamicVariables = {
  podcast_context: string;
};

export function Conversation() {
  const [dynamicVariables, setDynamicVariables] = useState<DynamicVariables>({
    podcast_context: `ThePrimeagen
(01:31:06) I've always just been good at print off debugging because one of my first kind of side quest jobs that I got was writing robots for the government when I was still at school. And so I'd kind of do this contractually for so many hours a week. And my boss, Hunter Lloyd, great professor by the way, he just said, "Hey, here's your computer, here's the robot, here's how you plug it in. Here's how you run the code. Can you write the flash driver, the ethernet driver. Can you write the planetary pancake motor? Here's some manuals, I'm missing some. Just figure it out, I'll be back." So that was government work for me. So I was like, okay, I'll figure all these things out. And I figured them all out and the only way to really get anything out of the machine was to print. And so it's like I had to become really good at printing my way through problems. And so that kind of became this skill I guess I adopted is that I can just kind of print off debug my way through a lot of these problems.
`,
  });

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      if (!process.env.NEXT_PUBLIC_AGENT_ID) {
        throw new Error("Agent ID is not set");
      }

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_AGENT_ID,
        dynamicVariables,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, dynamicVariables]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Lex Fridman Podcast Audio Player */}
      <audio controls className="mb-4 w-full max-w-md">
        <source src="https://media.blubrry.com/takeituneasy/content.blubrry.com/takeituneasy/lex_ai_theprimeagen.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === "connected"}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== "connected"}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
      </div>
    </div>
  );
}
