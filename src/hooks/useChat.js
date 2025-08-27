import { useState, useCallback, useEffect, useRef } from 'react'
import { chatService } from '../services/chatService.js'
import { validateChatMessage, validateDocumentId, validateSessionId } from '../utils/validation.js'
import { useAppContext } from '../context/AppContext.jsx'

export const useChat = (documentId) => {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const { setChatSession, setError: setGlobalError } = useAppContext()

  /**
   * Start new chat session
   */
  const startChatSession = useCallback(async (docId = documentId) => {
    if (!docId) {
      throw new Error('Document ID is required to start chat session')
    }

    try {
      setError(null)
      setIsLoading(true)

      const validation = validateDocumentId(docId)
      if (!validation.valid) {
        throw new Error(validation.errors[0])
      }

      const response = await chatService.startChatSession(docId)
      const sessionData = response.data

      setSession(sessionData)
      setMessages([])
      setChatSession(sessionData)

      // Load suggestions
      await loadSuggestions(docId)

      return sessionData

    } catch (error) {
      const errorMessage = error.message || 'Failed to start chat session'
      setError(errorMessage)
      setGlobalError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId, setChatSession, setGlobalError])

  /**
   * Send message in chat
   */
  const sendMessage = useCallback(async (message) => {
    if (!session?.sessionId) {
      throw new Error('No active chat session')
    }

    try {
      setError(null)
      setIsSending(true)

      const validation = validateChatMessage(message)
      if (!validation.valid) {
        throw new Error(validation.errors[0])
      }

      // Add user message immediately for better UX
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: validation.cleanMessage,
        timestamp: new Date(),
        isFromUser: true
      }
      setMessages(prev => [...prev, userMessage])

      const response = await chatService.sendMessage(session.sessionId, validation.cleanMessage)
      const responseData = response.data

      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseData.assistantResponse,
        timestamp: new Date(responseData.timestamp),
        isFromUser: false,
        metadata: {
          responseTime: responseData.responseTime,
          confidence: responseData.confidence
        }
      }
      setMessages(prev => [...prev, assistantMessage])

      return assistantMessage

    } catch (error) {
      const errorMessage = error.message || 'Failed to send message'
      setError(errorMessage)
      throw error
    } finally {
      setIsSending(false)
    }
  }, [session])

  /**
   * Ask quick question without session
   */
  const askQuickQuestion = useCallback(async (question, docId = documentId) => {
    if (!docId) {
      throw new Error('Document ID is required')
    }

    try {
      setError(null)
      setIsSending(true)

      const validation = validateChatMessage(question)
      if (!validation.valid) {
        throw new Error(validation.errors[0])
      }

      const response = await chatService.quickQuestion(docId, validation.cleanMessage)
      return response.data

    } catch (error) {
      const errorMessage = error.message || 'Failed to ask question'
      setError(errorMessage)
      throw error
    } finally {
      setIsSending(false)
    }
  }, [documentId])

  /**
   * Load chat history
   */
  const loadChatHistory = useCallback(async (sessionId, limit = 50) => {
    try {
      setError(null)
      setIsLoading(true)

      const validation = validateSessionId(sessionId)
      if (!validation.valid) {
        throw new Error(validation.errors[0])
      }

      const response = await chatService.getChatHistory(sessionId, limit)
      const formattedMessages = response.data.messages.map(msg =>
        chatService.formatMessage(msg)
      )

      setMessages(formattedMessages)
      return formattedMessages

    } catch (error) {
      const errorMessage = error.message || 'Failed to load chat history'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Load chat suggestions
   */
  const loadSuggestions = useCallback(async (docId = documentId) => {
    if (!docId) return

    try {
      const response = await chatService.getChatSuggestions(docId)
      setSuggestions(response.data.suggestions)
      return response.data.suggestions

    } catch (error) {
      // Don't set error for suggestions failure - use defaults
      console.warn('Failed to load suggestions:', error)
      setSuggestions(chatService.getDefaultSuggestions())
    }
  }, [documentId])

  /**
   * End chat session
   */
  const endChatSession = useCallback(async () => {
    if (!session?.sessionId) return

    try {
      await chatService.endChatSession(session.sessionId)
      setSession(null)
      setMessages([])
      setSuggestions([])
      setChatSession(null)

    } catch (error) {
      console.warn('Failed to properly end chat session:', error)
      // Still clear local state
      setSession(null)
      setMessages([])
      setSuggestions([])
      setChatSession(null)
    }
  }, [session, setChatSession])

  /**
   * Clear chat messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  /**
   * Get suggested question based on analysis
   */
  const generateSuggestions = useCallback((analysis) => {
    return chatService.generateSuggestedQuestions(analysis)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load suggestions when documentId changes
  useEffect(() => {
    if (documentId) {
      loadSuggestions(documentId)
    }
  }, [documentId, loadSuggestions])

  return {
    // State
    session,
    messages,
    suggestions,
    isLoading,
    isSending,
    error,
    messagesEndRef,

    // Actions
    startChatSession,
    sendMessage,
    askQuickQuestion,
    loadChatHistory,
    loadSuggestions,
    endChatSession,
    clearMessages,
    clearError,
    generateSuggestions,

    // Computed
    hasSession: !!session,
    hasMessages: messages.length > 0,
    isActive: session && chatService.isSessionActive(session),
    messageCount: messages.length,

    // Helpers
    formatMessage: chatService.formatMessage,
    validateMessage: validateChatMessage,
    calculateMetrics: () => chatService.calculateChatMetrics(messages)
  }
}