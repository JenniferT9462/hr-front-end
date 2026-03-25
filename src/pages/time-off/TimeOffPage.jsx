import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import timeOffService from '@/services/timeOffService'
import employeeService from '@/services/employeeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

const LEAVE_TYPES = ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other']
const STATUSES = ['pending', 'approved', 'rejected']

const STATUS_COLORS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
}

export default function TimeOffPage() {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, empRes] = await Promise.all([
        timeOffService.getAll(),
        employeeService.getAll(),
      ])
      setRequests(reqRes.data.results ?? reqRes.data)
      setEmployees(empRes.data.results ?? empRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (req) => {
    setEditing(req)
    reset({
      employee: req.employee,
      leave_type: req.leave_type,
      start_date: req.start_date,
      end_date: req.end_date,
      status: req.status,
      reason: req.reason,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await timeOffService.update(editing.id, data)
      } else {
        await timeOffService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save time-off request.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (req) => {
    const result = await Swal.fire({
      title: 'Delete time-off request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await timeOffService.remove(req.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete request.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{requests.length} record{requests.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Request
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
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No time-off requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employee_name || '—'}</TableCell>
                      <TableCell>
                        {req.leave_type
                          ? req.leave_type.charAt(0).toUpperCase() + req.leave_type.slice(1)
                          : '—'}
                      </TableCell>
                      <TableCell>{req.start_date || '—'}</TableCell>
                      <TableCell>{req.end_date || '—'}</TableCell>
                      <TableCell>{req.total_days ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[req.status] || 'default'}>
                          {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(req)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(req)}>
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
        title={editing ? 'Edit Time-Off Request' : 'New Time-Off Request'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Leave Type *</Label>
            <select
              {...register('leave_type', { required: 'Required' })}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {LEAVE_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            {errors.leave_type && <p className="text-xs text-red-600">{errors.leave_type.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select
              {...register('status')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input type="date" {...register('start_date', { required: 'Required' })} />
            {errors.start_date && <p className="text-xs text-red-600">{errors.start_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>End Date *</Label>
            <Input type="date" {...register('end_date', { required: 'Required' })} />
            {errors.end_date && <p className="text-xs text-red-600">{errors.end_date.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Reason</Label>
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Reason for time off..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
      </FormModal>
    </div>
  )
}
