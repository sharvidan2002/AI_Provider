import React, { useState } from 'react'
import VideoCard from './VideoCard'
import LoadingSpinner, { VideoCardSkeleton } from '../common/LoadingSpinner'
import { EmptyState } from '../common/ErrorMessage'

const VideoGrid = ({
  videos = [],
  isLoading = false,
  onRefresh,
  showFilters = true
}) => {
  const [sortBy, setSortBy] = useState('relevance')
  const [filterBy, setFilterBy] = useState('all')

  // Sort videos
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.relevanceScore || 0) - (a.relevanceScore || 0)
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0)
      case 'date':
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
      case 'duration':
        return parseDurationToSeconds(a.duration) - parseDurationToSeconds(b.duration)
      default:
        return 0
    }
  })

  // Filter videos
  const filteredVideos = sortedVideos.filter(video => {
    if (filterBy === 'all') return true
    if (filterBy === 'short') return parseDurationToSeconds(video.duration) < 300 // < 5 minutes
    if (filterBy === 'medium') {
      const duration = parseDurationToSeconds(video.duration)
      return duration >= 300 && duration < 1200 // 5-20 minutes
    }
    if (filterBy === 'long') return parseDurationToSeconds(video.duration) >= 1200 // > 20 minutes
    return true
  })

  const parseDurationToSeconds = (duration) => {
    if (!duration || duration === 'Unknown') return 0
    if (duration.includes(':')) {
      const parts = duration.split(':').map(Number)
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    return parseInt(duration) || 0
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading state with skeletons */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon="🎥"
        title="No Videos Found"
        description="We couldn't find any educational videos related to this content. Try refreshing or check back later."
        action={
          <button onClick={onRefresh} className="btn-primary">
            🔄 Try Again
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Related Educational Videos
          </h3>
          <p className="text-sm text-gray-600">
            {filteredVideos.length} of {videos.length} videos
            {sortBy !== 'relevance' && ` • Sorted by ${sortBy}`}
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-3">
            {/* Duration Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="input text-sm w-auto"
            >
              <option value="all">All Durations</option>
              <option value="short">Short (< 5 min)</option>
              <option value="medium">Medium (5-20 min)</option>
              <option value="long">Long (> 20 min)</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-sm w-auto"
            >
              <option value="relevance">Most Relevant</option>
              <option value="views">Most Viewed</option>
              <option value="date">Newest</option>
              <option value="duration">Shortest First</option>
            </select>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="btn-outline text-sm"
                disabled={isLoading}
              >
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
            )}
          </div>
        )}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <VideoCard key={video.videoId || index} video={video} />
        ))}
      </div>

      {/* Load More Button */}
      {videos.length > 6 && filteredVideos.length > 6 && (
        <div className="text-center pt-4">
          <button className="btn-outline">
            Load More Videos
          </button>
        </div>
      )}

      {/* Filter Results Info */}
      {filteredVideos.length !== videos.length && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredVideos.length} of {videos.length} videos
            {filterBy !== 'all' && (
              <button
                onClick={() => setFilterBy('all')}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Show all
              </button>
            )}
          </p>
        </div>
      )}

      {/* Powered by YouTube */}
      <div className="text-center pt-6 border-t">
        <p className="text-xs text-gray-500">
          🎥 Powered by YouTube • Educational content suggestions
        </p>
      </div>
    </div>
  )
}

export default VideoGrid