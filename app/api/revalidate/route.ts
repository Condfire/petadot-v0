import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path") || "/"

    // Revalidar o caminho especificado
    revalidatePath(path)
    console.log(`Revalidação solicitada para o caminho: ${path}`)

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    })
  } catch (error) {
    console.error("Erro ao revalidar caminho:", error)
    return NextResponse.json(
      {
        revalidated: false,
        now: Date.now(),
        error: "Falha na revalidação",
      },
      { status: 500 },
    )
  }
}
