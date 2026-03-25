import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import { Spinner } from '@/components/ui/spinner'
import Swal from 'sweetalert2'

const fieldStyle = {
  width: '100%',
  height: '44px',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  padding: '0 14px',
  fontSize: '15px',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      await authService.register(data)
      await Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: 'Your account has been created successfully. Please sign in.',
        confirmButtonColor: '#4E89BD',
      })
      navigate('/login')
    } catch (err) {
      const resData = err.response?.data
      if (resData && typeof resData === 'object') {
        const messages = Object.entries(resData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n')
        setError(messages)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (name, opts = {}) => ({
    ...register(name, opts),
    style: fieldStyle,
    onFocus: e => (e.target.style.borderColor = '#4E89BD'),
    onBlur: e => (e.target.style.borderColor = errors[name] ? '#dc2626' : '#e2e8f0'),
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e8f2f9 100%)',
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4E89BD, #61AFEE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', color: 'white', fontSize: '17px',
            margin: '0 auto 14px',
            boxShadow: '0 6px 20px rgba(78,137,189,0.35)',
          }}>HR</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Register as an applicant</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)', padding: '32px',
          border: '1px solid rgba(78,137,189,0.12)',
        }}>
          <form onSubmit={handleSubmit(onSubmit)}>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '20px', color: '#dc2626',
                fontSize: '14px', whiteSpace: 'pre-line',
              }}>{error}</div>
            )}

            {/* First + Last name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input placeholder="Jane" {...field('first_name', { required: 'Required' })} />
                {errors.first_name && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input placeholder="Doe" {...field('last_name', { required: 'Required' })} />
                {errors.last_name && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <input placeholder="jdoe" {...field('username', { required: 'Username is required' })} />
              {errors.username && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="jane.doe@example.com"
                {...field('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
              <input type="tel" placeholder="+1 555 000 0000" {...field('phone')} />
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="Min. 8 characters"
                  {...field('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' }
                  })} />
                {errors.password && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" placeholder="Repeat password"
                  {...field('password_confirm', {
                    required: 'Required',
                    validate: val => val === password || 'Passwords do not match',
                  })} />
                {errors.password_confirm && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.password_confirm.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '48px', borderRadius: '12px',
                background: loading ? '#93b8d8' : 'linear-gradient(135deg, #4E89BD, #61AFEE)',
                color: 'white', fontWeight: '700', fontSize: '16px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(78,137,189,0.40)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? <><Spinner size="sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4E89BD', fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
