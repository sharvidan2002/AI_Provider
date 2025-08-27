import React, { useState } from 'react'
import { analysisService } from '../../services/analysisService'
import LoadingSpinner from '../common/LoadingSpinner'
import { getDifficultyColor } from '../../utils/helpers'

const ConceptsSection = ({ analysis, documentId }) => {
  const [expandedConcept, setExpandedConcept] = useState(null)
  const [conceptExplanations, setConceptExplanations] = useState({})
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

  const concepts = analysis?.concepts || []
  const keyPoints = analysis?.keyPoints || []

  const handleConceptClick = async (concept, index) => {
    if (expandedConcept === index) {
      setExpandedConcept(null)
      return
    }

    setExpandedConcept(index)

    // If we don't have an explanation for this concept, generate one
    if (!conceptExplanations[concept] && documentId) {
      try {
        setIsLoadingExplanation(true)

        // Generate explanation using analysis service
        const response = await analysisService.regenerateAnalysis(documentId, {
          prompt: `Please explain the concept "${concept}" in detail, including examples and how it relates to the main content.`,
          focusArea: concept
        })

        setConceptExplanations(prev => ({
          ...prev,
          [concept]: response.data.analysis.explanation || `${concept} is a key concept discussed in this material.`
        }))
      } catch (error) {
        console.error('Failed to generate concept explanation:', error)
        setConceptExplanations(prev => ({
          ...prev,
          [concept]: `${concept} is an important concept covered in this document. Click refresh to try loading more details.`
        }))
      } finally {
        setIsLoadingExplanation(false)
      }
    }
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-3xl mb-2">🧠</div>
        <p className="text-gray-500">No analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Concepts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {concepts.length}
          </div>
          <div className="text-sm text-blue-700">Key Concepts</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {keyPoints.length}
          </div>
          <div className="text-sm text-green-700">Important Points</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {analysis.difficulty || 'Medium'}
          </div>
          <div className="text-sm text-purple-700">Difficulty Level</div>
        </div>
      </div>

      {/* Main Concepts */}
      {concepts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            Key Concepts
          </h4>
          <div className="space-y-3">
            {concepts.map((concept, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleConceptClick(concept, index)}
                  className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{concept}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(analysis.difficulty)}`}>
                      {analysis.difficulty}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedConcept === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Concept Explanation */}
                {expandedConcept === index && (
                  <div className="px-4 pb-4 bg-gray-50">
                    {isLoadingExplanation && !conceptExplanations[concept] ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="small" />
                        <span className="ml-2 text-sm text-gray-600">Loading explanation...</span>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {conceptExplanations[concept] || `${concept} is a key concept discussed in this material.`}
                        </p>

                        {/* Related points */}
                        {keyPoints.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-xs font-medium text-gray-600 mb-2">Related Points:</h6>
                            <div className="space-y-1">
                              {keyPoints.filter(point =>
                                point.toLowerCase().includes(concept.toLowerCase()) ||
                                concept.toLowerCase().includes(point.toLowerCase().split(' ')[0])
                              ).slice(0, 3).map((point, idx) => (
                                <div key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-blue-200">
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Key Points
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyPoints.map((point, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-yellow-400 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-yellow-800 text-sm leading-relaxed">{point}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Tips */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
          <span className="mr-2">📚</span>
          Study Tips
        </h4>
        <div className="space-y-2 text-sm text-green-800">
          <p>• Focus on understanding the main concepts before memorizing details</p>
          <p>• Create connections between different concepts to build a mental map</p>
          <p>• Practice explaining each concept in your own words</p>
          {concepts.length > 3 && (
            <p>• Break down complex concepts into smaller, manageable parts</p>
          )}
        </div>
      </div>

      {/* Concept Map Suggestion */}
      {concepts.length >= 3 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-purple-900 mb-2 flex items-center">
            <span className="mr-2">🗺️</span>
            Concept Map Suggestion
          </h4>
          <p className="text-sm text-purple-800 mb-3">
            Try creating a concept map with these main ideas:
          </p>
          <div className="flex flex-wrap gap-2">
            {concepts.slice(0, 5).map((concept, index) => (
              <span key={index} className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {concepts.length === 0 && keyPoints.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-3xl mb-2">🧠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Concepts Identified</h3>
          <p className="text-gray-500 mb-4">
            The AI couldn't identify specific concepts from this content.
          </p>
          <button className="btn-outline">
            🔄 Reanalyze Content
          </button>
        </div>
      )}
    </div>
  )
}

export default ConceptsSection