'use client'

import Image from 'next/image'
import { MapPin, Clock, Wifi, Users, ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function About() {
  const { t } = useI18n()

  const highlights = [
    { icon: MapPin, label: t.about.highlights.location.label, value: t.about.highlights.location.value },
    { icon: Clock, label: t.about.highlights.reception.label, value: t.about.highlights.reception.value },
    { icon: Wifi, label: t.about.highlights.wifi.label, value: t.about.highlights.wifi.value },
    { icon: Users, label: t.about.highlights.community.label, value: t.about.highlights.community.value },
  ]

  return (
    <section id="about" className="py-12 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative h-64 rounded-md overflow-hidden">
                <Image
                  src="/assets/images/mandioca-main-5.webp"
                  alt="Mandioca Hostel main"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative h-48 rounded-md overflow-hidden">
                <Image
                  src="/assets/images/mandioca-living-1.webp"
                  alt="Mandioca Hostel common area"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative h-48 rounded-md overflow-hidden">
                <Image
                  src="/assets/images/mandioca-dorm-1.webp"
                  alt="Mandioca Hostel room"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative h-64 rounded-md overflow-hidden">
                <Image
                  src="/assets/images/mandioca-main-6.webp"
                  alt="Mandioca Hostel outdoor area"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
                {t.about.sectionTitle}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-6">
                {t.about.title}
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                {t.about.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-[#0A4843]/5 rounded-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0A4843] flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A4843] text-lg">
                    {t.contact.labels.address}
                  </h3>
                  <p className="text-gray-600">{t.about.address}</p>
                  <p className="text-gray-600">{t.about.city}</p>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-[#F7B03D] hover:text-[#0A4843] transition-colors cursor-pointer font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t.about.directions || 'Get Directions'}
                  </a>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-md bg-gray-50 hover:bg-[#0A4843]/5 transition-colors"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#F7B03D]/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A4843]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-[#0A4843] text-sm sm:text-base truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
