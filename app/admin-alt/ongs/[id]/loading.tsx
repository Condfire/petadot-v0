import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function OngDetailLoading() {
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
              <div className="flex items-center gap-6">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div>
                  <Skeleton className="h-4 w-36 mb-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
