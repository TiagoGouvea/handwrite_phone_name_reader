import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true
})

export interface ExtractedContact {
  name: string
  phone: string
  source: string
}

const ContactSchema = z.object({
  name: z.string().describe("Nome e sobrenome da pessoa extraído da imagem (apenas primeiro nome e último sobrenome)"),
  phone: z.string().describe("Número de telefone extraído da imagem"),
  source: z.string().describe("Como conheceu a pessoa/empresa - identifique qual checkbox está marcado com X")
})

export async function extractContactFromImage(imageFile: File): Promise<ExtractedContact | null> {
  try {
    const base64 = await fileToBase64(imageFile)
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: zodResponseFormat(ContactSchema, "contact"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extraia o nome, número de telefone e como a pessoa conheceu desta anotação manuscrita.

              Para o nome: extraia apenas o primeiro nome e último sobrenome (ex: "João Silva").
              
              Para o campo "source", identifique qual checkbox está marcado com X entre as opções:
              - "Passando por aqui"
              - "Facebook" 
              - "TV"
              - "Youtube"
              - "Um amigo me falou"
              - "Rádio"
              - "Cartaz no ônibus"
              - "Instagram"
              - "Carro de som"
              
              Se não conseguir encontrar claramente alguma informação, deixe o campo vazio.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    try {
      const parsed = ContactSchema.parse(JSON.parse(content))
      return {
        name: parsed.name || "",
        phone: parsed.phone || "",
        source: parsed.source || ""
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content, parseError)
      return null
    }
  } catch (error) {
    console.error("OpenAI API error:", error)
    return null
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}