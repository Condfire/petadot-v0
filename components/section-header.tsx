import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllLink?: string
  viewAllText?: string
}

export default function SectionHeader({
  title,
  description,
  viewAllLink,
  viewAllText = "Ver Todos",
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h2 className="section-title text-gradient">{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {viewAllLink && (
        <Link href={viewAllLink} className="mt-2 md:mt-0">
          <Button variant="outline" size="sm" className="gap-1 group">
            {viewAllText}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      )}
    </div>
  )
}
