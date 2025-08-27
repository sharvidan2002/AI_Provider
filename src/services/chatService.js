import apiService from './api.js'

export const chatService = {
  /**
   * Start a new chat session
   */
  async startChatSession(documentId) {
    return apiService.post('/chat/start', { documentId })
  },

  /**
   * Send message in chat session
   */
  async sendMessage(sessionId, message) {
    return apiService.post(`/chat/${sessionId}/message`, { message })
  },

  /**
   * Get chat history
   */
  async getChatHistory(sessionId, limit = 50) {
    return apiService.get(`/chat/${sessionId}/history`, { limit })
  },

  /**
   * Get chat session info
   */
  async getChatSession(sessionId) {
    return apiService.get(`/chat/${sessionId}`)
  },

  /**
   * End chat session
   */
  async endChatSession(sessionId) {
    return apiService.delete(`/chat/${sessionId}`)
  },

  /**
   * Get active chat sessions for a document
   */
  async getDocumentChats(documentId, limit = 10) {
    return apiService.get(`/chat/document/${documentId}`, { limit })
  },

  /**
   * Ask a quick question without creating a session
   */
  async quickQuestion(documentId, question) {
    return apiService.post('/chat/quick', { documentId, question })
  },

  /**
   * Get chat suggestions based on document content
   */
  async getChatSuggestions(documentId) {
    return apiService.get(`/chat/suggestions/${documentId}`)
  },

  /**
   * Cleanup inactive chat sessions
   */
  async cleanupInactiveSessions(daysOld = 7) {
    return apiService.post('/chat/cleanup', {}, { daysOld })
  },

  /**
   * Format chat message for display
   */
  formatMessage(message) {
    return {
      ...message,
      id: message.id || Math.random().toString(36).substr(2, 9),
      timestamp: new Date(message.timestamp),
      formattedTime: this.formatMessageTime(message.timestamp),
      isFromUser: message.role === 'user',
      isFromAssistant: message.role === 'assistant'
    }
  },

  /**
   * Format message timestamp
   */
  formatMessageTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / 60000)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  },

  /**
   * Get predefined chat suggestions
   */
  getDefaultSuggestions() {
    return [
      "Explain this concept in simple terms",
      "What are the key points I should remember?",
      "Can you give me examples?",
      "How does this relate to other topics?",
      "Test my understanding with a question",
      "What should I study next?",
      "Summarize the main ideas",
      "Break this down step by step"
    ]
  },

  /**
   * Validate message content
   */
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required' }
    }

    const trimmed = message.trim()
    if (trimmed.length === 0) {
      return { valid: false, error: 'Message cannot be empty' }
    }

    if (trimmed.length > 1000) {
      return { valid: false, error: 'Message is too long (max 1000 characters)' }
    }

    return { valid: true, message: trimmed }
  },

  /**
   * Check if session is active
   */
  isSessionActive(session) {
    if (!session) return false

    // Check if session was created in the last 24 hours
    const sessionTime = new Date(session.createdAt || session.timestamp)
    const now = new Date()
    const hoursDiff = (now - sessionTime) / (1000 * 60 * 60)

    return hoursDiff < 24
  },

  /**
   * Get chat status color for UI
   */
  getChatStatusColor(status) {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      error: 'text-red-600 bg-red-100'
    }
    return colors[status] || colors.inactive
  },

  /**
   * Generate suggested questions based on content
   */
  generateSuggestedQuestions(analysis) {
    const suggestions = []

    if (analysis?.subject) {
      suggestions.push(`What are the fundamentals of ${analysis.subject}?`)
    }

    if (analysis?.concepts && analysis.concepts.length > 0) {
      const concept = analysis.concepts[0]
      suggestions.push(`Explain ${concept} in more detail`)
      suggestions.push(`Give me examples of ${concept}`)
    }

    if (analysis?.keyPoints && analysis.keyPoints.length > 0) {
      suggestions.push('Quiz me on the key points')
      suggestions.push('Which key point is most important?')
    }

    if (analysis?.difficulty) {
      if (analysis.difficulty === 'advanced') {
        suggestions.push('Break this down into simpler terms')
      } else {
        suggestions.push('What are the advanced concepts here?')
      }
    }

    // Add generic suggestions if we don't have enough
    const genericSuggestions = [
      'What should I focus on studying?',
      'How can I remember this better?',
      'What are common mistakes students make?',
      'How does this connect to real-world applications?'
    ]

    const allSuggestions = [...suggestions, ...genericSuggestions]
    return allSuggestions.slice(0, 6) // Return max 6 suggestions
  },

  /**
   * Calculate chat engagement metrics
   */
  calculateChatMetrics(messages) {
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')

    const totalMessages = messages.length
    const averageResponseTime = assistantMessages
      .filter(m => m.metadata?.responseTime)
      .reduce((sum, m) => sum + m.metadata.responseTime, 0) / assistantMessages.length || 0

    return {
      totalMessages,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseTime: Math.round(averageResponseTime),
      engagement: totalMessages > 10 ? 'high' : totalMessages > 5 ? 'medium' : 'low'
    }
  }
}