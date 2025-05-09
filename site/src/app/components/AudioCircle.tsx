import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../lib/ThemeContext";

type AudioCircleProps = {
  frequency: number;
  isActive: boolean;
  position: "left" | "right";
  label?: string;
};

export function AudioCircle({
  frequency = 0,
  isActive = false,
  position,
  label,
}: AudioCircleProps) {
  console.log("Audio Circle: Label: ", label, "Frequency: ", frequency);
  const { theme } = useTheme();
  const [radius, setRadius] = useState(isActive ? 300 : 100);
  const animationRef = useRef<number | null>(null);

  // Calculate circle size based on frequency
  useEffect(() => {
    // Base size when active but not speaking
    const baseSize = isActive ? 200 : 80;

    // Only animate if there's a frequency value and the circle is active
    if (frequency > 0 && isActive) {
      // Normalize the frequency value (assuming it's between 0-255)
      const normalizedFrequency = Math.min(frequency / 255, 1);
      // Calculate the new radius with some damping to make it look natural
      const newRadius = baseSize + normalizedFrequency * 40;

      setRadius(newRadius);

      // Add some gentle animation
      const pulsate = () => {
        setRadius((prev) => {
          // Gradually return to the normal size
          return prev * 0.95 + baseSize * 0.05;
        });

        animationRef.current = requestAnimationFrame(pulsate);
      };

      animationRef.current = requestAnimationFrame(pulsate);
    } else {
      // When not active or no frequency, return to base size
      setRadius(baseSize);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, isActive]);

  // Define gradient colors based on position and theme
  const gradientColors =
    position === "left"
      ? theme === "dark"
        ? "from-blue-400 via-indigo-500 to-purple-600"
        : "from-blue-300 via-indigo-400 to-purple-500"
      : theme === "dark"
      ? "from-green-400 via-teal-500 to-emerald-600"
      : "from-green-300 via-teal-400 to-emerald-500";

  // Define positioning classes based on position prop
  const positionClasses =
    position === "left"
      ? "left-[30%] translate-x-[-50%]"
      : "right-[30%] translate-x-[50%]";

  return (
    <div
      className={`fixed top-1/2 transform translate-y-[-50%] ${positionClasses} z-30 flex flex-col items-center`}
    >
      <div
        className={`
          rounded-full bg-gradient-to-br ${gradientColors}
          shadow-lg flex items-center justify-center
          transition-all
          ${isActive ? "opacity-80" : "opacity-40"}
        `}
        style={{
          width: `${radius}px`,
          height: `${radius}px`,
          filter: `blur(${isActive ? 2 : 5}px)`,
          animation: isActive ? "pulse 2s infinite" : "none",
          transition: "all 0.3s ease-in-out",
        }}
      />
      {label && (
        <span
          className={`mt-4 text-sm font-medium ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
