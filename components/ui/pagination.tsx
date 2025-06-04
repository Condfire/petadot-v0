"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxPageButtons?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxPageButtons = 5,
}: PaginationProps) {
  // Não renderizar se houver apenas uma página
  if (totalPages <= 1) return null

  // Função para gerar o array de páginas a serem exibidas
  const getPageNumbers = () => {
    const pageNumbers = []

    // Calcular o número de botões de cada lado da página atual
    const sideButtons = Math.floor(maxPageButtons / 2)

    // Calcular a página inicial e final
    let startPage = Math.max(1, currentPage - sideButtons)
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    // Ajustar a página inicial se necessário
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    // Adicionar elipses e páginas
    if (startPage > 1) {
      pageNumbers.push(1)
      if (startPage > 2) pageNumbers.push("ellipsis-start")
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("ellipsis-end")
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center space-x-2">
      {/* Botão para primeira página */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Botão para página anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Botões de páginas */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button key={`ellipsis-${index}`} variant="outline" size="icon" disabled>
              ...
            </Button>
          )
        }

        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page as number)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`Página ${page}`}
          >
            {page}
          </Button>
        )
      })}

      {/* Botão para próxima página */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Botão para última página */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export const PaginationContent = Pagination
export const PaginationItem = Pagination
export const PaginationLink = Pagination
export const PaginationEllipsis = Pagination
export const PaginationPrevious = Pagination
export const PaginationNext = Pagination
