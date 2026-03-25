import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Check, X, UserSearch } from 'lucide-react'
import Swal from 'sweetalert2'
import applicantService from '@/services/applicantService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await applicantService.getAll()
      setApplicants(res.data.results ?? res.data)
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
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      phone: app.phone,
      headline: app.headline,
      linkedin_url: app.linkedin_url,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await applicantService.update(editing.id, data)
      } else {
        await applicantService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save applicant.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (app) => {
    const result = await Swal.fire({
      title: 'Delete applicant?',
      text: `${app.full_name || app.email} will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await applicantService.remove(app.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete applicant.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  const BoolIcon = ({ value }) =>
    value
      ? <Check size={15} style={{color:'#16a34a'}} />
      : <X size={15} style={{color:'#cbd5e1'}} />

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon icon-blue">
            <UserSearch strokeWidth={2} />
          </div>
          <div>
            <h2 className="page-title">Applicants</h2>
            <p className="page-subtitle">{applicants.length} record{applicants.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Applicant
        </Button>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <SpinnerOverlay />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>Has CV</TableHead>
                  <TableHead>Has Photo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="empty-state">
                        <UserSearch strokeWidth={1.5} />
                        <p className="empty-state-title">No applicants yet</p>
                        <p className="empty-state-desc">Add applicants to build your talent pool</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  applicants.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.full_name || `${app.first_name} ${app.last_name}`}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone || '—'}</TableCell>
                      <TableCell>{app.headline || '—'}</TableCell>
                      <TableCell><BoolIcon value={app.has_cv} /></TableCell>
                      <TableCell><BoolIcon value={app.has_photo} /></TableCell>
                      <TableCell>
                        <div className="row-actions">
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
        title={editing ? 'Edit Applicant' : 'New Applicant'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="form-grid-2">
          <div className="form-group">
            <Label>First Name *</Label>
            <Input {...register('first_name', { required: 'Required' })} placeholder="Jane" />
            {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
          </div>
          <div className="form-group">
            <Label>Last Name *</Label>
            <Input {...register('last_name', { required: 'Required' })} placeholder="Doe" />
            {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
          </div>
        </div>
        <div className="form-group">
          <Label>Email *</Label>
          <Input type="email" {...register('email', { required: 'Required' })} placeholder="jane.doe@example.com" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Phone</Label>
            <Input {...register('phone')} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <Label>LinkedIn URL</Label>
            <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <div className="form-group">
          <Label>Headline</Label>
          <Input {...register('headline')} placeholder="Software Engineer with 5 years experience" />
        </div>
      </FormModal>
    </div>
  )
}
