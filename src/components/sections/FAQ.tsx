'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function FAQ() {
  const { t } = useI18n()
  const faqs = t.faq.items

  return (
    <section id="faq" className="py-12 sm:pt-16 sm:pb-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.faq.sectionTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.faq.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 rounded-md px-4 sm:px-6 border-none"
              >
                <AccordionTrigger className="text-left text-[#0A4843] font-semibold hover:text-[#0A4843] hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-3">
            {t.faq.stillQuestions}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-[#0A4843] font-semibold hover:text-[#F7B03D] transition-colors underline underline-offset-4 cursor-pointer"
          >
            {t.faq.contactUs} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
