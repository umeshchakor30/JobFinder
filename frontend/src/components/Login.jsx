import { useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login({ onLoginSuccess, onSwitchToRegister, onBackToDashboard, authNotice }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    const trimmedEmail = formData.email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.'
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com).'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
    } else {
      setErrors({})
      const trimmedEmail = formData.email.trim()
      const fallbackName = trimmedEmail.split('@')[0]
      // Capitalize first letter of fallback name
      const displayName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)

      // Demo login: only non-sensitive identifier is passed; no passwords stored
      onLoginSuccess({
        email: trimmedEmail,
        name: displayName,
        isDemo: true
      })
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="auth-back-link"
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>

        {authNotice && (
          <div className="auth-guard-notice" role="alert">
            <span className="notice-icon">🔒</span>
            <span>{authNotice}</span>
          </div>
        )}

        <div className="demo-badge-banner">
          <span className="demo-badge-pill">Demo Mode</span>
          <p className="demo-badge-text">
            This is a frontend demonstration. No backend authentication or password verification is performed. Enter any valid email format and a 6+ character password to begin.
          </p>
        </div>

        <div className="auth-header">
          <div className="auth-icon" role="img" aria-label="Key icon">🔑</div>
          <h2 className="auth-title">Demo Candidate Sign In</h2>
          <p className="auth-subtitle">Sign in to unlock interactive MCQ practice quizzes</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="candidate@example.com"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter demo password (6+ chars)"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn">
            Sign In to Demo Session
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            Don&apos;t have a demo account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="auth-switch-btn"
            >
              Create Demo Account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
