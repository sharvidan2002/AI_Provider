import React, { useState } from 'react'
import { formatViewCount, formatVideoDuration } from '../../utils/helpers'
import { youtubeService } from '../../services/youtubeService'
import Modal from '../common/Modal'

const VideoCard = ({ video, showDetails = true }) => {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)

  const handleThumbnailError = () => {
    setThumbnailError(true)
  }

  const getThumbnailUrl = () => {
    if (thumbnailError || !video.thumbnail) {
      return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
    }
    return video.thumbnail
  }

  const getRelevanceColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const handleCardClick = () => {
    setShowVideoModal(true)
  }

  const handleWatchOnYouTube = () => {
    window.open(video.watchUrl || `https://www.youtube.com/watch?v=${video.videoId}`, '_blank')
  }

  return (
    <>
      <div
        className="card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group"
        onClick={handleCardClick}
      >
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          <img
            src={getThumbnailUrl()}
            alt={video.title || 'Video thumbnail'}
            onError={handleThumbnailError}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-5 h-5 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5z" />
              </svg>
            </div>
          </div>

          {/* Duration Badge */}
          {video.duration && video.duration !== 'Unknown' && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {formatVideoDuration(video.duration)}
            </div>
          )}

          {/* Relevance Score */}
          {video.relevanceScore && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getRelevanceColor(video.relevanceScore)}`}>
              {Math.round(video.relevanceScore)}% match
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h4 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {video.title || 'Untitled Video'}
          </h4>

          <div className="space-y-2">
            {/* Channel Name */}
            <p className="text-sm text-gray-600 truncate">
              📺 {video.channelName || 'Unknown Channel'}
            </p>

            {showDetails && (
              <>
                {/* View Count and Date */}
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {video.viewCount && (
                    <span>👁️ {formatViewCount(video.viewCount)}</span>
                  )}
                  {video.publishedAt && (
                    <span>📅 {new Date(video.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Description Preview */}
                {video.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {video.description.length > 100
                      ? `${video.description.substring(0, 100)}...`
                      : video.description
                    }
                  </p>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleWatchOnYouTube()
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>▶️</span>
              <span>YouTube</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {video.likeCount && (
                <span>👍 {formatViewCount(video.likeCount)}</span>
              )}
              {video.relevanceScore && (
                <span>🎯 {Math.round(video.relevanceScore)}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        video={video}
      />
    </>
  )
}

const VideoModal = ({ isOpen, onClose, video }) => {
  if (!video) return null

  const embedUrl = youtubeService.getEmbedUrl(video.videoId, {
    autoplay: 1,
    mute: 1
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title={video.title}
    >
      <div className="space-y-4">
        {/* Video Player */}
        <div className="video-responsive">
          <iframe
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Details */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                📺 {video.channelName}
              </p>
            </div>

            <button
              onClick={() => window.open(video.watchUrl || `https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
              className="btn-primary ml-4"
            >
              🔗 Open in YouTube
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {video.viewCount ? formatViewCount(video.viewCount) : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Views</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {video.likeCount ? formatViewCount(video.likeCount) : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Likes</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatVideoDuration(video.duration) || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {video.relevanceScore ? `${Math.round(video.relevanceScore)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Relevance</div>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                <p className="whitespace-pre-wrap">
                  {video.description.length > 500
                    ? `${video.description.substring(0, 500)}...`
                    : video.description
                  }
                </p>
              </div>
            </div>
          )}

          {/* Published Date */}
          {video.publishedAt && (
            <div className="text-xs text-gray-500">
              Published: {new Date(video.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default VideoCard