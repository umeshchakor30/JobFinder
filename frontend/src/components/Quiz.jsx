import { useState, useEffect } from 'react'
import { QUIZ_DATA } from '../data/quizData.js'
import { fetchQuizByTopic } from '../api/quiz.js'

function Quiz({ topicKey, onBackToDashboard }) {
  const [quiz, setQuiz] = useState(null)
  const [loadedTopicKey, setLoadedTopicKey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryTrigger, setRetryTrigger] = useState(0)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch quiz data asynchronously when topicKey or retryTrigger changes
  useEffect(() => {
    let ignore = false

    const loadQuiz = async () => {
      try {
        const data = await fetchQuizByTopic(topicKey)
        if (!ignore) {
          setQuiz(data)
          setLoadedTopicKey(topicKey)
          setError(null)
          setCurrentIndex(0)
          setSelectedAnswers({})
          setIsSubmitted(false)
          setIsLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          // Fallback to local QUIZ_DATA if available
          const fallbackData = QUIZ_DATA[topicKey]
          if (fallbackData) {
            setQuiz(fallbackData)
            setLoadedTopicKey(topicKey)
            setError(null)
            setCurrentIndex(0)
            setSelectedAnswers({})
            setIsSubmitted(false)
          } else {
            setQuiz(null)
            setLoadedTopicKey(topicKey)
            setError(
              err.response?.data?.detail ||
              `Unable to load practice quiz for "${topicKey}". Please check your connection and try again.`
            )
          }
          setIsLoading(false)
        }
      }
    }

    loadQuiz()

    return () => {
      ignore = true
    }
  }, [topicKey, retryTrigger])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryTrigger((prev) => prev + 1)
  }

  // Derive loading state: true if initially loading or if topicKey has changed but not yet loaded
  const isTopicLoading = isLoading || loadedTopicKey !== topicKey

  // Loading Screen
  if (isTopicLoading) {
    return (
      <div className="quiz-wrapper">
        <div className="quiz-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">⏳</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Loading Practice Questions...
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Fetching questions from FastAPI backend...
          </p>
        </div>
      </div>
    )
  }

  // Error Screen (Neither API data nor fallback data available)
  if (error || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="quiz-wrapper">
        <div className="quiz-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Quiz Unavailable
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            {error || `Unable to load questions for track "${topicKey}".`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRetry}
              className="quiz-btn btn-secondary"
            >
              🔄 Retry
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="quiz-btn btn-primary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const questions = quiz.questions
  const currentQuestion = questions[currentIndex] || questions[0]
  const currentAnswers = selectedAnswers[currentQuestion.id] || []

  // Selection handler for single and multiple choice questions
  const handleOptionToggle = (optionIndex) => {
    if (isSubmitted) return

    setSelectedAnswers((prev) => {
      const existing = prev[currentQuestion.id] || []

      if (currentQuestion.type === 'single') {
        // Single choice: replace with selected option
        return {
          ...prev,
          [currentQuestion.id]: [optionIndex]
        }
      } else {
        // Multiple choice: toggle option presence
        const isAlreadySelected = existing.includes(optionIndex)
        const updated = isAlreadySelected
          ? existing.filter((idx) => idx !== optionIndex)
          : [...existing, optionIndex]

        return {
          ...prev,
          [currentQuestion.id]: updated
        }
      }
    })
  }

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setCurrentIndex(0)
    setIsSubmitted(false)
  }

  // Calculate score
  const calculateResults = () => {
    let correctCount = 0

    const questionResults = questions.map((q) => {
      const userChoices = selectedAnswers[q.id] || []
      const isCorrect =
        userChoices.length === q.correct.length &&
        q.correct.every((idx) => userChoices.includes(idx))

      if (isCorrect) {
        correctCount += 1
      }

      return {
        ...q,
        userChoices,
        isCorrect
      }
    })

    const total = questions.length
    const percentage = Math.round((correctCount / total) * 100)
    const passed = percentage >= 66

    return {
      correctCount,
      total,
      percentage,
      passed,
      questionResults
    }
  }

  // Progress percentage
  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => (selectedAnswers[qId] || []).length > 0
  ).length
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

  // Render Quiz Results Screen
  if (isSubmitted) {
    const results = calculateResults()

    return (
      <div className="quiz-wrapper">
        <div className="quiz-results-card">
          <div className="results-header">
            <span className="results-icon" role="img" aria-label={quiz.title}>
              {quiz.icon}
            </span>
            <h2 className="results-title">{quiz.title} Quiz Results</h2>
            <p className="results-subtitle">Performance breakdown and answer explanation</p>
          </div>

          <div className="score-summary-box">
            <div className={`score-badge ${results.passed ? 'badge-passed' : 'badge-practice'}`}>
              <span className="score-percent">{results.percentage}%</span>
              <span className="score-label">
                {results.passed ? '🎉 Passed' : '📚 Keep Practicing'}
              </span>
            </div>
            <p className="score-details-text">
              You answered <strong>{results.correctCount}</strong> out of <strong>{results.total}</strong> questions correctly.
            </p>
          </div>

          {/* Detailed Question Review */}
          <div className="review-section">
            <h3 className="review-heading">Answer Review &amp; Explanations</h3>
            <div className="review-list">
              {results.questionResults.map((item, idx) => (
                <div
                  key={item.id}
                  className={`review-item ${item.isCorrect ? 'review-correct' : 'review-incorrect'}`}
                >
                  <div className="review-item-header">
                    <span className="review-q-num">Question {idx + 1}</span>
                    <span className={`status-pill ${item.isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                      {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <p className="review-question-text">{item.question}</p>

                  <div className="review-options">
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.userChoices.includes(optIdx)
                      const isCorrectChoice = item.correct.includes(optIdx)

                      let optClass = 'review-opt'
                      if (isCorrectChoice) optClass += ' opt-is-correct'
                      if (isUserChoice && !isCorrectChoice) optClass += ' opt-is-wrong'

                      return (
                        <div key={optIdx} className={optClass}>
                          <span className="review-opt-text">{opt}</span>
                          <span className="review-opt-tags">
                            {isUserChoice && <span className="tag-user">Your Choice</span>}
                            {isCorrectChoice && <span className="tag-correct">Correct Answer</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="review-explanation">
                    <strong>💡 Explanation:</strong> {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="results-actions">
            <button
              type="button"
              onClick={handleRetake}
              className="quiz-btn btn-secondary"
            >
              🔄 Retake Quiz
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="quiz-btn btn-primary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Active Quiz Screen
  return (
    <div className="quiz-wrapper">
      <div className="quiz-card">
        {/* Top Header & Progress */}
        <div className="quiz-header">
          <div className="quiz-header-top">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="quiz-exit-btn"
              aria-label="Exit Quiz and return to Dashboard"
            >
              ← Exit Quiz
            </button>
            <div className="quiz-track-badge">
              <span className="track-icon">{quiz.icon}</span>
              <span className="track-title">{quiz.title} Track</span>
            </div>
          </div>

          <div className="progress-bar-container" aria-label={`Progress: ${progressPercent}%`}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="quiz-meta-row">
            <span className="quiz-step-count">
              Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>
            </span>
            <span className="quiz-answered-count">
              {answeredCount} of {questions.length} Answered
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="quiz-body">
          <div className="question-type-indicator">
            {currentQuestion.type === 'single' ? (
              <span className="type-badge badge-single">🔘 Single Choice (Select one)</span>
            ) : (
              <span className="type-badge badge-multiple">☑️ Multiple Choice (Select all that apply)</span>
            )}
          </div>

          <h3 className="quiz-question-title">{currentQuestion.question}</h3>

          {/* Options */}
          <div className="options-group" role="group" aria-label="Answer options">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = currentAnswers.includes(optIdx)

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleOptionToggle(optIdx)}
                  className={`quiz-option-btn ${isSelected ? 'option-selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className="option-indicator">
                    {currentQuestion.type === 'single' ? (
                      <span className={`radio-dot ${isSelected ? 'dot-active' : ''}`}></span>
                    ) : (
                      <span className={`check-box ${isSelected ? 'check-active' : ''}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    )}
                  </span>
                  <span className="option-label">{option}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="quiz-footer-actions">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="quiz-btn btn-prev"
          >
            ← Previous
          </button>

          <div className="right-actions">
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="quiz-btn btn-next"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="quiz-btn btn-submit"
              >
                Submit Practice Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz
