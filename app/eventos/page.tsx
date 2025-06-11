import { getEvents } from "@/lib/supabase"

async function EventsPage() {
  const events = await getEvents()

  return (
    <div>
      <h1>Eventos</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>Data: {event.date}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default EventsPage
