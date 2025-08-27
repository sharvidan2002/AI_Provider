const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type']
    }

    try {
      const response = await fetch(url, config)

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/pdf')) {
        return response.blob()
      }

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || 'Request failed', response.status, data.error)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or other errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR')
      }

      throw new ApiError(error.message || 'An unexpected error occurred', 500, 'UNKNOWN_ERROR')
    }
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    return this.request(endpoint + url.search, { method: 'GET' })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  async downloadFile(endpoint, filename) {
    const response = await fetch(`${this.baseURL}${endpoint}`)

    if (!response.ok) {
      throw new Error('Download failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export default new ApiService()