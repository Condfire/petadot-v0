"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdoptionPetForm } from "@/components/AdoptionPetForm"
import { LostPetForm } from "@/components/LostPetForm"

interface CadastrarPetClientProps {
  ongId: string
  ongName: string
}

export default function CadastrarPetClient({ ongId, ongName }: CadastrarPetClientProps) {
  const [activeTab, setActiveTab] = useState("adoption")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Pet</h1>
          <p className="text-gray-600">
            Cadastre um novo pet para sua ONG: <span className="font-semibold">{ongName}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Cadastro</CardTitle>
            <CardDescription>Escolha o tipo de pet que você deseja cadastrar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adoption">Pet para Adoção</TabsTrigger>
                <TabsTrigger value="lost">Pet Perdido</TabsTrigger>
              </TabsList>

              <TabsContent value="adoption" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cadastrar Pet para Adoção</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Cadastre um pet que está disponível para adoção em sua ONG.
                    </p>
                  </div>
                  <AdoptionPetForm ongId={ongId} redirectPath="/ongs/dashboard" />
                </div>
              </TabsContent>

              <TabsContent value="lost" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cadastrar Pet Perdido</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Cadastre um pet perdido para ajudar na busca pelo dono.
                    </p>
                  </div>
                  <LostPetForm ongId={ongId} redirectPath="/ongs/dashboard" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
