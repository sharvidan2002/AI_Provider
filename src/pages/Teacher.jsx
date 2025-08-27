import React, { useState, useEffect } from 'react'
import FileUpload from '../components/upload/FileUpload'
import ProcessingStatus from '../components/upload/ProcessingStatus'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Modal from '../components/common/Modal'
import { useUpload } from '../hooks/useUpload'
import { useAnalysis } from '../hooks/useAnalysis'
import { useAppContext } from '../context/AppContext'
import { formatDate, getDifficultyColor, getSubjectColor } from '../utils/helpers'

const Teacher = () => {
  const [showProcessing, setShowProcessing] = useState(false)
  const [processingDocumentId, setProcessingDocumentId] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [googleFormUrl, setGoogleFormUrl] = useState('')
  const [isGeneratingForm, setIsGeneratingForm] = useState(false)

  const {
    uploadFile,
    isUploading,
    uploadProgress,
    processingStatus,
    isProcessing,
    error: uploadError,
    clearError,
    resetUpload
  } = useUpload()

  const {
    analysis,
    generateCustomQuiz,
    isLoading: analysisLoading,
    error: analysisError,
    clearError: clearAnalysisError
  } = useAnalysis(processingDocumentId)

  const {
    goHome,
    error: globalError,
    clearError: clearGlobalError
  } = useAppContext()

  const handleFileUpload = async (file, prompt) => {
    try {
      clearError()
      clearGlobalError()
      clearAnalysisError()

      // Use teacher-specific prompt enhancement
      const teacherPrompt = `As a teacher resource: ${prompt}. Please focus on educational content that can be used for creating assessments, lesson plans, and teaching materials.`

      const result = await uploadFile(file, teacherPrompt, 'analysis')
      setProcessingDocumentId(result.documentId)
      setShowProcessing(true)

    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleProcessingComplete = async (documentId) => {
    setShowProcessing(false)
    setProcessingDocumentId(documentId)

    // Auto-generate teacher questions
    try {
      await generateTeacherQuestions(documentId)
    } catch (error) {
      console.error('Failed to generate teacher questions:', error)
    }

    resetUpload()
  }

  const generateTeacherQuestions = async (documentId) => {
    try {
      const questions = await generateCustomQuiz({
        difficulty: 'mixed',
        questionCount: 10,
        questionTypes: ['mcq', 'short_answer', 'essay'],
        focusTopics: []
      }, documentId)

      // Transform questions for teacher use
      const teacherQuestions = questions.map((q, index) => ({
        ...q,
        id: index + 1,
        points: getQuestionPoints(q.type),
        rubric: generateRubric(q.type, q.difficulty),
        cognitiveLevel: getCognitiveLevel(q.type)
      }))

      setGeneratedQuestions(teacherQuestions)
      setShowQuestionsModal(true)

    } catch (error) {
      console.error('Failed to generate teacher questions:', error)
    }
  }

  const getQuestionPoints = (type) => {
    const pointsMap = {
      mcq: 2,
      short_answer: 5,
      essay: 10,
      true_false: 1
    }
    return pointsMap[type] || 5
  }

  const generateRubric = (type, difficulty) => {
    if (type === 'mcq' || type === 'true_false') {
      return 'Correct answer: full points, Incorrect: 0 points'
    } else if (type === 'short_answer') {
      return 'Full credit: Complete and accurate answer with explanation. Partial credit: Correct answer with incomplete explanation. No credit: Incorrect or no answer.'
    } else if (type === 'essay') {
      return 'Excellent (90-100%): Comprehensive answer with detailed analysis and examples. Good (70-89%): Clear answer with adequate explanation. Fair (50-69%): Basic understanding with limited detail. Poor (0-49%): Incorrect or insufficient response.'
    }
    return 'Standard grading rubric applies'
  }

  const getCognitiveLevel = (type) => {
    const levelMap = {
      mcq: 'remember',
      short_answer: 'understand',
      essay: 'analyze',
      true_false: 'remember'
    }
    return levelMap[type] || 'understand'
  }

  const generateGoogleForm = async () => {
    if (generatedQuestions.length === 0) return

    try {
      setIsGeneratingForm(true)

      // Simulate Google Form generation (in real implementation, this would call your backend)
      // For now, we'll create a mock URL
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockFormUrl = `https://forms.google.com/forms/d/mock-form-id-${Date.now()}`
      setGoogleFormUrl(mockFormUrl)

    } catch (error) {
      console.error('Failed to generate Google Form:', error)
    } finally {
      setIsGeneratingForm(false)
    }
  }

  const handleRetryUpload = () => {
    setShowProcessing(false)
    setProcessingDocumentId(null)
    setGeneratedQuestions([])
    setGoogleFormUrl('')
    resetUpload()
  }

  const handleBackToHome = () => {
    setShowProcessing(false)
    setProcessingDocumentId(null)
    setGeneratedQuestions([])
    setGoogleFormUrl('')
    resetUpload()
    goHome()
  }

  const displayError = uploadError || analysisError || globalError

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          👩‍🏫 Teacher Mode
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Upload educational content to generate assessment questions and teaching materials
        </p>

        <button
          onClick={handleBackToHome}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back to Home
        </button>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="mb-6">
          <ErrorMessage
            message={displayError}
            onClose={() => {
              clearError()
              clearGlobalError()
              clearAnalysisError()
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

      {/* Upload Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Teaching Material</h2>

        <FileUpload
          onUpload={handleFileUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          disabled={isProcessing}
          placeholder="Describe what type of questions you want to generate (e.g., 'Create quiz questions for Chapter 5 on photosynthesis')"
        />

        {/* Teacher-specific tips */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">🎯 Teacher Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload lesson content, textbook pages, or lecture slides</li>
            <li>• Specify the type of assessment you need (quiz, test, homework)</li>
            <li>• Mention difficulty level and grade level if relevant</li>
            <li>• Questions will be auto-generated with rubrics and point values</li>
          </ul>
        </div>
      </div>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generated Assessment Questions</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuestionsModal(true)}
                className="btn-outline"
              >
                📋 View All Questions
              </button>
              <button
                onClick={generateGoogleForm}
                disabled={isGeneratingForm}
                className="btn-primary"
              >
                {isGeneratingForm ? '⏳ Creating...' : '📝 Create Google Form'}
              </button>
            </div>
          </div>

          {/* Quick Preview */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{generatedQuestions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {generatedQuestions.reduce((sum, q) => sum + q.points, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(generatedQuestions.map(q => q.type)).size}
                </div>
                <div className="text-sm text-gray-600">Question Types</div>
              </div>
            </div>

            {/* Sample Questions */}
            <div>
              <h4 className="font-medium mb-2">Sample Questions:</h4>
              {generatedQuestions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {index + 1}. {question.question}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        Type: {question.displayType || question.type} •
                        Points: {question.points} •
                        Level: {question.cognitiveLevel}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
              ))}
              {generatedQuestions.length > 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  ...and {generatedQuestions.length - 3} more questions
                </p>
              )}
            </div>
          </div>

          {/* Google Form Link */}
          {googleFormUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Google Form Created!</h4>
              <p className="text-sm text-green-700 mb-3">
                Your assessment has been converted to a Google Form. Students can access it using the link below:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={googleFormUrl}
                  readOnly
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard?.writeText(googleFormUrl)}
                  className="btn-outline text-sm"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => window.open(googleFormUrl, '_blank')}
                  className="btn-primary text-sm"
                >
                  🔗 Open
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teacher Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="font-semibold mb-2">Assessment Creation</h3>
          <p className="text-sm text-gray-600">
            Generate quizzes, tests, and homework assignments with automatic grading rubrics
          </p>
        </div>

        <div className="card p-6">
          <div className="text-2xl mb-3">📝</div>
          <h3 className="font-semibold mb-2">Google Forms Integration</h3>
          <p className="text-sm text-gray-600">
            Convert questions directly into Google Forms for easy distribution to students
          </p>
        </div>

        <div className="card p-6">
          <div className="text-2xl mb-3">🎯</div>
          <h3 className="font-semibold mb-2">Cognitive Levels</h3>
          <p className="text-sm text-gray-600">
            Questions are tagged with Bloom's Taxonomy levels for better learning objectives
          </p>
        </div>

        <div className="card p-6">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="font-semibold mb-2">Grading Rubrics</h3>
          <p className="text-sm text-gray-600">
            Each question comes with detailed grading criteria and point allocations
          </p>
        </div>
      </div>

      {/* Questions Modal */}
      <Modal
        isOpen={showQuestionsModal}
        onClose={() => setShowQuestionsModal(false)}
        title="Assessment Questions"
        size="large"
      >
        <div className="space-y-6">
          {generatedQuestions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium mb-2">
                    Question {index + 1}: {question.question}
                  </h4>

                  {/* Question Options for MCQ */}
                  {question.options && question.options.length > 0 && (
                    <div className="mb-3 pl-4">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm ${option.isCorrect ? 'font-semibold text-green-600' : ''}`}>
                            {option.letter}. {option.text}
                            {option.isCorrect && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer for non-MCQ questions */}
                  {question.correctAnswer && !question.options && (
                    <div className="mb-3 pl-4">
                      <p className="text-sm"><strong>Answer:</strong> {question.correctAnswer}</p>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mb-3 pl-4">
                      <p className="text-sm text-gray-600">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm font-medium">{question.points} points</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)} mt-1`}>
                    {question.difficulty}
                  </div>
                </div>
              </div>

              {/* Question Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 border-t pt-3">
                <div>
                  <strong>Type:</strong> {question.displayType || question.type}
                </div>
                <div>
                  <strong>Cognitive Level:</strong> {question.cognitiveLevel}
                </div>
                <div>
                  <strong>Grading:</strong> Points-based
                </div>
              </div>

              {/* Rubric */}
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                <strong>Grading Rubric:</strong> {question.rubric}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default Teacher