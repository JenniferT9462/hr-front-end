import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react'
import Swal from 'sweetalert2'
import jobApplicationService from '@/services/jobApplicationService'
import jobService from '@/services/jobService'
import applicantService from '@/services/applicantService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

const STAGE_COLORS = {
  applied: 'default',
  screening: 'pending',
  interview: 'warning',
  offer: 'approved',
  hired: 'hired',
  rejected: 'rejected',
}

const formatDate = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString()
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appsRes, jobsRes, applicantsRes] = await Promise.all([
        jobApplicationService.getAll(),
        jobService.getAll(),
        applicantService.getAll(),
      ])
      setApplications(appsRes.data.results ?? appsRes.data)
      setJobs(jobsRes.data.results ?? jobsRes.data)
      setApplicants(applicantsRes.data.results ?? applicantsRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (app) => {
    setEditing(app)
    reset({
      applicant: app.applicant,
      job: app.job,
      stage: app.stage,
      cover_letter: app.cover_letter,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await jobApplicationService.update(editing.id, data)
      } else {
        await jobApplicationService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save application.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (app) => {
    const result = await Swal.fire({
      title: 'Delete application?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await jobApplicationService.remove(app.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete application.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  const handleAdvanceStage = async (app) => {
    const result = await Swal.fire({
      title: 'Advance stage?',
      text: `Move "${app.applicant_name || 'this applicant'}" to the next stage?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4E89BD',
      confirmButtonText: 'Advance',
    })
    if (result.isConfirmed) {
      try {
        await jobApplicationService.advanceStage(app.id)
        fetchData()
        Swal.fire({ icon: 'success', title: 'Stage advanced!', timer: 1500, showConfirmButton: false })
      } catch (err) {
        const msg = err.response?.data?.detail || 'Could not advance stage.'
        Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{applications.length} record{applications.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Application
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.applicant_name || '—'}</TableCell>
                      <TableCell>{app.job_title || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={STAGE_COLORS[app.stage] || 'default'}>
                          {app.stage ? app.stage.charAt(0).toUpperCase() + app.stage.slice(1) : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(app.stage_updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdvanceStage(app)}
                            title="Advance Stage"
                          >
                            <ArrowRight className="h-3.5 w-3.5 mr-1" /> Advance
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(app)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(app)}>
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
        title={editing ? 'Edit Application' : 'New Application'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="space-y-1.5">
          <Label>Applicant *</Label>
          <select
            {...register('applicant', { required: 'Required' })}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">— Select Applicant —</option>
            {applicants.map(a => (
              <option key={a.id} value={a.id}>
                {a.full_name || `${a.first_name} ${a.last_name}`} ({a.email})
              </option>
            ))}
          </select>
          {errors.applicant && <p className="text-xs text-red-600">{errors.applicant.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Job *</Label>
          <select
            {...register('job', { required: 'Required' })}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">— Select Job —</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          {errors.job && <p className="text-xs text-red-600">{errors.job.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Stage</Label>
          <select
            {...register('stage')}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {Object.keys(STAGE_COLORS).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Cover Letter</Label>
          <textarea
            {...register('cover_letter')}
            rows={4}
            placeholder="Cover letter text..."
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>
      </FormModal>
    </div>
  )
}
