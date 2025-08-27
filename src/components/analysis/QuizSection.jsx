import React, { useState } from 'react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { getDifficultyColor, getQuestionTypeLabel } from '../../utils/helpers'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import Modal from '../common/Modal'

const QuizSection = ({ documentId }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [showCustomQuizModal, setShowCustomQuizModal] = useState(false)
  const [quizFilters, setQuizFilters] = useState({
    difficulty: '',
    questionType: '',
    count: 5
  })

  const {
    quizQuestions,
    loadQuizQuestions,
    generateCustomQuiz,
    answerQuestion,
    resetQuiz,
    quizScore,
    isLoading,
    error,
    clearError
  } = useAnalysis(documentId)

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
    answerQuestion(questionId, answer)
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setShowResults(false)
    resetQuiz()
  }

  const handleGenerateCustomQuiz = async (options) => {
    try {
      await generateCustomQuiz(options)
      setShowCustomQuizModal(false)
      handleResetQuiz()
    } catch (error) {
      console.error('Failed to generate custom quiz:', error)
    }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (isLoading && !quizQuestions.length) {
    return <LoadingSpinner size="large" text="Loading quiz questions..." />
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
        />
      )}

      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Practice Quiz</h3>
          {quizQuestions.length > 0 && (
            <p className="text-sm text-gray-600">
              {quizQuestions.length} questions • Test your understanding
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowCustomQuizModal(true)}
            className="btn-outline"
          >
            ⚙️ Custom Quiz
          </button>
          {quizQuestions.length > 0 && (
            <button
              onClick={handleResetQuiz}
              className="btn-outline"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Quiz Results */}
      {showResults && quizScore && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Quiz Results
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(quizScore.percentage)}`}>
                {quizScore.percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Score</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizScore.correct}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizScore.answered}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quizScore.total}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={handleResetQuiz}
              className="btn-primary"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => setShowCustomQuizModal(true)}
              className="btn-outline"
            >
              📝 New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {quizQuestions.length > 0 ? (
        <div className="space-y-4">
          {quizQuestions.map((question, index) => (
            <QuestionCard
              key={question.id || index}
              question={question}
              questionNumber={index + 1}
              selectedAnswer={selectedAnswers[question.id]}
              onAnswerSelect={(answer) => handleAnswerSelect(question.id, answer)}
              showResult={showResults}
            />
          ))}

          {/* Submit Button */}
          {!showResults && Object.keys(selectedAnswers).length > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmitQuiz}
                className="btn-primary px-8"
              >
                📊 Submit Quiz ({Object.keys(selectedAnswers).length}/{quizQuestions.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Questions Available</h3>
          <p className="text-gray-500 mb-6">
            Generate practice questions to test your understanding of this content.
          </p>
          <button
            onClick={() => setShowCustomQuizModal(true)}
            className="btn-primary"
          >
            📝 Generate Quiz
          </button>
        </div>
      )}

      {/* Custom Quiz Modal */}
      <CustomQuizModal
        isOpen={showCustomQuizModal}
        onClose={() => setShowCustomQuizModal(false)}
        onGenerate={handleGenerateCustomQuiz}
        filters={quizFilters}
        onFiltersChange={setQuizFilters}
        isLoading={isLoading}
      />
    </div>
  )
}

const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  showResult
}) => {
  const isCorrect = showResult && question.isCorrect
  const isIncorrect = showResult && question.isAnswered && !question.isCorrect

  return (
    <div className={`card p-6 ${
      showResult
        ? isCorrect
          ? 'border-green-200 bg-green-50'
          : isIncorrect
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200'
        : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h5 className="text-md font-medium text-gray-900 mb-2">
            {questionNumber}. {question.question}
          </h5>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {getQuestionTypeLabel(question.type)}
          </span>
        </div>
      </div>

      {/* Multiple Choice Options */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.text
            const isCorrectOption = showResult && option.isCorrect

            return (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                  showResult
                    ? isCorrectOption
                      ? 'bg-green-100 border-green-300'
                      : isSelected && !isCorrectOption
                      ? 'bg-red-100 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                    : isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } border`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.text}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(option.text)}
                  disabled={showResult}
                  className="mr-3 text-blue-600"
                />
                <span className={`flex-1 ${
                  showResult && isCorrectOption ? 'font-medium text-green-800' : 'text-gray-700'
                }`}>
                  {option.letter}. {option.text}
                </span>
                {showResult && isCorrectOption && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <span className="text-red-600 ml-2">✗</span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {/* Short Answer */}
      {question.type === 'short_answer' && (
        <div className="mb-4">
          <textarea
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            placeholder="Type your answer here..."
            disabled={showResult}
            className="input w-full min-h-[80px] resize-y"
          />
        </div>
      )}

      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="flex space-x-4 mb-4">
          {['True', 'False'].map((option) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = showResult && question.correctAnswer?.toLowerCase() === option.toLowerCase()

            return (
              <label
                key={option}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                  showResult
                    ? isCorrectOption
                      ? 'bg-green-100 border-green-300'
                      : isSelected && !isCorrectOption
                      ? 'bg-red-100 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                    : isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(option)}
                  disabled={showResult}
                  className="mr-2 text-blue-600"
                />
                <span className={showResult && isCorrectOption ? 'font-medium text-green-800' : 'text-gray-700'}>
                  {option}
                </span>
                {showResult && isCorrectOption && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {/* Explanation */}
      {showResult && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h6 className="text-sm font-medium text-blue-900 mb-1">Explanation</h6>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}

      {/* Correct Answer for Non-MCQ */}
      {showResult && question.correctAnswer && question.type !== 'mcq' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
          <h6 className="text-sm font-medium text-green-900 mb-1">Correct Answer</h6>
          <p className="text-sm text-green-800">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  )
}

const CustomQuizModal = ({
  isOpen,
  onClose,
  onGenerate,
  filters,
  onFiltersChange,
  isLoading
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(filters)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Custom Quiz">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFiltersChange({ ...filters, difficulty: e.target.value })}
            className="input w-full"
          >
            <option value="">Any Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={filters.questionType}
            onChange={(e) => onFiltersChange({ ...filters, questionType: e.target.value })}
            className="input w-full"
          >
            <option value="">Mixed Types</option>
            <option value="mcq">Multiple Choice</option>
            <option value="short_answer">Short Answer</option>
            <option value="true_false">True/False</option>
            <option value="flashcard">Flashcard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            value={filters.count}
            onChange={(e) => onFiltersChange({ ...filters, count: parseInt(e.target.value) })}
            className="input w-full"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Generating...' : '🎯 Generate Quiz'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default QuizSection