import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-6 w-full mx-auto" />
      </div>

      <div className="max-w-2xl mx-auto bg-muted/30 p-8 rounded-lg">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        <Skeleton className="h-6 w-3/4 mx-auto mb-6" />

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-12">
        <Skeleton className="h-8 w-64 mx-auto mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>
          <div className="bg-muted/30 p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
