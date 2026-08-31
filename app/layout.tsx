import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicTacToe Multiplayer — Realtime Battles",
  description:
    "Play Tic Tac Toe online with friends in realtime. Supports dynamic 3×3 to 6×6 grids, live emoji reactions, and instant win detection. Built with Next.js and Firebase.",
  keywords: ["tic tac toe", "multiplayer", "realtime", "online game", "firebase"],
  openGraph: {
    title: "TicTacToe Multiplayer",
    description: "Realtime multiplayer Tic Tac Toe with dynamic grids and live reactions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
