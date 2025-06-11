import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const filters = searchParams.get("filters")?.split(",") || []

    const skip = (page - 1) * limit

    const events = await prisma.evento.findMany({
      skip,
      take: limit,
      where: {
        AND: [
          {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                descripcion: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
          filters.length > 0
            ? {
                categoria: {
                  in: filters,
                },
              }
            : {},
        ],
      },
      include: {
        imagenes: true,
      },
      orderBy: {
        fechaInicio: "asc",
      },
    })

    const count = await prisma.evento.count({
      where: {
        AND: [
          {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                descripcion: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
          filters.length > 0
            ? {
                categoria: {
                  in: filters,
                },
              }
            : {},
        ],
      },
    })

    const totalPages = Math.ceil(count / limit)

    return NextResponse.json({
      events,
      totalPages,
      currentPage: page,
      totalEvents: count,
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
