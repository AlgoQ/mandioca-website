'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  Video,
  Upload,
  Trash2,
  Loader2,
  GripVertical,
  Check,
  X,
  Save,
  Play,
  Plus,
  Edit2,
} from 'lucide-react'

interface HostelVideo {
  id: string
  src: string
  thumbnail: string
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  duration: number // in seconds
  fileSize: number
  displayOrder: number
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function VideosPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [videos, setVideos] = useState<HostelVideo[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<HostelVideo | null>(null)
  const [editingVideo, setEditingVideo] = useState<HostelVideo | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please upload video files only (mp4, webm, etc.)')
        continue
      }

      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file is too large. Maximum size is 100MB.')
        continue
      }

      // Create temporary URL for preview
      const url = URL.createObjectURL(file)

      // Get video duration
      const video = document.createElement('video')
      video.src = url

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          // Create thumbnail from first frame
          const canvas = document.createElement('canvas')
          canvas.width = 320
          canvas.height = 180
          const ctx = canvas.getContext('2d')

          video.currentTime = 1 // Get frame at 1 second
          video.onseeked = () => {
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
            const thumbnail = canvas.toDataURL('image/jpeg')

            const newVideo: HostelVideo = {
              id: String(Date.now() + Math.random()),
              src: url,
              thumbnail,
              title: file.name.replace(/\.[^/.]+$/, ''),
              titleEs: '',
              description: '',
              descriptionEs: '',
              duration: Math.round(video.duration),
              fileSize: file.size,
              displayOrder: videos.length + 1,
            }
            setVideos(prev => [...prev, newVideo])
            resolve()
          }
        }
      })

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(r => setTimeout(r, 100))
      }
    }

    setUploading(false)
    setUploadProgress(0)
    e.target.value = ''
  }, [videos.length])

  const handleDelete = (id: string) => {
    if (confirm(t.admin.videos.deleteConfirm)) {
      setVideos(videos.filter(v => v.id !== id))
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

  const updateVideo = (id: string, updates: Partial<HostelVideo>) => {
    setVideos(videos.map(v => v.id === id ? { ...v, ...updates } : v))
    if (editingVideo?.id === id) {
      setEditingVideo({ ...editingVideo, ...updates })
    }
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {t.admin.videos.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {t.admin.videos.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.admin.videos.uploading} {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{t.admin.videos.uploadVideos}</span>
                    </>
                  )}
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
                    {t.admin.common.save}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A4843]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{t.admin.videos.uploadingVideo}</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0A4843] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-gray-900">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-600" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setPlayingVideo(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-[#0A4843] ml-1" />
                      </div>
                    </button>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>

                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{video.displayOrder}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{video.title || t.admin.videos.noTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {video.description || t.admin.videos.noDescription}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(video.fileSize)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="p-2 text-gray-400 hover:text-[#0A4843] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.admin.videos.noVideos}</h3>
              <p className="text-gray-500 mb-6">{t.admin.videos.noVideosDesc}</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A4843] text-white rounded-lg hover:bg-[#0d5c55] transition-colors">
                  <Plus className="w-4 h-4" />
                  {t.admin.videos.uploadFirst}
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-4">{t.admin.videos.supportedFormats}</p>
            </div>
          )}

          {/* Video Player Modal */}
          {playingVideo && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setPlayingVideo(null)}
            >
              <div
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <video
                  src={playingVideo.src}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Edit Video Modal */}
          {editingVideo && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setEditingVideo(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">{t.admin.videos.modal.title}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="title">{t.admin.videos.modal.titleEn}</Label>
                    <Input
                      id="title"
                      value={editingVideo.title}
                      onChange={(e) => updateVideo(editingVideo.id, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleEs">{t.admin.videos.modal.titleEs}</Label>
                    <Input
                      id="titleEs"
                      value={editingVideo.titleEs}
                      onChange={(e) => updateVideo(editingVideo.id, { titleEs: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t.admin.videos.modal.descriptionEn}</Label>
                    <textarea
                      id="description"
                      value={editingVideo.description}
                      onChange={(e) => updateVideo(editingVideo.id, { description: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionEs">{t.admin.videos.modal.descriptionEs}</Label>
                    <textarea
                      id="descriptionEs"
                      value={editingVideo.descriptionEs}
                      onChange={(e) => updateVideo(editingVideo.id, { descriptionEs: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4843]"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEditingVideo(null)}>
                    {t.admin.common.cancel}
                  </Button>
                  <Button
                    onClick={() => setEditingVideo(null)}
                    className="bg-[#0A4843] hover:bg-[#0d5c55]"
                  >
                    {t.admin.videos.modal.saveChanges}
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
