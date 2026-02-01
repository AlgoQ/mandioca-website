import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import AdminNav from './components/AdminNav'
import { AdminI18nWrapper } from './components/AdminI18nWrapper'

export const metadata = {
  title: 'Admin - Mandioca Hostel',
  description: 'Admin dashboard for Mandioca Hostel',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're on the login page
  // We can't use usePathname in server components, so we check if children is login
  // The login page will handle its own layout

  return <AdminI18nWrapper>{children}</AdminI18nWrapper>
}

// Wrapper component for protected pages
export async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await verifySession()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
