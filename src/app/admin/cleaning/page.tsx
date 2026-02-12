'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import {
  CheckCircle,
  Circle,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  Filter,
  Calendar as CalendarIcon,
  CheckSquare,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import AdminNav from '../components/AdminNav'
import { useAuth } from '@/lib/hooks/use-auth'
import type { CleaningTask, CleaningTemplate, ChecklistItem, StaffUser } from '@/types/database'

// Area icons/colors
const AREA_STYLES: Record<string, { icon: string; color: string }> = {
  room: { icon: '🛏️', color: 'bg-blue-100 text-blue-800' },
  bathroom: { icon: '🚿', color: 'bg-cyan-100 text-cyan-800' },
  kitchen: { icon: '🍳', color: 'bg-orange-100 text-orange-800' },
  pool: { icon: '🏊', color: 'bg-sky-100 text-sky-800' },
  terrace: { icon: '🌴', color: 'bg-green-100 text-green-800' },
  common: { icon: '🛋️', color: 'bg-purple-100 text-purple-800' },
}

// Status styles
const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  verified: { label: 'Verified', color: 'bg-blue-100 text-blue-800' },
}

export default function CleaningPage() {
  const router = useRouter()
  const { isAdmin, isVolunteer, userName, loading: authLoading, authenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [templates, setTemplates] = useState<CleaningTemplate[]>([])
  const [volunteers, setVolunteers] = useState<StaffUser[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterArea, setFilterArea] = useState<string>('all')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // New task form state
  const [newTask, setNewTask] = useState({
    area_type: '',
    area_name: '',
    task_type: 'daily',
    template_id: '',
    assigned_to: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    recurrence: 'none' as 'none' | 'daily' | 'weekly',
    recurrence_days: [] as number[], // 0=Sun, 1=Mon, ... 6=Sat
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/admin/login')
    }
  }, [authLoading, authenticated, router])

  useEffect(() => {
    if (authenticated) {
      fetchData()
      fetchVolunteers()
    }
  }, [selectedDate, viewMode, authenticated])

  async function fetchVolunteers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        // Filter to active volunteers only (and admins for assignment)
        setVolunteers(data.users?.filter((u: StaffUser) => u.active) || [])
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    }
  }

  async function fetchData() {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const params = new URLSearchParams({
        date: dateStr,
        view: viewMode,
      })

      const [tasksRes, templatesRes] = await Promise.all([
        fetch(`/api/admin/cleaning?${params}`),
        fetch('/api/admin/cleaning/templates'),
      ])

      if (tasksRes.ok) {
        const data = await tasksRes.json()
        let allTasks = data.tasks || []

        // If volunteer, filter to only their assigned tasks
        if (isVolunteer && userName) {
          allTasks = allTasks.filter(
            (task: CleaningTask) => task.assigned_to === userName
          )
        }

        setTasks(allTasks)
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/cleaning/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setTasks(tasks.map((t) =>
          t.id === taskId ? { ...t, status: status as CleaningTask['status'] } : t
        ))
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function updateChecklistItem(taskId: string, itemId: string, completed: boolean) {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const updatedChecklist = task.checklist.map((item) =>
        item.id === itemId
          ? { ...item, completed, completed_at: completed ? new Date().toISOString() : undefined }
          : item
      )

      const res = await fetch(`/api/admin/cleaning/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updatedChecklist }),
      })

      if (res.ok) {
        setTasks(tasks.map((t) =>
          t.id === taskId ? { ...t, checklist: updatedChecklist } : t
        ))
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
    }
  }

  async function createTask() {
    try {
      const template = templates.find((t) => t.id === newTask.template_id)

      const res = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          checklist: template?.checklist || [],
        }),
      })

      if (res.ok) {
        setShowNewTaskModal(false)
        setNewTask({
          area_type: '',
          area_name: '',
          task_type: 'daily',
          template_id: '',
          assigned_to: '',
          scheduled_date: format(new Date(), 'yyyy-MM-dd'),
          recurrence: 'none',
          recurrence_days: [],
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterArea !== 'all' && task.area_type !== filterArea) return false
    return true
  })

  // Group tasks by status for quick stats
  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    verified: tasks.filter((t) => t.status === 'verified').length,
  }

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : 1
    setSelectedDate((prev) =>
      direction === 'next' ? addDays(prev, days) : addDays(prev, -days)
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A4843]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">
          <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isVolunteer ? 'My Tasks' : 'Task Management'}
          </h1>
          <p className="text-gray-500">
            {isVolunteer
              ? 'View and complete your assigned tasks'
              : 'Track and manage daily tasks'}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowNewTaskModal(true)}
            className="bg-[#0A4843] hover:bg-[#0A4843]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Circle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.in_progress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksByStatus.verified}</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg min-w-[200px] justify-center">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {viewMode === 'day'
                    ? format(selectedDate, 'EEEE, MMMM d')
                    : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d')}`
                  }
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>

            {/* View Mode & Filters */}
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week')}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="room">Rooms</SelectItem>
                  <SelectItem value="bathroom">Bathrooms</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">
                {tasks.length === 0
                  ? 'No tasks scheduled for this period'
                  : 'No tasks match your current filters'}
              </p>
              <Button onClick={() => setShowNewTaskModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={updateTaskStatus}
              onChecklistChange={updateChecklistItem}
            />
          ))
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Area Type</Label>
                <Select
                  value={newTask.area_type}
                  onValueChange={(v) => setNewTask({ ...newTask, area_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">🛏️ Room</SelectItem>
                    <SelectItem value="bathroom">🚿 Bathroom</SelectItem>
                    <SelectItem value="kitchen">🍳 Kitchen</SelectItem>
                    <SelectItem value="pool">🏊 Pool</SelectItem>
                    <SelectItem value="terrace">🌴 Terrace</SelectItem>
                    <SelectItem value="common">🛋️ Common Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Area Name</Label>
                <Input
                  placeholder="e.g., Room 101, Main Bathroom"
                  value={newTask.area_name}
                  onChange={(e) => setNewTask({ ...newTask, area_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={newTask.template_id}
                  onValueChange={(v) => setNewTask({ ...newTask, template_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter((t) => !newTask.area_type || t.area_type === newTask.area_type)
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select volunteer" />
                  </SelectTrigger>
                  <SelectContent>
                    {volunteers.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name} {user.role === 'admin' ? '(Admin)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={newTask.scheduled_date}
                  onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewTaskModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#0A4843]"
                  onClick={createTask}
                  disabled={!newTask.area_type || !newTask.area_name}
                >
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Task Card Component
function TaskCard({
  task,
  onStatusChange,
  onChecklistChange,
}: {
  task: CleaningTask
  onStatusChange: (taskId: string, status: string) => void
  onChecklistChange: (taskId: string, itemId: string, completed: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const areaStyle = AREA_STYLES[task.area_type] || AREA_STYLES.common
  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.pending

  const completedItems = task.checklist.filter((item) => item.completed).length
  const totalItems = task.checklist.length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <Card className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{areaStyle.icon}</span>
            <div>
              <h3 className="font-medium text-gray-900">{task.area_name}</h3>
              <p className="text-sm text-gray-500">{task.task_type} clean</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {task.assigned_to && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {task.assigned_to}
              </div>
            )}

            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
              {statusStyle.label}
            </span>

            <div className="text-sm text-gray-500">
              {completedItems}/{totalItems}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0A4843] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Expanded checklist */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="space-y-2 mb-4">
            {task.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    onChecklistChange(task.id, item.id, checked === true)
                  }
                />
                <span
                  className={`flex-1 text-sm ${
                    item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}
                >
                  {item.task}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Status actions */}
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, 'in_progress')}
              >
                Start Task
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onStatusChange(task.id, 'completed')}
              >
                Mark Complete
              </Button>
            )}
            {task.status === 'completed' && (
              <Button
                size="sm"
                className="bg-[#0A4843]"
                onClick={() => onStatusChange(task.id, 'verified')}
              >
                Verify
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
