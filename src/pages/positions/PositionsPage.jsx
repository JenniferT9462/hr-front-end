import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import positionService from '@/services/positionService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

export default function PositionsPage() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await positionService.getAll()
      setPositions(res.data.results ?? res.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (pos) => {
    setEditing(pos)
    reset({
      title: pos.title,
      description: pos.description,
      min_salary: pos.min_salary,
      max_salary: pos.max_salary,
      is_active: pos.is_active,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = { ...data, is_active: data.is_active === true || data.is_active === 'true' }
      if (editing) {
        await positionService.update(editing.id, payload)
      } else {
        await positionService.create(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save position.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pos) => {
    const result = await Swal.fire({
      title: 'Delete position?',
      text: `"${pos.title}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await positionService.remove(pos.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete position.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{positions.length} record{positions.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Position
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
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Min Salary</TableHead>
                  <TableHead>Max Salary</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No positions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-slate-500">{pos.description || '—'}</TableCell>
                      <TableCell>{fmt(pos.min_salary)}</TableCell>
                      <TableCell>{fmt(pos.max_salary)}</TableCell>
                      <TableCell><StatusBadge status={pos.is_active ? 'active' : 'inactive'} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(pos)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(pos)}>
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
        title={editing ? 'Edit Position' : 'New Position'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input {...register('title', { required: 'Required' })} placeholder="Software Engineer" />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Position description..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Min Salary</Label>
            <Input type="number" {...register('min_salary')} placeholder="50000" />
          </div>
          <div className="space-y-1.5">
            <Label>Max Salary</Label>
            <Input type="number" {...register('max_salary')} placeholder="80000" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" {...register('is_active')} className="h-4 w-4" />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </FormModal>
    </div>
  )
}
