import { safeParseJSON } from '../utils/storage'

const STORAGE_KEY = 'savedJobs'

const normalizeJob = (job) => ({
  id: job.id,
  title: job.title || job.position_display || job.external_position_title || 'Role',
  company_name: job.company_name || job.display_company || 'CodeX Academy',
  location: job.location || (job.is_remote ? 'Remote' : 'Hybrid'),
  saved_at: new Date().toISOString(),
})

const notify = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('savedJobsUpdated'))
  }
}

const savedJobsService = {
  getSavedJobsLocal: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = safeParseJSON(raw, [])
    return Array.isArray(parsed) ? parsed : []
  },
  saveJobLocal: (job) => {
    if (!job?.id) return
    const list = savedJobsService.getSavedJobsLocal()
    if (list.some((item) => item.id === job.id)) return
    const updated = [normalizeJob(job), ...list]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    notify()
  },
  removeJobLocal: (jobId) => {
    if (!jobId) return
    const list = savedJobsService.getSavedJobsLocal()
    const updated = list.filter((item) => item.id !== jobId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    notify()
  },
  isSavedLocal: (jobId) => {
    if (!jobId) return false
    const list = savedJobsService.getSavedJobsLocal()
    return list.some((item) => item.id === jobId)
  },
  toggleJobLocal: (job) => {
    if (!job?.id) return
    if (savedJobsService.isSavedLocal(job.id)) {
      savedJobsService.removeJobLocal(job.id)
      return false
    }
    savedJobsService.saveJobLocal(job)
    return true
  },
}

export default savedJobsService
