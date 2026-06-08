import { SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FullPlayer } from "./full-player";
import { useTranslation } from "@/hooks/useTranslation";

export function MiniPlayer() {
  const t = useTranslation();
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    updateProgress,
    seekTo,
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
    if (!audio) return;

    const unsubscribe = usePlayerStore.subscribe(
      (state, prevState) => {
        if (
          state.progress !== prevState.progress &&
          Math.abs(state.progress - audio.currentTime) > 1.5
        ) {
          audio.currentTime = state.progress;
        }
      }
    );

    return unsubscribe;
  }, []);

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
        "fixed left-4 right-4 z-[45] max-w-md mx-auto",
        "bottom-[110px]" // above floating bottom navigation
      )}>
        <div className="bg-background/80 backdrop-blur-3xl border border-border/50 rounded-[32px] p-2.5 shadow-2xl overflow-hidden relative">
          
          {/* Background blur if cover exists */}
          {currentTrack?.coverArt && (
            <div 
              className="absolute inset-0 bg-cover bg-center blur-[40px] opacity-20 scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${currentTrack.coverArt})` }}
            />
          )}
          
          <div className="relative flex items-center gap-3">
            <div
              className={cn(
                "flex items-center space-x-3 flex-1 min-w-0 max-w-[calc(100%-120px)] transition-colors",
                currentTrack && "cursor-pointer rounded-xl"
              )}
              onClick={() => currentTrack && setIsFullPlayerOpen(true)}
            >
              <div className="flex-shrink-0">
                {currentTrack?.coverArt ? (
                  <img
                    src={currentTrack.coverArt}
                    alt="Now playing"
                    className="w-11 h-11 rounded-[14px] object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-[14px] bg-secondary flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/30"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden max-w-[calc(100%-50px)]">
                <div className="overflow-hidden whitespace-nowrap">
                  <p className={cn(
                    "font-medium text-[15px] text-foreground",
                    isPlaying && currentTrack?.title && currentTrack.title.length > 25
                      ? "animate-marquee-bidirectional inline-block"
                      : "truncate block"
                  )}>
                    {currentTrack?.title || t("miniplayer.noTrack")}
                  </p>
                </div>
              </div>
            </div>
          
            <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex items-center space-x-1 flex-shrink-0 mr-1">
            <button
              onClick={togglePlay}
              disabled={!currentTrack || isLoading}
              className={cn(
                "p-2 flex items-center justify-center transition-all",
                currentTrack && !isLoading
                  ? "text-foreground hover:scale-110 active:scale-95"
                  : "text-muted-foreground cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current ml-0.5" />
              )}
            </button>
            
            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className={cn(
                "p-2 transition-all",
                currentTrack 
                  ? "text-foreground hover:scale-110 active:scale-95" 
                  : "text-muted-foreground cursor-not-allowed"
              )}
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </button>
          </div>
          </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
            <div
              className="bg-foreground h-full transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="absolute w-full h-4 -top-1 left-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <FullPlayer
        isOpen={isFullPlayerOpen}
        setIsOpen={setIsFullPlayerOpen}
      />
    </>
  );
}