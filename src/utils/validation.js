import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_MESSAGE_LENGTH,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  EXPORT_TYPES
} from './constants.js'

/**
 * Validate file upload
 */
export const validateFile = (file) => {
  const errors = []

  if (!file) {
    errors.push('No file provided')
    return { valid: false, errors }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    errors.push('Invalid file type. Please upload an image file (JPEG, PNG, WebP, GIF, BMP, or TIFF).')
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
    errors.push(`File too large. Maximum size is ${maxSizeMB}MB.`)
  }

  // Check if file has content
  if (file.size === 0) {
    errors.push('File appears to be empty')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate upload prompt
 */
export const validatePrompt = (prompt) => {
  const errors = []

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required')
    return { valid: false, errors }
  }

  const trimmedPrompt = prompt.trim()

  if (trimmedPrompt.length === 0) {
    errors.push('Prompt cannot be empty')
  }

  if (trimmedPrompt.length < 10) {
    errors.push('Prompt must be at least 10 characters long')
  }

  if (trimmedPrompt.length > 1000) {
    errors.push('Prompt is too long (maximum 1000 characters)')
  }

  // Check for potentially harmful content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /onclick/i,
    /onerror/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(trimmedPrompt))) {
    errors.push('Prompt contains potentially unsafe content')
  }

  return {
    valid: errors.length === 0,
    errors,
    cleanPrompt: trimmedPrompt
  }
}

/**
 * Validate chat message
 */
export const validateChatMessage = (message) => {
  const errors = []

  if (!message || typeof message !== 'string') {
    errors.push('Message is required')
    return { valid: false, errors }
  }

  const trimmedMessage = message.trim()

  if (trimmedMessage.length === 0) {
    errors.push('Message cannot be empty')
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message is too long (maximum ${MAX_MESSAGE_LENGTH} characters)`)
  }

  // Basic spam detection
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /[A-Z]{20,}/, // Too many caps
    /http[s]?:\/\/[^\s]{10,}/g // Long URLs
  ]

  if (spamPatterns.some(pattern => pattern.test(trimmedMessage))) {
    errors.push('Message appears to be spam or contains invalid content')
  }

  return {
    valid: errors.length === 0,
    errors,
    cleanMessage: trimmedMessage
  }
}

/**
 * Validate question type
 */
export const validateQuestionType = (type) => {
  const validTypes = Object.values(QUESTION_TYPES)

  if (!type) {
    return { valid: true } // Optional field
  }

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      errors: [`Invalid question type. Must be one of: ${validTypes.join(', ')}`]
    }
  }

  return { valid: true }
}

/**
 * Validate difficulty level
 */
export const validateDifficulty = (difficulty) => {
  const validDifficulties = Object.values(DIFFICULTY_LEVELS)

  if (!difficulty) {
    return { valid: true } // Optional field
  }

  if (!validDifficulties.includes(difficulty)) {
    return {
      valid: false,
      errors: [`Invalid difficulty level. Must be one of: ${validDifficulties.join(', ')}`]
    }
  }

  return { valid: true }
}

/**
 * Validate export type
 */
export const validateExportType = (type) => {
  const validTypes = Object.values(EXPORT_TYPES)

  if (!type) {
    return { valid: false, errors: ['Export type is required'] }
  }

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      errors: [`Invalid export type. Must be one of: ${validTypes.join(', ')}`]
    }
  }

  return { valid: true }
}

/**
 * Validate document ID format
 */
export const validateDocumentId = (documentId) => {
  const errors = []

  if (!documentId || typeof documentId !== 'string') {
    errors.push('Document ID is required')
    return { valid: false, errors }
  }

  // Basic format validation (assuming doc_timestamp_randomstring format)
  const documentIdPattern = /^doc_[a-z0-9]+_[a-z0-9]+$/i

  if (!documentIdPattern.test(documentId)) {
    errors.push('Invalid document ID format')
  }

  if (documentId.length < 10 || documentId.length > 100) {
    errors.push('Document ID length is invalid')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate session ID format
 */
export const validateSessionId = (sessionId) => {
  const errors = []

  if (!sessionId || typeof sessionId !== 'string') {
    errors.push('Session ID is required')
    return { valid: false, errors }
  }

  // Basic format validation (assuming session_timestamp_randomstring format)
  const sessionIdPattern = /^session_[a-z0-9]+_[a-z0-9]+$/i

  if (!sessionIdPattern.test(sessionId)) {
    errors.push('Invalid session ID format')
  }

  if (sessionId.length < 15 || sessionId.length > 100) {
    errors.push('Session ID length is invalid')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate YouTube video ID
 */
export const validateYouTubeVideoId = (videoId) => {
  const errors = []

  if (!videoId || typeof videoId !== 'string') {
    errors.push('Video ID is required')
    return { valid: false, errors }
  }

  // YouTube video IDs are exactly 11 characters long
  if (videoId.length !== 11) {
    errors.push('Invalid YouTube video ID length')
  }

  // Only alphanumeric characters, dash, and underscore are allowed
  const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/

  if (!videoIdPattern.test(videoId)) {
    errors.push('Invalid YouTube video ID format')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate search query
 */
export const validateSearchQuery = (query) => {
  const errors = []

  if (!query || typeof query !== 'string') {
    errors.push('Search query is required')
    return { valid: false, errors }
  }

  const trimmedQuery = query.trim()

  if (trimmedQuery.length === 0) {
    errors.push('Search query cannot be empty')
  }

  if (trimmedQuery.length > 100) {
    errors.push('Search query is too long (maximum 100 characters)')
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i
  ]

  if (sqlPatterns.some(pattern => pattern.test(trimmedQuery))) {
    errors.push('Search query contains invalid characters')
  }

  return {
    valid: errors.length === 0,
    errors,
    cleanQuery: trimmedQuery
  }
}

/**
 * Validate email format (for potential future use)
 */
export const validateEmail = (email) => {
  const errors = []

  if (!email || typeof email !== 'string') {
    errors.push('Email is required')
    return { valid: false, errors }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    errors.push('Invalid email format')
  }

  if (email.length > 254) {
    errors.push('Email is too long')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate positive integer
 */
export const validatePositiveInteger = (value, fieldName = 'Value') => {
  const errors = []

  if (value === undefined || value === null) {
    return { valid: true } // Optional field
  }

  const numValue = parseInt(value)

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a number`)
  } else if (numValue < 1) {
    errors.push(`${fieldName} must be a positive number`)
  } else if (numValue > 1000) {
    errors.push(`${fieldName} is too large (maximum 1000)`)
  }

  return {
    valid: errors.length === 0,
    errors,
    value: numValue
  }
}

