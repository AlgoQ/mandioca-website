'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CookieBannerProps {
  lang?: 'en' | 'es'
}

const content = {
  en: {
    title: 'We use cookies',
    message: 'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
    acceptAll: 'Accept All',
    acceptNecessary: 'Necessary Only',
    learnMore: 'Learn More',
    privacyPolicy: 'Privacy Policy',
  },
  es: {
    title: 'Usamos cookies',
    message: 'Usamos cookies para mejorar tu experiencia de navegación y analizar nuestro tráfico. Al hacer clic en "Aceptar todas", consientes el uso de nuestras cookies.',
    acceptAll: 'Aceptar Todas',
    acceptNecessary: 'Solo Necesarias',
    learnMore: 'Más Información',
    privacyPolicy: 'Política de Privacidad',
  },
}

export default function CookieBanner({ lang = 'en' }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const t = content[lang]

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent')
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }))
    closeBanner()
  }

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }))
    closeBanner()
  }

  const closeBanner = () => {
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              {/* Cookie Icon */}
              <div className="hidden sm:flex w-12 h-12 bg-[#F7B03D]/10 rounded-full items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-[#F7B03D]" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t.message}{' '}
                  <a
                    href="/terms"
                    className="text-[#0A4843] hover:underline font-medium"
                  >
                    {t.privacyPolicy}
                  </a>
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-[#0A4843] hover:bg-[#0d5c55] text-white"
                  >
                    {t.acceptAll}
                  </Button>
                  <Button
                    onClick={handleAcceptNecessary}
                    variant="outline"
                    className="border-gray-300"
                  >
                    {t.acceptNecessary}
                  </Button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleAcceptNecessary}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
