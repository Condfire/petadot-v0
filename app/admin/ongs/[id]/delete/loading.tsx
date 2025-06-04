import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function DeleteOngLoading() {
  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Skeleton className="h-4 w-24 mr-4" />
        <Skeleton className="h-8 w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-md">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
            <Skeleton className="h-5 w-64 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
