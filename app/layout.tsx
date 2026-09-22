import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your to-do list",
  description: "A personal anonymous task list.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
