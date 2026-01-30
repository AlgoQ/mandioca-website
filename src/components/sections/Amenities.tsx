'use client'

import {
  Wifi,
  ChefHat,
  Lock,
  Luggage,
  Wind,
  MapPin,
  Dog,
  Waves,
  Flame,
  TreePine,
  Users,
  Beer,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  pool: Waves,
  kitchen: ChefHat,
  bbq: Flame,
  garden: TreePine,
  common_area: Users,
  bar: Beer,
  ac: Wind,
  lockers: Lock,
  luggage: Luggage,
  tours: MapPin,
  pets: Dog,
}

export function Amenities() {
  const { t } = useI18n()

  const amenities = t.amenities.items

  return (
    <section id="amenities" className="py-12 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.amenities.sectionTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.amenities.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.amenities.subtitle}
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => {
            const IconComponent = amenityIcons[amenity.icon] || Wifi
            return (
              <div
                key={index}
                className="group bg-white rounded-md p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-md bg-[#0A4843]/10 group-hover:bg-[#0A4843] flex items-center justify-center mb-4 transition-colors">
                  <IconComponent className="h-7 w-7 text-[#0A4843] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#0A4843] text-lg mb-2">
                  {amenity.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {amenity.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
