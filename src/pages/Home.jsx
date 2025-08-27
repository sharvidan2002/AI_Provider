import React, { useState, useEffect } from 'react'
import FileUpload from '../components/upload/FileUpload'
import ProcessingStatus from '../components/upload/ProcessingStatus'
import RecentDocuments from '../components/upload/RecentDocuments'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { useUpload } from '../hooks/useUpload'
import { useAppContext } from '../context/AppContext'

const Home = () => {
  const [recentDocuments, setRecentDocuments] = useState([])
  const [showProcessing, setShowProcessing] = useState(false)
  const [processingDocumentId, setProcessingDocumentId] = useState(null)

  const {
    uploadFile,
    getRecentDocuments,
    isUploading,
    uploadProgress,
    processingStatus,
    isProcessing,
    error: uploadError,
    clearError,
    resetUpload
  } = useUpload()

  const {
    isTeacherMode,
    toggleTeacherMode,
    setCurrentDocument,
    error: globalError,
    clearError: clearGlobalError
  } = useAppContext()

  // Load recent documents on component mount
  useEffect(() => {
    loadRecentDocuments()
  }, [loadRecentDocuments])

  // eslint-disable-next-line react-hooks/exhaustive-deps, no-undef
  const loadRecentDocuments = useCallback(async () => {
    try {
      const documents = await getRecentDocuments(10)
      setRecentDocuments(documents)
    } catch (error) {
      console.error('Failed to load recent documents:', error)
    }
  })

  const handleFileUpload = async (file, prompt) => {
    try {
      clearError()
      clearGlobalError()

      const result = await uploadFile(file, prompt, 'analysis')
      setProcessingDocumentId(result.documentId)
      setShowProcessing(true)

      // Refresh recent documents
      await loadRecentDocuments()

    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleProcessingComplete = (documentId) => {
    setShowProcessing(false)
    setProcessingDocumentId(null)
    setCurrentDocument(documentId)
    resetUpload()
  }

  const handleDocumentSelect = (documentId) => {
    setCurrentDocument(documentId)
  }

  const handleRetryUpload = () => {
    setShowProcessing(false)
    setProcessingDocumentId(null)
    resetUpload()
  }

  const displayError = uploadError || globalError

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Study Helper
        </h1>
        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Upload photos of your handwritten notes, textbook pages, or diagrams.
          Get instant summaries, explanations, quiz questions, and study materials powered by AI.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border shadow-sm p-1 inline-flex">
            <button
              onClick={() => !isTeacherMode || toggleTeacherMode()}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isTeacherMode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Student Mode
            </button>
            <button
              onClick={() => isTeacherMode || toggleTeacherMode()}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isTeacherMode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👩‍🏫 Teacher Mode
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              📝
            </div>
            <h3 className="font-semibold mb-2">Smart Analysis</h3>
            <p className="text-sm text-gray-600">AI extracts and analyzes content from your images</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              ❓
            </div>
            <h3 className="font-semibold mb-2">Quiz Generation</h3>
            <p className="text-sm text-gray-600">Auto-generated practice questions and flashcards</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              🎥
            </div>
            <h3 className="font-semibold mb-2">Video Suggestions</h3>
            <p className="text-sm text-gray-600">Related YouTube videos for deeper learning</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              📄
            </div>
            <h3 className="font-semibold mb-2">PDF Export</h3>
            <p className="text-sm text-gray-600">Export your study materials as PDFs</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="mb-6">
          <ErrorMessage
            message={displayError}
            onClose={() => {
              clearError()
              clearGlobalError()
            }}
          />
        </div>
      )}

      {/* Processing Status */}
      {showProcessing && processingDocumentId && (
        <div className="mb-8">
          <ProcessingStatus
            documentId={processingDocumentId}
            status={processingStatus}
            onComplete={handleProcessingComplete}
            onRetry={handleRetryUpload}
            onError={(error) => {
              console.error('Processing error:', error)
              setShowProcessing(false)
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {isTeacherMode ? 'Upload Content for Teaching' : 'Upload Your Study Material'}
            </h2>

            <FileUpload
              onUpload={handleFileUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              disabled={isProcessing}
            />

            {/* Upload Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">📋 Tips for Best Results:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure good lighting and clear text</li>
                <li>• Keep the image straight and focused</li>
                <li>• Include complete diagrams or sections</li>
                <li>• Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>

            {recentDocuments.length > 0 ? (
              <RecentDocuments
                documents={recentDocuments}
                onDocumentSelect={handleDocumentSelect}
                onRefresh={loadRecentDocuments}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📚</div>
                <p className="text-gray-500 text-sm">
                  No documents yet. Upload your first study material to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sample Use Cases */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-8">Perfect for...</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-lg border">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="font-semibold mb-2">Handwritten Notes</h3>
            <p className="text-gray-600 text-sm">
              Convert messy lecture notes into organized summaries and study guides
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border">
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-semibold mb-2">Textbook Pages</h3>
            <p className="text-gray-600 text-sm">
              Extract key concepts from dense textbook content with AI analysis
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border">
            <div className="text-3xl mb-3">🔬</div>
            <h3 className="font-semibold mb-2">Diagrams & Charts</h3>
            <p className="text-gray-600 text-sm">
              Understand complex diagrams with detailed explanations and context
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="bg-blue-50 rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Ready to supercharge your studying?</h2>
          <p className="text-gray-600 mb-4">
            Upload any study material and let AI create personalized learning resources for you.
          </p>
          <div className="text-sm text-gray-500">
            No account required • Free to use • Privacy focused
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home