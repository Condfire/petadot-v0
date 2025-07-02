"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  PawPrint,
  Calendar,
  Home,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  BookOpen,
  Handshake,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin-alt",
    icon: Home,
  },
  {
    title: "Moderação",
    href: "/admin-alt/moderation",
    icon: ShieldCheck,
  },
  {
    title: "Histórias",
    href: "/admin-alt/historias",
    icon: BookOpen,
  },
  {
    title: "SEO",
    href: "/admin-alt/seo",
    icon: Search,
  },
  {
    title: "Usuários",
    href: "/admin-alt/users",
    icon: Users,
  },
  {
    title: "ONGs",
    href: "/admin-alt/ongs",
    icon: Building2,
  },
  {
    title: "Pets",
    href: "/admin-alt/pets",
    icon: PawPrint,
  },
  {
    title: "Eventos",
    href: "/admin-alt/events",
    icon: Calendar,
  },
  {
    title: "Parceiros",
    href: "/admin-alt/partners",
    icon: Handshake,
  },
  {
    title: "Estatísticas",
    href: "/admin-alt/stats",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    href: "/admin-alt/settings",
    icon: Settings,
  },
]

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
