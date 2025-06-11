import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PetDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="p-0">
          <Skeleton className="w-full h-64" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
