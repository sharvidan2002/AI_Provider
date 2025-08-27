import apiService from './api.js'

export const analysisService = {
  /**
   * Get detailed analysis for a document
   */
  async getAnalysis(documentId) {
    return apiService.get(`/analysis/${documentId}`)
  },

  /**
   * Regenerate analysis with different parameters
   */
  async regenerateAnalysis(documentId, options = {}) {
    const { prompt, focusArea, difficulty } = options
    return apiService.post(`/analysis/${documentId}/regenerate`, {
      prompt,
      focusArea,
      difficulty
    })
  },

  /**
   * Get quiz questions for a document
   */
  async getQuizQuestions(documentId, filters = {}) {
    const { difficulty, questionType, count } = filters
    return apiService.get(`/analysis/${documentId}/quiz`, {
      difficulty,
      questionType,
      count
    })
  },

  /**
   * Generate custom quiz questions
   */
  async generateCustomQuiz(documentId, options = {}) {
    const {
      difficulty = 'medium',
      questionCount = 5,
      questionTypes = ['mcq', 'short_answer'],
      focusTopics = []
    } = options

    return apiService.post(`/analysis/${documentId}/quiz/custom`, {
      difficulty,
      questionCount,
      questionTypes,
      focusTopics
    })
  },

  /**
   * Get summary and key points
   */
  async getSummary(documentId, length = 'medium') {
    return apiService.get(`/analysis/${documentId}/summary`, { length })
  },

  /**
   * Search documents
   */
  async searchDocuments(searchParams = {}) {
    const {
      query,
      subject,
      difficulty,
      limit = 10,
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = searchParams

    return apiService.get('/analysis/search', {
      query,
      subject,
      difficulty,
      limit,
      sortBy,
      sortOrder
    })
  },

  /**
   * Get analysis analytics
   */
  async getAnalysisAnalytics() {
    return apiService.get('/analysis/analytics')
  },

  /**
   * Format quiz questions for display
   */
  formatQuizQuestions(questions) {
    return questions.map(question => ({
      ...question,
      id: question.id || Math.random().toString(36).substr(2, 9),
      displayType: this.getQuestionDisplayType(question.type),
      formattedOptions: this.formatQuestionOptions(question.options),
      isAnswered: false,
      userAnswer: null,
      isCorrect: null
    }))
  },

  /**
   * Get display type for question
   */
  getQuestionDisplayType(type) {
    const types = {
      mcq: 'Multiple Choice',
      short_answer: 'Short Answer',
      true_false: 'True/False',
      flashcard: 'Flashcard'
    }
    return types[type] || 'Unknown'
  },

  /**
   * Format question options for display
   */
  formatQuestionOptions(options) {
    if (!options || !Array.isArray(options)) return []

    return options.map((option, index) => ({
      ...option,
      letter: String.fromCharCode(65 + index), // A, B, C, D
      id: `option_${index}`
    }))
  },

  /**
   * Check quiz answer
   */
  checkQuizAnswer(question, userAnswer) {
    if (question.type === 'mcq') {
      const correctOption = question.options.find(opt => opt.isCorrect)
      return correctOption && correctOption.text === userAnswer
    } else if (question.type === 'true_false') {
      return question.correctAnswer.toLowerCase() === userAnswer.toLowerCase()
    } else {
      // For short answer, just return true (manual checking needed)
      return userAnswer && userAnswer.trim().length > 0
    }
  },

  /**
   * Calculate quiz score
   */
  calculateQuizScore(questions) {
    const answered = questions.filter(q => q.isAnswered)
    const correct = questions.filter(q => q.isCorrect === true)

    return {
      total: questions.length,
      answered: answered.length,
      correct: correct.length,
      percentage: answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : 0
    }
  },

  /**
   * Get difficulty color for UI
   */
  getDifficultyColor(difficulty) {
    const colors = {
      easy: 'text-green-600 bg-green-100',
      beginner: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      intermediate: 'text-yellow-600 bg-yellow-100',
      hard: 'text-red-600 bg-red-100',
      advanced: 'text-red-600 bg-red-100'
    }
    return colors[difficulty?.toLowerCase()] || 'text-gray-600 bg-gray-100'
  },

  /**
   * Get subject color for UI
   */
  getSubjectColor(subject) {
    const colors = {
      mathematics: 'text-blue-600 bg-blue-100',
      math: 'text-blue-600 bg-blue-100',
      physics: 'text-purple-600 bg-purple-100',
      chemistry: 'text-green-600 bg-green-100',
      biology: 'text-emerald-600 bg-emerald-100',
      history: 'text-amber-600 bg-amber-100',
      literature: 'text-pink-600 bg-pink-100',
      english: 'text-indigo-600 bg-indigo-100',
      science: 'text-teal-600 bg-teal-100'
    }

    const key = subject?.toLowerCase()
    for (const [subjectKey, color] of Object.entries(colors)) {
      if (key && key.includes(subjectKey)) {
        return color
      }
    }

    return 'text-gray-600 bg-gray-100'
  }
}