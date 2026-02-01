'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  HelpCircle,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  GripVertical,
} from 'lucide-react'
import { TranslateButton } from '@/components/admin/TranslateButton'

interface FAQItem {
  id: string
  questionEn: string
  questionEs: string
  answerEn: string
  answerEs: string
  visible: boolean
}

const initialFAQs: FAQItem[] = [
  {
    id: '1',
    questionEn: 'What time is check-in and check-out?',
    questionEs: '¿Cuál es el horario de check-in y check-out?',
    answerEn: 'Check-in is from 11:00 AM and check-out is by 12:00 PM. We offer free luggage storage if you arrive early or leave late.',
    answerEs: 'El check-in es desde las 11:00 y el check-out es hasta las 12:00. Ofrecemos guardaequipaje gratis si llegas temprano o te vas tarde.',
    visible: true,
  },
  {
    id: '2',
    questionEn: 'How do I get to the hostel from the airport?',
    questionEs: '¿Cómo llego al hostel desde el aeropuerto?',
    answerEn: 'Silvio Pettirossi International Airport is about 15km from the hostel. Use Uber/Bolt for around $10-15.',
    answerEs: 'El Aeropuerto Internacional Silvio Pettirossi está a unos 15km del hostel. Usa Uber/Bolt por unos $10-15.',
    visible: true,
  },
  {
    id: '3',
    questionEn: 'Are pets allowed?',
    questionEs: '¿Se permiten mascotas?',
    answerEn: 'Yes! We are pet-friendly and pets stay for free.',
    answerEs: '¡Sí! Somos pet-friendly y las mascotas se quedan gratis.',
    visible: true,
  },
]

export default function FAQPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [lang, setLang] = useState<'en' | 'es'>('en')

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

  const addFAQ = () => {
    const newFAQ: FAQItem = {
      id: String(Date.now()),
      questionEn: 'New Question',
      questionEs: 'Nueva Pregunta',
      answerEn: 'Answer here...',
      answerEs: 'Respuesta aquí...',
      visible: true,
    }
    setFaqs([...faqs, newFAQ])
    setExpandedId(newFAQ.id)
  }

  const deleteFAQ = (id: string) => {
    if (confirm(t.admin.faq.deleteConfirm)) {
      setFaqs(faqs.filter(f => f.id !== id))
    }
  }

  const updateFAQ = (id: string, updates: Partial<FAQItem>) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A4843]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t.admin.faq.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.faq.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={addFAQ}>
                <Plus className="w-4 h-4 mr-2" />
                {t.admin.faq.addFaq}
              </Button>
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

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  !faq.visible ? 'opacity-60' : ''
                }`}
              >
                {/* Header */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="p-2 bg-gray-100 rounded-lg cursor-grab">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                      <h3 className="font-medium text-gray-900">
                        {lang === 'en' ? faq.questionEn : faq.questionEs}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateFAQ(faq.id, { visible: !faq.visible })
                      }}
                      className={`px-3 py-1 text-xs rounded-full ${
                        faq.visible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {faq.visible ? t.admin.common.visible : t.admin.common.hidden}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFAQ(faq.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === faq.id && (
                  <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                    <div className="space-y-4 pt-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>{t.admin.faq.questionLang} ({lang === 'en' ? 'English' : 'Español'})</Label>
                          <TranslateButton
                            text={lang === 'en' ? faq.questionEs : faq.questionEn}
                            from={lang === 'en' ? 'es' : 'en'}
                            to={lang}
                            onTranslate={(translated) => updateFAQ(faq.id, lang === 'en' ? { questionEn: translated } : { questionEs: translated })}
                            size="sm"
                          />
                        </div>
                        <Input
                          value={lang === 'en' ? faq.questionEn : faq.questionEs}
                          onChange={(e) => updateFAQ(faq.id, lang === 'en' ? { questionEn: e.target.value } : { questionEs: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>{t.admin.faq.answerLang} ({lang === 'en' ? 'English' : 'Español'})</Label>
                          <TranslateButton
                            text={lang === 'en' ? faq.answerEs : faq.answerEn}
                            from={lang === 'en' ? 'es' : 'en'}
                            to={lang}
                            onTranslate={(translated) => updateFAQ(faq.id, lang === 'en' ? { answerEn: translated } : { answerEs: translated })}
                            size="sm"
                          />
                        </div>
                        <textarea
                          value={lang === 'en' ? faq.answerEn : faq.answerEs}
                          onChange={(e) => updateFAQ(faq.id, lang === 'en' ? { answerEn: e.target.value } : { answerEs: e.target.value })}
                          rows={4}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
