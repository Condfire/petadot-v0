import SectionHeader from "@/components/section-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnersLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <SectionHeader title="Nossos Parceiros" />

      <div className="max-w-4xl mx-auto my-8">
        <Skeleton className="h-24 w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
          ))}
      </div>
    </main>
  )
}
