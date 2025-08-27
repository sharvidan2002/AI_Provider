import React, { useState, useCallback, useRef } from 'react'
import { validateFile, validatePrompt } from '../../utils/validation'
import { formatFileSize } from '../../utils/helpers'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants'
import { UploadProgress } from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const FileUpload = ({
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
  placeholder = "Describe what you want to analyze or extract from this image..."
}) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)

  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    setError(null)

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    setSelectedFile(file)

    // Create preview URL for images
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
      e.dataTransfer.clearData()
    }
  }, [handleFileSelect])

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.valid) {
      setError(promptValidation.errors[0])
      return
    }

    try {
      await onUpload(selectedFile, promptValidation.cleanPrompt)
      // Reset form after successful upload
      setSelectedFile(null)
      setPrompt('')
      setPreviewUrl(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setError(error.message || 'Upload failed')
    }
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isDisabled = disabled || isUploading

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <UploadProgress
          progress={uploadProgress}
          status="Uploading your file..."
        />
      )}

      {/* File Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isDisabled}
        />

        {selectedFile ? (
          // Selected file preview
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-40 max-w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                📄 {selectedFile.name}
              </h4>
              <p className="text-sm text-gray-600">
                Size: {formatFileSize(selectedFile.size)}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-700"
                disabled={isDisabled}
              >
                🗑️ Remove file
              </button>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="space-y-4">
            <div className="text-4xl">📸</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {dragActive ? 'Drop your file here!' : 'Upload your study material'}
              </h3>
              <p className="text-gray-600">
                Drag and drop an image file here, or click to browse
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p className="mb-1">Supported formats:</p>
              <p>JPEG, PNG, WebP, GIF, BMP, TIFF</p>
              <p>Maximum size: {formatFileSize(MAX_FILE_SIZE)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          What do you want to do with this image? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="textarea w-full"
          rows="4"
          required
          disabled={isDisabled}
        />
        <p className="mt-1 text-sm text-gray-500">
          Be specific about what you want to analyze or extract from the image.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!selectedFile || !prompt.trim() || isDisabled}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              🚀 Analyze Image
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>
          💡 <strong>Tip:</strong> For best results, ensure your image is clear, well-lit,
          and contains readable text or diagrams
        </p>
      </div>
    </form>
  )
}

export default FileUpload