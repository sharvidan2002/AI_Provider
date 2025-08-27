import React, { useState, useEffect } from 'react'
import AnalysisView from '../components/analysis/AnalysisView'
import ChatInterface from '../components/chat/ChatInterface'
import VideoGrid from '../components/youtube/VideoGrid'
import ExportOptions from '../components/export/ExportOptions'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Modal from '../components/common/Modal'
import { useAnalysis } from '../hooks/useAnalysis'
import { useChat } from '../hooks/useChat'
import { youtubeService } from '../services/youtubeService'
import { uploadService } from '../services/uploadService'
import { useAppContext } from '../context/AppContext'
import { formatDate, getDifficultyColor, getSubjectColor } from '../utils/helpers'

const Document = ({ documentId }) => {
  const [activeTab, setActiveTab] = useState('analysis')
  const [documentData, setDocumentData] = useState(null)
  const [youtubeVideos, setYoutubeVideos] = useState([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

  const { goHome, setError: setGlobalError } = useAppContext()

  const {
    analysis,
    quizQuestions,
    summary,
    isLoading: analysisLoading,
    error: analysisError,
    loadAll,
    clearError: clearAnalysisError
  } = useAnalysis(documentId)

  const {
    startChatSession,
    hasSession,
    error: chatError,
    clearError: clearChatError
  } = useChat(documentId)

  // Load document data on mount
  useEffect(() => {
    if (!documentId) {
      goHome()
      return
    }

    loadDocumentData()
    loadYouTubeVideos()
  }, [documentId])

  const loadDocumentData = async () => {
    try {
      const response = await uploadService.getDocumentStatus(documentId)
      setDocumentData(response.data)

      if (!response.data.isProcessed) {
        setGlobalError('Document is still being processed. Please wait...')
      }
    } catch (error) {
      setGlobalError('Failed to load document data')
      console.error('Document load error:', error)
    }
  }

  const loadYouTubeVideos = async () => {
    try {
      setIsLoadingVideos(true)
      const response = await youtubeService.getDocumentVideos(documentId, { limit: 6 })
      setYoutubeVideos(response.data.videos || [])
    } catch (error) {
      console.warn('Failed to load YouTube videos:', error)
      setYoutubeVideos([])
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const handleTabChange = async (tab) => {
    setActiveTab(tab)

    // Start chat session if switching to chat tab and no session exists
    if (tab === 'chat' && !hasSession) {
      try {
        await startChatSession(documentId)
      } catch (error) {
        console.error('Failed to start chat session:', error)
      }
    }
  }

  const handleRefreshVideos = async () => {
    try {
      setIsLoadingVideos(true)
      const response = await youtubeService.getDocumentVideos(documentId, {
        refresh: true,
        limit: 6
      })
      setYoutubeVideos(response.data.videos || [])
    } catch (error) {
      console.error('Failed to refresh videos:', error)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const clearAllErrors = () => {
    clearAnalysisError()
    clearChatError()
  }

  if (!documentId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No document selected</p>
        <button
          onClick={goHome}
          className="btn-primary mt-4"
        >
          Go Home
        </button>
      </div>
    )
  }

  if (analysisLoading && !documentData) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading document...</span>
      </div>
    )
  }

  const displayError = analysisError || chatError

  return (
    <div className="max-w-7xl mx-auto">
      {/* Document Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goHome}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn-primary"
          >
            📄 Export
          </button>
        </div>

        {documentData && (
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {documentData.originalFilename}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {formatDate(documentData.uploadedAt)}</span>
                  {documentData.analysis?.subject && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(documentData.analysis.subject)}`}>
                      {documentData.analysis.subject}
                    </span>
                  )}
                  {documentData.analysis?.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(documentData.analysis.difficulty)}`}>
                      {documentData.analysis.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Processing Status</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  documentData.isProcessed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {documentData.isProcessed ? '✅ Completed' : '⏳ Processing...'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="mb-6">
          <ErrorMessage message={displayError} onClose={clearAllErrors} />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'analysis', label: '📊 Analysis', count: null },
              { id: 'quiz', label: '❓ Quiz', count: quizQuestions?.length },
              { id: 'videos', label: '🎥 Videos', count: youtubeVideos?.length },
              { id: 'chat', label: '💬 Chat', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'analysis' && (
          <AnalysisView
            documentId={documentId}
            analysis={analysis}
            summary={summary}
            isLoading={analysisLoading}
            onRefresh={() => loadAll(documentId)}
          />
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {quizQuestions && quizQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Practice Questions</h2>
                  <div className="text-sm text-gray-500">
                    {quizQuestions.length} questions available
                  </div>
                </div>

                {/* Quiz questions would be rendered here */}
                <div className="grid gap-4">
                  {quizQuestions.slice(0, 5).map((question, index) => (
                    <div key={question.id || index} className="card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">
                            {index + 1}. {question.question}
                          </h3>
                          {question.options && question.options.length > 0 && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    className="text-blue-600"
                                  />
                                  <span className="text-sm">
                                    {option.letter}. {option.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {quizQuestions.length > 5 && (
                  <div className="text-center">
                    <button className="btn-outline">
                      Load More Questions ({quizQuestions.length - 5} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">❓</div>
                <p className="text-gray-500 mb-4">No quiz questions available yet</p>
                <button
                  onClick={() => loadAll(documentId)}
                  className="btn-primary"
                >
                  Generate Questions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Related Videos</h2>
              <button
                onClick={handleRefreshVideos}
                disabled={isLoadingVideos}
                className="btn-outline"
              >
                {isLoadingVideos ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>

            {isLoadingVideos ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
                <span className="ml-2">Loading videos...</span>
              </div>
            ) : (
              <VideoGrid
                videos={youtubeVideos}
                onRefresh={handleRefreshVideos}
              />
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatInterface documentId={documentId} />
        )}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Options"
      >
        <ExportOptions
          documentId={documentId}
          document={documentData}
          onClose={() => setShowExportModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Document