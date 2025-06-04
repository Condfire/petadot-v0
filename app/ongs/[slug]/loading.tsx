import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OngDetailsLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center text-muted-foreground mb-6">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações da ONG */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Skeleton className="w-32 h-32 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="text-left w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="text-left w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-0.5" />
                  <div className="text-left w-full">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas da ONG */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-muted/50 p-4 rounded-lg text-center">
                    <Skeleton className="h-5 w-5 mx-auto mb-1" />
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        {/* Pets e Eventos */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pets" disabled className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-24" />
              </TabsTrigger>
              <TabsTrigger value="events" disabled className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-24" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pets" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
