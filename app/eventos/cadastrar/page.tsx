import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import EventoForm from "@/app/eventos/components/EventoForm" // Importar como default export
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function CadastrarEventoPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirecionar para login ou exibir mensagem de erro
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você precisa estar logado para cadastrar um evento.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Para ONGs, o ongId viria do perfil da ONG logada
  // Para usuários comuns, o userId seria o id do session.user
  const userId = session.user.id
  // const ongId = 'SEU_ONG_ID_AQUI' // Se for um dashboard de ONG, buscar o ID da ONG

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Cadastrar Novo Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <EventoForm userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}
