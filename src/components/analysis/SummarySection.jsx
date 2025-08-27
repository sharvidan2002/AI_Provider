import React, { useState } from 'react'
import { analysisService } from '../../services/analysisService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const SummarySection = ({
  documentId,
  analysis,
  summary,
  isLoading
}) => {
  const [selectedLength, setSelectedLength] = useState('medium')
  const [customSummary, setCustomSummary] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerateCustomSummary = async (length) => {
    if (!documentId) return

    try {
      setIsGenerating(true)
      setError(null)

      const response = await analysisService.getSummary(documentId, length)
      setCustomSummary(response)
      setSelectedLength(length)
    } catch (error) {
      setError(error.message || 'Failed to generate summary')
    } finally {
      setIsGenerating(false)
    }
  }

  const currentSummary = customSummary || summary
  const summaryText = currentSummary?.summary || analysis?.summary

  if (isLoading && !summaryText) {
    return <LoadingSpinner size="large" text="Loading summary..." />
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Summary Length Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Document Summary</h3>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Length:</span>
          {['short', 'medium', 'long'].map((length) => (
            <button
              key={length}
              onClick={() => handleGenerateCustomSummary(length)}
              disabled={isGenerating}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedLength === length
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {length.charAt(0).toUpperCase() + length.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Content */}
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="medium" />
          <span className="ml-3 text-gray-600">Generating summary...</span>
        </div>
      ) : summaryText ? (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">
              {summaryText}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-2">📄</div>
          <p className="text-gray-500 mb-4">No summary available</p>
          <button
            onClick={() => handleGenerateCustomSummary('medium')}
            className="btn-primary"
          >
            Generate Summary
          </button>
        </div>
      )}

      {/* Key Points */}
      {currentSummary?.keyPoints && currentSummary.keyPoints.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Key Points
          </h4>
          <div className="space-y-2">
            {currentSummary.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-green-800 text-sm leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading Statistics */}
      {currentSummary && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Reading Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {currentSummary.wordCount || 0}
              </div>
              <div className="text-xs text-gray-600">Words</div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900">
                {currentSummary.readingTime || 1}m
              </div>
              <div className="text-xs text-gray-600">Reading Time</div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900">
                {currentSummary.concepts?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Concepts</div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900">
                {currentSummary.subject || 'General'}
              </div>
              <div className="text-xs text-gray-600">Subject</div>
            </div>
          </div>
        </div>
      )}

      {/* Topics Covered */}
      {(analysis?.topics || currentSummary?.topics) && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🏷️</span>
            Topics Covered
          </h4>
          <div className="flex flex-wrap gap-2">
            {(analysis?.topics || currentSummary?.topics || []).map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 pt-4 border-t">
        <button
          onClick={() => navigator.clipboard?.writeText(summaryText)}
          className="btn-outline"
          disabled={!summaryText}
        >
          📋 Copy Summary
        </button>

        <button
          className="btn-outline"
          onClick={() => {
            const element = document.createElement('a')
            const file = new Blob([summaryText || ''], { type: 'text/plain' })
            element.href = URL.createObjectURL(file)
            element.download = 'summary.txt'
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
          }}
          disabled={!summaryText}
        >
          💾 Download
        </button>

        <button
          onClick={() => window.print()}
          className="btn-outline"
          disabled={!summaryText}
        >
          🖨️ Print
        </button>
      </div>
    </div>
  )
}

export default SummarySection