import apiClient from './client.js'

/**
 * Quiz API Service
 * Fetches practice track questions and metadata from FastAPI.
 */

/**
 * Fetch quiz questions and track details for a specific topic.
 *
 * @param {string} topicKey - The topic track identifier (e.g., 'react', 'fastapi', 'git')
 * @returns {Promise<Object>} The quiz track object containing title, icon, description, and questions
 */
export const fetchQuizByTopic = async (topicKey) => {
  const response = await apiClient.get(`/quizzes/${topicKey}`)
  return response.data
}

