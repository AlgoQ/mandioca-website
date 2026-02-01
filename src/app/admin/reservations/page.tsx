'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import {
  CalendarDays,
  List,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  Bed,
} from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { es, en: enUS }

function getLocalizer(locale: string) {
  return dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  })
}

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in: string
  check_out: string
  guest_count: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
  created_at: string
  rooms?: {
    id: string
    name: string
    room_type: string
    price_per_night: number
  }
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Booking
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

const paymentStatusColors = {
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  refunded: 'text-gray-600',
}

export default function ReservationsPage() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updating, setUpdating] = useState(false)

  const localizer = useMemo(() => getLocalizer(locale), [locale])
  const dateLocale = locale === 'es' ? es : enUS

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login')
        } else {
          setAuthenticated(true)
          fetchBookings()
        }
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        await fetchBookings()
        setSelectedBooking(prev => prev ? { ...prev, status: status as Booking['status'] } : null)
      }
    } catch (error) {
      console.error('Error updating booking:', error)
    } finally {
      setUpdating(false)
    }
  }

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter(b => statusFilter === 'all' || b.status === statusFilter)
      .map(booking => ({
        id: booking.id,
        title: `${booking.guest_name} - ${booking.rooms?.name || 'Room'}`,
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        resource: booking,
      }))
  }, [bookings, statusFilter])

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => statusFilter === 'all' || b.status === statusFilter)
  }, [bookings, statusFilter])

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status
    const colors = {
      pending: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' },
      confirmed: { backgroundColor: '#D1FAE5', borderColor: '#10B981', color: '#065F46' },
      cancelled: { backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#991B1B' },
    }
    return {
      style: {
        ...colors[status],
        borderLeft: `4px solid ${colors[status].borderColor}`,
        borderRadius: '4px',
      },
    }
  }

  if (authenticated === null || loading) {
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t.admin.reservations.title}</h1>
              <p className="text-gray-500 mt-1">{t.admin.reservations.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
              >
                <option value="all">{t.admin.reservations.filters.allStatuses}</option>
                <option value="pending">{t.admin.reservations.filters.pending}</option>
                <option value="confirmed">{t.admin.reservations.filters.confirmed}</option>
                <option value="cancelled">{t.admin.reservations.filters.cancelled}</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setView('calendar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === 'calendar' ? 'bg-[#0A4843] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === 'list' ? 'bg-[#0A4843] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reservations.stats.totalReservations}</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reservations.stats.pending}</p>
              <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reservations.stats.confirmed}</p>
              <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reservations.stats.revenue}</p>
              <p className="text-2xl font-bold text-[#0A4843]">
                ${bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_price, 0)}
              </p>
            </div>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">
                  {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
                </h2>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div style={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  view={Views.MONTH}
                  onView={() => {}}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(event) => setSelectedBooking(event.resource)}
                  messages={{
                    today: t.admin.reservations.calendar.today,
                    previous: t.admin.reservations.calendar.previous,
                    next: t.admin.reservations.calendar.next,
                    month: t.admin.reservations.calendar.month,
                    week: t.admin.reservations.calendar.week,
                    day: t.admin.reservations.calendar.day,
                    noEventsInRange: t.admin.reservations.calendar.noEvents,
                  }}
                  popup
                />
              </div>
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.guest}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.room}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.checkIn}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.checkOut}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.total}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.status}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">{t.admin.reservations.table.payment}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500">
                          {t.admin.reservations.table.noReservations}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{booking.guest_name}</p>
                              <p className="text-sm text-gray-500">{booking.guest_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {booking.rooms?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {format(new Date(booking.check_in), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {format(new Date(booking.check_out), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ${booking.total_price}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[booking.status]}`}>
                              {t.admin.reservations.status[booking.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${paymentStatusColors[booking.payment_status]}`}>
                              {t.admin.reservations.paymentStatus[booking.payment_status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-[#0A4843] hover:underline text-sm font-medium"
                            >
                              {t.admin.common.view}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{t.admin.reservations.modal.title}</h2>
                  <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Guest Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{selectedBooking.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${selectedBooking.guest_email}`} className="text-[#0A4843] hover:underline">
                        {selectedBooking.guest_email}
                      </a>
                    </div>
                    {selectedBooking.guest_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${selectedBooking.guest_phone}`} className="text-[#0A4843] hover:underline">
                          {selectedBooking.guest_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Bed className="w-5 h-5 text-gray-400" />
                      <span>{selectedBooking.rooms?.name || t.admin.reservations.modal.room}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-gray-400" />
                      <span>
                        {format(new Date(selectedBooking.check_in), 'dd/MM/yyyy')} -{' '}
                        {format(new Date(selectedBooking.check_out), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{selectedBooking.guest_count} {t.admin.reservations.modal.guests}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-lg">${selectedBooking.total_price}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.admin.reservations.modal.bookingStatus}</p>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[selectedBooking.status]}`}>
                        {t.admin.reservations.status[selectedBooking.status]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.admin.reservations.modal.paymentStatus}</p>
                      <span className={`text-sm font-medium ${paymentStatusColors[selectedBooking.payment_status]}`}>
                        {t.admin.reservations.paymentStatus[selectedBooking.payment_status]}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                          disabled={updating}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          {t.admin.reservations.modal.confirmBtn}
                        </Button>
                        <Button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                          disabled={updating}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                          {t.admin.reservations.modal.cancelBtn}
                        </Button>
                      </>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <Button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                        disabled={updating}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                        {t.admin.reservations.modal.cancelReservation}
                      </Button>
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <Button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                        disabled={updating}
                        variant="outline"
                        className="w-full"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                        {t.admin.reservations.modal.reopenReservation}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
