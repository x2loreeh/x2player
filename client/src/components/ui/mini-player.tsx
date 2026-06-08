import { SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FullPlayer } from "./full-player";
import { useTranslation } from "@/hooks/useTranslation";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export function MiniPlayer() {
  const t = useTranslation();
  const isVisible = useScrollVisibility(400);
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
        "fixed left-6 right-6 z-[45] transition-all duration-300 ease-in-out",
        isVisible ? "bottom-[96px]" : "bottom-6"
      )}>
        <div className="bg-background/80 backdrop-blur-3xl border border-border/50 rounded-full p-1.5 shadow-2xl overflow-hidden relative">
          
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
                    className="w-10 h-10 rounded-[10px] object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-[10px] bg-secondary flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground/30"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden max-w-[calc(100%-50px)]">
                <div className="overflow-hidden whitespace-nowrap px-1">
                  <p className={cn(
                    "font-semibold text-[13px] text-foreground",
                    isPlaying && currentTrack?.title && currentTrack.title.length > 25
                      ? "animate-marquee-bidirectional inline-block"
                      : "truncate block"
                  )}>
                    {currentTrack?.title || t("miniplayer.noTrack")}
                  </p>
                </div>
              </div>
            </div>
          
            <div className="flex items-center space-x-2 flex-shrink-0 ml-auto mr-1">
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={togglePlay}
                disabled={!currentTrack || isLoading}
                className={cn(
                  "p-1.5 flex items-center justify-center transition-all rounded-full bg-foreground/5",
                  currentTrack && !isLoading
                    ? "text-foreground hover:bg-foreground/10 active:scale-95"
                    : "text-muted-foreground cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </button>
                        <button
                onClick={nextTrack}
                disabled={!currentTrack}
                className={cn(
                  "p-1.5 transition-all rounded-full",
                  currentTrack 
                    ? "text-foreground hover:bg-foreground/10 active:scale-95" 
                    : "text-muted-foreground cursor-not-allowed"
                )}
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
          </div>
          </div>
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