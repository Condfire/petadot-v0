import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-8" />

        <div className="border rounded-lg p-6 space-y-6">
          <div>
            <Skeleton className="h-7 w-1/3 mb-4" />
            <Skeleton className="h-4 w-2/3 mb-6" />
          </div>

          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-1/4 mb-2" />
              <div className="flex gap-4 mt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
