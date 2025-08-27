import React from 'react'

const ErrorMessage = ({
  message,
  type = 'error',
  onClose = null,
  onRetry = null,
  className = '',
  showIcon = true,
  dismissible = true
}) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border border-red-200',
      icon: '❌',
      text: 'text-red-700',
      button: 'text-red-600 hover:text-red-800'
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200',
      icon: '⚠️',
      text: 'text-yellow-700',
      button: 'text-yellow-600 hover:text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border border-blue-200',
      icon: 'ℹ️',
      text: 'text-blue-700',
      button: 'text-blue-600 hover:text-blue-800'
    },
    success: {
      container: 'bg-green-50 border border-green-200',
      icon: '✅',
      text: 'text-green-700',
      button: 'text-green-600 hover:text-green-800'
    }
  }

  const styles = typeStyles[type] || typeStyles.error

  if (!message) return null

  return (
    <div className={`rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            <span className="text-lg">{styles.icon}</span>
          </div>
        )}

        <div className="flex-1">
          <div className={`text-sm ${styles.text}`}>
            {typeof message === 'string' ? message : 'An error occurred'}
          </div>
        </div>

        <div className="flex-shrink-0 ml-3 flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`text-sm font-medium ${styles.button} underline hover:no-underline`}
            >
              Try Again
            </button>
          )}

          {dismissible && onClose && (
            <button
              onClick={onClose}
              className={`${styles.button} hover:opacity-75`}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Specialized error components
export const NetworkError = ({ onRetry, onClose }) => (
  <ErrorMessage
    message="Network error - please check your internet connection and try again."
    type="error"
    onRetry={onRetry}
    onClose={onClose}
  />
)

export const FileUploadError = ({ message, onRetry, onClose }) => (
  <ErrorMessage
    message={`Upload failed: ${message || 'Please try again with a valid image file.'}`}
    type="error"
    onRetry={onRetry}
    onClose={onClose}
  />
)

export const ProcessingError = ({ message, onRetry, onClose }) => (
  <ErrorMessage
    message={`Processing failed: ${message || 'Please try uploading your file again.'}`}
    type="error"
    onRetry={onRetry}
    onClose={onClose}
  />
)

export const ValidationError = ({ message, onClose }) => (
  <ErrorMessage
    message={`Validation error: ${message}`}
    type="warning"
    onClose={onClose}
  />
)

export const ApiError = ({ error, onRetry, onClose }) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.response?.data?.message) return error.response.data.message
    return 'An unexpected error occurred'
  }

  return (
    <ErrorMessage
      message={getErrorMessage(error)}
      type="error"
      onRetry={onRetry}
      onClose={onClose}
    />
  )
}

export const WarningMessage = ({ message, onClose }) => (
  <ErrorMessage
    message={message}
    type="warning"
    onClose={onClose}
  />
)

export const InfoMessage = ({ message, onClose }) => (
  <ErrorMessage
    message={message}
    type="info"
    onClose={onClose}
  />
)

export const SuccessMessage = ({ message, onClose }) => (
  <ErrorMessage
    message={message}
    type="success"
    onClose={onClose}
  />
)

// Error boundaries and fallbacks
export const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-96 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        We encountered an unexpected error. Don't worry, your data is safe.
      </p>

      <div className="space-y-3">
        <button
          onClick={resetError}
          className="btn-primary w-full"
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="btn-outline w-full"
        >
          Refresh Page
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Error Details (Dev Mode)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
            {error?.stack || error?.message || 'No error details available'}
          </pre>
        </details>
      )}
    </div>
  </div>
)

export const NotFound = ({ message = 'Page not found', onGoHome }) => (
  <div className="min-h-96 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">404</h2>
      <p className="text-gray-600 mb-6">{message}</p>

      <button
        onClick={onGoHome || (() => window.location.href = '/')}
        className="btn-primary"
      >
        Go Home
      </button>
    </div>
  </div>
)

export const EmptyState = ({
  icon = '📂',
  title = 'No items found',
  description = '',
  action = null
}) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
    )}
    {action}
  </div>
)

export default ErrorMessage