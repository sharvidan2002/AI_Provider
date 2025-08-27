import React, { useState, useEffect } from 'react'
import { uploadService } from '../../services/uploadService'
import { ProcessingSteps } from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const ProcessingStatus = ({
  documentId,
  status,
  onComplete,
  onRetry,
  onError
}) => {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [documentData, setDocumentData] = useState(null)
  const [error, setError] = useState(null)
  const [processingTime, setProcessingTime] = useState(0)

  const processingSteps = [
    'Uploading file...',
    'Extracting text with OCR...',
    'Analyzing content with AI...',
    'Generating quiz questions...',
    'Finding related videos...',
    'Finalizing results...'
  ]

  const getStepIndex = (status) => {
    const stepMap = {
      'pending': 0,
      'processing': 2,
      'completed': 5,
      'failed': -1
    }
    return stepMap[status] || 0
  }

  // Poll for status updates
  useEffect(() => {
    if (!documentId || currentStatus === 'completed' || currentStatus === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await uploadService.getDocumentStatus(documentId)
        const data = response.data

        setDocumentData(data)
        setCurrentStatus(data.processingStatus)

        if (data.processingStatus === 'completed') {
          onComplete(documentId)
        } else if (data.processingStatus === 'failed') {
          const errorMsg = data.error?.message || 'Processing failed'
          setError(errorMsg)
          onError(new Error(errorMsg))
        }
      } catch (error) {
        console.error('Status polling error:', error)
        setError(error.message)
        onError(error)
      }
    }, 2000)

    // Cleanup interval
    return () => clearInterval(interval)
  }, [documentId, currentStatus, onComplete, onError])

  // Track processing time
  useEffect(() => {
    if (currentStatus === 'processing' || currentStatus === 'pending') {
      const startTime = Date.now()
      const timer = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentStatus])

  const handleRetry = () => {
    setError(null)
    setCurrentStatus('pending')
    setProcessingTime(0)
    onRetry()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-blue-600 bg-blue-100',
      processing: 'text-yellow-600 bg-yellow-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      completed: '✅',
      failed: '❌'
    }
    return icons[status] || icons.pending
  }

  if (currentStatus === 'completed') {
    return null // Component should be hidden after completion
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Processing Your Document
          </h3>
          {documentData && (
            <p className="text-sm text-gray-600">
              📄 {documentData.originalFilename}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
            <span className="mr-2">{getStatusIcon(currentStatus)}</span>
            {currentStatus === 'processing' ? 'Processing' :
             currentStatus === 'pending' ? 'Starting' :
             currentStatus === 'failed' ? 'Failed' : 'Completed'}
          </div>

          {(currentStatus === 'processing' || currentStatus === 'pending') && (
            <div className="text-xs text-gray-500 mt-1">
              Time: {formatTime(processingTime)}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && currentStatus === 'failed' && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            type="error"
          />
        </div>
      )}

      {/* Processing Steps */}
      {currentStatus !== 'failed' && (
        <div className="mb-6">
          <ProcessingSteps
            steps={processingSteps}
            currentStep={getStepIndex(currentStatus)}
          />
        </div>
      )}

      {/* Processing Information */}
      <div className="space-y-3">
        {currentStatus === 'pending' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="animate-pulse">⏳</span>
            <span>Initializing processing pipeline...</span>
          </div>
        )}

        {currentStatus === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="animate-spin">🔄</span>
              <span>AI is analyzing your document...</span>
            </div>
            <div className="text-xs text-gray-500">
              This usually takes 30-60 seconds depending on document complexity
            </div>
          </div>
        )}

        {currentStatus === 'failed' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <span>❌</span>
              <span>Processing failed</span>
            </div>
            <div className="text-xs text-gray-500">
              Don't worry - you can try again or upload a different image
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicators */}
      {currentStatus !== 'failed' && (
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>
              {currentStatus === 'completed' ? '100%' :
               currentStatus === 'processing' ? '60%' : '20%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                currentStatus === 'completed' ? 'bg-green-500' :
                currentStatus === 'processing' ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{
                width: currentStatus === 'completed' ? '100%' :
                       currentStatus === 'processing' ? '60%' : '20%'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Cancel/Retry Actions */}
      <div className="flex justify-center mt-6 space-x-3">
        {currentStatus === 'failed' ? (
          <>
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              🏠 Start Over
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Processing is running in the background
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cancel and start over
            </button>
          </div>
        )}
      </div>

      {/* Tips while waiting */}
      {(currentStatus === 'processing' || currentStatus === 'pending') && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 While you wait:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Our AI is extracting text using Google Vision OCR</li>
            <li>• Content is being analyzed with Gemini AI</li>
            <li>• Quiz questions and study materials are being generated</li>
            <li>• Relevant educational videos are being found</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProcessingStatus