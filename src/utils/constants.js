// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

// File Upload Constants
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff'
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILE_SIZE_MB = 10

// Processing Status
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Question Types
export const QUESTION_TYPES = {
  MCQ: 'mcq',
  SHORT_ANSWER: 'short_answer',
  TRUE_FALSE: 'true_false',
  FLASHCARD: 'flashcard'
}

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MCQ]: 'Multiple Choice',
  [QUESTION_TYPES.SHORT_ANSWER]: 'Short Answer',
  [QUESTION_TYPES.TRUE_FALSE]: 'True/False',
  [QUESTION_TYPES.FLASHCARD]: 'Flashcard'
}

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
}

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.EASY]: 'Easy',
  [DIFFICULTY_LEVELS.MEDIUM]: 'Medium',
  [DIFFICULTY_LEVELS.HARD]: 'Hard',
  [DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY_LEVELS.ADVANCED]: 'Advanced'
}

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: 'text-green-600 bg-green-100',
  [DIFFICULTY_LEVELS.BEGINNER]: 'text-green-600 bg-green-100',
  [DIFFICULTY_LEVELS.MEDIUM]: 'text-yellow-600 bg-yellow-100',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'text-yellow-600 bg-yellow-100',
  [DIFFICULTY_LEVELS.HARD]: 'text-red-600 bg-red-100',
  [DIFFICULTY_LEVELS.ADVANCED]: 'text-red-600 bg-red-100'
}

// Export Types
export const EXPORT_TYPES = {
  ANALYSIS: 'analysis',
  QUIZ: 'quiz',
  FLASHCARDS: 'flashcards',
  SUMMARY: 'summary'
}

export const EXPORT_TYPE_LABELS = {
  [EXPORT_TYPES.ANALYSIS]: 'Full Analysis',
  [EXPORT_TYPES.QUIZ]: 'Quiz Questions',
  [EXPORT_TYPES.FLASHCARDS]: 'Flashcards',
  [EXPORT_TYPES.SUMMARY]: 'Summary Notes'
}

// Chat Constants
export const CHAT_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant'
}

export const MAX_MESSAGE_LENGTH = 1000
export const MAX_CHAT_HISTORY = 50

// YouTube Constants
export const YOUTUBE_EMBED_OPTIONS = {
  autoplay: 0,
  mute: 0,
  controls: 1,
  showinfo: 1,
  rel: 0,
  modestbranding: 1
}

export const VIDEO_SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'date', label: 'Newest' },
  { value: 'duration', label: 'Duration' }
]

// Subject Categories
export const SUBJECT_CATEGORIES = {
  MATHEMATICS: 'mathematics',
  PHYSICS: 'physics',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
  HISTORY: 'history',
  LITERATURE: 'literature',
  ENGLISH: 'english',
  SCIENCE: 'science',
  COMPUTER_SCIENCE: 'computer science',
  GENERAL: 'general'
}

export const SUBJECT_COLORS = {
  [SUBJECT_CATEGORIES.MATHEMATICS]: 'text-blue-600 bg-blue-100',
  [SUBJECT_CATEGORIES.PHYSICS]: 'text-purple-600 bg-purple-100',
  [SUBJECT_CATEGORIES.CHEMISTRY]: 'text-green-600 bg-green-100',
  [SUBJECT_CATEGORIES.BIOLOGY]: 'text-emerald-600 bg-emerald-100',
  [SUBJECT_CATEGORIES.HISTORY]: 'text-amber-600 bg-amber-100',
  [SUBJECT_CATEGORIES.LITERATURE]: 'text-pink-600 bg-pink-100',
  [SUBJECT_CATEGORIES.ENGLISH]: 'text-indigo-600 bg-indigo-100',
  [SUBJECT_CATEGORIES.SCIENCE]: 'text-teal-600 bg-teal-100',
  [SUBJECT_CATEGORIES.COMPUTER_SCIENCE]: 'text-gray-600 bg-gray-100',
  [SUBJECT_CATEGORIES.GENERAL]: 'text-gray-600 bg-gray-100'
}

// UI Constants
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
}

export const ANIMATIONS = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms'
}

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: 'text-green-600 bg-green-100',
  WARNING: 'text-yellow-600 bg-yellow-100',
  ERROR: 'text-red-600 bg-red-100',
  INFO: 'text-blue-600 bg-blue-100',
  NEUTRAL: 'text-gray-600 bg-gray-100'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  RECENT_DOCUMENTS: 'recent_documents',
  EXPORT_HISTORY: 'export_history',
  USER_PREFERENCES: 'user_preferences',
  CHAT_SESSIONS: 'chat_sessions'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  FILE_TOO_LARGE: `File too large - maximum size is ${MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Invalid file type - please upload an image file',
  UPLOAD_FAILED: 'Upload failed - please try again',
  PROCESSING_FAILED: 'Processing failed - please try again',
  ANALYSIS_FAILED: 'Analysis failed - please try again',
  CHAT_FAILED: 'Chat failed - please try again',
  EXPORT_FAILED: 'Export failed - please try again',
  GENERIC_ERROR: 'Something went wrong - please try again'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'File uploaded successfully',
  PROCESSING_COMPLETE: 'Processing completed successfully',
  EXPORT_SUCCESS: 'Export completed successfully',
  CHAT_SESSION_STARTED: 'Chat session started',
  MESSAGE_SENT: 'Message sent successfully'
}

// App Metadata
export const APP_INFO = {
  NAME: 'AI Study Helper',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered study assistant for analyzing photos and generating educational content',
  AUTHOR: 'Your Name',
  GITHUB: 'https://github.com/yourusername/ai-study-helper',
  SUPPORT_EMAIL: 'support@aistudyhelper.com'
}

// Feature Flags
export const FEATURES = {
  YOUTUBE_INTEGRATION: true,
  PDF_EXPORT: true,
  CHAT_BOT: true,
  TEACHER_MODE: true,
  ANALYTICS: false,
  GOOGLE_FORMS: true
}

// Default Values
export const DEFAULTS = {
  QUIZ_QUESTION_COUNT: 5,
  VIDEO_LIMIT: 5,
  SUMMARY_LENGTH: 'medium',
  CHAT_SUGGESTION_COUNT: 6,
  RECENT_DOCUMENTS_LIMIT: 10,
  PROCESSING_POLL_INTERVAL: 2000,
  MAX_RETRY_ATTEMPTS: 3
}