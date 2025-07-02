import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EventDetailLoading() {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="w-full h-64 rounded-md" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-9 w-full mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="pt-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
