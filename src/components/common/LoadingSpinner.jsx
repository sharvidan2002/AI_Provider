import React from 'react'

const LoadingSpinner = ({
  size = 'medium',
  color = 'blue',
  className = '',
  text = null
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
    white: 'border-white'
  }

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`

  if (text) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className={spinnerClass}></div>
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    )
  }

  return <div className={spinnerClass}></div>
}

// Specialized loading states
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <LoadingSpinner size="large" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
)

export const InlineLoading = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-4">
    <LoadingSpinner size="small" />
    <span className="ml-2 text-sm text-gray-600">{message}</span>
  </div>
)

export const ButtonLoading = ({ size = 'small', color = 'white' }) => (
  <LoadingSpinner size={size} color={color} />
)

export const UploadProgress = ({ progress = 0, status = 'Uploading...' }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">{status}</span>
      <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  </div>
)

export const ProcessingSteps = ({
  steps = [],
  currentStep = 0,
  className = ''
}) => (
  <div className={`space-y-3 ${className}`}>
    {steps.map((step, index) => (
      <div key={index} className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          index < currentStep
            ? 'bg-green-100 text-green-600'
            : index === currentStep
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 text-gray-400'
        }`}>
          {index < currentStep ? (
            '✓'
          ) : index === currentStep ? (
            <LoadingSpinner size="small" color="blue" />
          ) : (
            index + 1
          )}
        </div>
        <span className={`text-sm ${
          index <= currentStep ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {step}
        </span>
      </div>
    ))}
  </div>
)

export const LoadingCard = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
)

export const LoadingGrid = ({ count = 6, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <LoadingCard key={index} />
    ))}
  </div>
)

// Skeleton loading for specific content types
export const VideoCardSkeleton = () => (
  <div className="card p-4">
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="flex items-center space-x-2 mt-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
)

export const QuizCardSkeleton = () => (
  <div className="card p-4">
    <div className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default LoadingSpinner