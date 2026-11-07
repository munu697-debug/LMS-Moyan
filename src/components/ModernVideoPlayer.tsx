"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Check,
  Zap,
} from "lucide-react";

interface ModernVideoPlayerProps {
  videoUrl: string;
  title: string;
  courseTitle?: string;
  duration?: string;
  onEnded?: () => void;
}

function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 480; // default 8 min
  // formats like "14:20", "4h 30m", "18m 45s", "8:30"
  if (durationStr.includes(":")) {
    const parts = durationStr.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  let total = 0;
  const hours = durationStr.match(/(\d+)\s*h/);
  const mins = durationStr.match(/(\d+)\s*m/);
  const secs = durationStr.match(/(\d+)\s*s/);
  if (hours) total += parseInt(hours[1], 10) * 3600;
  if (mins) total += parseInt(mins[1], 10) * 60;
  if (secs) total += parseInt(secs[1], 10);
  return total > 0 ? total : 510;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const formattedMins = remMins < 10 ? `0${remMins}` : `${remMins}`;
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${formattedMins}:${formattedSecs}`;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function ModernVideoPlayer({
  videoUrl,
  title,
  courseTitle,
  duration,
  onEnded,
}: ModernVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const parsedDuration = parseDurationToSeconds(duration);
  const ytId = extractYouTubeId(videoUrl);
  const isYouTube = Boolean(ytId);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(parsedDuration);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [rippleAction, setRippleAction] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Update total duration when duration prop changes
  useEffect(() => {
    setTotalDuration(parseDurationToSeconds(duration));
    setCurrentTime(0);
    setIsPlaying(false);
  }, [duration, videoUrl]);

  // Send message to YouTube iframe
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func,
          args,
        }),
        "*"
      );
    }
  }, []);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (isYouTube) {
        sendYouTubeCommand("pauseVideo");
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (isYouTube) {
        sendYouTubeCommand("playVideo");
      } else if (videoRef.current) {
        videoRef.current.play();
      }
      setIsPlaying(true);
    }
  }, [isPlaying, isYouTube, sendYouTubeCommand]);

  // Skip relative seconds
  const skipSeconds = useCallback(
    (seconds: number) => {
      const newTime = Math.max(0, Math.min(totalDuration, currentTime + seconds));
      setCurrentTime(newTime);
      if (isYouTube) {
        sendYouTubeCommand("seekTo", [newTime, true]);
      } else if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
      setRippleAction(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
      setTimeout(() => setRippleAction(null), 700);
    },
    [currentTime, totalDuration, isYouTube, sendYouTubeCommand]
  );

  // Seek to specific second
  const seekTo = useCallback(
    (timeInSeconds: number) => {
      const clamped = Math.max(0, Math.min(totalDuration, timeInSeconds));
      setCurrentTime(clamped);
      if (isYouTube) {
        sendYouTubeCommand("seekTo", [clamped, true]);
      } else if (videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
    },
    [totalDuration, isYouTube, sendYouTubeCommand]
  );

  // Volume change
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (isYouTube) {
        sendYouTubeCommand("setVolume", [newVolume]);
        if (newVolume === 0) sendYouTubeCommand("mute");
        else sendYouTubeCommand("unMute");
      } else if (videoRef.current) {
        videoRef.current.volume = newVolume / 100;
        videoRef.current.muted = newVolume === 0;
      }
    },
    [isYouTube, sendYouTubeCommand]
  );

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      const restoreVol = volume || 50;
      if (isYouTube) {
        sendYouTubeCommand("unMute");
        sendYouTubeCommand("setVolume", [restoreVol]);
      } else if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = restoreVol / 100;
      }
    } else {
      setIsMuted(true);
      if (isYouTube) {
        sendYouTubeCommand("mute");
      } else if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  }, [isMuted, volume, isYouTube, sendYouTubeCommand]);

  // Change speed
  const changeSpeed = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      if (isYouTube) {
        sendYouTubeCommand("setPlaybackRate", [speed]);
      } else if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    },
    [isYouTube, sendYouTubeCommand]
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Smooth timer tick when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isScrubbing) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            if (onEnded) onEnded();
            return totalDuration;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isScrubbing, totalDuration, playbackSpeed, onEnded]);

  // YouTube message listener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setTotalDuration(data.info.duration);
          }
          if (typeof data.info.playerState === "number") {
            // 1: PLAYING, 2: PAUSED, 0: ENDED
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
            if (data.info.playerState === 0) {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }
          }
        }
      } catch (err) {
        // non-json message, ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        if (!showSpeedMenu) setShowControls(false);
      }, 2800);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        skipSeconds(10);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipSeconds, toggleMute, toggleFullscreen]);

  // Progress bar scrub click / drag
  const handleProgressScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * totalDuration);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * totalDuration);
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Modern YouTube embed URL with zero controls, no branding, no related videos, no captions bar
  const ytEmbedUrl = isYouTube
    ? `https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&autohide=1`
    : "";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="group relative aspect-video w-full select-none overflow-hidden rounded-3xl border border-border/80 bg-neutral-950 shadow-2xl transition-all"
    >
      {/* Video Stream Layer */}
      {isYouTube ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/*
            Cropping: By scaling up by 115% and shifting top by -14%,
            we completely push YouTube's native header (title, avatar, share icon)
            and bottom watermark outside the visible viewport!
          */}
          <iframe
            ref={iframeRef}
            src={ytEmbedUrl}
            title={title}
            className="absolute -top-[14%] -left-[7%] h-[128%] w-[114%] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-cover"
          onEnded={() => {
            setIsPlaying(false);
            if (onEnded) onEnded();
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              if (videoRef.current.duration) setTotalDuration(videoRef.current.duration);
            }
          }}
        />
      ) : null}

      {/* Transparent Clickable Overlay for Play/Pause & Double-Click Skip */}
      <div
        onClick={togglePlay}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) skipSeconds(-10);
          else skipSeconds(10);
        }}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Center Action Feedback Ripple (+10s, -10s) */}
      {rippleAction && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center animate-out fade-out zoom-out duration-500">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-md shadow-2xl">
            {rippleAction.includes("+") ? <RotateCw className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            <span>{rippleAction}</span>
          </div>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xl shadow-emerald-900/60 ring-8 ring-emerald-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer group/play"
            title="Play Lesson"
          >
            <Play className="ml-1 h-8 w-8 fill-white transition-transform group-hover/play:scale-110" />
          </button>
        </div>
      )}

      {/* Top Glass Header (NO Share Option, Pure Clean LMS Brand) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent p-5 sm:p-6 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/10">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            {courseTitle && (
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {courseTitle}
              </p>
            )}
            <h3 className="truncate text-xs sm:text-sm font-extrabold text-white drop-shadow-sm">
              {title}
            </h3>
          </div>
        </div>

        {/* Quality Stream Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            1080p Ultra-HD
          </span>
        </div>
      </div>

      {/* Bottom Modern Control Deck */}
      <div
        className={`pointer-events-auto absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300 sm:px-6 sm:pb-5 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Scrubber Timeline Bar */}
        <div
          ref={progressBarRef}
          onClick={(e) => {
            e.stopPropagation();
            handleProgressScrub(e);
          }}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
          className="group/progress relative h-2 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-3"
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${hoverPosition}%` }}
              className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-neutral-900/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-md border border-white/10"
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Buffered track */}
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/10" style={{ width: "100%" }} />

          {/* Played progress fill */}
          <div
            style={{ width: `${progressPercent}%` }}
            className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm"
          >
            {/* Scrubber Thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-2 ring-emerald-500 transition-transform group-hover/progress:scale-125" />
          </div>
        </div>

        {/* Control Bar Actions */}
        <div className="mt-3 flex items-center justify-between text-white">
          {/* Left: Play/Pause, Replay/Skip, Time, Volume */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Play / Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-white" />
              )}
            </button>

            {/* Skip -10s */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                skipSeconds(-10);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-95 cursor-pointer"
              title="Rewind 10 seconds (J / ←)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                skipSeconds(10);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-95 cursor-pointer"
              title="Forward 10 seconds (L / →)"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Volume Control */}
            <div className="group/volume relative flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/15 hover:text-white cursor-pointer"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                ) : volume > 50 ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <Volume1 className="h-4 w-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  e.stopPropagation();
                  handleVolumeChange(Number(e.target.value));
                }}
                className="hidden h-1 w-16 accent-emerald-500 cursor-pointer sm:block"
                title="Volume slider"
              />
            </div>

            {/* Time Stamp Display */}
            <div className="font-mono text-xs font-semibold text-white/90 pl-1">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span className="text-white/60">{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right Utilities: Speed, Fullscreen (NO Share Option) */}
          <div className="relative flex items-center gap-2">
            {/* Speed Selector Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu((prev) => !prev);
                }}
                className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-11 right-0 w-28 rounded-2xl border border-white/20 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-0.5 animate-in fade-in zoom-in-95"
                >
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Playback Speed
                  </p>
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        playbackSpeed === s
                          ? "bg-emerald-600 text-white"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>{s === 1 ? "Normal (1x)" : `${s}x`}</span>
                      {playbackSpeed === s && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/90 transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
