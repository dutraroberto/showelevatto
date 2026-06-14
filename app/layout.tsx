import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "Show de 10 anos da Elevatto";
const description =
  "Uma década de música, entrega e conexão. Garanta sua inscrição gratuita para o show de 10 anos da Elevatto.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Elevatto",
    title,
    description,
    images: [
      {
        url: "/logo-footer.png",
        width: 640,
        height: 641,
        alt: "Elevatto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/logo-footer.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
