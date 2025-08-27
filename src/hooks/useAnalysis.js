import { useState, useCallback, useEffect } from 'react'
import { analysisService } from '../services/analysisService.js'
import { validateDocumentId, validateQuizOptions } from '../utils/validation.js'
import { useAppContext } from '../context/AppContext.jsx'

export const useAnalysis = (documentId) => {
  const [analysis, setAnalysis] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useAppContext()

  /**
   * Load analysis data
   */
  const loadAnalysis = useCallback(async (docId = documentId) => {
    if (!docId) return

    try {
      setError(null)
      setIsLoading(true)

      const validation = validateDocumentId(docId)
      if (!validation.valid) {
        throw new Error(validation.errors[0])
      }

      const response = await analysisService.getAnalysis(docId)
      setAnalysis(response.data.analysis)
      return response.data

    } catch (error) {
      const errorMessage = error.message || 'Failed to load analysis'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  /**
   * Load quiz questions with filters
   */
  const loadQuizQuestions = useCallback(async (filters = {}, docId = documentId) => {
    if (!docId) return

    try {
      setError(null)
      setIsLoading(true)

      const response = await analysisService.getQuizQuestions(docId, filters)
      const formattedQuestions = analysisService.formatQuizQuestions(response.data.questions)
      setQuizQuestions(formattedQuestions)
      return formattedQuestions

    } catch (error) {
      const errorMessage = error.message || 'Failed to load quiz questions'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  /**
   * Generate custom quiz
   */
  const generateCustomQuiz = useCallback(async (options = {}, docId = documentId) => {
    if (!docId) return

    try {
      setError(null)
      setIsLoading(true)

      const optionsValidation = validateQuizOptions(options)
      if (!optionsValidation.valid) {
        throw new Error(optionsValidation.errors[0])
      }

      const response = await analysisService.generateCustomQuiz(docId, options)
      const formattedQuestions = analysisService.formatQuizQuestions(response.data.questions)
      setQuizQuestions(formattedQuestions)
      return formattedQuestions

    } catch (error) {
      const errorMessage = error.message || 'Failed to generate quiz'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  /**
   * Load summary
   */
  const loadSummary = useCallback(async (length = 'medium', docId = documentId) => {
    if (!docId) return

    try {
      setError(null)
      setIsLoading(true)

      const response = await analysisService.getSummary(docId, length)
      setSummary(response.data)
      return response.data

    } catch (error) {
      const errorMessage = error.message || 'Failed to load summary'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  /**
   * Regenerate analysis
   */
  const regenerateAnalysis = useCallback(async (options = {}, docId = documentId) => {
    if (!docId) return

    try {
      setError(null)
      setIsLoading(true)

      const response = await analysisService.regenerateAnalysis(docId, options)
      setAnalysis(response.data.analysis)
      return response.data

    } catch (error) {
      const errorMessage = error.message || 'Failed to regenerate analysis'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  /**
   * Answer quiz question
   */
  const answerQuestion = useCallback((questionId, answer) => {
    setQuizQuestions(prevQuestions =>
      prevQuestions.map(question => {
        if (question.id === questionId) {
          const isCorrect = analysisService.checkQuizAnswer(question, answer)
          return {
            ...question,
            userAnswer: answer,
            isAnswered: true,
            isCorrect
          }
        }
        return question
      })
    )
  }, [])

  /**
   * Reset quiz answers
   */
  const resetQuiz = useCallback(() => {
    setQuizQuestions(prevQuestions =>
      prevQuestions.map(question => ({
        ...question,
        userAnswer: null,
        isAnswered: false,
        isCorrect: null
      }))
    )
  }, [])

  /**
   * Get quiz score
   */
  const getQuizScore = useCallback(() => {
    return analysisService.calculateQuizScore(quizQuestions)
  }, [quizQuestions])

  /**
   * Search documents
   */
  const searchDocuments = useCallback(async (searchParams) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await analysisService.searchDocuments(searchParams)
      return response.data.results

    } catch (error) {
      const errorMessage = error.message || 'Search failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Load all data for document
   */
  const loadAll = useCallback(async (docId = documentId) => {
    if (!docId) return

    try {
      setIsLoading(true)
      const [analysisData, quizData, summaryData] = await Promise.allSettled([
        loadAnalysis(docId),
        loadQuizQuestions({}, docId),
        loadSummary('medium', docId)
      ])

      const results = {
        analysis: analysisData.status === 'fulfilled' ? analysisData.value : null,
        quiz: quizData.status === 'fulfilled' ? quizData.value : [],
        summary: summaryData.status === 'fulfilled' ? summaryData.value : null
      }

      return results
    } catch (error) {
      const errorMessage = error.message || 'Failed to load data'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [documentId, loadAnalysis, loadQuizQuestions, loadSummary])

  // Auto-load data when documentId changes
  useEffect(() => {
    if (documentId) {
      loadAll(documentId).catch(console.error)
    }
  }, [documentId, loadAll])

  return {
    // State
    analysis,
    quizQuestions,
    summary,
    isLoading,
    error,

    // Actions
    loadAnalysis,
    loadQuizQuestions,
    generateCustomQuiz,
    loadSummary,
    regenerateAnalysis,
    answerQuestion,
    resetQuiz,
    searchDocuments,
    clearError,
    loadAll,

    // Computed
    quizScore: getQuizScore(),
    hasAnalysis: !!analysis,
    hasQuizQuestions: quizQuestions.length > 0,
    hasSummary: !!summary,

    // Helpers
    getDifficultyColor: analysisService.getDifficultyColor,
    getSubjectColor: analysisService.getSubjectColor
  }
}