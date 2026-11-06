import { useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Register({ onRegisterSuccess, onSwitchToLogin, onBackToDashboard }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    // Also clear confirmPassword error if password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()

    if (!trimmedName) {
      newErrors.name = 'Full name is required.'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.'
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
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
      const trimmedName = formData.name.trim()
      const trimmedEmail = formData.email.trim()

      // Demo registration: Only non-sensitive display details are stored in the demo session
      // Never store passwords or sensitive data in browser storage
      onRegisterSuccess({
        name: trimmedName,
        email: trimmedEmail,
        isDemo: true
      })
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-top-nav">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="auth-back-link"
            aria-label="Back to Dashboard"
          >
            ← Back to Dashboard
          </button>

          <div className="auth-top-tabs" role="tablist" aria-label="Authentication views">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-tab-btn"
              role="tab"
              aria-selected="false"
            >
              Sign In
            </button>
            <button
              type="button"
              className="auth-tab-btn active"
              role="tab"
              aria-selected="true"
            >
              Register
            </button>
          </div>
        </div>

        <div className="demo-badge-banner">
          <span className="demo-badge-pill">Demo Mode</span>
          <p className="demo-badge-text">
            This account registration is temporary and runs locally in your browser. No data is sent to a backend or saved in a persistent database.
          </p>
        </div>

        <div className="auth-header">
          <div className="auth-icon" role="img" aria-label="Sparkles icon">✨</div>
          <h2 className="auth-title">Create Demo Account</h2>
          <p className="auth-subtitle">Get started with JobFinder practice quizzes</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password" className="form-label">
              Confirm Password <span className="required-star">*</span>
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && (
              <span className="form-error-msg">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn">
            Create Demo Account &amp; Start
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            Already have a demo account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-switch-btn"
            >
              Sign In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
