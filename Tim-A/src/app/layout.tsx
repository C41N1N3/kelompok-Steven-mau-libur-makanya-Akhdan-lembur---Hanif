import type { Metadata } from "next";
import { Cinzel, Inter, Lexend } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "GLOSIO",
  description: "Learn Greek with focused daily practice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} ${lexend.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
