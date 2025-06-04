"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PaginationControlsProps {
  totalItems: number
  pageSize: number
  currentPage: number
  baseUrl: string
  siblingCount?: number
}

export function PaginationControls({
  totalItems,
  pageSize,
  currentPage,
  baseUrl,
  siblingCount = 1,
}: PaginationControlsProps) {
  const searchParams = useSearchParams()

  // Garantir que todos os valores sejam números válidos
  const validTotalItems = isNaN(totalItems) ? 0 : totalItems
  const validPageSize = isNaN(pageSize) || pageSize <= 0 ? 12 : pageSize
  const validCurrentPage = isNaN(currentPage) || currentPage <= 0 ? 1 : currentPage

  // Calcular o número total de páginas
  const totalPages = Math.max(1, Math.ceil(validTotalItems / validPageSize))

  // Se houver apenas uma página, não mostrar a paginação
  if (totalPages <= 1) {
    return null
  }

  // Função para criar a URL com os parâmetros de busca atuais
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  // Função para gerar o array de páginas a serem exibidas
  const generatePaginationItems = () => {
    const items = []

    // Sempre mostrar a primeira página
    items.push(1)

    // Calcular o intervalo de páginas a serem mostradas
    const leftSibling = Math.max(2, validCurrentPage - siblingCount)
    const rightSibling = Math.min(totalPages - 1, validCurrentPage + siblingCount)

    // Adicionar elipses à esquerda se necessário
    if (leftSibling > 2) {
      items.push("ellipsis-left")
    }

    // Adicionar páginas do intervalo
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i)
      }
    }

    // Adicionar elipses à direita se necessário
    if (rightSibling < totalPages - 1) {
      items.push("ellipsis-right")
    }

    // Sempre mostrar a última página se houver mais de uma página
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  const paginationItems = generatePaginationItems()

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Botão Anterior */}
      <Button variant="outline" size="icon" disabled={validCurrentPage <= 1} asChild={validCurrentPage > 1}>
        {validCurrentPage > 1 ? (
          <Link href={createPageUrl(validCurrentPage - 1)} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Números das páginas */}
      {paginationItems.map((item, index) => {
        // Renderizar elipses
        if (item === "ellipsis-left" || item === "ellipsis-right") {
          return (
            <span key={item} className="px-3 py-2">
              ...
            </span>
          )
        }

        // Renderizar botões de página
        return (
          <Button
            key={index}
            variant={validCurrentPage === item ? "default" : "outline"}
            size="icon"
            asChild={validCurrentPage !== item}
            className="w-9"
          >
            {validCurrentPage !== item ? (
              <Link href={createPageUrl(item as number)} aria-label={`Ir para página ${item}`}>
                {item}
              </Link>
            ) : (
              <span>{item}</span>
            )}
          </Button>
        )
      })}

      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="icon"
        disabled={validCurrentPage >= totalPages}
        asChild={validCurrentPage < totalPages}
      >
        {validCurrentPage < totalPages ? (
          <Link href={createPageUrl(validCurrentPage + 1)} aria-label="Próxima página">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}
