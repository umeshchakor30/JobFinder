import { useState } from 'react'
import './App.css'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Quiz from './components/Quiz.jsx'
import ApplicationsTracker from './components/ApplicationsTracker'

const TOPICS = [
  {
    id: 'react',
    title: 'React.js',
    category: 'Frontend',
    icon: '⚛️',
    description: 'Component architecture, state management with hooks, virtual DOM reconciliation, and modern Vite build tooling.',
    skills: ['Components & Props', 'Hooks & State', 'Vite & JSX', 'Lifecycle']
  },
  {
    id: 'fastapi',
    title: 'Python / FastAPI',
    category: 'Backend',
    icon: '⚡',
    description: 'High-performance asynchronous REST API design, Pydantic schema validation, and automatic OpenAPI documentation.',
    skills: ['Async Endpoints', 'Pydantic Models', 'Dependency Injection', 'REST Routing']
  },
  {
    id: 'git',
    title: 'Git',
    category: 'Version Control',
    icon: '🌿',
    description: 'Branch management strategies, clean commit histories, staging techniques, and conflict resolution.',
    skills: ['Branching Models', 'Commit Hygiene', 'Merge & Rebase', 'Staging Workflows']
  },
  {
    id: 'docker',
    title: 'Docker',
    category: 'DevOps',
    icon: '🐳',
    description: 'Containerization fundamentals, multi-stage Dockerfiles for React and Python, and multi-service Docker Compose setups.',
    skills: ['Dockerfiles', 'Docker Compose', 'Container Networking', 'Image Optimization']
  },
  {
    id: 'cicd',
    title: 'CI / CD',
    category: 'Automation',
    icon: '🔄',
    description: 'Continuous integration and delivery pipelines, automated test runs, static code analysis, and GitHub Actions.',
    skills: ['GitHub Actions', 'Automated Testing', 'Build Verification', 'Deployment Hooks']
  },
  {
    id: 'vercel',
    title: 'Vercel',
    category: 'Cloud Hosting',
    icon: '▲',
    description: 'Production cloud deployments, automated preview environments for PRs, DNS configuration, and edge performance.',
    skills: ['Cloud Deployment', 'Environment Variables', 'Preview Branches', 'Edge Network']
  }
]

const CURRENT_YEAR = new Date().getFullYear()
const DEMO_SESSION_KEY = 'jobfinder_demo_session'

function App() {
  // Session restored from sessionStorage on page load/refresh (non-sensitive info only)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(DEMO_SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      console.warn('Unable to retrieve demo session from sessionStorage:', err)
      return null
    }
  })

  const [currentView, setCurrentView] = useState('dashboard')
  const [activeQuizTopic, setActiveQuizTopic] = useState('react')
  const [authNotice, setAuthNotice] = useState('')
  const [pendingQuizTopic, setPendingQuizTopic] = useState(null)

  // Guarded quiz launch
  const handleStartQuiz = (topicId) => {
    if (!currentUser) {
      setPendingQuizTopic(topicId)
      setAuthNotice('Demo sign-in required: Please sign in or create a demo account to start a practice quiz.')
      setCurrentView('login')
      return
    }

    setAuthNotice('')
    setActiveQuizTopic(topicId)
    setCurrentView('quiz')
  }

  // Navigation handlers
  const handleGoToDashboard = () => {
    setAuthNotice('')
    setCurrentView('dashboard')
  }

  // Demo Login Success
  const handleLoginSuccess = (userData) => {
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(userData))
    } catch (err) {
      console.warn('Unable to persist demo session in sessionStorage:', err)
    }

    setCurrentUser(userData)
    setAuthNotice('')

    if (pendingQuizTopic) {
      setActiveQuizTopic(pendingQuizTopic)
      setPendingQuizTopic(null)
      setCurrentView('quiz')
    } else {
      setCurrentView('dashboard')
    }
  }

  // Demo Register Success
  const handleRegisterSuccess = (userData) => {
    handleLoginSuccess(userData)
  }

  // Demo Logout: clears session storage, user state, and active quiz state
  const handleLogout = () => {
    try {
      sessionStorage.removeItem(DEMO_SESSION_KEY)
    } catch (err) {
      console.warn('Unable to clear demo session from sessionStorage:', err)
    }

    setCurrentUser(null)
    setActiveQuizTopic(null)
    setPendingQuizTopic(null)
    setAuthNotice('You have been logged out of your demo session.')
    setCurrentView('dashboard')
  }

  return (
    <div className="app-shell">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <div
            className="brand-group"
            onClick={handleGoToDashboard}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleGoToDashboard()
              }
            }}
            aria-label="JobFinder home dashboard"
          >
            <span className="brand-logo" role="img" aria-label="JobFinder Logo">💼</span>
            <div className="brand-meta">
              <span className="brand-title">JobFinder</span>
              <span className="brand-tag">Interactive Candidate Preparation</span>
            </div>
          </div>

          <div className="nav-actions">
            <nav className="nav-links">
              <button
                type="button"
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={handleGoToDashboard}
              >
                Dashboard
              </button>
              <button
                type="button"
                className={`nav-link ${currentView === 'quiz' ? 'active' : ''}`}
                onClick={() => {
                  if (currentView === 'quiz') return
                  handleGoToDashboard()
                  setTimeout(() => {
                    const el = document.getElementById('practice-topics')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 50)
                }}
              >
                Practice
              </button>
            </nav>

            {currentUser ? (
              <div className="nav-user-group">
                <div className="user-profile-pill">
                  <span className="user-avatar" role="img" aria-label="User avatar">👤</span>
                  <div className="user-details">
                    <span className="user-name">{currentUser.name}</span>
                    <span className="user-demo-tag">Demo Session</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="nav-auth-btn nav-btn-logout"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="nav-auth-group">
                <button
                  type="button"
                  className={`nav-auth-btn nav-btn-signin ${currentView === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthNotice('')
                    setCurrentView('login')
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`nav-auth-btn nav-btn-register ${currentView === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthNotice('')
                    setCurrentView('register')
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => {
              setAuthNotice('')
              setCurrentView('register')
            }}
            onBackToDashboard={handleGoToDashboard}
            authNotice={authNotice}
          />
        )}

        {currentView === 'register' && (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => {
              setAuthNotice('')
              setCurrentView('login')
            }}
            onBackToDashboard={handleGoToDashboard}
          />
        )}

        {currentView === 'quiz' && (
          currentUser ? (
            <Quiz
              topicKey={activeQuizTopic}
              onBackToDashboard={handleGoToDashboard}
            />
          ) : (
            // Quiz guard fallback in case direct state navigation is triggered without user
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setAuthNotice('')
                setCurrentView('register')
              }}
              onBackToDashboard={handleGoToDashboard}
              authNotice="Demo sign-in required: Please sign in or create a demo account to start a practice quiz."
            />
          )
        )}

        {currentView === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <section className="welcome-section">
              <div className="welcome-badge">🚀 Interactive Candidate Preparation</div>
              <h1 className="welcome-title">Master Your Tech Interview Stack</h1>
              <p className="welcome-description">
                JobFinder is your hands-on practice platform designed to prepare candidates for real-world software engineering roles.
                Select any core track below to test your technical competencies with interactive MCQs.
              </p>
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">6</span>
                  <span className="stat-label">Core Tracks</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Practical Focus</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">Full-Stack</span>
                  <span className="stat-label">React + FastAPI + MySQL</span>
                </div>
              </div>
            </section>

            {/* Practice Topics Section */}
            <section className="topics-section" id="practice-topics">
              <div className="section-header">
                <h2 className="section-title">Practice Topics</h2>
                <p className="section-subtitle">
                  {currentUser
                    ? 'Your demo session is active. Choose a topic to begin practicing!'
                    : 'Choose a topic below. A quick demo sign-in is required to start your practice session.'}
                </p>
              </div>

              <div className="topics-grid">
                {TOPICS.map((topic) => (
                  <div key={topic.id} className="topic-card">
                    <div className="card-top">
                      <span className="card-icon" role="img" aria-label={topic.title}>{topic.icon}</span>
                      <span className="card-category">{topic.category}</span>
                    </div>
                    <h3 className="card-title">{topic.title}</h3>
                    <p className="card-description">{topic.description}</p>
                    <div className="skill-pills">
                      {topic.skills.map((skill, index) => (
                        <span key={index} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <button
                        type="button"
                        onClick={() => handleStartQuiz(topic.id)}
                        className={`card-action-btn ${!currentUser ? 'card-action-locked' : ''}`}
                        aria-label={`Start practice quiz for ${topic.title}`}
                      >
                        {currentUser ? 'Start Practice Quiz →' : '🔒 Sign In to Practice'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Applications Tracker Section */}
            <ApplicationsTracker />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© {CURRENT_YEAR} JobFinder. All rights reserved. Job-Seeker Practice Platform.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
