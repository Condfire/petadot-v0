"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"

export default function ModerationPage() {
  const [rejectedPets, setRejectedPets] = useState<any[]>([])
  const [rejectedStories, setRejectedStories] = useState<any[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchRejectedItems()
  }, [])

  const fetchRejectedItems = async () => {
    try {
      // Para pets rejeitados:
      const { data: rejectedPets, error: petsError } = await supabase
        .from("pets")
        .select("*, users!pets_user_id_fkey(name)")
        .eq("status", "rejected")
        .order("created_at", { ascending: false })

      if (petsError) {
        console.error("Error fetching rejected pets:", petsError)
        toast.error("Error fetching rejected pets")
        return
      }

      // Para stories rejeitadas:
      const { data: rejectedStories, error: storiesError } = await supabase
        .from("pet_stories")
        .select("*, users!pet_stories_user_id_fkey(name)")
        .eq("status", "rejected")
        .order("created_at", { ascending: false })

      if (storiesError) {
        console.error("Error fetching rejected stories:", storiesError)
        toast.error("Error fetching rejected stories")
        return
      }

      setRejectedPets(rejectedPets || [])
      setRejectedStories(rejectedStories || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("Unexpected error occurred")
    }
  }

  const handleApprove = async (type: "pet" | "story", id: string) => {
    try {
      const tableName = type === "pet" ? "pets" : "pet_stories"
      const { error } = await supabase.from(tableName).update({ status: "approved" }).eq("id", id)

      if (error) {
        console.error(`Error approving ${type}:`, error)
        toast.error(`Error approving ${type}`)
        return
      }

      toast.success(`${type === "pet" ? "Pet" : "Story"} approved!`)
      fetchRejectedItems() // Refresh data
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("Unexpected error occurred")
    }
  }

  const handleRejectPermanently = async (type: "pet" | "story", id: string) => {
    try {
      const tableName = type === "pet" ? "pets" : "pet_stories"
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) {
        console.error(`Error deleting ${type}:`, error)
        toast.error(`Error deleting ${type}`)
        return
      }

      toast.success(`${type === "pet" ? "Pet" : "Story"} permanently rejected!`)
      fetchRejectedItems() // Refresh data
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("Unexpected error occurred")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Moderation</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Rejected Pets</h2>
        {rejectedPets.length === 0 ? (
          <p>No rejected pets.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedPets.map((item) => (
              <div key={item.id} className="bg-white rounded-md shadow-md p-4 flex flex-col">
                <div className="flex items-start mb-2">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.main_image_url || item.image_url || "/placeholder.svg?height=80&width=80&query=pet"}
                      alt={item.name || "Pet"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Uploaded by: {item.users?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-auto">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                    onClick={() => handleApprove("pet", item.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleRejectPermanently("pet", item.id)}
                  >
                    Reject Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Rejected Stories</h2>
        {rejectedStories.length === 0 ? (
          <p>No rejected stories.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedStories.map((item) => (
              <div key={item.id} className="bg-white rounded-md shadow-md p-4 flex flex-col">
                <div className="flex items-start mb-2">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.main_image_url || item.image_url || "/placeholder.svg?height=80&width=80&query=pet"}
                      alt={item.title || "Story"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">Uploaded by: {item.users?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-auto">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                    onClick={() => handleApprove("story", item.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleRejectPermanently("story", item.id)}
                  >
                    Reject Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
