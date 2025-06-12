import type React from "react"
import type { Metadata } from "next"
import { AdminNavigation } from "@/components/admin-navigation"
import AdminAuthCheck from "@/components/admin-auth-check"

export const metadata: Metadata = {
  title: "Painel de Administração | Petadot",
  description: "Painel de administração da plataforma Petadot",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthCheck>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <AdminNavigation />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </AdminAuthCheck>
  )
}
