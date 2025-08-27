import { useState, useCallback } from 'react'
import { uploadService } from '../services/uploadService.js'
import { validateFile, validatePrompt } from '../utils/validation.js'
import { useAppContext } from '../context/AppContext.jsx'

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [error, setError] = useState(null)

  const {
    setLoading,
    setError: setGlobalError,
    addDocument,
    updateDocument,
    setCurrentDocument
  } = useAppContext()

  /**
   * Poll processing status until complete
   */
  const pollProcessingStatus = useCallback(async (documentId) => {
    try {
      const document = await uploadService.pollDocumentStatus(
        documentId,
        (updatedDocument) => {
          setProcessingStatus(updatedDocument.processingStatus)
          updateDocument(updatedDocument)
        }
      )

      setProcessingStatus('completed')
      setCurrentDocument(documentId)
      return document

    } catch (error) {
      setProcessingStatus('failed')
      const errorMessage = error.message || 'Processing failed'
      setError(errorMessage)
      throw error
    }
  }, [updateDocument, setCurrentDocument])

  /**
   * Upload file with prompt
   */
  const uploadFile = useCallback(async (file, prompt, processType = 'analysis') => {
    try {
      setError(null)
      setIsUploading(true)
      setUploadProgress(0)

      // Validate file
      const fileValidation = validateFile(file)
      if (!fileValidation.valid) {
        throw new Error(fileValidation.errors[0])
      }

      // Validate prompt
      const promptValidation = validatePrompt(prompt)
      if (!promptValidation.valid) {
        throw new Error(promptValidation.errors[0])
      }

      // Upload with progress tracking
      const response = await uploadService.uploadDocument(
        file,
        promptValidation.cleanPrompt,
        processType,
        (progress) => setUploadProgress(progress)
      )

      const documentData = response.data
      addDocument(documentData)

      // Start polling for processing status
      setProcessingStatus('pending')
      await pollProcessingStatus(documentData.documentId)

      return documentData

    } catch (error) {
      const errorMessage = error.message || 'Upload failed'
      setError(errorMessage)
      setGlobalError(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [addDocument, pollProcessingStatus, setGlobalError])

  /**
   * Retry failed processing
   */
  const retryProcessing = useCallback(async (documentId) => {
    try {
      setError(null)
      setProcessingStatus('pending')
      setLoading(true)

      await uploadService.retryProcessing(documentId)
      await pollProcessingStatus(documentId)

    } catch (error) {
      const errorMessage = error.message || 'Retry failed'
      setError(errorMessage)
      setGlobalError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setGlobalError, pollProcessingStatus])

  /**
   * Delete document
   */
  const deleteDocument = useCallback(async (documentId) => {
    try {
      setLoading(true)
      await uploadService.deleteDocument(documentId)

      // Remove from context would need to be implemented in context
      // For now just show success
      return true

    } catch (error) {
      const errorMessage = error.message || 'Delete failed'
      setError(errorMessage)
      setGlobalError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setGlobalError])

  /**
   * Get recent documents
   */
  const getRecentDocuments = useCallback(async (limit = 10) => {
    try {
      setLoading(true)
      const response = await uploadService.getRecentDocuments(limit)
      return response.data
    } catch (error) {
      const errorMessage = error.message || 'Failed to load documents'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  /**
   * Clear upload error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setIsUploading(false)
    setUploadProgress(0)
    setProcessingStatus(null)
    setError(null)
  }, [])

  return {
    // State
    isUploading,
    uploadProgress,
    processingStatus,
    error,

    // Actions
    uploadFile,
    retryProcessing,
    deleteDocument,
    getRecentDocuments,
    clearError,
    resetUpload,

    // Helpers
    isProcessing: processingStatus === 'processing' || processingStatus === 'pending',
    isCompleted: processingStatus === 'completed',
    isFailed: processingStatus === 'failed'
  }
}