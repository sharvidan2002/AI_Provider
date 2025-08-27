import apiService from './api.js'

export const exportService = {
  /**
   * Export document analysis as PDF
   */
  async exportAnalysisPDF(documentId, options = {}) {
    const { includeOCR = false, includeQuiz = true } = options
    return apiService.post(`/export/${documentId}/analysis`, {}, { includeOCR, includeQuiz })
  },

  /**
   * Export quiz questions as PDF
   */
  async exportQuizPDF(documentId, options = {}) {
    const { questionType, difficulty, includeAnswers = true } = options
    return apiService.post(`/export/${documentId}/quiz`, {}, {
      questionType,
      difficulty,
      includeAnswers
    })
  },

  /**
   * Export flashcards as PDF
   */
  async exportFlashcardsPDF(documentId) {
    return apiService.post(`/export/${documentId}/flashcards`)
  },

  /**
   * Export summary notes as PDF
   */
  async exportSummaryPDF(documentId, options = {}) {
    const { includeKeyPoints = true, includeConcepts = true } = options
    return apiService.post(`/export/${documentId}/summary`, {}, {
      includeKeyPoints,
      includeConcepts
    })
  },

  /**
   * Download PDF file
   */
  async downloadPDF(filename) {
    return apiService.downloadFile(`/export/download/${filename}`, filename)
  },

  /**
   * Get export history for a document
   */
  async getExportHistory(documentId) {
    return apiService.get(`/export/${documentId}/history`)
  },

  /**
   * Delete exported file
   */
  async deleteExportFile(filename) {
    return apiService.delete(`/export/file/${filename}`)
  },

  /**
   * Cleanup old export files
   */
  async cleanupOldExports(daysOld = 7) {
    return apiService.post('/export/cleanup', {}, { daysOld })
  },

  /**
   * Get export statistics
   */
  async getExportStats() {
    return apiService.get('/export/stats')
  },

  /**
   * Get export type display name
   */
  getExportTypeDisplayName(type) {
    const names = {
      analysis: 'Full Analysis',
      quiz: 'Quiz Questions',
      flashcards: 'Flashcards',
      summary: 'Summary Notes',
      unknown: 'Unknown'
    }
    return names[type] || names.unknown
  },

  /**
   * Get export type icon
   */
  getExportTypeIcon(type) {
    const icons = {
      analysis: '📋',
      quiz: '❓',
      flashcards: '🗂️',
      summary: '📝',
      unknown: '📄'
    }
    return icons[type] || icons.unknown
  },

  /**
   * Get export type color for UI
   */
  getExportTypeColor(type) {
    const colors = {
      analysis: 'text-blue-600 bg-blue-100',
      quiz: 'text-green-600 bg-green-100',
      flashcards: 'text-purple-600 bg-purple-100',
      summary: 'text-orange-600 bg-orange-100',
      unknown: 'text-gray-600 bg-gray-100'
    }
    return colors[type] || colors.unknown
  },

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes'

    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  },

  /**
   * Validate export options
   */
  validateExportOptions(type, options = {}) {
    const errors = []

    switch (type) {
      case 'quiz':
        if (options.questionType && !['mcq', 'short_answer', 'true_false', 'flashcard'].includes(options.questionType)) {
          errors.push('Invalid question type')
        }
        if (options.difficulty && !['easy', 'medium', 'hard'].includes(options.difficulty)) {
          errors.push('Invalid difficulty level')
        }
        break

      case 'summary':
        // Summary options are boolean, no validation needed
        break

      case 'analysis':
        // Analysis options are boolean, no validation needed
        break

      case 'flashcards':
        // No options to validate
        break
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Generate export filename
   */
  generateExportFilename(type, documentTitle, timestamp = new Date()) {
    const cleanTitle = documentTitle
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30)

    const dateStr = timestamp.toISOString().split('T')[0]
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-')

    return `${type}_${cleanTitle}_${dateStr}_${timeStr}.pdf`
  },

  /**
   * Check if export is recent
   */
  isRecentExport(createdAt, hours = 1) {
    const exportTime = new Date(createdAt)
    const now = new Date()
    const diffInHours = (now - exportTime) / (1000 * 60 * 60)

    return diffInHours < hours
  },

  /**
   * Get recommended export types based on document
   */
  getRecommendedExports(document) {
    const recommendations = []

    // Always recommend summary for any document
    recommendations.push({
      type: 'summary',
      title: 'Summary Notes',
      description: 'Key points and concepts in a clean format',
      priority: 1
    })

    // Recommend full analysis if we have detailed analysis
    if (document.analysis?.explanation) {
      recommendations.push({
        type: 'analysis',
        title: 'Full Analysis',
        description: 'Complete analysis with explanations',
        priority: 2
      })
    }

    // Recommend quiz if we have questions
    if (document.quizQuestions && document.quizQuestions.length > 0) {
      recommendations.push({
        type: 'quiz',
        title: 'Quiz Questions',
        description: `${document.quizQuestions.length} practice questions`,
        priority: 3
      })

      // Check if we have flashcard-type questions
      const hasFlashcards = document.quizQuestions.some(q => q.type === 'flashcard')
      if (hasFlashcards) {
        recommendations.push({
          type: 'flashcards',
          title: 'Flashcards',
          description: 'Interactive study cards',
          priority: 4
        })
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority)
  },

  /**
   * Track export usage
   */
  trackExport(type, documentId, success = true) {
    // This could be used for analytics
    const exportData = {
      type,
      documentId,
      success,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }

    // Store in localStorage for basic tracking
    try {
      const exports = JSON.parse(localStorage.getItem('exportHistory') || '[]')
      exports.push(exportData)

      // Keep only last 100 exports
      const recentExports = exports.slice(-100)
      localStorage.setItem('exportHistory', JSON.stringify(recentExports))
    } catch (error) {
      console.warn('Failed to track export:', error)
    }

    return exportData
  },

  /**
   * Get export history from localStorage
   */
  getLocalExportHistory() {
    try {
      const exports = JSON.parse(localStorage.getItem('exportHistory') || '[]')
      return exports.map(exp => ({
        ...exp,
        timestamp: new Date(exp.timestamp)
      }))
    } catch (error) {
      console.warn('Failed to get export history:', error)
      return []
    }
  },

  /**
   * Clear local export history
   */
  clearLocalExportHistory() {
    try {
      localStorage.removeItem('exportHistory')
    } catch (error) {
      console.warn('Failed to clear export history:', error)
    }
  }
}