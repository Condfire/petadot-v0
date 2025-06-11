"use client"

import type React from "react"

interface EventosClientPageProps {
  initialEvents: any[]
  totalEvents: number
}

const EventosClientPage: React.FC<EventosClientPageProps> = ({ initialEvents, totalEvents }) => {
  console.log("Client Page: initialEvents prop", initialEvents)
  console.log("Client Page: totalEvents prop", totalEvents)

  return (
    <div>
      <h1>Eventos Client Page</h1>
      <p>Total Events: {totalEvents}</p>
      {initialEvents.length > 0 ? (
        <ul>
          {initialEvents.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))}
        </ul>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  )
}

export default EventosClientPage
