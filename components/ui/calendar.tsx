"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
}

export function Calendar({ selected, onSelect, className, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate calendar days
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }

  const isSelected = (date: Date) => {
    return (
      selected &&
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="h-7 w-7 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-sm font-medium">
          {monthNames[month]} {year}
        </h2>

        <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-7 w-7 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateClick(date)}
                disabled={disabled && disabled(date)}
                className={cn(
                  "h-full w-full p-0 font-normal",
                  isSelected(date) &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground",
                  disabled && disabled(date) && "opacity-50 cursor-not-allowed",
                )}
              >
                {date.getDate()}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
