import apiService from './api.js'

export const youtubeService = {
  /**
   * Get YouTube videos for a document
   */
  async getDocumentVideos(documentId, options = {}) {
    const { refresh = false, limit = 5 } = options
    return apiService.get(`/youtube/${documentId}/videos`, { refresh, limit })
  },

  /**
   * Search YouTube videos with custom query
   */
  async searchVideos(query, options = {}) {
    const { maxResults = 5, order = 'viewCount' } = options
    return apiService.get('/youtube/search', { query, maxResults, order })
  },

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId) {
    return apiService.get(`/youtube/video/${videoId}`)
  },

  /**
   * Get YouTube search suggestions based on document
   */
  async getSearchSuggestions(documentId) {
    return apiService.get(`/youtube/${documentId}/suggestions`)
  },

  /**
   * Get trending educational videos
   */
  async getTrendingEducational(options = {}) {
    const { category = 'education', maxResults = 10 } = options
    return apiService.get('/youtube/trending', { category, maxResults })
  },

  /**
   * Update video recommendations for a document
   */
  async updateVideoRecommendations(documentId, options = {}) {
    const { customQueries = [], maxResults = 5 } = options
    return apiService.post(`/youtube/${documentId}/update`, {
      customQueries,
      maxResults
    })
  },

  /**
   * Get YouTube API status
   */
  async getAPIStatus() {
    return apiService.get('/youtube/status')
  },

  /**
   * Get video analytics for a document
   */
  async getVideoAnalytics(documentId) {
    return apiService.get(`/youtube/${documentId}/analytics`)
  },

  /**
   * Format video duration
   */
  formatDuration(duration) {
    if (!duration || duration === 'Unknown') return duration

    // If duration is already formatted (e.g., "4:13"), return as is
    if (duration.includes(':')) return duration

    // Convert seconds to MM:SS format
    const totalSeconds = parseInt(duration)
    if (isNaN(totalSeconds)) return duration

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  },

  /**
   * Format view count for display
   */
  formatViewCount(viewCount) {
    if (!viewCount || viewCount === 0) return '0 views'

    const count = parseInt(viewCount)
    if (isNaN(count)) return '0 views'

    if (count < 1000) return `${count} views`
    if (count < 1000000) return `${Math.round(count / 1000)}K views`
    if (count < 1000000000) return `${Math.round(count / 1000000)}M views`
    return `${Math.round(count / 1000000000)}B views`
  },

  /**
   * Get video thumbnail URL with fallback
   */
  getVideoThumbnail(video, quality = 'medium') {
    if (video.thumbnail) return video.thumbnail

    // Fallback to YouTube thumbnail
    const qualities = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      max: 'maxresdefault'
    }

    const thumbnailQuality = qualities[quality] || qualities.medium
    return `https://img.youtube.com/vi/${video.videoId}/$(thumbnailQuality).jpg`
  },

  /**
   * Get embed URL with parameters
   */
  getEmbedUrl(videoId, options = {}) {
    const {
      autoplay = 0,
      mute = 0,
      controls = 1,
      showInfo = 1,
      rel = 0,
      modestbranding = 1
    } = options

    const params = new URLSearchParams({
      autoplay,
      mute,
      controls,
      showinfo: showInfo,
      rel,
      modestbranding
    })

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  },

  /**
   * Validate YouTube video ID
   */
  isValidVideoId(videoId) {
    if (!videoId || typeof videoId !== 'string') return false

    // YouTube video IDs are 11 characters long and contain only alphanumeric, dash, and underscore
    const regex = /^[a-zA-Z0-9_-]{11}$/
    return regex.test(videoId)
  },

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url) {
    if (!url) return null

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  },

  /**
   * Get relevance score color for UI
   */
  getRelevanceScoreColor(score) {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  },

  /**
   * Sort videos by criteria
   */
  sortVideos(videos, criteria = 'relevance') {
    const sortedVideos = [...videos]

    switch (criteria) {
      case 'relevance':
        return sortedVideos.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

      case 'views':
        return sortedVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))

      case 'date':
        return sortedVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

      case 'duration':
        return sortedVideos.sort((a, b) => {
          const aDuration = this.parseDurationToSeconds(a.duration)
          const bDuration = this.parseDurationToSeconds(b.duration)
          return aDuration - bDuration
        })

      case 'title':
        return sortedVideos.sort((a, b) => (a.title || '').localeCompare(b.title || ''))

      default:
        return sortedVideos
    }
  },

  /**
   * Parse duration string to seconds
   */
  parseDurationToSeconds(duration) {
    if (!duration || duration === 'Unknown') return 0

    if (duration.includes(':')) {
      const parts = duration.split(':').map(Number)
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1] // MM:SS
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2] // HH:MM:SS
      }
    }

    return parseInt(duration) || 0
  },

  /**
   * Filter videos by duration
   */
  filterByDuration(videos, maxMinutes = null, minMinutes = null) {
    if (!maxMinutes && !minMinutes) return videos

    return videos.filter(video => {
      const durationSeconds = this.parseDurationToSeconds(video.duration)
      const durationMinutes = durationSeconds / 60

      if (minMinutes && durationMinutes < minMinutes) return false
      if (maxMinutes && durationMinutes > maxMinutes) return false

      return true
    })
  },

  /**
   * Get video category from title/channel
   */
  getVideoCategory(video) {
    const title = (video.title || '').toLowerCase()
    const channel = (video.channelName || '').toLowerCase()
    const text = `${title} ${channel}`

    const categories = {
      tutorial: ['tutorial', 'how to', 'guide', 'step by step'],
      lecture: ['lecture', 'lesson', 'class', 'course'],
      explanation: ['explained', 'explanation', 'understand', 'concept'],
      review: ['review', 'overview', 'summary', 'recap'],
      demonstration: ['demo', 'demonstration', 'example', 'practice']
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }

    return 'educational'
  },

  /**
   * Generate search queries from document analysis
   */
  generateSearchQueries(analysis) {
    const queries = []

    if (analysis?.subject) {
      queries.push(`${analysis.subject} tutorial`)
      queries.push(`${analysis.subject} explained`)
      queries.push(`learn ${analysis.subject}`)
    }

    if (analysis?.concepts && analysis.concepts.length > 0) {
      analysis.concepts.slice(0, 3).forEach(concept => {
        queries.push(`${concept} tutorial`)
        queries.push(`${concept} explained`)
      })
    }

    if (analysis?.topics && analysis.topics.length > 0) {
      analysis.topics.slice(0, 2).forEach(topic => {
        queries.push(`${topic} lesson`)
      })
    }

    return [...new Set(queries)].slice(0, 5) // Remove duplicates and limit
  }
}