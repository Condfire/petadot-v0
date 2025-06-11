const EventDetailPage = ({ params }: { params: { id: string } }) => {
  const eventId = params.id

  return (
    <div>
      <h1>Event Detail Page</h1>
      <p>Event ID: {eventId}</p>
      {/* You can fetch and display event details here based on the eventId */}
    </div>
  )
}

export default EventDetailPage
