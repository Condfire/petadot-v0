import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function DeleteEventLoading() {
  return (
    <div className="container py-12 max-w-md">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
