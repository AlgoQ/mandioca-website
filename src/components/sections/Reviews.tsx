'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function Reviews() {
  const { t } = useI18n()
  const reviews = t.reviews.items

  return (
    <section id="reviews" className="py-12 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.reviews.sectionTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.reviews.title}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-[#F7B03D] fill-[#F7B03D]"
                  />
                ))}
              </div>
              <span className="text-3xl font-bold text-[#0A4843]">9.6</span>
            </div>
            <div className="text-left border-l pl-4 border-gray-300">
              <p className="text-gray-600">HostelWorld</p>
              <p className="text-sm text-gray-500">{t.reviews.reviewCount}</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid - 2 rows of 3 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.slice(0, 6).map((review, index) => (
            <Card
              key={`${review.guest_name}-${index}`}
              className="bg-white hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(review.rating / 2)
                            ? 'text-[#F7B03D] fill-[#F7B03D]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-[#0A4843]">
                    {review.rating}
                  </span>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-[#0A4843]/10" />
                  <p className="text-gray-600 leading-relaxed pl-4">
                    {review.comment}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-[#0A4843]">
                      {review.guest_name}
                    </p>
                    <p className="text-sm text-gray-500">{review.country}</p>
                  </div>
                  <p className="text-sm text-gray-400">{review.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
