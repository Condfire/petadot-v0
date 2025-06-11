import type React from "react"
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/solid"
import type { Event } from "@/types"
import { formatDateTime } from "@/lib/utils"
import { mapEventType } from "@/lib/utils"

interface EventCardProps {
  event: Event
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { title, description, eventType, dateTime, location, imageUrl } = event

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <div className="mt-2">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">{mapEventType(eventType)}</p>
        </div>
        <div className="mt-3">
          <div className="flex items-center text-gray-500 text-sm">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDateTime(dateTime)}
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {location}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
