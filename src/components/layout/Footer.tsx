'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// WhatsApp icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export function Footer() {
  const { t } = useI18n()

  const quickLinks = [
    { name: t.footer.links.about, href: '#about' },
    { name: t.footer.links.rooms, href: '#rooms' },
    { name: t.footer.links.contact, href: '#contact' },
    { name: t.footer.links.faq, href: '#faq' },
  ]

  const legalLinks = [
    { name: t.footer.legalLinks.privacy, href: '/privacy' },
    { name: t.footer.legalLinks.terms, href: '/terms' },
    { name: t.footer.legalLinks.cancellation, href: '/cancellation' },
  ]

  return (
    <footer className="bg-[#0A4843] text-white overflow-hidden">
      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="bg-white rounded-md p-3">
                <Image
                  src="/full_logo.jpg"
                  alt="Mandioca Hostel"
                  width={200}
                  height={110}
                  className="h-14 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-white/80 leading-relaxed">
              {t.footer.description}
            </p>
            <div className="space-y-3">
              <a
                href="tel:+5493704951772"
                className="flex items-center gap-3 text-white/80 hover:text-[#F7B03D] transition-colors"
              >
                <Phone className="h-5 w-5" />
                +54 9 3704 95-1772
              </a>
              <a
                href="mailto:info@mandiocahostel.com"
                className="flex items-center gap-3 text-white/80 hover:text-[#F7B03D] transition-colors"
              >
                <Mail className="h-5 w-5" />
                info@mandiocahostel.com
              </a>
              <a
                href="https://maps.google.com/?q=Mandioca+Hostel+Asuncion+Paraguay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-[#F7B03D] transition-colors"
              >
                <MapPin className="h-5 w-5" />
                Av. Colón 1090, Asunción
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-[#F7B03D] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t.footer.legal}</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-[#F7B03D] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t.footer.followUs}</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/hostelmandioca1090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F7B03D] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5493704951772"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F7B03D] transition-colors"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>#1 Rated Hostel in Asunción</span>
            <span className="text-[#F7B03D]">★ 9.6</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
