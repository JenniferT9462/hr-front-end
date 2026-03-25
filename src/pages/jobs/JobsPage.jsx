import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import jobService from '@/services/jobService'
import positionService from '@/services/positionService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

const JOB_TYPES = ['full_time', 'part_time', 'contractor', 'internship']
const JOB_STATUSES = ['open', 'closed', 'paused']

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsRes, posRes] = await Promise.all([
        jobService.getAll(),
        positionService.getAll(),
      ])
      setJobs(jobsRes.data.results ?? jobsRes.data)
      setPositions(posRes.data.results ?? posRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (job) => {
    setEditing(job)
    reset({
      title: job.title,
      position: job.position,
      company: job.company,
      is_internal: job.is_internal,
      job_type: job.job_type,
      status: job.status,
      description: job.description,
      requirements: job.requirements,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await jobService.update(editing.id, data)
      } else {
        await jobService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save job.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (job) => {
    const result = await Swal.fire({
      title: 'Delete job posting?',
      text: `"${job.title}" will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await jobService.remove(job.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete job.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{jobs.length} record{jobs.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Job
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
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Internal</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.position_display || job.position_title || '—'}</TableCell>
                      <TableCell>{job.display_company || job.company || '—'}</TableCell>
                      <TableCell><StatusBadge status={job.is_internal ? 'active' : 'inactive'} /></TableCell>
                      <TableCell>{job.job_type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'}</TableCell>
                      <TableCell><StatusBadge status={job.status} /></TableCell>
                      <TableCell>{job.application_count ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(job)}>
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
        title={editing ? 'Edit Job' : 'New Job'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input {...register('title', { required: 'Required' })} placeholder="Senior Developer" />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Position</Label>
            <select
              {...register('position')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">— None —</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input {...register('company')} placeholder="Acme Corp" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Job Type</Label>
            <select
              {...register('job_type')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {JOB_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select
              {...register('status')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {JOB_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_internal" {...register('is_internal')} className="h-4 w-4" />
          <Label htmlFor="is_internal">Internal posting only</Label>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Job description..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Requirements</Label>
          <textarea
            {...register('requirements')}
            rows={3}
            placeholder="Requirements..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
      </FormModal>
    </div>
  )
}
