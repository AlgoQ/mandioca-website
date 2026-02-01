import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

// Using Google Translate API (free tier via unofficial endpoint)
// In production, you would use the official API with an API key
async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || text.trim() === '') return text

  try {
    // Using Google Translate free API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url)
    const data = await response.json()

    // Extract translated text from response
    if (data && data[0]) {
      return data[0].map((item: string[]) => item[0]).join('')
    }

    return text
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error('Error en la traducción')
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { text, from, to } = body

    if (!text) {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })
    }

    // Validate language codes
    const validLangs = ['en', 'es', 'pt', 'fr', 'de', 'it']
    if (!validLangs.includes(from) || !validLangs.includes(to)) {
      return NextResponse.json({ error: 'Idioma no soportado' }, { status: 400 })
    }

    // Handle batch translations (array of texts)
    if (Array.isArray(text)) {
      const translations = await Promise.all(
        text.map(t => translateText(t, from, to))
      )
      return NextResponse.json({ translations })
    }

    // Single text translation
    const translation = await translateText(text, from, to)
    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Error al traducir. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
