import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import Swal from 'sweetalert2'
import performanceService from '@/services/performanceService'
import employeeService from '@/services/employeeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

const REVIEW_TYPES = ['annual', 'mid_year', 'quarterly', 'probation', 'other']
const RATING_COLORS = {
  1: 'danger',
  2: 'warning',
  3: 'default',
  4: 'active',
  5: 'approved',
}

function RatingStars({ rating }) {
  if (!rating) return <span className="text-slate-400">—</span>
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
        />
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating}/5</span>
    </div>
  )
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [revRes, empRes] = await Promise.all([
        performanceService.getAll(),
        employeeService.getAll(),
      ])
      setReviews(revRes.data.results ?? revRes.data)
      setEmployees(empRes.data.results ?? empRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (rev) => {
    setEditing(rev)
    reset({
      employee: rev.employee,
      reviewer: rev.reviewer,
      review_type: rev.review_type,
      review_date: rev.review_date,
      overall_rating: rev.overall_rating,
      comments: rev.comments,
      goals: rev.goals,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await performanceService.update(editing.id, data)
      } else {
        await performanceService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save review.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (rev) => {
    const result = await Swal.fire({
      title: 'Delete performance review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await performanceService.remove(rev.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete review.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{reviews.length} record{reviews.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Review
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SpinnerOverlay />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Review Type</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No performance reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell className="font-medium">{rev.employee_name || '—'}</TableCell>
                      <TableCell>{rev.reviewer_name || '—'}</TableCell>
                      <TableCell>
                        {rev.review_type
                          ? rev.review_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : '—'}
                      </TableCell>
                      <TableCell>{rev.review_date || '—'}</TableCell>
                      <TableCell><RatingStars rating={rev.overall_rating} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(rev)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rev)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Performance Review' : 'New Performance Review'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Employee *</Label>
            <select
              {...register('employee', { required: 'Required' })}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">— Select Employee —</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.full_name || `${e.first_name} ${e.last_name}`}
                </option>
              ))}
            </select>
            {errors.employee && <p className="text-xs text-red-600">{errors.employee.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Reviewer (Employee)</Label>
            <select
              {...register('reviewer')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">— None —</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.full_name || `${e.first_name} ${e.last_name}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Review Type *</Label>
            <select
              {...register('review_type', { required: 'Required' })}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {REVIEW_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            {errors.review_type && <p className="text-xs text-red-600">{errors.review_type.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Review Date *</Label>
            <Input type="date" {...register('review_date', { required: 'Required' })} />
            {errors.review_date && <p className="text-xs text-red-600">{errors.review_date.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Overall Rating (1–5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            {...register('overall_rating', {
              min: { value: 1, message: 'Min 1' },
              max: { value: 5, message: 'Max 5' },
            })}
            placeholder="e.g. 4"
          />
          {errors.overall_rating && <p className="text-xs text-red-600">{errors.overall_rating.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Goals</Label>
          <textarea
            {...register('goals')}
            rows={2}
            placeholder="Goals for next period..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Comments</Label>
          <textarea
            {...register('comments')}
            rows={3}
            placeholder="General comments..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
      </FormModal>
    </div>
  )
}
