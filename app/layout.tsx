import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const flecha = localFont({
  src: [
    { path: "./fonts/Flecha-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Flecha-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Flecha-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Flecha-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-flecha",
});

const roobert = localFont({
  src: [
    { path: "./fonts/Roobert-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Roobert-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Roobert-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Roobert-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/Roobert-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-roobert",
});

const roobertMono = localFont({
  src: [
    { path: "./fonts/RoobertMono-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/RoobertMono-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/RoobertMono-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/RoobertMono-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/RoobertMono-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-roobert-mono",
});

export const metadata: Metadata = {
  title: "Open Gamma - AI Presentation Generator",
  description:
    "Create professional presentations instantly with AI. Generate pitch decks, sales presentations, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roobert.variable} ${flecha.variable} ${roobertMono.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
