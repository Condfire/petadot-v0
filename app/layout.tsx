import type React from "react"
import type { Metadata } from "next"
import { Inter, Lexend } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" })

// Helper function to safely construct URL
function getMetadataBaseUrl(): URL {
  try {
    // Try environment variables in order of preference
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL

    if (siteUrl) {
      // Ensure the URL has a protocol
      const url = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
      return new URL(url)
    }

    // Development fallback
    if (process.env.NODE_ENV === "development") {
      return new URL("http://localhost:3000")
    }

    // Production fallback
    return new URL("https://petadot.com.br")
  } catch (error) {
    console.error("Error constructing metadata base URL:", error)
    // Final safe fallback
    return new URL("https://petadot.com.br")
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: "Petadot - Encontre seu pet perdido",
    template: "%s | Petadot",
  },
  description:
    "Plataforma para ajudar a encontrar pets perdidos, adoção responsável e conectar famílias com seus animais de estimação.",
  keywords: ["pets", "animais perdidos", "adoção", "cães", "gatos", "Brasil", "pet perdido", "encontrar pet"],
  authors: [{ name: "Petadot Team" }],
  creator: "Petadot",
  publisher: "Petadot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Petadot",
    title: "Petadot - Encontre seu pet perdido",
    description:
      "Plataforma para ajudar a encontrar pets perdidos, adoção responsável e conectar famílias com seus animais de estimação.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petadot - Encontre seu pet perdido",
    description:
      "Plataforma para ajudar a encontrar pets perdidos, adoção responsável e conectar famílias com seus animais de estimação.",
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
        {/* Favicon dinâmico do Supabase Storage */}
        <link
          rel="icon"
          href={
            process.env.NEXT_PUBLIC_SUPABASE_URL
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/favicon.png`
              : "/favicon.ico"
          }
        />
      </head>
      <body className={`${inter.className} ${lexend.variable}`}>
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
