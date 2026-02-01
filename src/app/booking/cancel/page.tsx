'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reserva Cancelada
        </h1>
        <p className="text-gray-600 mb-8">
          Tu proceso de pago fue cancelado. No se realizó ningún cargo a tu tarjeta.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">¿Tuviste algún problema?</h2>
          <p className="text-gray-600 mb-4">
            Si encontraste algún inconveniente durante el proceso de reserva,
            no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>• WhatsApp: +54 9 3704 95-1772</li>
            <li>• Email: info@mandiocahostel.com</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/#booking"
            className="flex-1 px-6 py-3 bg-[#0A4843] text-white rounded-lg font-medium hover:bg-[#0d5c55] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Intentar de Nuevo
          </Link>
          <a
            href="https://wa.me/5493704951772"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 border border-[#0A4843] text-[#0A4843] rounded-lg font-medium hover:bg-[#0A4843]/5 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
