import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import Swal from 'sweetalert2'

export default function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('new_password')

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      await authService.passwordResetConfirm({
        uid,
        token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      })
      await Swal.fire({
        icon: 'success',
        title: 'Password updated!',
        text: 'Your password has been reset. Please sign in with your new password.',
        confirmButtonColor: '#4E89BD',
      })
      navigate('/login')
    } catch (err) {
      const respData = err.response?.data
      if (respData && typeof respData === 'object') {
        const messages = Object.values(respData).flat().join(' ')
        setError(messages)
      } else {
        setError('Failed to reset password. The link may be expired or invalid.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">Invalid reset link.</p>
          <Link to="/password-reset" className="mt-4 block text-brand-blue hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-brand-blue flex items-center justify-center font-bold text-white text-lg mb-4">
            HR
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Set New Password</h1>
          <p className="text-slate-500 mt-1">Enter your new password below</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Minimum 8 characters"
                {...register('new_password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' }
                })}
              />
              {errors.new_password && <p className="text-xs text-red-600">{errors.new_password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new_password_confirm">Confirm New Password</Label>
              <Input
                id="new_password_confirm"
                type="password"
                placeholder="Repeat password"
                {...register('new_password_confirm', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />
              {errors.new_password_confirm && <p className="text-xs text-red-600">{errors.new_password_confirm.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Spinner size="sm" className="mr-2" /> Updating...</> : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
