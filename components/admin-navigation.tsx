"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  AlertTriangle,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Moderação",
    href: "/admin/moderation",
    icon: ShieldCheck,
  },
  {
    title: "Denúncias",
    href: "/admin/reports",
    icon: AlertTriangle,
  },
  {
    title: "Histórias",
    href: "/admin/historias",
    icon: BookOpen,
  },
  {
    title: "SEO",
    href: "/admin/seo",
    icon: Search,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "ONGs",
    href: "/admin/ongs",
    icon: Building2,
  },
  {
    title: "Pets",
    href: "/admin/pets",
    icon: PawPrint,
  },
  {
    title: "Eventos",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Parceiros",
    href: "/admin/partners",
    icon: Handshake,
  },
  {
    title: "Estatísticas",
    href: "/admin/stats",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
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
