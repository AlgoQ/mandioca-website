'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  Bed,
  DollarSign,
  Users,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { TranslateButton } from '@/components/admin/TranslateButton'

// Room type from dictionaries for now (will migrate to Supabase)
interface Room {
  id: string
  name: string
  description: string
  bed_count: number
  room_type: 'dorm' | 'private'
  price_per_night: number
  max_guests: number
  available: boolean
  features: string[]
}

// Initial data from dictionaries
const initialRooms: Room[] = [
  {
    id: '1',
    name: '8 Bed Mixed Dorm',
    description: 'Perfect for solo travelers looking to meet new people. Features extra-wide twin beds with comfortable mattresses, air conditioning, and personal lockers.',
    bed_count: 8,
    room_type: 'dorm',
    price_per_night: 12,
    max_guests: 1,
    available: true,
    features: ['Extra-wide beds', 'Air conditioning', 'Personal lockers', 'Shared bathroom'],
  },
  {
    id: '2',
    name: '12 Bed Mixed Dorm',
    description: 'Our most social room type. Enjoy meeting travelers from around the world in our spacious dorm with comfortable beds and air conditioning.',
    bed_count: 12,
    room_type: 'dorm',
    price_per_night: 10,
    max_guests: 1,
    available: true,
    features: ['Extra-wide beds', 'Air conditioning', 'Personal lockers', 'Great value'],
  },
  {
    id: '3',
    name: 'Private Room - King Bed',
    description: 'Ideal for couples or those seeking privacy. Spacious and clean private room with a king-size bed, private bathroom with bidet, and air conditioning.',
    bed_count: 1,
    room_type: 'private',
    price_per_night: 30,
    max_guests: 2,
    available: true,
    features: ['King bed', 'Private bathroom', 'Air conditioning', 'Work desk'],
  },
  {
    id: '4',
    name: 'Private Twin Room',
    description: 'Perfect for friends traveling together. Features two single beds, private bathroom, air conditioning, and all the comfort you need.',
    bed_count: 2,
    room_type: 'private',
    price_per_night: 35,
    max_guests: 2,
    available: true,
    features: ['Twin beds', 'Private bathroom', 'Air conditioning', 'Wardrobe'],
  },
]

export default function RoomsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  // Check authentication
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

    // TODO: Save to Supabase when connected
    // For now, just simulate a save
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map(room =>
      room.id === id ? { ...room, ...updates } : room
    ))
  }

  const updateFeature = (roomId: string, index: number, value: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newFeatures = [...room.features]
        newFeatures[index] = value
        return { ...room, features: newFeatures }
      }
      return room
    }))
  }

  const addFeature = (roomId: string) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, features: [...room.features, 'New feature'] }
      }
      return room
    }))
  }

  const removeFeature = (roomId: string, index: number) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newFeatures = room.features.filter((_, i) => i !== index)
        return { ...room, features: newFeatures }
      }
      return room
    }))
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
                {t.admin.rooms.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.rooms.subtitle}
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

          {/* Rooms Grid */}
          <div className="space-y-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Room Header */}
                <div className="bg-gradient-to-r from-[#0A4843] to-[#0d5c55] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Bed className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <span className="text-sm text-white/70 capitalize">
                          {room.room_type === 'dorm' ? t.admin.rooms.fields.dorm : t.admin.rooms.fields.private}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">${room.price_per_night}</div>
                        <div className="text-sm text-white/70">{t.admin.rooms.fields.perNight}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Form */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`name-${room.id}`}>{t.admin.rooms.fields.name}</Label>
                      <Input
                        id={`name-${room.id}`}
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price-${room.id}`}>{t.admin.rooms.fields.pricePerNight}</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id={`price-${room.id}`}
                          type="number"
                          min="0"
                          step="1"
                          value={room.price_per_night}
                          onChange={(e) => updateRoom(room.id, { price_per_night: parseInt(e.target.value) || 0 })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`beds-${room.id}`}>{t.admin.rooms.fields.bedCount}</Label>
                      <div className="relative mt-1">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id={`beds-${room.id}`}
                          type="number"
                          min="1"
                          value={room.bed_count}
                          onChange={(e) => updateRoom(room.id, { bed_count: parseInt(e.target.value) || 1 })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`guests-${room.id}`}>{t.admin.rooms.fields.maxGuests}</Label>
                      <div className="relative mt-1">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id={`guests-${room.id}`}
                          type="number"
                          min="1"
                          value={room.max_guests}
                          onChange={(e) => updateRoom(room.id, { max_guests: parseInt(e.target.value) || 1 })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`desc-${room.id}`}>{t.admin.rooms.fields.description}</Label>
                      <div className="flex gap-1">
                        <TranslateButton
                          text={room.description}
                          from="es"
                          to="en"
                          onTranslate={(translated) => updateRoom(room.id, { description: translated })}
                          size="sm"
                        />
                        <TranslateButton
                          text={room.description}
                          from="en"
                          to="es"
                          onTranslate={(translated) => updateRoom(room.id, { description: translated })}
                          size="sm"
                        />
                      </div>
                    </div>
                    <textarea
                      id={`desc-${room.id}`}
                      value={room.description}
                      onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843] focus:border-transparent"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{t.admin.rooms.fields.features}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addFeature(room.id)}
                        className="text-[#0A4843] hover:text-[#0d5c55]"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t.admin.rooms.fields.addFeature}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {room.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                          <Input
                            value={feature}
                            onChange={(e) => updateFeature(room.id, index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(room.id, index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Type & Availability */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.available}
                        onChange={(e) => updateRoom(room.id, { available: e.target.checked })}
                        className="w-4 h-4 text-[#0A4843] rounded focus:ring-[#0A4843]"
                      />
                      <span className="text-sm text-gray-600">{t.admin.rooms.fields.availableForBooking}</span>
                    </label>
                    <select
                      value={room.room_type}
                      onChange={(e) => updateRoom(room.id, { room_type: e.target.value as 'dorm' | 'private' })}
                      className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                    >
                      <option value="dorm">{t.admin.rooms.fields.dorm}</option>
                      <option value="private">{t.admin.rooms.fields.private}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Room Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-dashed border-2 py-8 text-gray-500 hover:text-[#0A4843] hover:border-[#0A4843]"
              onClick={() => {
                const newRoom: Room = {
                  id: String(Date.now()),
                  name: t.admin.rooms.newRoom.name,
                  description: t.admin.rooms.newRoom.description,
                  bed_count: 1,
                  room_type: 'private',
                  price_per_night: 25,
                  max_guests: 2,
                  available: true,
                  features: [],
                }
                setRooms([...rooms, newRoom])
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.admin.rooms.addRoom}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
