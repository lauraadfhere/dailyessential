import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppLoader from "../components/app-loader";
import AutoTranslate from "../components/auto-translate";
import CookieConsent from "../components/cookie-consent";
import HelpPopup from "../components/help-popup";
import { LanguageProvider } from "../components/language-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyessential.school";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daily Essential School — Learning, admissions and student portal",
    template: "%s · Daily Essential School",
  },
  description:
    "Daily Essential School — twenty career-focused courses, online admissions, a student portal with digital ID and recovery access, and DAMMI AI study support.",
  applicationName: "Daily Essential School",
  keywords: [
    "Daily Essential School",
    "school portal",
    "online courses",
    "admissions",
    "student ID",
    "DAMMI AI",
    "Algeria school",
  ],
  // Canonicals are declared per page so no child route inherits the home URL.
  alternates: {
    languages: {
      en: "/?lang=en",
      fr: "/?lang=fr",
      ar: "/?lang=ar",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Daily Essential School",
    title: "Daily Essential School — Learning, admissions and student portal",
    description:
      "Twenty career-focused courses, online admissions, a verified student ID and DAMMI AI study support in one school platform.",
    locale: "en_GB",
    images: [{ url: "/brand/logo-blue.png", width: 1000, height: 280, alt: "Daily Essential School" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Essential School",
    description: "Courses, admissions, student portal and DAMMI AI study support.",
    images: ["/brand/logo-blue.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/brand/favicon-64.png", type: "image/png", sizes: "64x64" },
      { url: "/brand/favicon-128.png", type: "image/png", sizes: "128x128" },
      { url: "/brand/favicon-256.png", type: "image/png", sizes: "256x256" },
      { url: "/brand/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1738a8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          <AppLoader>{children}</AppLoader>
          <HelpPopup />
          <CookieConsent />
          <AutoTranslate />
        </LanguageProvider>
      </body>
    </html>
  );
}
