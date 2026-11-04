import apiClient from './client.js'

/**
 * Applications API Service
 * Centralized API calls for JobFinder application endpoints.
 */

// 1. GET /health - Check backend API availability
export const fetchHealth = async () => {
  const response = await apiClient.get('/health')
  return response.data
}

// 2. GET /stats - Retrieve application status breakdown & metrics
export const fetchStats = async () => {
  const response = await apiClient.get('/stats')
  return response.data
}

// 3. GET /applications - Fetch all applications with optional query params (status, page, limit)
export const fetchApplications = async (params) => {
  const response = await apiClient.get('/applications', { params })
  return response.data
}

// 4. GET /applications/{id} - Fetch a single application by ID
export const fetchApplicationById = async (id) => {
  const response = await apiClient.get(`/applications/${id}`)
  return response.data
}

// 5. POST /applications - Create a new job application
export const createApplication = async (data) => {
  const response = await apiClient.post('/applications', data)
  return response.data
}

// 6. PUT /applications/{id} - Completely replace an existing application
export const replaceApplication = async (id, data) => {
  const response = await apiClient.put(`/applications/${id}`, data)
  return response.data
}

// 7. PATCH /applications/{id} - Partially update fields of an application
export const updateApplication = async (id, data) => {
  const response = await apiClient.patch(`/applications/${id}`, data)
  return response.data
}

// 8. DELETE /applications/{id} - Delete an application by ID
export const deleteApplication = async (id) => {
  const response = await apiClient.delete(`/applications/${id}`)
  return response.data
}

