import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Moyan AI — Next-Gen AI Learning Platform",
  description:
    "Next-generation AI learning platform with personal Gemini AI tutor, adaptive courses, and dedicated Student, Tutor, and Admin panels.",
  icons: {
    icon: [
      { url: "/logo-round.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo-round.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo-round.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AppProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="relative min-h-[calc(100vh-80px)]">{children}</main>
          <Toaster richColors position="bottom-left" />
        </AppProvider>
      </body>
    </html>
  );
}
