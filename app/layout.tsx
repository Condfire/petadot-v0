import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { AuthProvider } from "./auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PetAdot - Adoção, Pets Perdidos e Encontrados",
  description:
    "Plataforma para adoção de pets, divulgação de pets perdidos e encontrados, e apoio a ONGs de proteção animal.",
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
