/**
 * Wrapper minimalista sobre fetch nativo.
 * Token: se inyecta vía _registerTokenGetter desde main.js
 * para evitar dependencias circulares con auth.js.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// El auth store registra un getter aquí para evitar importación circular.
let _getToken = () => ''

export function _registerTokenGetter(fn) {
  _getToken = fn
}

export async function apiFetch(path, options = {}) {
  const { parseJson = true, headers = {}, ...rest } = options

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const token = _getToken()
  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Token ${token}`
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  })

  if (!response.ok) {
    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }
    throw new ApiError(`HTTP ${response.status}`, { status: response.status, data })
  }

  if (!parseJson || response.status === 204) {
    return null
  }

  return response.json()
}

export function mediaUrl(maybeRelativePath) {
  if (!maybeRelativePath) return ''
  if (maybeRelativePath.startsWith('http')) return maybeRelativePath
  const base =
    import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000'
  const sep = maybeRelativePath.startsWith('/') ? '' : '/'
  return `${base}${sep}${maybeRelativePath}`
}

export { API_BASE_URL }
