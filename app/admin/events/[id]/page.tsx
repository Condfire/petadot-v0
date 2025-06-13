import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/login?callbackUrl=/admin/events/${id}`)
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (userError || !user?.is_admin) {
    redirect("/")
  }

  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

  if (eventError || !event) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Evento</h1>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>ID: {event.id}</p>
          {event.start_date && <p>Data: {formatDate(event.start_date)}</p>}
          {event.location && <p>Local: {event.location}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/events">Voltar</Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link href={`/admin/events/${event.id}/delete`}>Excluir Evento</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

