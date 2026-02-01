'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, Mail, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track booking success page view
    if (sessionId) {
      posthog.capture('booking_success_viewed', {
        stripe_session_id: sessionId,
      })
    }

    // Give the webhook time to process
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A4843] to-[#0d5c55] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Confirmando tu reserva...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A4843] to-[#0d5c55] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Reserva Confirmada!
        </h1>
        <p className="text-gray-600 mb-8">
          Tu pago ha sido procesado exitosamente. Te hemos enviado un email de confirmación.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0A4843]" />
            Próximos Pasos
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#0A4843] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
              <span>Revisa tu email para los detalles de la reserva</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#0A4843] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
              <span>Check-in a partir de las 13:00</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#0A4843] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
              <span>Trae un documento de identidad válido</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#F7B03D]/10 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0A4843]" />
            Nuestra Ubicación
          </h2>
          <p className="text-gray-600 mb-3">Av. Colón 1090, Asunción, Paraguay</p>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A4843] font-medium hover:underline"
          >
            Ver en Google Maps →
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-[#0A4843] text-white rounded-lg font-medium hover:bg-[#0d5c55] transition-colors"
          >
            Volver al Inicio
          </Link>
          <a
            href="mailto:info@mandiocahostel.com"
            className="flex-1 px-6 py-3 border border-[#0A4843] text-[#0A4843] rounded-lg font-medium hover:bg-[#0A4843]/5 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contactar
          </a>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-400 mt-6">
            ID de transacción: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A4843] to-[#0d5c55] flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p>Cargando...</p>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingSuccessContent />
    </Suspense>
  )
}
