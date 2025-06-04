import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HistoriaDetalhesLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/historias">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para histórias
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />

            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </div>
          </div>

          <Skeleton className="h-64 w-full rounded-lg" />

          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
