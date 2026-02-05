'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../components/AdminNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'
import {
  FolderOpen,
  FileText,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Search,
  Filter,
  Loader2,
  File,
  Link as LinkIcon,
  Building,
  Users,
  Shield,
  Wrench,
  FileCode,
} from 'lucide-react'
import { getDocumentUrl } from '@/lib/storage'

interface Document {
  id: string
  name: string
  description: string
  type: 'internal' | 'external'
  category: string
  url: string
  created_at: string
  updated_at: string
}

// Document categories
const CATEGORIES = [
  { id: 'operations', label: 'Operations', icon: Wrench },
  { id: 'legal', label: 'Legal & Compliance', icon: Shield },
  { id: 'hr', label: 'Staff & HR', icon: Users },
  { id: 'property', label: 'Property', icon: Building },
  { id: 'other', label: 'Other', icon: FileText },
]

export default function DocumentsPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // New document form state
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    type: 'internal' as 'internal' | 'external',
    category: 'operations',
    url: '',
  })

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login')
        } else {
          setAuthenticated(true)
          // TODO: Fetch documents from API when table exists
          // For now, use sample data
          setDocuments([
            {
              id: '1',
              name: 'Employee Handbook',
              description: 'Guide for all staff members',
              type: 'internal',
              category: 'hr',
              url: '#',
              created_at: '2025-01-15',
              updated_at: '2025-01-15',
            },
            {
              id: '2',
              name: 'Fire Safety Procedures',
              description: 'Emergency evacuation and fire safety protocols',
              type: 'internal',
              category: 'operations',
              url: '#',
              created_at: '2025-01-10',
              updated_at: '2025-01-10',
            },
            {
              id: '3',
              name: 'Hostel License',
              description: 'Official operating license from municipality',
              type: 'internal',
              category: 'legal',
              url: '#',
              created_at: '2025-01-01',
              updated_at: '2025-01-01',
            },
          ])
          setLoading(false)
        }
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  const addDocument = () => {
    const doc: Document = {
      id: Date.now().toString(),
      ...newDocument,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setDocuments([...documents, doc])
    setShowAddModal(false)
    setNewDocument({
      name: '',
      description: '',
      type: 'internal',
      category: 'operations',
      url: '',
    })
  }

  const deleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id))
    }
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Group by category
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Documents
              </h1>
              <p className="text-gray-500 mt-1">
                Manage internal and external documents
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0A4843] hover:bg-[#0d5c55]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents by Category */}
          {Object.keys(groupedDocuments).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  {documents.length === 0
                    ? 'Add your first document to get started'
                    : 'No documents match your filters'}
                </p>
                <Button onClick={() => setShowAddModal(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {CATEGORIES.filter(cat => groupedDocuments[cat.id]?.length > 0).map(category => {
                const Icon = category.icon
                return (
                  <Card key={category.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="w-5 h-5 text-[#0A4843]" />
                        {category.label}
                        <span className="text-sm font-normal text-gray-400">
                          ({groupedDocuments[category.id].length})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {groupedDocuments[category.id].map(doc => (
                          <div
                            key={doc.id}
                            className="py-3 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                doc.type === 'internal'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {doc.type === 'internal' ? (
                                  <File className="w-4 h-4" />
                                ) : (
                                  <LinkIcon className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                <p className="text-sm text-gray-500">{doc.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                doc.type === 'internal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {doc.type}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument(doc.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  placeholder="e.g., Employee Handbook"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description..."
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(v) => setNewDocument({ ...newDocument, type: v as 'internal' | 'external' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">
                      <span className="flex items-center gap-2">
                        <File className="w-4 h-4" /> Internal Document
                      </span>
                    </SelectItem>
                    <SelectItem value="external">
                      <span className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> External Link
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newDocument.category}
                  onValueChange={(v) => setNewDocument({ ...newDocument, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{newDocument.type === 'internal' ? 'File URL' : 'External URL'}</Label>
                <Input
                  placeholder={newDocument.type === 'internal' ? 'Upload or paste URL...' : 'https://...'}
                  value={newDocument.url}
                  onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#0A4843]"
                  onClick={addDocument}
                  disabled={!newDocument.name || !newDocument.url}
                >
                  Add Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
