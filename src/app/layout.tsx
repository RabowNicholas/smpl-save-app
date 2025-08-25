import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SMPL - Group Discounts on Subscriptions",
  description: "Track your subscriptions and unlock group discounts on streaming, groceries, internet, and more. Join our community to save together with better deals for everyone.",
  keywords: ["subscription tracker", "group discounts", "streaming deals", "grocery savings", "community savings", "service discounts", "smpl"],
  authors: [{ name: "SMPL Team" }],
  creator: "SMPL",
  publisher: "SMPL",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://live.smpl.com",
    title: "SMPL - Group Discounts on Subscriptions",
    description: "Track your subscriptions and unlock group discounts. More members = better deals for everyone. Free to join!",
    siteName: "SMPL",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SMPL - Community-powered subscription savings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMPL - Group Discounts on Subscriptions",
    description: "Join our community to unlock group discounts on your favorite services. More members = better deals!",
    images: ["/twitter-image.png"],
    creator: "@smpl",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  alternates: {
    canonical: "https://live.smpl.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
