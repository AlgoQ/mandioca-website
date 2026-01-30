'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const heroImages = [
  {
    src: '/assets/images/mandioca-main-1.webp',
    alt: 'Mandioca Hostel Asunción',
  },
  {
    src: '/assets/images/mandioca-main-2.webp',
    alt: 'Mandioca Hostel pool and garden',
  },
  {
    src: '/assets/images/mandioca-main-3.webp',
    alt: 'Mandioca Hostel common area',
  },
  {
    src: '/assets/images/mandioca-main-4.webp',
    alt: 'Mandioca Hostel facilities',
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useI18n()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[85vh] sm:h-[90vh] min-h-[450px] sm:min-h-[600px] mt-[76px] sm:mt-[104px] overflow-hidden">
      {/* Image Carousel */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A4843]/30 via-[#0A4843]/20 to-[#0A4843]/70" />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-[#F7B03D] w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-full sm:max-w-3xl text-white">
            {/* Rating Badge */}
            <Badge className="bg-[#F7B03D] text-gray-900 mb-4 sm:mb-6 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#F7B03D]">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-current" />
              {t.hero.rating} {t.hero.ratingText}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight break-words">
              {t.hero.hostelName}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
              {t.hero.shortDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-[#F7B03D] hover:bg-[#e9a235] text-gray-900 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                asChild
              >
                <a href="#booking">{t.hero.bookNow}</a>
              </Button>
              <Button
                size="lg"
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                asChild
              >
                <a href="#rooms">{t.hero.viewRooms}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
