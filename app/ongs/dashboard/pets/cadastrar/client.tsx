"use client"

import { useState, Suspense } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { AdoptionPetForm } from "@/components/AdoptionPetForm" // Importação nomeada
import { LostPetForm } from "@/components/LostPetForm" // Importação nomeada

interface CadastrarPetClientProps {
  ongId: string
  ongName: string
}

export default function CadastrarPetClient({ ongId, ongName }: CadastrarPetClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("adoption") // Estado para controlar a aba ativa

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/ongs/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Pet</h1>
          <p className="text-muted-foreground">Adicione um novo pet para adoção ou reporte um pet perdido</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adoption">Para Adoção</TabsTrigger>
          <TabsTrigger value="lost">Perdido</TabsTrigger>
        </TabsList>
        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Pet para Adoção</CardTitle>
              <CardDescription>Preencha os dados do pet disponível para adoção.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                }
              >
                <AdoptionPetForm ongId={ongId} ongName={ongName} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lost">
          <Card>
            <CardHeader>
              <CardTitle>Reportar Pet Perdido</CardTitle>
              <CardDescription>Preencha os dados do pet que foi perdido.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                }
              >
                <LostPetForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
