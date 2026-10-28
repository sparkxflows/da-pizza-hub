import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Bebas_Neue, Allura } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { getBranches } from "@/lib/db";
import { PRIMARY_STORE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#D91F26",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dapizzahub.in"),
  title: {
    default: "Da Pizza Hub | 100% Pure Veg Gourmet Pizzeria – Hansi",
    template: "%s | Da Pizza Hub",
  },
  description:
    "Order freshly baked 100% Pure Veg Pizzas, Burgers, Pasta, Garlic Bread & Combos from Da Pizza Hub, Shop No. 60, Gandhi Market, Near Ambedkar Chowk, Hansi, Haryana.",
  keywords: [
    "Da Pizza Hub",
    "Pure Veg Pizza Hansi",
    "Best Pizza in Hansi",
    "Pizza Delivery Hansi",
    "Vegetarian Pizza",
    "Da Pizza Hub Menu",
    "Pizza Hansi Haryana",
  ],
  authors: [{ name: "Da Pizza Hub" }],
  creator: "Da Pizza Hub",
  publisher: "Da Pizza Hub",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.dapizzahub.in",
    siteName: "Da Pizza Hub",
    title: "Da Pizza Hub — Freshly Baked. 100% Pure Veg.",
    description:
      "Fresh dough, premium cheese & farm-fresh toppings in Hansi, Haryana. Free delivery within 3 KM!",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Da Pizza Hub — Pure Veg Pizzeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Da Pizza Hub — 100% Pure Veg Pizza Experience",
    description:
      "Freshly handcrafted pizzas, burgers, pasta, wraps & shakes in Hansi, Haryana.",
    images: ["/brand/og-image.jpg"],
  },
};

export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branches = await getBranches();
  const primary =
    branches.find((b) => b.id === "Hansi") ?? branches[0] ?? PRIMARY_STORE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Da Pizza Hub",
    image: "https://www.dapizzahub.in/images/hero/hero-main.webp",
    "@id": "https://www.dapizzahub.in",
    url: "https://www.dapizzahub.in",
    telephone: primary ? `+91${primary.phone}` : "+919911273199",
    priceRange: "₹₹",
    servesCuisine: ["Pizza", "Italian", "Fast Food", "Pure Vegetarian"],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        primary?.address ??
        "Shop No. 60, Gandhi Market, Near Ambedkar Chowk",
      addressLocality: "Hansi",
      addressRegion: "Haryana",
      postalCode: "125033",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: primary?.lat ?? 29.0941994,
      longitude: primary?.lng ?? 75.9622477,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "23:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1250",
    },
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${bebas.variable} ${allura.variable}`}
    >
      <body className="font-sans bg-bg text-ink-primary antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>
          <StorefrontChrome branches={branches}>{children}</StorefrontChrome>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
