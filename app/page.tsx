'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import ContactResults from '@/components/ContactResults'
import { ExtractedContact } from '@/lib/openai'

export default function Home() {
  const [contacts, setContacts] = useState<ExtractedContact[]>([])

  const handleContactsExtracted = (newContacts: ExtractedContact[]) => {
    setContacts(prev => [...prev, ...newContacts])
  }

  const handleClear = () => {
    setContacts([])
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 overflow-x-hidden">
      <div className="mx-auto w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leitor de Nomes e Telefones
          </h1>
          <p className="text-gray-600">
            Faça upload de fotos para extrair nomes e telefones usando IA
          </p>
        </header>

        <div className="space-y-8">
          <ImageUpload onContactsExtracted={handleContactsExtracted} />
          <ContactResults contacts={contacts} onClear={handleClear} />
        </div>

        {contacts.length === 0 && (
          <div className="text-center mt-12">
            <div className="text-gray-400 text-sm space-y-2">
              <p>📱 Tire fotos dos cartões de sorteio</p>
              <p>🤖 A IA extrairá as informações automaticamente</p>
              <p>📊 Visualize e exporte os resultados em CSV</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}