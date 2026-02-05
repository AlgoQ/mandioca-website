'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  Settings,
  Save,
  Loader2,
  Check,
  Database,
  Key,
  Globe,
  Mail,
  AlertTriangle,
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  // Settings state
  const [settings, setSettings] = useState({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    siteUrl: 'https://mandiocahostel.com',
    adminEmail: 'info@mandiocahostel.com',
    defaultLanguage: 'es',
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
                {t.admin.settings.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.settings.subtitle}
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

          <div className="space-y-6">
            {/* Database Connection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                  <Database className="w-5 h-5 text-[#0A4843]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.database.title}</h2>
                  <p className="text-sm text-gray-500">{t.admin.settings.database.subtitle}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">{t.admin.settings.database.supabaseUrl}</Label>
                  <Input
                    id="supabaseUrl"
                    value={settings.supabaseUrl}
                    onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                    placeholder="https://xxx.supabase.co"
                    className="mt-1"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>{t.admin.settings.database.apiKeysNote}</strong> {t.admin.settings.database.apiKeysInstructions} <code className="bg-yellow-100 px-1 rounded">{t.admin.settings.database.envFile}</code>{t.admin.settings.database.fileDirectly}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                  <Globe className="w-5 h-5 text-[#0A4843]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.site.title}</h2>
                  <p className="text-sm text-gray-500">{t.admin.settings.site.subtitle}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteUrl">{t.admin.settings.site.siteUrl}</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultLanguage">{t.admin.settings.site.defaultLanguage}</Label>
                  <select
                    id="defaultLanguage"
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                  >
                    <option value="en">{t.admin.settings.site.english}</option>
                    <option value="es">{t.admin.settings.site.spanish}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                  <Mail className="w-5 h-5 text-[#0A4843]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.email.title}</h2>
                  <p className="text-sm text-gray-500">{t.admin.settings.email.subtitle}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail">{t.admin.settings.email.adminEmail}</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                  <Key className="w-5 h-5 text-[#0A4843]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.admin.settings.security.title}</h2>
                  <p className="text-sm text-gray-500">{t.admin.settings.security.subtitle}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    {t.admin.settings.security.credentialsNote} <code className="bg-gray-200 px-1 rounded">{t.admin.settings.security.passwordEnvVar}</code> {t.admin.settings.security.valueInEnv} <code className="bg-gray-200 px-1 rounded">.env</code>.
                  </p>
                </div>
                <div>
                  <Label>{t.admin.settings.security.currentAdmin}</Label>
                  <Input
                    value="(set via ADMIN_USERNAME env var)"
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
