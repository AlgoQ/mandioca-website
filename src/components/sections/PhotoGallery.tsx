'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

const galleryImages = [
  {
    src: '/assets/images/mandioca-main-1.webp',
    alt: 'Mandioca Hostel exterior',
  },
  {
    src: '/assets/images/mandioca-main-2.webp',
    alt: 'Mandioca Hostel pool',
  },
  {
    src: '/assets/images/mandioca-main-3.webp',
    alt: 'Mandioca Hostel common area',
  },
  {
    src: '/assets/images/mandioca-main-4.webp',
    alt: 'Mandioca Hostel facilities',
  },
  {
    src: '/assets/images/mandioca-main-5.webp',
    alt: 'Mandioca Hostel garden',
  },
  {
    src: '/assets/images/mandioca-main-6.webp',
    alt: 'Mandioca Hostel outdoor',
  },
  {
    src: '/assets/images/mandioca-main-7.webp',
    alt: 'Mandioca Hostel interior',
  },
  {
    src: '/assets/images/mandioca-main-8.webp',
    alt: 'Mandioca Hostel view',
  },
  {
    src: '/assets/images/mandioca-living-1.webp',
    alt: 'Mandioca Hostel living area',
  },
  {
    src: '/assets/images/mandioca-living-2.webp',
    alt: 'Mandioca Hostel lounge',
  },
  {
    src: '/assets/images/mandioca-dorm-1.webp',
    alt: 'Mandioca Hostel dorm room',
  },
  {
    src: '/assets/images/mandioca-dorm-2.webp',
    alt: 'Mandioca Hostel beds',
  },
  {
    src: '/assets/images/mandioca-private-1.webp',
    alt: 'Mandioca Hostel private room',
  },
  {
    src: '/assets/images/mandioca-bathroom-2.webp',
    alt: 'Mandioca Hostel bathroom',
  },
  {
    src: '/assets/images/mandioca-cats-1.webp',
    alt: 'Mandioca Hostel cats',
  },
]

// Images to show in the initial grid (2 rows x 4 columns = 8 images)
const INITIAL_VISIBLE = 8

export function PhotoGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const { t } = useI18n()

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length)
  }, [])

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }, [])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, nextLightbox, prevLightbox])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  const visibleImages = galleryImages.slice(0, INITIAL_VISIBLE)

  return (
    <section id="gallery" className="py-12 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.about.sectionTitle || 'Explore'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.gallery?.title || 'Photo Gallery'}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.gallery?.subtitle || 'Take a tour of our beautiful hostel and facilities'}
          </p>
        </div>

        {/* Gallery Grid - 2 rows x 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">{t.gallery?.viewPhoto || 'View Photo'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {galleryImages.length > INITIAL_VISIBLE && (
          <div className="text-center mt-8">
            <Button
              onClick={() => openLightbox(0)}
              className="bg-[#0A4843] hover:bg-[#0A4843]/90 text-white font-semibold px-8"
              size="lg"
            >
              {t.gallery?.showMore || 'Show More'} (+{galleryImages.length - INITIAL_VISIBLE})
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox Popup */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 md:right-[270px] lg:right-[310px] z-20 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
            {/* Navigation - Previous */}
            <button
              onClick={prevLightbox}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full max-w-4xl h-[60vh] md:h-[80vh]">
              <Image
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation - Next */}
            <button
              onClick={nextLightbox}
              className="absolute right-4 md:right-[300px] lg:right-[340px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail Sidebar */}
          <div
            className="hidden md:flex w-[260px] lg:w-[300px] bg-black/50 flex-col p-4 overflow-hidden flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-sm font-medium mb-4">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>

            {/* Scrollable Thumbnails */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`relative w-full aspect-[4/3] rounded-md overflow-hidden transition-all cursor-pointer ${
                    index === lightboxIndex
                      ? 'ring-2 ring-[#F7B03D] opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Counter */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </section>
  )
}
