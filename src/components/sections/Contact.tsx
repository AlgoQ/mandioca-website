'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const { t } = useI18n()

  const contactInfo = [
    {
      icon: Phone,
      label: t.contact.labels.phone,
      value: t.contact.phone,
      href: 'tel:+5493704951772',
    },
    {
      icon: Mail,
      label: t.contact.labels.email,
      value: t.contact.email,
      href: 'mailto:info@mandiocahostel.com',
    },
    {
      icon: MapPin,
      label: t.contact.labels.address,
      value: t.contact.address,
      href: 'https://maps.google.com/?q=Mandioca+Hostel+Asuncion+Paraguay',
    },
    {
      icon: Clock,
      label: t.contact.labels.reception,
      value: t.contact.receptionHours,
      href: null,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSuccess(true)
    setIsSubmitting(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-12 sm:pt-12 sm:pb-8 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            {t.contact.sectionTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A4843] mt-2 mb-4">
            {t.contact.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-stretch">
          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            {contactInfo.map((item, index) => {
              const isAddressCard = item.label === t.contact.labels.address
              return (
                <Card key={index} className="bg-gray-50 border-none flex-1">
                  <CardContent className={`p-6 h-full flex flex-col ${isAddressCard ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-md bg-[#0A4843]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-[#0A4843]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="font-semibold text-[#0A4843] hover:text-[#F7B03D] transition-colors cursor-pointer"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-semibold text-[#0A4843]">{item.value}</p>
                        )}
                      </div>
                    </div>
                    {/* Add Directions link for Address card - bottom right */}
                    {isAddressCard && (
                      <div className="flex justify-end mt-3">
                        <a
                          href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[#F7B03D] hover:text-[#0A4843] transition-colors cursor-pointer font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Directions
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Contact Form */}
          <Card className="border-none shadow-xl h-full">
            <CardContent className="p-8 h-full">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A4843] mb-2">
                    {t.contact.form.success}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t.contact.form.successMessage}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false)
                      setFormData({ name: '', email: '', subject: '', message: '' })
                    }}
                  >
                    {t.contact.form.sendAnother}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col h-full gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">{t.contact.form.name}</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder={t.contact.form.namePlaceholder}
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">{t.contact.form.email}</Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder={t.contact.form.emailPlaceholder}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.contact.form.subject}</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.contact.form.subjectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {t.contact.subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col">
                    <Label htmlFor="message">{t.contact.form.message}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t.contact.form.messagePlaceholder}
                      className="flex-1 min-h-[120px] resize-none"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="privacy" className="text-sm text-gray-600 font-normal">
                      {t.contact.form.acceptTerms}{' '}
                      <a href="/terms" className="text-[#0A4843] underline hover:text-[#F7B03D]">
                        {t.contact.form.termsLink}
                      </a>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#0A4843] hover:bg-[#0A4843]/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.contact.form.sending}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t.contact.form.send}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
