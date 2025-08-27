import React, { useEffect } from 'react'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-lg shadow-xl w-full
            ${sizeClasses[size]}
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized modal components
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  const typeStyles = {
    warning: {
      icon: '⚠️',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      iconBg: 'bg-yellow-100'
    },
    danger: {
      icon: '🗑️',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      iconBg: 'bg-red-100'
    },
    info: {
      icon: 'ℹ️',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBg: 'bg-blue-100'
    }
  }

  const styles = typeStyles[type] || typeStyles.warning

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg} mb-4`}>
          <span className="text-xl">{styles.icon}</span>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`btn px-4 py-2 rounded-md font-medium transition-colors ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export const ImagePreviewModal = ({ isOpen, onClose, imageSrc, title, alt }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="large" title={title}>
    <div className="text-center">
      <img
        src={imageSrc}
        alt={alt || title || 'Preview'}
        className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
      />
      <div className="mt-4 text-sm text-gray-500">
        Click outside or press ESC to close
      </div>
    </div>
  </Modal>
)

export const FormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  children
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <form onSubmit={onSubmit}>
      <div className="space-y-4 mb-6">
        {children}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-outline"
          disabled={isSubmitting}
        >
          {cancelText}
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Saving...' : submitText}
        </button>
      </div>
    </form>
  </Modal>
)

export default Modal