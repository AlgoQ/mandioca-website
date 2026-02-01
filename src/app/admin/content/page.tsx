'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  FileText,
  Save,
  Loader2,
  Check,
  Globe,
} from 'lucide-react'
import { TranslateButton } from '@/components/admin/TranslateButton'

export default function ContentPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState('hero')
  const [lang, setLang] = useState<'en' | 'es'>('en')

  // Content sections from translations
  const contentSections = [
    { id: 'hero', name: t.admin.content.sections.hero, fields: ['hostelName', 'shortDescription', 'ratingText'] },
    { id: 'about', name: t.admin.content.sections.about, fields: ['sectionTitle', 'title', 'description'] },
    { id: 'contact', name: t.admin.content.sections.contact, fields: ['phone', 'email', 'address', 'receptionHours'] },
  ]

  // Mock content state
  const [content, setContent] = useState({
    hero: {
      en: { hostelName: 'Mandioca Hostel', shortDescription: 'Your home in the heart of Asunción, Paraguay', ratingText: 'Average Rating' },
      es: { hostelName: 'Mandioca Hostel', shortDescription: 'Tu hogar en el corazón de Asunción, Paraguay', ratingText: 'Calificación Promedio' },
    },
    about: {
      en: { sectionTitle: 'About Our Hostel', title: "Your Home in Asunción's Heart", description: 'Welcome to Mandioca Hostel...' },
      es: { sectionTitle: 'Sobre Nosotros', title: 'Tu Hogar en el Corazón de Asunción', description: '¡Bienvenido a Mandioca Hostel...' },
    },
    contact: {
      en: { phone: '+54 9 3704 95-1772', email: 'info@mandiocahostel.com', address: 'Av. Colón 1090, Asunción, Paraguay', receptionHours: '24/7' },
      es: { phone: '+54 9 3704 95-1772', email: 'info@mandiocahostel.com', address: 'Av. Colón 1090, Asunción, Paraguay', receptionHours: '24/7' },
    },
  })

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login')
        } else {
          setAuthenticated(true)
        }
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = (section: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [lang]: {
          ...prev[section as keyof typeof prev][lang],
          [field]: value,
        },
      },
    }))
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A4843]" />
      </div>
    )
  }

  const currentSection = contentSections.find(s => s.id === activeTab)
  const currentContent = content[activeTab as keyof typeof content]?.[lang] || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t.admin.content.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.content.subtitle}
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#0A4843] hover:bg-[#0d5c55]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.admin.common.saving}
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t.admin.common.saved}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t.admin.common.save}
                </>
              )}
            </Button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-[#0A4843] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lang === 'es'
                    ? 'bg-[#0A4843] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {contentSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === section.id
                    ? 'bg-[#0A4843] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Content Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                <FileText className="w-5 h-5 text-[#0A4843]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSection?.name}
              </h2>
            </div>

            <div className="space-y-6">
              {currentSection?.fields.map((field) => {
                const otherLang = lang === 'en' ? 'es' : 'en'
                const otherContent = content[activeTab as keyof typeof content]?.[otherLang] || {}
                const sourceText = otherContent[field as keyof typeof otherContent] || ''

                return (
                  <div key={field}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field} className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <TranslateButton
                        text={sourceText}
                        from={otherLang}
                        to={lang}
                        onTranslate={(translated) => updateField(activeTab, field, translated)}
                        size="sm"
                      />
                    </div>
                    {field === 'description' ? (
                      <textarea
                        id={field}
                        value={currentContent[field as keyof typeof currentContent] || ''}
                        onChange={(e) => updateField(activeTab, field, e.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                      />
                    ) : (
                      <Input
                        id={field}
                        value={currentContent[field as keyof typeof currentContent] || ''}
                        onChange={(e) => updateField(activeTab, field, e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