/**
 * Validate array of strings
 */
export const validateStringArray = (arr, fieldName = 'Array') => {
  const errors = []

  if (!arr) {
    return { valid: true } // Optional field
  }

  if (!Array.isArray(arr)) {
    errors.push(`${fieldName} must be an array`)
    return { valid: false, errors }
  }

  if (arr.length > 10) {
    errors.push(`${fieldName} can contain maximum 10 items`)
  }


  return {
    valid: errors.length === 0,
    errors,
    cleanArray: arr.map(item => typeof item === 'string' ? item.trim() : item).filter(item => item.length > 0)
  }
}

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return input

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * Comprehensive validation for quiz generation options
 */
export const validateQuizOptions = (options) => {
  const errors = []

  // Validate difficulty
  const difficultyValidation = validateDifficulty(options.difficulty)
  if (!difficultyValidation.valid) {
    errors.push(...difficultyValidation.errors)
  }

  // Validate question count
  const countValidation = validatePositiveInteger(options.questionCount, 'Question count')
  if (!countValidation.valid) {
    errors.push(...countValidation.errors)
  } else if (countValidation.value > 20) {
    errors.push('Question count cannot exceed 20')
  }

  // Validate question types array
  if (options.questionTypes) {
    const typesValidation = validateStringArray(options.questionTypes, 'Question types')
    if (!typesValidation.valid) {
      errors.push(...typesValidation.errors)
    } else {
      // Validate each question type
      const validTypes = Object.values(QUESTION_TYPES)
      const invalidTypes = options.questionTypes.filter(type => !validTypes.includes(type))
      if (invalidTypes.length > 0) {
        errors.push(`Invalid question types: ${invalidTypes.join(', ')}`)
      }
    }
  }

  // Validate focus topics array
  if (options.focusTopics) {
    const topicsValidation = validateStringArray(options.focusTopics, 'Focus topics')
    if (!topicsValidation.valid) {
      errors.push(...topicsValidation.errors)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}