import { useState, useEffect, useRef } from "react";
import { ChevronDown, Heart, SkipBack, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullPlayer({ isOpen, onClose }: FullPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    nextTrack,
    previousTrack,
    togglePlay,
    seekTo,
    setVolume,
  } = usePlayerStore();

  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * (currentTrack.duration || 0);
    
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value) / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark-bg z-[100] flex flex-col relative overflow-hidden">
      {/* Background with blurred cover */}
      {currentTrack?.coverArt && (
        <div className="absolute inset-0">
          <img
            src={currentTrack.coverArt}
            alt="Background"
            className="w-full h-full object-cover scale-110 blur-2xl opacity-20"
          />
          <div className="absolute inset-0 bg-dark-bg/60"></div>
        </div>
      )}
      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-start p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-dark-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-elevated/80 transition-colors"
          >
            <ChevronDown className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-8 py-4">
          <div className="w-80 h-80 max-w-[80vw] max-h-[80vw] rounded-full overflow-hidden shadow-2xl">
            {currentTrack?.coverArt ? (
              <img
                src={currentTrack.coverArt}
                alt={`${currentTrack.album} cover`}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationDuration: '10s' }}
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center rounded-full">
                <Play className="h-20 w-20 text-black opacity-60" />
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate mb-1">
                {currentTrack?.title || "No track selected"}
              </h2>
              <p className="text-dark-text-secondary text-lg truncate">
                {currentTrack?.artist || "Select a song to play"}
              </p>
            </div>
            <button className="ml-4 p-2">
              <Heart className="h-6 w-6 text-dark-text-secondary hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pb-4">
          <div
            ref={progressRef}
            className="relative w-full h-1 bg-dark-surface rounded-full cursor-pointer mb-2"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
              style={{ width: `${(progress / (currentTrack.duration || 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-dark-text-secondary">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentTrack.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-center space-x-8 mb-4">
            <button
              onClick={previousTrack}
              className="p-2 text-white hover:scale-105 transition-transform"
            >
              <SkipBack className="h-8 w-8" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-black" />
              ) : (
                <Play className="h-8 w-8 text-black ml-1" />
              )}
            </button>
            
            <button
              onClick={nextTrack}
              className="p-2 text-white hover:scale-105 transition-transform"
            >
              <SkipForward className="h-8 w-8" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4">
            <Volume2 className="h-5 w-5 text-dark-text-secondary" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-dark-surface rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}