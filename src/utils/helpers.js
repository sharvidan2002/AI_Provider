import {
  DIFFICULTY_COLORS,
  SUBJECT_COLORS,
  STATUS_COLORS,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  EXPORT_TYPE_LABELS
} from './constants.js'

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format date to readable string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''

  const d = new Date(date)
  const {
    includeTime = false,
    relative = false,
    short = false
  } = options

  if (relative) {
    return getRelativeTime(d)
  }

  const dateOptions = {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric'
  }

  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }

  return d.toLocaleDateString('en-US', dateOptions)
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return ''

  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

  if (diffInSeconds < 60) return 'Just now'

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
    }
  }

  return 'Just now'
}

/**
 * Get color class for difficulty level
 */
export const getDifficultyColor = (difficulty) => {
  if (!difficulty) return STATUS_COLORS.NEUTRAL
  return DIFFICULTY_COLORS[difficulty.toLowerCase()] || STATUS_COLORS.NEUTRAL
}

/**
 * Get color class for subject
 */
export const getSubjectColor = (subject) => {
  if (!subject) return STATUS_COLORS.NEUTRAL

  const lowerSubject = subject.toLowerCase()

  // Find matching subject color
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (lowerSubject.includes(key.replace('_', ' ')) || lowerSubject.includes(key)) {
      return color
    }
  }

  return STATUS_COLORS.NEUTRAL
}

/**
 * Get status color for processing status
 */
export const getProcessingStatusColor = (status) => {
  const colors = {
    pending: STATUS_COLORS.INFO,
    processing: STATUS_COLORS.WARNING,
    completed: STATUS_COLORS.SUCCESS,
    failed: STATUS_COLORS.ERROR
  }

  return colors[status?.toLowerCase()] || STATUS_COLORS.NEUTRAL
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Clean text for display
 */
export const cleanText = (text) => {
  if (!text) return ''

  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if file is valid image
 */
export const isValidImageFile = (file, allowedTypes, maxSize) => {
  if (!file) return { valid: false, error: 'No file provided' }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload an image file.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${formatFileSize(maxSize)}.` }
  }

  return { valid: true }
}

/**
 * Debounce function calls
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * Download blob as file
 */
export const downloadBlob = (blob, filename) => {
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

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Format quiz score as percentage
 */
export const formatQuizScore = (correct, total) => {
  if (!total || total === 0) return '0%'
  const percentage = Math.round((correct / total) * 100)
  return `${percentage}%`
}

/**
 * Get quiz score color based on percentage
 */
export const getQuizScoreColor = (correct, total) => {
  const percentage = total > 0 ? (correct / total) * 100 : 0

  if (percentage >= 80) return STATUS_COLORS.SUCCESS
  if (percentage >= 60) return STATUS_COLORS.WARNING
  return STATUS_COLORS.ERROR
}

/**
 * Format view count for YouTube videos
 */
export const formatViewCount = (count) => {
  if (!count || count === 0) return '0 views'

  const num = parseInt(count)
  if (isNaN(num)) return '0 views'

  if (num < 1000) return `${num} views`
  if (num < 1000000) return `${Math.round(num / 1000)}K views`
  if (num < 1000000000) return `${Math.round(num / 1000000)}M views`
  return `${Math.round(num / 1000000000)}B views`
}

/**
 * Format video duration
 */
export const formatVideoDuration = (duration) => {
  if (!duration || duration === 'Unknown') return duration

  // If already formatted, return as is
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration
  }

  // Convert seconds to MM:SS format
  const totalSeconds = parseInt(duration)
  if (isNaN(totalSeconds)) return duration

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
 * Get readable labels for question types, difficulties, etc.
 */
export const getQuestionTypeLabel = (type) => {
  return QUESTION_TYPE_LABELS[type] || type
}

export const getDifficultyLabel = (difficulty) => {
  return DIFFICULTY_LABELS[difficulty] || capitalize(difficulty)
}

export const getExportTypeLabel = (type) => {
  return EXPORT_TYPE_LABELS[type] || capitalize(type)
}

export const getExportTypeDisplayName = (type) => {
  return EXPORT_TYPE_LABELS[type] || capitalize(type)
}

export const getExportTypeIcon = (type) => {
  const icons = {
    analysis: '📋',
    quiz: '❓',
    flashcards: '🗂️',
    summary: '📝',
    unknown: '📄'
  }
  return icons[type] || icons.unknown
}

/**
 * Scroll element into view smoothly
 */
export const scrollToElement = (element, options = {}) => {
  if (!element) return

  const { offset = 0, behavior = 'smooth' } = options

  const elementPosition = element.offsetTop - offset

  window.scrollTo({
    top: elementPosition,
    behavior
  })
}

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element) => {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Create URL-safe slug from text
 */
export const createSlug = (text) => {
  if (!text) return ''

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse URL parameters
 */
export const getUrlParams = () => {
  const params = {}
  const queryString = window.location.search.substring(1)
  const pairs = queryString.split('&')

  for (let pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  }

  return params
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.warn(`Failed to get from localStorage: ${key}`, error)
      return defaultValue
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set to localStorage: ${key}`, error)
      return false
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error)
      return false
    }
  }
}