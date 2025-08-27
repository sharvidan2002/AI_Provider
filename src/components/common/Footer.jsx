import React from 'react'
import { APP_INFO } from '../../utils/constants'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-bold text-gray-900">AI Study Helper</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Transform your handwritten notes, textbook pages, and diagrams into interactive study materials
              with the power of AI. Get instant summaries, explanations, quiz questions, and more.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>🔒 Privacy Focused</span>
              <span>🚀 No Account Required</span>
              <span>📱 Mobile Friendly</span>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📝 Text Extraction (OCR)</li>
              <li>🧠 AI Analysis</li>
              <li>❓ Quiz Generation</li>
              <li>🎥 Video Suggestions</li>
              <li>📄 PDF Export</li>
              <li>💬 AI Chat</li>
              <li>👩‍🏫 Teacher Tools</li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Powered By</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>🤖 Google Gemini AI</li>
              <li>👁️ Google Vision API</li>
              <li>🎥 YouTube API</li>
              <li>⚛️ React + Vite</li>
              <li>🎨 Tailwind CSS</li>
              <li>🛠️ Node.js + Express</li>
              <li>🗄️ MongoDB</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              <span>&copy; {currentYear} {APP_INFO.NAME}. Made with ❤️ for students and teachers.</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <button
                onClick={() => window.open('mailto:support@aistudyhelper.com', '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                📧 Support
              </button>

              <button
                onClick={() => window.open('https://github.com/yourusername/ai-study-helper', '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                🐙 GitHub
              </button>

              <div className="text-gray-400">
                v{APP_INFO.VERSION}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This is an AI-powered study tool. While we strive for accuracy,
            always verify important information with authoritative sources. Use as a study aid,
            not as a replacement for proper learning and understanding.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer