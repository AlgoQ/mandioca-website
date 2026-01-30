'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Bed, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const roomImages = [
  '/assets/images/mandioca-dorm-2.webp',    // 8 Bed Mixed Dorm
  '/assets/images/mandioca-dorm-1.webp',    // 12 Bed Mixed Dorm
  '/assets/images/mandioca-private-1.webp', // Private Room - King Bed
  '/assets/images/mandioca-private-2.webp', // Private Twin Room
]

export function Rooms() {
  const { t } = useI18n()
  const rooms = t.rooms.items

  return (
    <section id="rooms" className="py-12 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.rooms.sectionTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.rooms.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.rooms.subtitle}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {rooms.map((room, index) => (
            <Card
              key={room.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={roomImages[index] || roomImages[0]}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge
                    className={`${
                      room.room_type === 'dorm'
                        ? 'bg-[#0A4843] hover:bg-[#0A4843]'
                        : 'bg-[#F7B03D] text-gray-900 hover:bg-[#F7B03D]'
                    }`}
                  >
                    {room.room_type === 'dorm' ? t.rooms.dorm : t.rooms.private}
                  </Badge>
                  {room.available && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-500">{t.rooms.available}</Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#0A4843] leading-tight">{room.name}</h3>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-[#0A4843]">
                      ${room.price_per_night}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm block">{t.rooms.perNight}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 flex-1 px-4 sm:px-6">
                <p className="text-gray-600 text-sm sm:text-base">{room.description}</p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                    <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{room.bed_count} {room.bed_count === 1 ? t.rooms.bed : t.rooms.beds}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{t.rooms.maxGuests} {room.max_guests}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {room.features?.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full"
                    >
                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#0A4843] flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button
                  className="w-full bg-[#0A4843]/90"
                  asChild
                >
                  <a href="#booking">{t.rooms.bookRoom}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
