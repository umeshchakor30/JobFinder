import { useState, useEffect, useCallback } from 'react'
import {
  fetchApplications,
  fetchStats,
  createApplication,
  updateApplication,
  deleteApplication
} from '../api/applications.js'
import './ApplicationsTracker.css'

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offered', 'Rejected']

/**
 * Extracts a readable error message from Axios error responses,
 * handling FastAPI HTTPException strings and Pydantic validation error lists.
 */
const extractErrorMessage = (err) => {
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const field = item.loc ? item.loc[item.loc.length - 1] : 'Field'
          return `${field}: ${item.msg}`
        })
        .join('; ')
    }
  }
  return err.message || 'An unexpected error occurred while communicating with the backend.'
}

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'interviewing':
      return 'status-badge status-interviewing'
    case 'offered':
      return 'status-badge status-offered'
    case 'rejected':
      return 'status-badge status-rejected'
    case 'applied':
    default:
      return 'status-badge status-applied'
  }
}

export default function ApplicationsTracker() {
  // Data states
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState(null)

  // Loading and network error states
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied'
  })
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Action status / feedback
  const [actionError, setActionError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  /**
   * Load applications and stats concurrently.
   */
  const loadData = useCallback(async () => {
    try {
      const [appsData, statsData] = await Promise.all([
        fetchApplications(),
        fetchStats()
      ])
      setApplications(appsData)
      setStats(statsData)
      setFetchError(null)
    } catch (err) {
      setFetchError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 1. Initial fetch on component mount
  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const [appsData, statsData] = await Promise.all([
          fetchApplications(),
          fetchStats()
        ])
        if (!ignore) {
          setApplications(appsData)
          setStats(statsData)
          setFetchError(null)
        }
      } catch (err) {
        if (!ignore) {
          setFetchError(extractErrorMessage(err))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      ignore = true
    }
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    await loadData()
  }

  // Handle create form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (formError) {
      setFormError(null)
    }
  }

  // 4 & 9. Create application with validation and error handling
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setActionError(null)
    setSuccessMessage(null)

    const trimmedCompany = formData.company.trim()
    const trimmedPosition = formData.position.trim()

    if (trimmedCompany.length < 2) {
      setFormError('Company name must be at least 2 characters.')
      return
    }
    if (trimmedPosition.length < 2) {
      setFormError('Position title must be at least 2 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      const newRecord = await createApplication({
        company: trimmedCompany,
        position: trimmedPosition,
        status: formData.status
      })
      setSuccessMessage(`Application #${newRecord.id} for "${newRecord.position}" at ${newRecord.company} created successfully!`)
      setFormData({
        company: '',
        position: '',
        status: 'Applied'
      })
      // 10. Refresh list and stats after creation
      await loadData()
    } catch (err) {
      setFormError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 5. Update status using PATCH
  const handleStatusChange = async (id, newStatus) => {
    setActionError(null)
    setSuccessMessage(null)
    setUpdatingId(id)

    try {
      await updateApplication(id, { status: newStatus })
      setSuccessMessage(`Application #${id} status updated to "${newStatus}".`)
      // 10. Refresh list and stats after update
      await loadData()
    } catch (err) {
      setActionError(`Failed to update application #${id}: ${extractErrorMessage(err)}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // 6. Delete application using DELETE
  const handleDelete = async (id, company, position) => {
    if (!window.confirm(`Are you sure you want to delete application #${id} (${position} at ${company})?`)) {
      return
    }

    setActionError(null)
    setSuccessMessage(null)
    setDeletingId(id)

    try {
      await deleteApplication(id)
      setSuccessMessage(`Application #${id} (${company}) deleted successfully.`)
      // 10. Refresh list and stats after delete
      await loadData()
    } catch (err) {
      setActionError(`Failed to delete application #${id}: ${extractErrorMessage(err)}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="tracker-container">
      {/* Header */}
      <header className="tracker-header">
        <div className="tracker-title-group">
          <span className="tracker-icon" role="img" aria-label="Briefcase">💼</span>
          <h1 className="tracker-title">Job Applications Tracker</h1>
          <span className="tracker-badge">FastAPI Connected</span>
        </div>
        <p className="tracker-subtitle">
          Track, manage, and monitor your job applications live via the FastAPI REST backend.
        </p>
      </header>

      {/* 11. In-memory storage notice banner */}
      <div className="tracker-notice-banner" role="note">
        <span className="notice-banner-icon" aria-hidden="true">💡</span>
        <div className="notice-banner-text">
          <strong>In-Memory Storage Notice:</strong> Application records are stored in temporary FastAPI backend memory. Any applications you create, update, or delete will persist for the duration of the server session and reset to initial sample records whenever the backend restarts.
        </div>
      </div>

      {/* Global Action / Error Messages */}
      {successMessage && (
        <div className="alert-box alert-success" role="status">
          <span>✓ {successMessage}</span>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-error" role="alert">
          <span>⚠️ {actionError}</span>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* 7. Statistics Display */}
      <section className="stats-grid" aria-label="Application Statistics">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Applications</span>
            <span className="stat-icon" aria-hidden="true">📊</span>
          </div>
          <div className="stat-value">{stats?.total_applications ?? applications.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Applied</span>
            <span className="stat-icon" aria-hidden="true">📨</span>
          </div>
          <div className="stat-value">{stats?.status_breakdown?.Applied ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Interviewing</span>
            <span className="stat-icon" aria-hidden="true">🎯</span>
          </div>
          <div className="stat-value">{stats?.status_breakdown?.Interviewing ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Offered</span>
            <span className="stat-icon" aria-hidden="true">🎉</span>
          </div>
          <div className="stat-value">{stats?.status_breakdown?.Offered ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Rejected</span>
            <span className="stat-icon" aria-hidden="true">📋</span>
          </div>
          <div className="stat-value">{stats?.status_breakdown?.Rejected ?? 0}</div>
        </div>
      </section>

      {/* 4. Create Application Form */}
      <section className="tracker-card">
        <div className="card-heading-group">
          <h2 className="card-heading">Add New Application</h2>
          <p className="card-subheading">Enter company details and starting status to record a job application.</p>
        </div>

        {formError && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }} role="alert">
            <span>⚠️ {formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} noValidate className="create-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="company" className="field-label">Company Name *</label>
              <input
                id="company"
                type="text"
                name="company"
                placeholder="e.g., Netflix"
                value={formData.company}
                onChange={handleInputChange}
                className="field-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="position" className="field-label">Position / Role *</label>
              <input
                id="position"
                type="text"
                name="position"
                placeholder="e.g., Senior Frontend Engineer"
                value={formData.position}
                onChange={handleInputChange}
                className="field-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="status" className="field-label">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="field-select"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? 'Saving to FastAPI...' : '+ Add Application'}
            </button>
          </div>
        </form>
      </section>

      {/* Applications List Section */}
      <section className="tracker-card">
        <div className="applications-header-bar">
          <div>
            <h2 className="card-heading">Tracked Applications</h2>
            <p className="card-subheading">View, update status, or remove tracked applications.</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="refresh-btn"
            title="Reload applications and statistics from backend"
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* 8. Loading State */}
        {isLoading && applications.length === 0 && (
          <div className="state-box">
            <div className="state-icon">⏳</div>
            <h3 className="state-title">Loading Applications</h3>
            <p className="state-desc">Fetching real-time data from the FastAPI backend...</p>
          </div>
        )}

        {/* 8. Error State */}
        {fetchError && (
          <div className="state-box">
            <div className="state-icon">⚠️</div>
            <h3 className="state-title">Connection Error</h3>
            <p className="state-desc">{fetchError}</p>
            <button type="button" onClick={handleRefresh} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {/* 8. Empty State */}
        {!isLoading && !fetchError && applications.length === 0 && (
          <div className="state-box">
            <div className="state-icon">📂</div>
            <h3 className="state-title">No Applications Found</h3>
            <p className="state-desc">
              Your tracker is currently empty. Use the form above to add your first job application.
            </p>
          </div>
        )}

        {/* 2 & 3. Applications List */}
        {!fetchError && applications.length > 0 && (
          <div className="applications-grid">
            {applications.map((app) => (
              <article key={app.id} className="app-item-card">
                <div className="app-item-top">
                  <span className="app-id-pill">ID #{app.id}</span>
                  <span className={getStatusBadgeClass(app.status)}>
                    {app.status}
                  </span>
                </div>

                <div className="app-item-details">
                  <h3 className="app-position">{app.position}</h3>
                  <div className="app-company">{app.company}</div>
                </div>

                <div className="app-item-actions">
                  {/* 5. Status update control */}
                  <label className="status-select-label">
                    <span>Status:</span>
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="status-inline-select"
                      aria-label={`Update status for application ${app.id}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>

                  {/* 6. Delete action */}
                  <button
                    type="button"
                    disabled={deletingId === app.id}
                    onClick={() => handleDelete(app.id, app.company, app.position)}
                    className="btn-delete"
                    title={`Delete application #${app.id}`}
                  >
                    {deletingId === app.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
