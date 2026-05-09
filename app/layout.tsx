import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "YumiTrack",
  description: "A Kyudo practice tracker for sessions, ends, notes, and progress.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
