import React from 'react'

const ChatSuggestions = ({
  suggestions = [],
  onSuggestionClick,
  disabled = false,
  showTitle = true
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {showTitle && (
        <p className="text-xs font-medium text-gray-500">💡 Suggestions:</p>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <SuggestionButton
            key={index}
            suggestion={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

const SuggestionButton = ({ suggestion, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
        transition-all duration-200 hover:shadow-sm text-left
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
        }
      `}
      title={suggestion}
    >
      <span className="line-clamp-2">
        {suggestion.length > 60 ? `${suggestion.substring(0, 60)}...` : suggestion}
      </span>
    </button>
  )
}

// Specialized suggestion components
export const QuickSuggestions = ({ documentId, analysis, onSuggestionClick, disabled }) => {
  const generateQuickSuggestions = () => {
    const suggestions = ['Can you explain this in simple terms?']

    if (analysis?.concepts && analysis.concepts.length > 0) {
      suggestions.push(`Tell me more about ${analysis.concepts[0]}`)
    }

    if (analysis?.difficulty === 'advanced') {
      suggestions.push('Can you break this down for beginners?')
    }

    if (analysis?.keyPoints && analysis.keyPoints.length > 0) {
      suggestions.push('What are the most important points?')
    }

    suggestions.push('Quiz me on this content')

    return suggestions.slice(0, 4)
  }

  return (
    <ChatSuggestions
      suggestions={generateQuickSuggestions()}
      onSuggestionClick={onSuggestionClick}
      disabled={disabled}
      showTitle={false}
    />
  )
}

export const ContextualSuggestions = ({
  lastMessage,
  analysis,
  onSuggestionClick,
  disabled
}) => {
  const generateContextualSuggestions = () => {
    const suggestions = []

    if (lastMessage && lastMessage.content) {
      const content = lastMessage.content.toLowerCase()

      if (content.includes('explain') || content.includes('what is')) {
        suggestions.push('Can you give me an example?')
        suggestions.push('How does this apply in practice?')
      }

      if (content.includes('example') || content.includes('practice')) {
        suggestions.push('Are there any other examples?')
        suggestions.push('What are common mistakes here?')
      }

      if (content.includes('difficult') || content.includes('hard')) {
        suggestions.push('Can you explain it step by step?')
        suggestions.push('What are the basics I should know first?')
      }

      if (content.includes('quiz') || content.includes('test')) {
        suggestions.push('Give me another question')
        suggestions.push('How can I remember this better?')
      }
    }

    // Fallback suggestions
    if (suggestions.length === 0) {
      suggestions.push('What should I focus on studying?')
      suggestions.push('Can you create a summary?')
      suggestions.push('Test my understanding')
    }

    return suggestions.slice(0, 3)
  }

  return (
    <ChatSuggestions
      suggestions={generateContextualSuggestions()}
      onSuggestionClick={onSuggestionClick}
      disabled={disabled}
      showTitle={false}
    />
  )
}

export const WelcomeSuggestions = ({ onSuggestionClick, disabled }) => {
  const welcomeSuggestions = [
    "What's the main idea of this document?",
    "Can you summarize the key points?",
    "Create some practice questions for me",
    "Explain the most important concept",
    "What should I remember from this?",
    "Help me understand the difficult parts"
  ]

  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-gray-600">
        🤖 I'm here to help you study! Try asking me:
      </p>
      <ChatSuggestions
        suggestions={welcomeSuggestions}
        onSuggestionClick={onSuggestionClick}
        disabled={disabled}
        showTitle={false}
      />
    </div>
  )
}

export default ChatSuggestions