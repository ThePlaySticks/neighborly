import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neighborly | Nigerian Neighborhood Super App",
  description:
    "Connect with trusted artisans, local businesses, community notices, events, and services in your neighborhood.",
  keywords: [
    "Nigeria neighborhood app",
    "estate management",
    "artisan booking",
    "gated community",
    "local services",
  ],
  openGraph: {
    title: "Neighborly | Nigerian Neighborhood Super App",
    description:
      "Connect with trusted artisans, local businesses, community notices, events, and services in your neighborhood.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
