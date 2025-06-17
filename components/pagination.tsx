"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function PaginationComponent({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  // Não renderizar paginação se houver apenas uma página
  if (totalPages <= 1) {
    return null
  }

  // Determinar quais páginas mostrar
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Número máximo de botões de página para mostrar

    if (totalPages <= maxPagesToShow) {
      // Se houver menos páginas que o máximo, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Caso contrário, mostrar um subconjunto com a página atual no centro
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
      let endPage = startPage + maxPagesToShow - 1

      if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Adicionar elipses se necessário
      if (startPage > 1) {
        pageNumbers.unshift(-1) // -1 representa "..."
        pageNumbers.unshift(1) // Sempre mostrar a primeira página
      }

      if (endPage < totalPages) {
        pageNumbers.push(-2) // -2 representa "..." no final
        pageNumbers.push(totalPages) // Sempre mostrar a última página
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex items-center justify-center space-x-2 my-8 ${className}`}>
      {/* Botão para primeira página */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Primeira página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

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

      {/* Botões de página */}
      {pageNumbers.map((pageNumber, index) => {
        if (pageNumber === -1 || pageNumber === -2) {
          // Renderizar elipses
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2">
              ...
            </span>
          )
        }

        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Página ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
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
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Export nomeado para compatibilidade
export { PaginationComponent as Pagination }

// Export padrão
export default PaginationComponent
