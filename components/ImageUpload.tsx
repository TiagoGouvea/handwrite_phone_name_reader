'use client'

import { useState, useCallback } from 'react'
import { extractContactFromImage, ExtractedContact } from '@/lib/openai'

interface ImageUploadProps {
  onContactsExtracted: (contacts: ExtractedContact[]) => void
}

export default function ImageUpload({ onContactsExtracted }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessedCount(0)
    setTotalCount(files.length)

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    // Process in batches of 3
    const BATCH_SIZE = 3
    const DELAY_MS = 300

    for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
      const batch = imageFiles.slice(i, i + BATCH_SIZE)
      
      // Process batch in parallel
      const batchPromises = batch.map(async (file) => {
        try {
          const contact = await extractContactFromImage(file)
          if (contact && (contact.name || contact.phone)) {
            return contact
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
        }
        return null
      })

      const batchResults = await Promise.all(batchPromises)
      const validContacts = batchResults.filter(contact => contact !== null) as ExtractedContact[]
      
      // Add contacts to grid immediately
      if (validContacts.length > 0) {
        onContactsExtracted(validContacts)
      }

      // Update progress
      setProcessedCount(Math.min(i + BATCH_SIZE, imageFiles.length))

      // Wait between batches (except for the last batch)
      if (i + BATCH_SIZE < imageFiles.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
    }

    setIsProcessing(false)
  }, [onContactsExtracted])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div className="w-full mx-auto px-4 overflow-hidden" style={{maxWidth: '100%'}}>
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
          isProcessing 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600 font-medium">
              Processando imagens...
            </p>
            <p className="text-sm text-gray-600">
              {processedCount} de {totalCount} concluídas
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(processedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Arraste imagens aqui ou clique para fazer upload
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Selecione múltiplas fotos
                </span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileInput}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}