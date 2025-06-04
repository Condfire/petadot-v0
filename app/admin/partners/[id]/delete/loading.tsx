import { Skeleton } from "@/components/ui/skeleton"

export default function DeletePartnerLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Skeleton className="h-24 w-full mb-6 rounded-lg" />

        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
