import React from 'react'
import { useAppContext } from '../../context/AppContext'

const Header = () => {
  const { currentView, isTeacherMode, toggleTeacherMode, goHome } = useAppContext()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={goHome}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Study Helper</h1>
              <p className="text-xs text-gray-500">Powered by Gemini AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={goHome}
              className={`text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Home
            </button>

            <button
              onClick={toggleTeacherMode}
              className={`text-sm font-medium transition-colors ${
                isTeacherMode
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isTeacherMode ? '👩‍🏫 Teacher Mode' : '📚 Student Mode'}
            </button>
          </nav>

          {/* Mode Indicator */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isTeacherMode ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isTeacherMode ? 'Teacher' : 'Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={goHome}
              className={`text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Home
            </button>

            <button
              onClick={toggleTeacherMode}
              className={`text-sm font-medium transition-colors ${
                isTeacherMode
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isTeacherMode ? '👩‍🏫 Teacher' : '📚 Student'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header