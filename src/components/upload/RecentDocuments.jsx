import React from 'react'
import { formatDate, getDifficultyColor, getSubjectColor } from '../../utils/helpers'
import { getProcessingStatusColor } from '../../utils/helpers'

const RecentDocuments = ({
  documents = [],
  onDocumentSelect,
  onRefresh
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-3xl mb-2">📄</div>
        <p className="text-gray-500 text-sm mb-4">
          No recent documents found
        </p>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Refresh
        </button>
      </div>
    )
  }

  const handleDocumentClick = (document) => {
    if (document.isProcessed) {
      onDocumentSelect(document.documentId)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">
          Recent ({documents.length})
        </h4>
        <button
          onClick={onRefresh}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-2">
        {documents.map((document) => (
          <DocumentCard
            key={document.documentId}
            document={document}
            onClick={() => handleDocumentClick(document)}
          />
        ))}
      </div>

      {documents.length >= 10 && (
        <div className="text-center pt-3">
          <button className="text-xs text-gray-500 hover:text-gray-700 underline">
            View all documents
          </button>
        </div>
      )}
    </div>
  )
}

const DocumentCard = ({ document, onClick }) => {
  const isClickable = document.isProcessed

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200
        ${isClickable
          ? 'bg-white hover:bg-gray-50 hover:shadow-md cursor-pointer border-gray-200 hover:border-gray-300'
          : 'bg-gray-50 border-gray-100 cursor-default'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* File Icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm
          ${isClickable ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}
        `}>
          {document.isProcessed ? '📄' : '⏳'}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className={`text-sm font-medium truncate ${
              isClickable ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {document.originalFilename || 'Untitled Document'}
            </h5>

            {/* Processing Status */}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
              ${getProcessingStatusColor(document.processingStatus)}
            `}>
              {document.processingStatus === 'completed' ? '✓' :
               document.processingStatus === 'processing' ? '⏳' :
               document.processingStatus === 'failed' ? '❌' : '○'}
            </span>
          </div>

          {/* Document Metadata */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>📅 {formatDate(document.uploadedAt, { relative: true })}</span>
            {document.viewCount > 0 && (
              <span>👁️ {document.viewCount}</span>
            )}
          </div>

          {/* Subject and Difficulty Tags */}
          {document.isProcessed && document.subject && (
            <div className="flex items-center space-x-1 mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(document.subject)}`}>
                {document.subject}
              </span>

              {document.analysis?.difficulty && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(document.analysis.difficulty)}`}>
                  {document.analysis.difficulty}
                </span>
              )}
            </div>
          )}

          {/* Processing Status Messages */}
          {!document.isProcessed && (
            <div className="mt-2">
              {document.processingStatus === 'processing' && (
                <p className="text-xs text-blue-600">
                  🔄 Processing... This may take a minute
                </p>
              )}
              {document.processingStatus === 'failed' && (
                <p className="text-xs text-red-600">
                  ❌ Processing failed - click to retry
                </p>
              )}
              {document.processingStatus === 'pending' && (
                <p className="text-xs text-gray-600">
                  ⏳ Waiting to process...
                </p>
              )}
            </div>
          )}

          {/* Quick Preview for Processed Documents */}
          {document.isProcessed && document.analysis?.summary && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              {document.analysis.summary.length > 80
                ? `${document.analysis.summary.substring(0, 80)}...`
                : document.analysis.summary
              }
            </p>
          )}
        </div>

        {/* Action Indicator */}
        {isClickable && (
          <div className="flex-shrink-0 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentDocuments