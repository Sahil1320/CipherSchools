import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client.js'

function DifficultyBadge({ difficulty }) {
  return <span className={`assignment-card__difficulty assignment-card__difficulty--${difficulty}`}>{difficulty}</span>
}

export function AssignmentListPage() {
  const [assignments, setAssignments] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    apiClient
      .getAssignments()
      .then((data) => {
        if (!isMounted) return
        setAssignments(data.assignments || [])
        setError('')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load assignments')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filtered = assignments.filter((a) => {
    const matchesDifficulty = filter === 'all' || a.difficulty === filter
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.shortDescription || '').toLowerCase().includes(search.toLowerCase())
    return matchesDifficulty && matchesSearch
  })

  return (
    <section className="page page--assignments">
      <header className="page-header">
        <h1 className="page-header__title">SQL Assignments</h1>
        <p className="page-header__subtitle">
          Choose an assignment to practice SQL against realistic sample data.
        </p>
      </header>

      <div className="assignment-filter">
        <div className="assignment-filter__group">
          <label className="assignment-filter__label">Difficulty</label>
          <select
            className="assignment-filter__select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="assignment-filter__group assignment-filter__group--search">
          <label className="assignment-filter__label">Search</label>
          <input
            className="assignment-filter__input"
            type="search"
            placeholder="Search by title or topic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="state-message">Loading assignments...</p>}
      {error && !loading && <p className="state-message state-message--error">{error}</p>}

      {!loading && !error && (
        <div className="assignment-grid">
          {filtered.map((assignment) => (
            <article
              key={assignment.id}
              className="assignment-card"
              onClick={() => navigate(`/assignments/${assignment.id}`)}
            >
              <div className="assignment-card__header">
                <h2 className="assignment-card__title">{assignment.title}</h2>
                <DifficultyBadge difficulty={assignment.difficulty} />
              </div>
              <p className="assignment-card__description">{assignment.shortDescription}</p>
              <button
                type="button"
                className="assignment-card__cta"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/assignments/${assignment.id}`)
                }}
              >
                Start assignment
              </button>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="state-message">No assignments match your filters yet.</p>
          )}
        </div>
      )}
    </section>
  )
}

