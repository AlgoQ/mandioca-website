'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  Settings,
  LogOut,
  Menu,
  X,
  Bed,
  MessageSquare,
  HelpCircle,
  CalendarDays,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

// UK Flag icon
function UKFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" fill="none">
      <clipPath id="uk-clip-admin">
        <rect width="60" height="30"/>
      </clipPath>
      <g clipPath="url(#uk-clip-admin)">
        <rect width="60" height="30" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-center)"/>
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  )
}

// Spain Flag icon
function SpainFlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" fill="none">
      <rect width="60" height="40" fill="#AA151B"/>
      <rect y="10" width="60" height="20" fill="#F1BF00"/>
    </svg>
  )
}

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { locale, setLocale, t } = useI18n()

  const navItems = [
    { href: '/admin', label: t.admin.nav.home, icon: LayoutDashboard },
    { href: '/admin/reservations', label: t.admin.nav.reservations, icon: CalendarDays },
    { href: '/admin/content', label: t.admin.nav.content, icon: FileText },
    { href: '/admin/rooms', label: t.admin.nav.rooms, icon: Bed },
    { href: '/admin/media', label: t.admin.nav.gallery, icon: Image },
    { href: '/admin/videos', label: t.admin.nav.videos, icon: Video },
    { href: '/admin/reviews', label: t.admin.nav.reviews, icon: MessageSquare },
    { href: '/admin/faq', label: t.admin.nav.faq, icon: HelpCircle },
    { href: '/admin/settings', label: t.admin.nav.settings, icon: Settings },
  ]

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-[#0A4843] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-[#0A4843] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Mandioca</h1>
              <p className="text-xs text-gray-500">{t.admin.nav.adminPanel}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>

          {/* Language Switcher & Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    {locale === 'en' ? (
                      <>
                        <UKFlagIcon className="h-4 w-6 rounded-sm" />
                        <span>English</span>
                      </>
                    ) : (
                      <>
                        <SpainFlagIcon className="h-4 w-6 rounded-sm" />
                        <span>Espanol</span>
                      </>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => setLocale('en')}
                  className={`flex items-center gap-2 cursor-pointer ${locale === 'en' ? 'bg-gray-100' : ''}`}
                >
                  <UKFlagIcon className="h-4 w-6 rounded-sm" />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocale('es')}
                  className={`flex items-center gap-2 cursor-pointer ${locale === 'es' ? 'bg-gray-100' : ''}`}
                >
                  <SpainFlagIcon className="h-4 w-6 rounded-sm" />
                  <span>Espanol</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {loggingOut ? t.admin.nav.loggingOut : t.admin.nav.logout}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0A4843] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-bold text-gray-900">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-[#0A4843] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Mandioca</h1>
              <p className="text-xs text-gray-500">{t.admin.nav.adminPanel}</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavLinks />
          </nav>

          {/* Language Switcher & Logout - Mobile */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Language Switcher - Mobile */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500 px-3">{t.admin.nav.language}</span>
              <button
                onClick={() => {
                  setLocale('en')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md w-full transition-colors cursor-pointer ${
                  locale === 'en' ? 'bg-[#0A4843] text-white' : 'bg-[#0A4843]/5 text-[#0A4843] hover:bg-[#0A4843]/10'
                }`}
              >
                <UKFlagIcon className="h-5 w-7 rounded-sm" />
                <span className="font-medium">English</span>
              </button>
              <button
                onClick={() => {
                  setLocale('es')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md w-full transition-colors cursor-pointer ${
                  locale === 'es' ? 'bg-[#0A4843] text-white' : 'bg-[#0A4843]/5 text-[#0A4843] hover:bg-[#0A4843]/10'
                }`}
              >
                <SpainFlagIcon className="h-5 w-7 rounded-sm" />
                <span className="font-medium">Espanol</span>
              </button>
            </div>

            {/* Logout - Mobile */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {loggingOut ? t.admin.nav.loggingOut : t.admin.nav.logout}
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14" />
    </>
  )
}
