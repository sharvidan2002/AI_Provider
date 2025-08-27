import React, { useState } from 'react'
import { formatDate, copyToClipboard } from '../../utils/helpers'

const ChatMessage = ({ message }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const isFromUser = message.role === 'user' || message.isFromUser
  const isFromAssistant = message.role === 'assistant' || message.isFromAssistant

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(message.content)
    if (success) {
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    }
  }

  const formatMessageContent = (content) => {
    if (!content) return ''

    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>')
  }

  const shouldTruncate = message.content && message.content.length > 500
  const displayContent = shouldTruncate && !isExpanded
    ? message.content.substring(0, 500) + '...'
    : message.content

  return (
    <div className={`flex items-start space-x-3 ${isFromUser ? 'justify-end' : ''}`}>
      {/* Avatar */}
      {!isFromUser && (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 text-sm">🤖</span>
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isFromUser ? 'order-first' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isFromUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(displayContent)
            }}
          />

          {/* Expand/Collapse for long messages */}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs mt-2 underline hover:no-underline ${
                isFromUser ? 'text-blue-100' : 'text-blue-600'
              }`}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isFromUser ? 'justify-end' : ''}`}>
          <span>
            {formatDate(message.timestamp, { relative: true })}
          </span>

          {/* Response time for assistant messages */}
          {isFromAssistant && message.metadata?.responseTime && (
            <>
              <span>•</span>
              <span>{Math.round(message.metadata.responseTime / 1000)}s</span>
            </>
          )}

          {/* Confidence score for assistant messages */}
          {isFromAssistant && message.metadata?.confidence && (
            <>
              <span>•</span>
              <span>
                {Math.round(message.metadata.confidence * 100)}% confident
              </span>
            </>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center space-x-2 mt-2 ${isFromUser ? 'justify-end' : ''}`}>
          <button
            onClick={handleCopyMessage}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            title="Copy message"
          >
            <span>{showCopySuccess ? '✅' : '📋'}</span>
            <span>{showCopySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Additional actions for assistant messages */}
          {isFromAssistant && (
            <>
              <button
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                title="Like this response"
              >
                <span>👍</span>
              </button>

              <button
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                title="Dislike this response"
              >
                <span>👎</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isFromUser && (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-green-600 text-sm">👤</span>
        </div>
      )}
    </div>
  )
}

export default ChatMessage