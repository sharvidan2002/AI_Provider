import React, { useState } from 'react'
import { exportService } from '../../services/exportService'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage, { SuccessMessage } from '../common/ErrorMessage'
import { getExportTypeIcon, getExportTypeDisplayName } from '../../utils/helpers'

const ExportOptions = ({ documentId, document, onClose }) => {
  const [selectedType, setSelectedType] = useState('analysis')
  const [exportOptions, setExportOptions] = useState({
    includeOCR: false,
    includeQuiz: true,
    includeAnswers: true,
    includeKeyPoints: true,
    includeConcepts: true,
    questionType: '',
    difficulty: ''
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)
  const [error, setError] = useState(null)

  const exportTypes = [
    {
      id: 'analysis',
      name: 'Full Analysis',
      description: 'Complete document analysis with explanations, key points, and concepts',
      icon: '📋',
      recommended: true
    },
    {
      id: 'summary',
      name: 'Summary Notes',
      description: 'Clean summary with key points and concepts for quick review',
      icon: '📝',
      recommended: false
    },
    {
      id: 'quiz',
      name: 'Quiz Questions',
      description: 'Practice questions with answers and explanations',
      icon: '❓',
      recommended: document?.quizQuestions?.length > 0
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Study cards for memorization and quick review',
      icon: '🗂️',
      recommended: document?.quizQuestions?.some(q => q.type === 'flashcard')
    }
  ]

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError(null)
      setExportResult(null)

      let result
      switch (selectedType) {
        case 'analysis':
          result = await exportService.exportAnalysisPDF(documentId, {
            includeOCR: exportOptions.includeOCR,
            includeQuiz: exportOptions.includeQuiz
          })
          break
        case 'summary':
          result = await exportService.exportSummaryPDF(documentId, {
            includeKeyPoints: exportOptions.includeKeyPoints,
            includeConcepts: exportOptions.includeConcepts
          })
          break
        case 'quiz':
          result = await exportService.exportQuizPDF(documentId, {
            questionType: exportOptions.questionType,
            difficulty: exportOptions.difficulty,
            includeAnswers: exportOptions.includeAnswers
          })
          break
        case 'flashcards':
          result = await exportService.exportFlashcardsPDF(documentId)
          break
        default:
          throw new Error('Invalid export type')
      }

      setExportResult(result.data)

      // Track the export
      exportService.trackExport(selectedType, documentId, true)

    } catch (error) {
      setError(error.message || 'Export failed')
      exportService.trackExport(selectedType, documentId, false)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = async () => {
    if (!exportResult?.filename) return

    try {
      await exportService.downloadPDF(exportResult.filename)
    } catch (error) {
      setError('Download failed: ' + error.message)
    }
  }

  const updateOptions = (key, value) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  const selectedTypeConfig = exportTypes.find(type => type.id === selectedType)

  return (
    <div className="space-y-6">
      {/* Export Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Export Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{type.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{type.name}</h4>
                    {type.recommended && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Options for {selectedTypeConfig?.name}
        </h4>

        <div className="space-y-4 bg-gray-50 rounded-lg p-4">
          {selectedType === 'analysis' && (
            <>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeOCR}
                  onChange={(e) => updateOptions('includeOCR', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Include OCR Results</span>
                  <p className="text-xs text-gray-500">Raw extracted text from the image</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeQuiz}
                  onChange={(e) => updateOptions('includeQuiz', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Include Quiz Questions</span>
                  <p className="text-xs text-gray-500">Practice questions if available</p>
                </div>
              </label>
            </>
          )}

          {selectedType === 'summary' && (
            <>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeKeyPoints}
                  onChange={(e) => updateOptions('includeKeyPoints', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Include Key Points</span>
                  <p className="text-xs text-gray-500">Important takeaways and highlights</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeConcepts}
                  onChange={(e) => updateOptions('includeConcepts', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Include Concepts</span>
                  <p className="text-xs text-gray-500">Main concepts and definitions</p>
                </div>
              </label>
            </>
          )}

          {selectedType === 'quiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={exportOptions.questionType}
                  onChange={(e) => updateOptions('questionType', e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Types</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="true_false">True/False</option>
                  <option value="flashcard">Flashcards</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={exportOptions.difficulty}
                  onChange={(e) => updateOptions('difficulty', e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnswers}
                  onChange={(e) => updateOptions('includeAnswers', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Include Answer Key</span>
                  <p className="text-xs text-gray-500">Answers and explanations</p>
                </div>
              </label>
            </>
          )}

          {selectedType === 'flashcards' && (
            <div className="text-sm text-gray-600">
              <p>📚 Flashcards will be exported as printable cards with questions on one side and answers on the other.</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Success Display */}
      {exportResult && (
        <SuccessMessage
          message={`${selectedTypeConfig?.name} exported successfully! File size: ${exportService.formatFileSize(exportResult.fileSize)}`}
          onClose={() => setExportResult(null)}
        />
      )}

      {/* Export Result */}
      {exportResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{selectedTypeConfig?.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Export Completed!</h4>
              <p className="text-sm text-green-700 mt-1">
                {exportResult.filename} • {exportService.formatFileSize(exportResult.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleDownload}
              className="btn-primary"
            >
              💾 Download PDF
            </button>
            <button
              onClick={onClose}
              className="btn-outline"
            >
              ✓ Done
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!exportResult && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="btn-outline"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary"
          >
            {isExporting ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Exporting...</span>
              </>
            ) : (
              <>
                <span className="mr-2">{selectedTypeConfig?.icon}</span>
                Export as PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Export Info */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h5 className="font-medium text-blue-900 mb-2">💡 Export Tips</h5>
        <ul className="text-blue-800 space-y-1">
          <li>• PDFs are optimized for printing and sharing</li>
          <li>• All exports include document metadata and timestamps</li>
          <li>• Files are automatically cleaned up after 7 days</li>
          <li>• Large documents may take longer to export</li>
        </ul>
      </div>
    </div>
  )
}

export default ExportOptions