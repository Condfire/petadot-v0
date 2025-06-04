import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function OngsLoading() {
  return (
    <div className="container py-12">
      <div className="space-y-4 mb-12">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                </div>
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  )
}
