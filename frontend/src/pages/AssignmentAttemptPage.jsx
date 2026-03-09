import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { apiClient } from '../api/client.js'

function SchemaTable({ tables }) {
  if (!tables || tables.length === 0) {
    return null
  }

  return (
    <div className="schema-viewer">
      {tables.map((table) => (
        <div key={table.name} className="schema-viewer__table">
          <h3 className="schema-viewer__title">{table.name}</h3>
          <table className="schema-viewer__grid">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {(table.columns || []).map((col) => (
                <tr key={col.name}>
                  <td>{col.name}</td>
                  <td>{col.type}</td>
                  <td>{col.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function ResultTable({ result, error }) {
  if (error) {
    return <div className="result-panel result-panel--error">{error}</div>
  }

  if (!result) {
    return <div className="result-panel result-panel--empty">Run a query to see results here.</div>
  }

  if (!result.rows || result.rows.length === 0) {
    return (
      <div className="result-panel">
        <p>No rows returned.</p>
        <p className="result-panel__meta">
          Row count: {result.rowCount ?? 0} · Time: {result.executionTimeMs} ms
        </p>
      </div>
    )
  }

  return (
    <div className="result-panel">
      <div className="result-panel__scroll">
        <table className="result-table">
          <thead>
            <tr>
              {result.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, idx) => (
              <tr key={idx}>
                {result.columns.map((col) => (
                  <td key={col}>{String(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="result-panel__meta">
        Row count: {result.rowCount ?? result.rows.length} · Time: {result.executionTimeMs} ms
      </p>
    </div>
  )
}

function HintPanel({ assignmentId, sql }) {
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGetHint() {
    setLoading(true)
    setError('')
    try {
      const data = await apiClient.getHint({ assignmentId, sql })
      setHint(data.hint)
    } catch (err) {
      setError(err.message || 'Failed to fetch hint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="hint-panel">
      <div className="hint-panel__header">
        <h2 className="hint-panel__title">Need a hint?</h2>
        <p className="hint-panel__subtitle">
          Hints are meant to guide your thinking, not give full solutions.
        </p>
      </div>
      <button
        type="button"
        className="hint-panel__button"
        onClick={handleGetHint}
        disabled={loading}
      >
        {loading ? 'Getting hint...' : 'Get Hint'}
      </button>
      {error && <p className="state-message state-message--error">{error}</p>}
      {hint && <p className="hint-panel__content">{hint}</p>}
    </aside>
  )
}

export function AssignmentAttemptPage() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sql, setSql] = useState('-- Write your SQL query here\nSELECT * FROM customers;')
  const [result, setResult] = useState(null)
  const [resultError, setResultError] = useState('')
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    apiClient
      .getAssignment(id)
      .then((data) => {
        if (!isMounted) return
        setAssignment(data.assignment)
        setError('')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load assignment')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  async function handleExecute() {
    if (!sql.trim()) return
    setExecuting(true)
    setResult(null)
    setResultError('')
    try {
      const data = await apiClient.executeQuery({ assignmentId: id, sql })
      setResult(data.result)
    } catch (err) {
      setResultError(err.message || 'Failed to execute query')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <section className="page page--attempt">
      {loading && <p className="state-message">Loading assignment...</p>}
      {error && !loading && <p className="state-message state-message--error">{error}</p>}

      {assignment && !loading && (
        <>
          <header className="page-header page-header--attempt">
            <div>
              <h1 className="page-header__title">{assignment.title}</h1>
              <p className="page-header__subtitle">{assignment.shortDescription}</p>
            </div>
            <span className={`badge badge--${assignment.difficulty}`}>{assignment.difficulty}</span>
          </header>

          <div className="attempt-layout">
            <section className="attempt-layout__left">
              <div className="question-panel">
                <h2 className="question-panel__title">Assignment</h2>
                <p className="question-panel__body">{assignment.question}</p>
                <p className="question-panel__note">
                  Focus on writing a single, safe SELECT query. Data is read-only.
                </p>
              </div>

              <SchemaTable tables={assignment.tables} />
            </section>

            <section className="attempt-layout__center">
              <div className="editor-panel">
                <div className="editor-panel__header">
                  <h2 className="editor-panel__title">SQL Editor</h2>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? 'Running...' : 'Execute Query'}
                  </button>
                </div>
                <div className="editor-panel__body">
                  <Editor
                    height="260px"
                    defaultLanguage="sql"
                    value={sql}
                    onChange={(value) => setSql(value ?? '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true
                    }}
                  />
                </div>
              </div>

              <ResultTable result={result} error={resultError} />
            </section>

            <HintPanel assignmentId={id} sql={sql} />
          </div>
        </>
      )}
    </section>
  )
}

