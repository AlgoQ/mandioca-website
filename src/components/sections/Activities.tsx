'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Waves, MapPin, Clock, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const activityImages = [
  '/assets/images/activities/asuncion-palace.jpg',
  '/assets/images/activities/costanera.jpg',
  '/assets/images/activities/historic-center.jpg',
]

const activityIcons = [Building2, Waves, MapPin]
const detailIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  users: Users,
  location: MapPin,
}

export function Activities() {
  const { t } = useI18n()
  const activities = t.activities.items

  return (
    <section id="activities" className="py-12 sm:py-20 bg-[#0A4843] overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 px-2">
          <span className="text-[#F7B03D] font-semibold text-xs sm:text-sm uppercase tracking-wider">
            {t.activities.sectionTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2 mb-3 sm:mb-4">
            {t.activities.title}
          </h2>
          <p className="text-white/80 text-base sm:text-lg">
            {t.activities.subtitle}
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activities.map((activity, index) => {
            const IconComponent = activityIcons[index] || MapPin
            return (
              <Card
                key={index}
                className="overflow-hidden group bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={activityImages[index]}
                    alt={activity.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A4843]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#F7B03D] flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-gray-900" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                        <p className="text-[#F7B03D] text-sm font-medium">{activity.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <p className="text-white/80 leading-relaxed">
                    {activity.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    {activity.details.map((detail, idx) => {
                      const DetailIcon = detailIcons[detail.icon] || Clock
                      return (
                        <div key={idx} className="flex items-center gap-3 text-white/70 text-sm">
                          <DetailIcon className="h-4 w-4 text-[#F7B03D]" />
                          <span>{detail.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-white/70 mb-4">
            {t.activities.ctaText}
          </p>
          <Button
            size="lg"
            className="bg-[#F7B03D] hover:bg-[#e9a235] text-gray-900 font-semibold"
            asChild
          >
            <a href="#booking">{t.activities.ctaButton}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
