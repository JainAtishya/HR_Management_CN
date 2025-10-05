import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HR Management Dashboard - Coding Ninjas Club",
  description: "Comprehensive HR management system for Coding Ninjas Club members, warnings, and communications",
  keywords: ["HR", "Management", "Dashboard", "Coding Ninjas Club", "Members", "Warnings", "Email"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
