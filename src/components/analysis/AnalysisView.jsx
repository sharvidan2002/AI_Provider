import React, { useState } from 'react'
import SummarySection from './SummarySection'
import ConceptsSection from './ConceptsSection'
import QuizSection from './QuizSection'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { getDifficultyColor, getSubjectColor } from '../../utils/helpers'

const AnalysisView = ({
  documentId,
  analysis,
  summary,
  isLoading,
  onRefresh
}) => {
  const [activeSection, setActiveSection] = useState('overview')

  if (isLoading && !analysis) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" text="Loading analysis..." />
      </div>
    )
  }

  if (!analysis && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-500 mb-6">
          The document analysis is not ready yet or failed to process.
        </p>
        <button onClick={onRefresh} className="btn-primary">
          🔄 Try Loading Again
        </button>
      </div>
    )
  }

  const sections = [
    { id: 'overview', label: '📋 Overview', component: OverviewSection },
    { id: 'summary', label: '📄 Summary', component: SummarySection },
    { id: 'concepts', label: '🧠 Concepts', component: ConceptsSection },
    { id: 'quiz', label: '❓ Quiz', component: QuizSection }
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || OverviewSection

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      {analysis && (
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Document Analysis</h2>

              {/* Metadata Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {analysis.subject && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(analysis.subject)}`}>
                    📚 {analysis.subject}
                  </span>
                )}

                {analysis.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(analysis.difficulty)}`}>
                    🎯 {analysis.difficulty}
                  </span>
                )}

                {analysis.topics && analysis.topics.length > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    🏷️ {analysis.topics.length} topics
                  </span>
                )}

                {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    💡 {analysis.keyPoints.length} key points
                  </span>
                )}
              </div>

              {/* Quick Summary */}
              {analysis.summary && (
                <p className="text-gray-600 leading-relaxed">
                  {analysis.summary.length > 200
                    ? `${analysis.summary.substring(0, 200)}...`
                    : analysis.summary
                  }
                </p>
              )}
            </div>

            <button
              onClick={onRefresh}
              className="btn-outline ml-4"
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </button>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        <div className="p-6">
          <ActiveComponent
            documentId={documentId}
            analysis={analysis}
            summary={summary}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  )
}

// Overview Section Component
const OverviewSection = ({ analysis, summary }) => {
  if (!analysis) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-3xl mb-2">📊</div>
        <p className="text-gray-500">No analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {analysis.summary && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">📄</span>
            Summary
          </h3>
          <p className="text-blue-800 leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {analysis.concepts?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Concepts Identified</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {analysis.keyPoints?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Key Points</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {analysis.topics?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Topics Covered</div>
        </div>
      </div>

      {/* Detailed Explanation */}
      {analysis.explanation && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📝</span>
            Detailed Explanation
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {analysis.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Subject</div>
          <div className="text-xs text-gray-600 mt-1">
            {analysis.subject || 'Not identified'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Difficulty</div>
          <div className="text-xs text-gray-600 mt-1">
            {analysis.difficulty || 'Not assessed'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Processed</div>
          <div className="text-xs text-gray-600 mt-1">
            {analysis.processedAt
              ? new Date(analysis.processedAt).toLocaleDateString()
              : 'Unknown'
            }
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Status</div>
          <div className="text-xs text-green-600 mt-1">
            ✅ Complete
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisView