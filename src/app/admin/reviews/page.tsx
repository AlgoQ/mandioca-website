'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  MessageSquare,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import { TranslateButton } from '@/components/admin/TranslateButton'

interface Review {
  id: string
  guestName: string
  rating: number
  comment: string
  country: string
  date: string
  visible: boolean
}

const initialReviews: Review[] = [
  { id: '1', guestName: 'Sarah M.', rating: 10, comment: "I've stayed at enough hostels in my life (minimum 150) and these folks are the sweetest people ever.", country: 'United States', date: 'January 2026', visible: true },
  { id: '2', guestName: 'Marco B.', rating: 10, comment: 'A gem in Asunción with lovely hospitable staff and a welcoming atmosphere.', country: 'Argentina', date: 'December 2025', visible: true },
  { id: '3', guestName: 'Emma L.', rating: 9, comment: 'Amazing hostel in Asuncion! The outdoor area is very relaxing.', country: 'Germany', date: 'November 2025', visible: true },
  { id: '4', guestName: 'Carlos R.', rating: 10, comment: 'Great hostel, the team was really friendly and helpful.', country: 'Brazil', date: 'October 2025', visible: true },
  { id: '5', guestName: 'Julia W.', rating: 10, comment: 'Best hostel in Paraguay! The pool is perfect for the hot days.', country: 'Chile', date: 'October 2025', visible: true },
]

export default function ReviewsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

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

  const toggleVisibility = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, visible: !r.visible } : r))
  }

  const deleteReview = (id: string) => {
    if (confirm(t.admin.reviews.deleteConfirm)) {
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  const addReview = () => {
    const newReview: Review = {
      id: String(Date.now()),
      guestName: t.admin.reviews.newReview.guestName,
      rating: 10,
      comment: t.admin.reviews.newReview.comment,
      country: t.admin.reviews.newReview.country,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      visible: true,
    }
    setReviews([newReview, ...reviews])
    setEditingReview(newReview)
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
                {t.admin.reviews.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.reviews.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={addReview}>
                <Plus className="w-4 h-4 mr-2" />
                {t.admin.reviews.addReview}
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reviews.stats.totalReviews}</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reviews.stats.visible}</p>
              <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.visible).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reviews.stats.hidden}</p>
              <p className="text-2xl font-bold text-gray-400">{reviews.filter(r => !r.visible).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t.admin.reviews.stats.avgRating}</p>
              <p className="text-2xl font-bold text-[#F7B03D]">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  !review.visible ? 'opacity-60' : ''
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block p-2 bg-gray-100 rounded-lg cursor-grab">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                          <span className="text-sm text-gray-500">{review.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#F7B03D] text-[#F7B03D]" />
                          <span className="font-semibold">{review.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{review.date}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleVisibility(review.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              review.visible
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={review.visible ? t.admin.reviews.toggleHide : t.admin.reviews.toggleShow}
                          >
                            {review.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingReview(review)}
                            className="p-2 text-gray-400 hover:text-[#0A4843] hover:bg-gray-100 rounded-lg"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {editingReview && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setEditingReview(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">{t.admin.reviews.modal.title}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guestName">{t.admin.reviews.modal.guestName}</Label>
                      <Input
                        id="guestName"
                        value={editingReview.guestName}
                        onChange={(e) => {
                          const updated = { ...editingReview, guestName: e.target.value }
                          setEditingReview(updated)
                          setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">{t.admin.reviews.modal.country}</Label>
                      <Input
                        id="country"
                        value={editingReview.country}
                        onChange={(e) => {
                          const updated = { ...editingReview, country: e.target.value }
                          setEditingReview(updated)
                          setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rating">{t.admin.reviews.modal.rating}</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="10"
                        value={editingReview.rating}
                        onChange={(e) => {
                          const updated = { ...editingReview, rating: parseInt(e.target.value) || 10 }
                          setEditingReview(updated)
                          setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">{t.admin.reviews.modal.date}</Label>
                      <Input
                        id="date"
                        value={editingReview.date}
                        onChange={(e) => {
                          const updated = { ...editingReview, date: e.target.value }
                          setEditingReview(updated)
                          setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                        }}
                        className="mt-1"
                        placeholder={t.admin.reviews.modal.datePlaceholder}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comment">{t.admin.reviews.modal.comment}</Label>
                      <div className="flex gap-1">
                        <TranslateButton
                          text={editingReview.comment}
                          from="es"
                          to="en"
                          onTranslate={(translated) => {
                            const updated = { ...editingReview, comment: translated }
                            setEditingReview(updated)
                            setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                          }}
                          size="sm"
                        />
                        <TranslateButton
                          text={editingReview.comment}
                          from="en"
                          to="es"
                          onTranslate={(translated) => {
                            const updated = { ...editingReview, comment: translated }
                            setEditingReview(updated)
                            setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                    <textarea
                      id="comment"
                      value={editingReview.comment}
                      onChange={(e) => {
                        const updated = { ...editingReview, comment: e.target.value }
                        setEditingReview(updated)
                        setReviews(reviews.map(r => r.id === editingReview.id ? updated : r))
                      }}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEditingReview(null)}>
                    {t.admin.common.close}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
