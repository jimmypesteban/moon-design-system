'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

export interface AudioPlayerProps {
  /**
   * Audio URL - can be a direct HTTPS URL, an S3 URL (s3://...), or prefixed with "audio:"
   * If an S3 URL is provided, you must also provide getPresignedUrl
   */
  url: string;
  /**
   * Known duration in seconds (optional, helps with initial display)
   */
  duration?: number;
  /**
   * Auto-play the audio when loaded (default: false)
   */
  autoPlay?: boolean;
  /**
   * Callback when audio playback ends
   */
  onEnded?: () => void;
  /**
   * Optional transcript to display below the player
   */
  transcript?: string;
  /**
   * Color scheme for the player
   * - "purple": Brand purple (mo-purple #4C1C75), default, for student experience
   * - "blue": Blue theme (for admin pages)
   */
  colorScheme?: 'purple' | 'blue';
  /**
   * Label to display next to the volume icon (e.g., "Voice Recording")
   * Only shown when colorScheme is "blue"
   */
  label?: string;
  /**
   * Function to convert S3 URLs to pre-signed HTTPS URLs
   * Required if your URL might be an S3 URL (s3://...)
   */
  getPresignedUrl?: (s3Url: string) => Promise<string>;
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * AudioPlayer component with WebM duration detection support.
 *
 * WebM files (the format used for browser audio recording) don't include duration
 * metadata in their headers. This component uses a seek-to-end hack to discover
 * the actual duration.
 *
 * @example
 * // Basic usage with direct URL
 * <AudioPlayer url="https://example.com/audio.webm" />
 *
 * @example
 * // With S3 URL and pre-signed URL resolver
 * <AudioPlayer
 *   url="s3://bucket/path/audio.webm"
 *   getPresignedUrl={getPresignedUrl}
 * />
 *
 * @example
 * // Admin page with blue theme and transcript
 * <AudioPlayer
 *   url={audioUrl}
 *   colorScheme="blue"
 *   label="Voice Recording"
 *   transcript={transcriptText}
 * />
 */
export function AudioPlayer({
  url,
  duration: knownDuration,
  autoPlay = false,
  onEnded,
  transcript,
  colorScheme = 'purple',
  label,
  getPresignedUrl,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(knownDuration || 0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const durationDiscoveredRef = useRef(false);

  // Color scheme styles
  const colors = colorScheme === 'blue' ? {
    bg: 'bg-blue-50',
    border: 'border border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    icon: 'text-blue-600',
    text: 'text-blue-900',
    textLight: 'text-blue-600',
    textLabel: 'text-blue-700',
    progressBg: 'bg-blue-200 hover:bg-blue-300',
    progressFill: 'bg-blue-600',
    transcriptBorder: 'border-blue-200',
    sliderThumb: 'bg-blue-600',
  } : {
    bg: 'bg-gray-50',
    border: '',
    button: 'bg-mo-purple hover:bg-mo-purple-5',
    icon: 'text-gray-400',
    text: 'text-gray-600',
    textLight: 'text-gray-500',
    textLabel: 'text-gray-700',
    progressBg: 'bg-gray-300',
    progressFill: 'bg-mo-purple',
    transcriptBorder: 'border-gray-200',
    sliderThumb: 'bg-mo-purple',
  };

  // Handle different URL formats
  const getPlayableUrl = (inputUrl: string): string => {
    // Strip audio: prefix if present
    if (inputUrl.startsWith('audio:')) {
      return inputUrl.slice(6);
    }
    return inputUrl;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Main effect: reset state and initialize audio when URL changes
   */
  useEffect(() => {
    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    // Reset all state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(knownDuration || 0);
    setProgress(0);
    setIsLoading(true);
    setError(null);
    durationDiscoveredRef.current = false;

    const rawUrl = getPlayableUrl(url);

    // Helper to update duration only if valid
    const updateDuration = (dur: number) => {
      if (dur && isFinite(dur) && !isNaN(dur) && dur > 0) {
        setDuration(dur);
        durationDiscoveredRef.current = true;
      }
    };

    // WebM workaround: seek to end to discover duration
    const discoverDuration = (audio: HTMLAudioElement) => {
      if (durationDiscoveredRef.current) return;

      // Check if duration is already valid
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
        updateDuration(audio.duration);
        return;
      }

      // WebM hack: seek to a very large number to force the browser to find the end
      const currentPos = audio.currentTime;

      const onSeeked = () => {
        // After seeking to "end", the duration should be available
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          updateDuration(audio.duration);
        }
        // Seek back to where we were
        audio.currentTime = currentPos;
        audio.removeEventListener('seeked', onSeeked);
      };

      audio.addEventListener('seeked', onSeeked);
      // Seek to a very large time - browser will clamp to actual duration
      audio.currentTime = 1e101;
    };

    // Initialize audio with a URL (either direct or pre-signed)
    const initAudio = (playableUrl: string) => {
      const audio = new Audio(playableUrl);
      audio.preload = 'auto';
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setIsLoading(false);
        // Try immediate duration check
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          updateDuration(audio.duration);
        }
      };

      // When enough data is loaded, try to discover duration
      audio.oncanplaythrough = () => {
        discoverDuration(audio);
      };

      // durationchange fires when duration becomes known
      audio.ondurationchange = () => {
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          updateDuration(audio.duration);
        }
      };

      audio.onerror = () => {
        // Only set error if we haven't successfully loaded yet
        if (isLoading) {
          setError('Failed to load audio');
        }
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentTime(0);
        // At end, we definitely know the duration
        if (audio.duration && isFinite(audio.duration)) {
          updateDuration(audio.duration);
        }
        if (onEnded) onEnded();
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        // Track the furthest we've played as a fallback duration
        if (!durationDiscoveredRef.current) {
          setDuration((prev) => Math.max(prev, audio.currentTime + 1));
        }
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
          updateDuration(audio.duration);
        }
      };

      // Check buffered ranges for duration fallback
      audio.onprogress = () => {
        if (audio.buffered.length > 0) {
          // Use buffered end as duration fallback
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          if (!durationDiscoveredRef.current && bufferedEnd > 0) {
            setDuration((prev) => Math.max(prev, bufferedEnd));
          }
        }
      };

      // Auto-play if requested
      if (autoPlay) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {
          // Auto-play blocked by browser, user must click play
        });
      }
    };

    // Handle S3 URLs vs direct URLs
    if (rawUrl.startsWith('s3://')) {
      if (!getPresignedUrl) {
        setError('S3 URL requires getPresignedUrl function');
        setIsLoading(false);
        return;
      }
      getPresignedUrl(rawUrl)
        .then((signedUrl) => {
          initAudio(signedUrl);
        })
        .catch((err) => {
          console.error('Failed to get pre-signed URL:', err);
          setError('Failed to load audio');
          setIsLoading(false);
        });
    } else {
      initAudio(rawUrl);
    }

    // Cleanup on unmount or URL change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [url, knownDuration, autoPlay, onEnded, getPresignedUrl]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error('Failed to play audio:', err);
        setError('Failed to play audio');
      });
    }
  };

  /**
   * Seek to specific position (click-based for blue theme, range input for purple)
   */
  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    // Try to seek using duration first
    if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
      const newTime = percentage * audio.duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
      return;
    }

    // Fallback: seek within buffered range
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const newTime = percentage * bufferedEnd;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  const handleSeekRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);

    // Try to seek using duration first
    if (duration && isFinite(duration) && duration > 0) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      return;
    }

    // Fallback: seek within buffered range
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      if (newTime <= bufferedEnd) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${colors.bg} ${colors.border} rounded-lg ${className || ''}`}>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-mo-annotation text-gray-500">Loading audio...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`px-3 py-2 bg-red-50 rounded-lg ${className || ''}`}>
        <span className="text-mo-annotation text-red-600">{error}</span>
      </div>
    );
  }

  // Blue theme renders with click-based progress bar and optional label/transcript
  if (colorScheme === 'blue') {
    return (
      <div className={`${colors.bg} ${colors.border} rounded-lg p-4 ${className || ''}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className={`flex items-center justify-center w-10 h-10 ${colors.button} text-white rounded-full transition-colors shrink-0`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            {label && (
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className={`w-4 h-4 ${colors.icon}`} />
                <span className={`text-sm font-medium ${colors.text}`}>{label}</span>
              </div>
            )}
            <div
              ref={progressBarRef}
              onClick={handleSeekClick}
              className={`h-2 ${colors.progressBg} rounded-full overflow-hidden cursor-pointer transition-colors`}
            >
              <div
                className={`h-full ${colors.progressFill} transition-all duration-100 pointer-events-none`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`text-mo-annotation ${colors.textLight} mt-1`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className={`mt-3 pt-3 border-t ${colors.transcriptBorder}`}>
            <div className={`text-mo-annotation font-medium ${colors.textLabel} mb-1`}>Transcript</div>
            <p className={`text-sm ${colors.text} whitespace-pre-wrap`}>{transcript}</p>
          </div>
        )}
      </div>
    );
  }

  // Brand purple theme (default) - compact with range input
  return (
    <div className={`${colors.bg} w-full min-w-0 rounded-lg ${className || ''}`}>
      <style>{`
        .audio-player-slider-purple::-webkit-slider-thumb { background-color: #4C1C75; }
        .audio-player-slider-purple::-moz-range-thumb { background-color: #4C1C75; }
      `}</style>
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${colors.button} text-white rounded-full transition-colors`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekRange}
            className={`audio-player-slider-purple h-1 min-w-0 flex-1 ${colors.progressBg} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer`}
          />
          <div
            className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-mo-annotation tabular-nums ${colors.text} font-mono`}
          >
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume icon */}
        <Volume2 className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
      </div>

      {/* Transcript (optional) */}
      {transcript && (
        <div className={`mx-3 mb-3 pt-3 border-t ${colors.transcriptBorder}`}>
          <div className={`text-mo-annotation font-medium ${colors.textLabel} mb-1`}>Transcript</div>
          <p className={`text-sm ${colors.text} whitespace-pre-wrap`}>{transcript}</p>
        </div>
      )}
    </div>
  );
}
