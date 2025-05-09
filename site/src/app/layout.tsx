import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./lib/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Argue With Lex",
  description: "Argue With Lex Fridman And His Guests On Demand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          {/* Animated gradient and blurred blobs background - visible in both themes but with different opacity */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 opacity-30 dark:opacity-15 rounded-full filter blur-3xl animate-blob1" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-pink-300 via-yellow-300 to-blue-300 opacity-25 dark:opacity-10 rounded-full filter blur-2xl animate-blob2" />
            <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] bg-gradient-to-tl from-green-300 via-blue-300 to-purple-300 opacity-20 dark:opacity-5 rounded-full filter blur-2xl animate-blob3" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
