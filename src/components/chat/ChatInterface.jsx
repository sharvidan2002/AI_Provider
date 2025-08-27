import React, { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatSuggestions from './ChatSuggestions'
import { useChat } from '../../hooks/useChat'
import { validateChatMessage } from '../../utils/validation'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const ChatInterface = ({ documentId }) => {
  const [message, setMessage] = useState('')
  const [inputError, setInputError] = useState('')
  const messagesContainerRef = useRef(null)

  const {
    session,
    messages,
    suggestions,
    isLoading,
    isSending,
    error,
    messagesEndRef,
    startChatSession,
    sendMessage,
    clearError,
    hasSession
  } = useChat(documentId)

  // Auto-start session when component mounts
  useEffect(() => {
    if (documentId && !hasSession && !isLoading) {
      startChatSession(documentId).catch(console.error)
    }
  }, [documentId, hasSession, isLoading, startChatSession])

  const handleSendMessage = async (messageText = message) => {
    const validation = validateChatMessage(messageText)
    if (!validation.valid) {
      setInputError(validation.errors[0])
      return
    }

    setInputError('')

    try {
      await sendMessage(validation.cleanMessage)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !isSending) {
        handleSendMessage()
      }
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (!isSending) {
      handleSendMessage(suggestion)
    }
  }

  if (isLoading && !hasSession) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="large" text="Starting chat session..." />
      </div>
    )
  }

  if (!hasSession && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Not Available</h3>
        <p className="text-gray-500 mb-6">
          Unable to start chat session. Please try refreshing the page.
        </p>
        <button
          onClick={() => startChatSession(documentId)}
          className="btn-primary"
        >
          🔄 Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Study Assistant</h3>
            <p className="text-xs text-gray-500">
              {session ? `Session active • ${messages.length} messages` : 'Connecting...'}
            </p>
          </div>
        </div>

        {session && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b">
          <ErrorMessage
            message={error}
            onClose={clearError}
            type="error"
          />
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-3xl mb-3">👋</div>
            <h4 className="font-medium text-gray-700 mb-2">Welcome to AI Chat!</h4>
            <p className="text-sm text-gray-500 mb-4">
              Ask me anything about your document. I can help explain concepts,
              create summaries, generate questions, and more.
            </p>

            {/* Initial Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isSending}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
            />
          ))
        )}

        {/* Loading indicator for AI response */}
        {isSending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3 inline-block">
                <LoadingSpinner size="small" />
                <span className="ml-2 text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length > 0 && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <ChatSuggestions
            suggestions={suggestions.slice(0, 4)}
            onSuggestionClick={handleSuggestionClick}
            disabled={isSending}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        {inputError && (
          <div className="mb-2">
            <p className="text-xs text-red-600">{inputError}</p>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setInputError('')
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your document..."
              disabled={isSending || !hasSession}
              className="input w-full resize-none"
              rows="2"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {message.length}/1000 • Press Enter to send, Shift+Enter for new line
              </span>
              <span className="text-xs text-gray-500">
                {session && messages.length > 0 && `${messages.length} messages`}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim() || isSending || !hasSession}
            className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <span>📤</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface