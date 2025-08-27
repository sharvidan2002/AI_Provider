import React, { useState, useEffect } from 'react'
import { exportService } from '../../services/exportService'
import { formatDate, formatFileSize } from '../../utils/helpers'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { ConfirmationModal } from '../common/Modal'

const ExportHistory = ({ documentId }) => {
  const [exports, setExports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadExportHistory()
  }, [documentId])

  const loadExportHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await exportService.getExportHistory(documentId)
      setExports(response.data.exports || [])
    } catch (error) {
      setError(error.message || 'Failed to load export history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (filename) => {
    try {
      await exportService.downloadPDF(filename)
    } catch (error) {
      setError('Download failed: ' + error.message)
    }
  }

  const handleDelete = async (filename) => {
    try {
      setIsDeleting(true)
      await exportService.deleteExportFile(filename)

      // Remove from local state
      setExports(prev => prev.filter(exp => exp.filename !== filename))
      setDeleteConfirm(null)
    } catch (error) {
      setError('Delete failed: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const getExportTypeIcon = (type) => {
    const icons = {
      analysis: '📋',
      quiz: '❓',
      flashcards: '🗂️',
      summary: '📝',
      unknown: '📄'
    }
    return icons[type] || icons.unknown
  }

  const getExportTypeColor = (type) => {
    const colors = {
      analysis: 'text-blue-600 bg-blue-100',
      quiz: 'text-green-600 bg-green-100',
      flashcards: 'text-purple-600 bg-purple-100',
      summary: 'text-orange-600 bg-orange-100',
      unknown: 'text-gray-600 bg-gray-100'
    }
    return colors[type] || colors.unknown
  }

  const isRecentExport = (createdAt) => {
    const now = new Date()
    const exportTime = new Date(createdAt)
    const hoursDiff = (now - exportTime) / (1000 * 60 * 60)
    return hoursDiff < 1
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="medium" text="Loading export history..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
        <button
          onClick={loadExportHistory}
          className="btn-outline text-sm"
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {exports.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-3">📄</div>
          <h4 className="font-medium text-gray-700 mb-2">No Exports Yet</h4>
          <p className="text-sm text-gray-500">
            Your exported files will appear here after you create them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exports.map((exportFile, index) => (
            <ExportItem
              key={exportFile.filename || index}
              exportFile={exportFile}
              onDownload={() => handleDownload(exportFile.filename)}
              onDelete={() => setDeleteConfirm(exportFile)}
              isRecent={isRecentExport(exportFile.createdAt)}
            />
          ))}

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Export Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{exports.length}</div>
                <div className="text-xs text-gray-600">Total Exports</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatFileSize(exports.reduce((sum, exp) => sum + (exp.size || 0), 0))}
                </div>
                <div className="text-xs text-gray-600">Total Size</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {exports.filter(exp => isRecentExport(exp.createdAt)).length}
                </div>
                <div className="text-xs text-gray-600">Recent (1h)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {new Set(exports.map(exp => exp.exportType)).size}
                </div>
                <div className="text-xs text-gray-600">Types</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm.filename)}
        title="Delete Export File"
        message={`Are you sure you want to delete "${deleteConfirm?.filename}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        type="danger"
      />
    </div>
  )
}

const ExportItem = ({ exportFile, onDownload, onDelete, isRecent }) => {
  const getExportTypeIcon = (type) => {
    const icons = {
      analysis: '📋',
      quiz: '❓',
      flashcards: '🗂️',
      summary: '📝',
      unknown: '📄'
    }
    return icons[type] || icons.unknown
  }

  const getExportTypeColor = (type) => {
    const colors = {
      analysis: 'text-blue-600 bg-blue-100',
      quiz: 'text-green-600 bg-green-100',
      flashcards: 'text-purple-600 bg-purple-100',
      summary: 'text-orange-600 bg-orange-100',
      unknown: 'text-gray-600 bg-gray-100'
    }
    return colors[type] || colors.unknown
  }

  const getExportTypeLabel = (type) => {
    const labels = {
      analysis: 'Full Analysis',
      quiz: 'Quiz Questions',
      flashcards: 'Flashcards',
      summary: 'Summary Notes',
      unknown: 'Unknown'
    }
    return labels[type] || labels.unknown
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        {/* File Icon */}
        <div className="flex-shrink-0">
          <div className="text-2xl">
            {getExportTypeIcon(exportFile.exportType)}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {exportFile.filename}
            </h4>
            {isRecent && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                New
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExportTypeColor(exportFile.exportType)}`}>
              {getExportTypeLabel(exportFile.exportType)}
            </span>
            <span>{formatFileSize(exportFile.size || 0)}</span>
            <span>{formatDate(exportFile.createdAt, { relative: true })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownload}
            className="btn-outline text-sm"
            title="Download PDF"
          >
            💾 Download
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 text-sm p-2"
            title="Delete file"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportHistory