import AdocaoClientPage from "./AdocaoClientPage"

interface PageProps {
  searchParams: {
    page?: string
    per_page?: string
    especie?: string
    porte?: string
    sexo?: string
    idade?: string
  }
}

export default function Page({ searchParams }: PageProps) {
  const page = searchParams?.page ? Number.parseInt(searchParams.page) : 1
  const per_page = searchParams?.per_page ? Number.parseInt(searchParams.per_page) : 10
  const especie = searchParams?.especie || ""
  const porte = searchParams?.porte || ""
  const sexo = searchParams?.sexo || ""
  const idade = searchParams?.idade || ""

  return <AdocaoClientPage page={page} per_page={per_page} especie={especie} porte={porte} sexo={sexo} idade={idade} />
}
