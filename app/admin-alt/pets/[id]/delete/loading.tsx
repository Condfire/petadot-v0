export default function Loading() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
