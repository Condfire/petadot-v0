import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar" // Import Navbar
import Footer from "@/components/footer" // Import Footer
import { Toaster } from "@/components/ui/sonner" // Using sonner for toasts

const inter = Inter({ subsets: ["latin"] })

// Safe URL construction with multiple fallbacks
function getMetadataBaseUrl(): URL {
  // Try environment variables first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL)
    } catch {
      // Invalid URL, continue to next fallback
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL)
    } catch {
      // Invalid URL, continue to next fallback
    }
  }

  // Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return new URL("http://localhost:3000")
  }

  // Final fallback
  return new URL("https://petadot.com.br")
}

export const metadata: Metadata = {
  title: {
    default: "PetAdot - Adoção, Pets Perdidos e Encontrados",
    template: "%s | PetAdot",
  },
  description:
    "Plataforma para adoção de pets, divulgação de pets perdidos e encontrados, e apoio a ONGs de proteção animal.",
  keywords: [
    "pets",
    "adoção",
    "animais perdidos",
    "pets encontrados",
    "cães",
    "gatos",
    "ONGs",
    "proteção animal",
    "Brasil",
  ],
  authors: [{ name: "PetAdot Team" }],
  creator: "PetAdot",
  publisher: "PetAdot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: getMetadataBaseUrl(),
    title: "PetAdot - Adoção, Pets Perdidos e Encontrados",
    description:
      "Plataforma para adoção de pets, divulgação de pets perdidos e encontrados, e apoio a ONGs de proteção animal.",
    siteName: "PetAdot",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetAdot - Adoção, Pets Perdidos e Encontrados",
    description:
      "Plataforma para adoção de pets, divulgação de pets perdidos e encontrados, e apoio a ONGs de proteção animal.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/favicon.png`
          : "/favicon.ico",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/favicon.png`
          : "/favicon.ico",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/favicon.png`
          : "/favicon.ico",
        type: "image/png",
      },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href={
            process.env.NEXT_PUBLIC_SUPABASE_URL
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/favicon.png`
              : "/favicon.ico"
          }
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
