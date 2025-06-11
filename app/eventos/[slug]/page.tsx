import { mapEventType } from "@/lib/utils"

export default function EventPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  return (
    <div>
      <h1>Event: {slug}</h1>
      <p>Event Type: {mapEventType("concert")}</p>
    </div>
  )
}
