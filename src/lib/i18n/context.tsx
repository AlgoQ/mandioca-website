'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { en } from './locales/en'

export type Locale = 'en' | 'es'

// Use a recursive type to make all string literals into string type
type DeepStringify<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends readonly (infer U)[]
  ? DeepStringify<U>[]
  : T extends object
  ? { [K in keyof T]: DeepStringify<T[K]> }
  : T

export type Dictionary = DeepStringify<typeof en>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Dynamic import for locale - only loads the needed language
async function loadDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === 'es') {
    const { es } = await import('./locales/es')
    return es as unknown as Dictionary
  }
  return en as unknown as Dictionary
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es') // Default to Spanish for Paraguay
  const [dictionary, setDictionary] = useState<Dictionary>(en as unknown as Dictionary) // Start with en to avoid hydration mismatch
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectLanguage = async () => {
      try {
        let detectedLocale: Locale = 'es' // Default

        // Check localStorage for saved preference first
        const savedLocale = localStorage.getItem('locale') as Locale | null
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
          detectedLocale = savedLocale
        } else {
          // No saved preference, try IP-based geolocation
          try {
            const response = await fetch('/api/detect-language')
            if (response.ok) {
              const data = await response.json()
              const geoLocale = data.language as Locale
              if (geoLocale === 'en' || geoLocale === 'es') {
                detectedLocale = geoLocale
              }
            }
          } catch {
            // Geolocation failed, fall back to browser language
            const browserLang = navigator.language.toLowerCase()
            if (browserLang.startsWith('en')) {
              detectedLocale = 'en'
            }
            // Otherwise keep default (Spanish)
          }
        }

        // Load the dictionary for the detected locale
        const dict = await loadDictionary(detectedLocale)
        setLocaleState(detectedLocale)
        setDictionary(dict)
      } catch (error) {
        console.error('Language detection error:', error)
        // Keep default Spanish - load its dictionary
        const dict = await loadDictionary('es')
        setDictionary(dict)
      } finally {
        setIsLoading(false)
      }
    }

    detectLanguage()
  }, [])

  const setLocale = async (newLocale: Locale) => {
    const dict = await loadDictionary(newLocale)
    setLocaleState(newLocale)
    setDictionary(dict)
    localStorage.setItem('locale', newLocale)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionary, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
