import Link from "next/link"
import { PawPrintIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-8 w-full">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-6">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <PawPrintIcon className="h-6 w-6" />
            <span className="text-lg">PetAdot</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Conectando pets a lares amorosos e ajudando a reunir famílias.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Navegação</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/adocao" className="text-sm hover:underline" prefetch={false}>
                Adoção
              </Link>
            </li>
            <li>
              <Link href="/perdidos" className="text-sm hover:underline" prefetch={false}>
                Perdidos
              </Link>
            </li>
            <li>
              <Link href="/encontrados" className="text-sm hover:underline" prefetch={false}>
                Encontrados
              </Link>
            </li>
            <li>
              <Link href="/historias" className="text-sm hover:underline" prefetch={false}>
                Histórias de Sucesso
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Recursos</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/ongs" className="text-sm hover:underline" prefetch={false}>
                ONGs Parceiras
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="text-sm hover:underline" prefetch={false}>
                Eventos
              </Link>
            </li>
            <li>
              <Link href="/contato" className="text-sm hover:underline" prefetch={false}>
                Contato
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="text-sm hover:underline" prefetch={false}>
                Sobre Nós
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Legal</h3>
          <ul className="space-y-1">
            <li>
              <Link href="#" className="text-sm hover:underline" prefetch={false}>
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline" prefetch={false}>
                Termos de Serviço
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PetAdot. Todos os direitos reservados.
      </div>
    </footer>
  )
}

export default Footer
