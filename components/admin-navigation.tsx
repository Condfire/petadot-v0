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

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Pets",
    href: "/admin/pets",
    icon: PawPrint,
  },
  {
    title: "Agendamentos",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    title: "Organizações",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Estatísticas",
    href: "/admin/statistics",
    icon: BarChart3,
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
    title: "Conteúdo Educacional",
    href: "/admin/educational-content",
    icon: BookOpen,
  },
  {
    title: "Parcerias",
    href: "/admin/partnerships",
    icon: Handshake,
  },
  {
    title: "Busca",
    href: "/admin/search",
    icon: Search,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
]
