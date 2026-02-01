'use client'

import { useState } from 'react'
import { Languages, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TranslateButtonProps {
  text: string
  from: 'en' | 'es'
  to: 'en' | 'es'
  onTranslate: (translatedText: string) => void
  className?: string
  size?: 'sm' | 'default' | 'lg' | 'icon'
}

export function TranslateButton({
  text,
  from,
  to,
  onTranslate,
  className = '',
  size = 'sm',
}: TranslateButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!text || text.trim() === '') return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      onTranslate(data.translation)
    } catch (error) {
      console.error('Translation error:', error)
      alert('Error al traducir. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const label = from === 'es' ? 'Traducir a Inglés' : 'Traducir a Español'

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleTranslate}
      disabled={loading || !text || text.trim() === ''}
      className={`text-[#0A4843] hover:text-[#0d5c55] hover:bg-[#0A4843]/10 ${className}`}
      title={label}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Languages className="w-4 h-4" />
      )}
      {size !== 'icon' && <span className="ml-1">{label}</span>}
    </Button>
  )
}
