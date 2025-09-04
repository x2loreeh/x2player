import { SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { FullPlayer } from "./full-player";

export function MiniPlayer() {
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [location] = useLocation();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    updateProgress,
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Adjust position based on whether navigation is visible
  const hideNavigation = location?.startsWith('/album/') || location?.startsWith('/playlist/');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      updateProgress(audio.currentTime, audio.duration || 0);
    };
    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, updateProgress, nextTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isLoading) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, isLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.path;
    audio.load();
  }, [currentTrack]);

  // Show player UI even when no track is selected
  const showPlayer = currentTrack || true; // Always show for better UX

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  if (!showPlayer) return null;

  return (
    <>
      {currentTrack && <audio ref={audioRef} preload="metadata" />}
      <div className={cn(
        "fixed left-0 right-0 z-40 px-4 py-3 max-w-sm mx-auto",
        hideNavigation ? "bottom-4" : "bottom-16"
      )}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center space-x-3 flex-1 min-w-0 max-w-[calc(100%-140px)] transition-colors",
                currentTrack && "cursor-pointer hover:bg-white/5 -mx-2 px-2 py-1 rounded-xl"
              )}
              onClick={() => currentTrack && setIsFullPlayerOpen(true)}
            >
              <div className="flex-shrink-0">
                {currentTrack?.coverArt ? (
                  <img
                    src={currentTrack.coverArt}
                    alt="Now playing"
                    className="w-12 h-12 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-white/30"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden max-w-[calc(100%-60px)]">
                <div className="overflow-hidden whitespace-nowrap">
                  <p className={cn(
                    "font-semibold text-sm text-dark-text-primary",
                    isPlaying && currentTrack?.title && currentTrack.title.length > 18
                      ? "animate-marquee-bidirectional inline-block"
                      : "truncate block"
                  )}>
                    {currentTrack?.title || "No track selected"}
                  </p>
                </div>
                <p className="text-dark-text-secondary text-xs truncate block">
                  {currentTrack?.artist || "Select a song to play"}
                </p>
              </div>
            </div>
          
            <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={previousTrack}
              disabled={!currentTrack}
              className={cn(
                "p-2 rounded-full transition-colors backdrop-blur-sm",
                currentTrack 
                  ? "text-white/70 hover:text-white hover:bg-white/10" 
                  : "text-white/30 cursor-not-allowed"
              )}
            >
              <SkipBack className="h-4 w-4" />
            </button>
            
            <button
              onClick={togglePlay}
              disabled={!currentTrack || isLoading}
              className={cn(
                "w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg border border-white/30",
                currentTrack && !isLoading
                  ? "bg-white/90 hover:scale-105 hover:bg-white/95"
                  : "bg-white/30 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 text-dark-bg" />
              ) : (
                <Play className="h-4 w-4 text-dark-bg ml-0.5" />
              )}
            </button>
            
            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className={cn(
                "p-2 rounded-full transition-colors backdrop-blur-sm",
                currentTrack 
                  ? "text-white/70 hover:text-white hover:bg-white/10" 
                  : "text-white/30 cursor-not-allowed"
              )}
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-white/20 h-1 rounded-full backdrop-blur-sm">
              <div
                className="bg-white/90 h-1 rounded-full transition-all duration-200 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <FullPlayer 
        isOpen={isFullPlayerOpen} 
        onClose={() => setIsFullPlayerOpen(false)} 
      />
    </>
  );
}