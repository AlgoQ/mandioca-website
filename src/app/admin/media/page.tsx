'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  GripVertical,
  Check,
  X,
  Save,
  Maximize2,
  Info,
} from 'lucide-react'

interface MediaImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
  fileSize: number
  displayOrder: number
  category: 'gallery' | 'hero' | 'room'
}

// Initial images from public folder
const initialImages: MediaImage[] = [
  { id: '1', src: '/assets/images/mandioca-0001.webp', alt: 'Mandioca Main 1', width: 1200, height: 800, fileSize: 115654, displayOrder: 1, category: 'gallery' },
  { id: '2', src: '/assets/images/mandioca-0002.webp', alt: 'Mandioca Main 2', width: 1200, height: 800, fileSize: 126092, displayOrder: 2, category: 'gallery' },
  { id: '3', src: '/assets/images/mandioca-0003.webp', alt: 'Mandioca Main 3', width: 1200, height: 800, fileSize: 125164, displayOrder: 3, category: 'gallery' },
  { id: '4', src: '/assets/images/mandioca-0004.webp', alt: 'Mandioca Main 4', width: 1200, height: 800, fileSize: 396218, displayOrder: 4, category: 'gallery' },
  { id: '5', src: '/assets/images/mandioca-0005.webp', alt: 'Mandioca Main 5', width: 1200, height: 800, fileSize: 114840, displayOrder: 5, category: 'gallery' },
  { id: '6', src: '/assets/images/mandioca-0006.webp', alt: 'Mandioca Main 6', width: 1200, height: 800, fileSize: 59142, displayOrder: 6, category: 'gallery' },
  { id: '7', src: '/assets/images/mandioca-0007.webp', alt: 'Mandioca Main 7', width: 1200, height: 800, fileSize: 132938, displayOrder: 7, category: 'gallery' },
  { id: '8', src: '/assets/images/mandioca-0008.webp', alt: 'Mandioca Main 8', width: 1200, height: 800, fileSize: 296268, displayOrder: 8, category: 'gallery' },
  { id: '9', src: '/assets/images/mandioca-0009.webp', alt: 'Living Area 1', width: 1200, height: 800, fileSize: 286786, displayOrder: 9, category: 'gallery' },
  { id: '10', src: '/assets/images/mandioca-0010.webp', alt: 'Living Area 2', width: 1200, height: 800, fileSize: 239268, displayOrder: 10, category: 'gallery' },
  { id: '11', src: '/assets/images/mandioca-0011.webp', alt: 'Dorm Room 1', width: 1200, height: 800, fileSize: 205244, displayOrder: 11, category: 'room' },
  { id: '12', src: '/assets/images/mandioca-0012.webp', alt: 'Dorm Room 2', width: 1200, height: 800, fileSize: 279966, displayOrder: 12, category: 'room' },
  { id: '13', src: '/assets/images/mandioca-0013.webp', alt: 'Private Room 1', width: 1200, height: 800, fileSize: 88310, displayOrder: 13, category: 'room' },
  { id: '14', src: '/assets/images/mandioca-0014.webp', alt: 'Private Room 2', width: 1200, height: 800, fileSize: 169572, displayOrder: 14, category: 'room' },
  { id: '15', src: '/assets/images/mandioca-0015.webp', alt: 'Bathroom', width: 1200, height: 800, fileSize: 122734, displayOrder: 15, category: 'gallery' },
  { id: '16', src: '/assets/images/mandioca-0016.webp', alt: 'Cats', width: 1200, height: 800, fileSize: 111088, displayOrder: 16, category: 'gallery' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function MediaPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [images, setImages] = useState<MediaImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null)
  const [filter, setFilter] = useState<'all' | 'gallery' | 'hero' | 'room'>('all')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
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

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedItem === id) return

    const draggedIndex = images.findIndex(img => img.id === draggedItem)
    const hoverIndex = images.findIndex(img => img.id === id)

    if (draggedIndex === -1 || hoverIndex === -1) return

    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)

    // Update display orders
    newImages.forEach((img, index) => {
      img.displayOrder = index + 1
    })

    setImages(newImages)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      // Create a temporary URL for preview
      const url = URL.createObjectURL(file)

      // Get image dimensions
      const img = document.createElement('img')
      img.src = url

      await new Promise<void>((resolve) => {
        img.onload = () => {
          const newImage: MediaImage = {
            id: String(Date.now() + Math.random()),
            src: url, // In production, this would be the Supabase Storage URL
            alt: file.name.replace(/\.[^/.]+$/, ''),
            width: img.naturalWidth,
            height: img.naturalHeight,
            fileSize: file.size,
            displayOrder: images.length + 1,
            category: 'gallery',
          }
          setImages(prev => [...prev, newImage])
          resolve()
        }
      })
    }

    setUploading(false)
    e.target.value = '' // Reset input
  }, [images.length])

  const handleDelete = (id: string) => {
    if (confirm(t.admin.media.deleteConfirm)) {
      setImages(images.filter(img => img.id !== id))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filteredImages = filter === 'all'
    ? images
    : images.filter(img => img.category === filter)

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t.admin.media.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.media.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploading ? t.admin.media.uploading : t.admin.media.uploadImages}</span>
                </div>
              </label>
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
                    {t.admin.media.saveOrder}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'gallery', 'hero', 'room'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === category
                    ? 'bg-[#0A4843] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="ml-2 text-xs opacity-70">
                  ({category === 'all' ? images.length : images.filter(i => i.category === category).length})
                </span>
              </button>
            ))}
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              {t.admin.common.dragToReorder}
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={(e) => handleDragOver(e, image.id)}
                onDragEnd={handleDragEnd}
                className={`group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition-all ${
                  draggedItem === image.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded p-1">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                    #{image.displayOrder}
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedImage(image)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{image.alt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {image.width} x {image.height}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(image.fileSize)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <select
                      value={image.category}
                      onChange={(e) => {
                        setImages(images.map(img =>
                          img.id === image.id
                            ? { ...img, category: e.target.value as MediaImage['category'] }
                            : img
                        ))
                      }}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      <option value="gallery">{t.admin.media.categories.gallery}</option>
                      <option value="hero">{t.admin.media.categories.hero}</option>
                      <option value="room">{t.admin.media.categories.room}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t.admin.media.noImages}</p>
            </div>
          )}

          {/* Image Preview Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative aspect-video">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Input
                    value={selectedImage.alt}
                    onChange={(e) => {
                      setImages(images.map(img =>
                        img.id === selectedImage.id
                          ? { ...img, alt: e.target.value }
                          : img
                      ))
                      setSelectedImage({ ...selectedImage, alt: e.target.value })
                    }}
                    placeholder="Alt text"
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{t.admin.media.modal.dimensions}: {selectedImage.width} x {selectedImage.height}</span>
                    <span>{t.admin.media.modal.size}: {formatFileSize(selectedImage.fileSize)}</span>
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
