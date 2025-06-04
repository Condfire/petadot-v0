import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function OngLoginLoading() {
  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <div className="w-full border-t border-border pt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
