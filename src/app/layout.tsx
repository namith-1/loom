import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zoom Dashboard Clone",
  description: "A clone of the Zoom Dashboard UI",
};

import SessionProvider from '@/components/SessionProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 overflow-hidden`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
