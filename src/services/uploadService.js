import apiService from './api.js'

export const uploadService = {
  /**
   * Upload document with file and prompt
   */
  async uploadDocument(file, prompt, processType = 'analysis', onProgress = null) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('prompt', prompt)
    formData.append('processType', processType)

    // Create XMLHttpRequest for upload progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            reject(new Error('Invalid response format'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.message || 'Upload failed'))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', `${apiService.baseURL}/upload`)
      xhr.send(formData)
    })
  },

  /**
   * Get document processing status
   */
  async getDocumentStatus(documentId) {
    return apiService.get(`/upload/status/${documentId}`)
  },

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit = 10) {
    return apiService.get('/upload/recent', { limit })
  },

  /**
   * Retry processing for failed document
   */
  async retryProcessing(documentId) {
    return apiService.post(`/upload/retry/${documentId}`)
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    return apiService.delete(`/upload/${documentId}`)
  },

  /**
   * Get processing statistics
   */
  async getProcessingStats() {
    return apiService.get('/upload/stats')
  },

  /**
   * Poll document status until completed
   */
  async pollDocumentStatus(documentId, onUpdate = null, maxAttempts = 60) {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await this.getDocumentStatus(documentId)
          const document = response.data

          if (onUpdate) {
            onUpdate(document)
          }

          if (document.isProcessed) {
            resolve(document)
            return
          }

          if (document.processingStatus === 'failed') {
            reject(new Error(document.error?.message || 'Processing failed'))
            return
          }

          attempts++
          if (attempts >= maxAttempts) {
            reject(new Error('Processing timeout - please check status manually'))
            return
          }

          // Poll every 2 seconds
          setTimeout(poll, 2000)

        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }
}