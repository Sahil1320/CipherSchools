const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = isJson ? data.message || 'Request failed' : data
    throw new Error(message)
  }

  return data
}

export const apiClient = {
  getAssignments() {
    return request('/assignments')
  },
  getAssignment(id) {
    return request(`/assignments/${id}`)
  },
  executeQuery(payload) {
    return request('/queries/execute', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getHint(payload) {
    return request('/hints', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
}

