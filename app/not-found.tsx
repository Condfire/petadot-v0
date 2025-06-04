import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">Página não encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Voltar para a página inicial
      </Link>
    </div>
  )
}
