'use client'

import { ExtractedContact } from '@/lib/openai'

interface ContactResultsProps {
  contacts: ExtractedContact[]
  onClear: () => void
}

export default function ContactResults({ contacts, onClear }: ContactResultsProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const addPhonePrefix = (phone: string) => {
    if (!phone) return phone
    
    // Remove espaços e caracteres especiais
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se já tem DDD, retorna formatado
    if (cleanPhone.length >= 10) {
      return phone
    }
    
    // Se não tem DDD, adiciona (32)
    if (cleanPhone.length === 8 || cleanPhone.length === 9) {
      return `(32) ${phone}`
    }
    
    return phone
  }

  const exportToCsv = () => {
    const csvContent = [
      'Nome,Telefone,Origem',
      ...contacts.map(contact => `"${contact.name}","${addPhonePrefix(contact.phone)}","${contact.source}"`)
    ].join('\n')

    // Generate filename with current date and time
    const now = new Date()
    const day = now.getDate()
    const month = now.toLocaleDateString('pt-BR', { month: 'short' }).toLowerCase()
    const year = now.getFullYear()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const filename = `contatos_feira_${day}-${month}-${year}_${hours}-${minutes}.csv`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (contacts.length === 0) {
    return null
  }

  return (
    <div className="w-full mx-auto mt-8 px-2 sm:px-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Contatos ({contacts.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCsv}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Exportar CSV
          </button>
          <button
            onClick={onClear}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="w-full">
          <table className="w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                  Nome
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                  Tel
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                  Origem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-2 py-3 text-gray-900 w-1/3">
                    <div className="break-words text-xs leading-tight">
                      {contact.name || <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-gray-900 w-1/3">
                    <div className="break-words text-xs leading-tight">
                      {contact.phone ? addPhonePrefix(contact.phone) : <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-gray-900 w-1/3">
                    <div className="break-words text-xs leading-tight">
                      {contact.source || <span className="text-gray-400">-</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}