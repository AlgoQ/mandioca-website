'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from './components/AdminNav'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import {
  FileText,
  Image,
  Video,
  Bed,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  Loader2,
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { t } = useI18n()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

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

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A4843]" />
      </div>
    )
  }

  const quickLinks = [
    {
      href: '/admin/content',
      label: t.admin.dashboard.quickLinks.editContent,
      icon: FileText,
      description: t.admin.dashboard.quickLinks.editContentDesc,
    },
    {
      href: '/admin/rooms',
      label: t.admin.dashboard.quickLinks.roomsPricing,
      icon: Bed,
      description: t.admin.dashboard.quickLinks.roomsPricingDesc,
    },
    {
      href: '/admin/media',
      label: t.admin.dashboard.quickLinks.mediaGallery,
      icon: Image,
      description: t.admin.dashboard.quickLinks.mediaGalleryDesc,
    },
    {
      href: '/admin/videos',
      label: t.admin.dashboard.quickLinks.videos,
      icon: Video,
      description: t.admin.dashboard.quickLinks.videosDesc,
    },
    {
      href: '/admin/reviews',
      label: t.admin.dashboard.quickLinks.reviews,
      icon: MessageSquare,
      description: t.admin.dashboard.quickLinks.reviewsDesc,
    },
    {
      href: '/admin/faq',
      label: t.admin.dashboard.quickLinks.faq,
      icon: HelpCircle,
      description: t.admin.dashboard.quickLinks.faqDesc,
    },
  ]

  const stats = [
    { label: t.admin.dashboard.stats.rooms, value: '4', icon: Bed },
    { label: t.admin.dashboard.stats.rating, value: '9.6', icon: TrendingUp },
    { label: t.admin.dashboard.stats.reviews, value: '150+', icon: MessageSquare },
    { label: t.admin.dashboard.stats.images, value: '17', icon: Image },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {t.admin.dashboard.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {t.admin.dashboard.subtitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#0A4843]/10 rounded-lg">
                      <Icon className="w-5 h-5 text-[#0A4843]" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.admin.dashboard.quickActions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0A4843]/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#0A4843]/10 rounded-lg group-hover:bg-[#0A4843] transition-colors">
                        <Icon className="w-6 h-6 text-[#0A4843] group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#0A4843] transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* View Website Link */}
          <div className="bg-gradient-to-r from-[#0A4843] to-[#0d5c55] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t.admin.dashboard.viewWebsite}</h2>
                <p className="text-white/80 mt-1">
                  {t.admin.dashboard.viewWebsiteDesc}
                </p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A4843] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t.admin.dashboard.openSite}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
