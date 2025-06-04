import { Skeleton } from "@/components/ui/skeleton"

export default function EditPartnerLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />

        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />

        <div className="pt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
