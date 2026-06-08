import {
  ChevronDown,
  Heart,
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/playerStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FullPlayerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function FullPlayer({ isOpen, setIsOpen }: FullPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    seekTo,
    progress,
    duration,
    nextTrack,
    previousTrack,
    isShuffled,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
    likedSongs,
    toggleLike,
    addToQueue,
  } = usePlayerStore();
  const { toast } = useToast();

  if (!currentTrack) return null;

  const isLiked = likedSongs.includes(currentTrack.id);

  const handleLike = () => {
    toggleLike(currentTrack.id);
    toast({
      title: isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
      duration: 2000,
    });
  };

  const handleAddToQueue = () => {
    addToQueue(currentTrack);
    toast({
      title: "Added to queue",
      description: `"${currentTrack.title}" has been added to the end of the queue.`,
      duration: 2000,
    });
  };

  const playerVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };

  const formatDuration = (duration: number | null) => {
    if (duration === null || isNaN(duration)) return "0:00";
    return new Date(duration * 1000).toISOString().substring(14, 19);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-background text-foreground"
          variants={playerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.4, type: "spring", bounce: 0, damping: 25 }}
        >
          {/* Blurred Background from Cover Art */}
          {currentTrack.coverArt && (
            <div 
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-125 pointer-events-none" 
              style={{ backgroundImage: `url(${currentTrack.coverArt})` }} 
            />
          )}
          <div className="absolute inset-0 bg-background/50 pointer-events-none" />

          <div className="relative z-10 flex-1 flex flex-col p-6 pt-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setIsOpen(false)} className="p-2 opacity-70 hover:opacity-100 transition-opacity">
                <ChevronDown size={32} />
              </button>
              <div className="text-center">
                <p className="text-xs uppercase font-semibold tracking-wider opacity-60">
                  {currentTrack.album}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2">
                    <MoreHorizontal size={28} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleAddToQueue}>
                    Add to queue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Cover Art */}
            <div className="flex-1 flex items-center justify-center mb-8">
              <img
                src={currentTrack.coverArt ?? ""}
                alt={currentTrack.title}
                className="w-full max-w-[320px] aspect-square rounded-2xl shadow-2xl object-cover"
              />
            </div>

            {/* Track Info & Actions */}
            <div className="flex justify-between items-end mb-8">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-2xl font-bold truncate mb-1 text-foreground">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-foreground/70 truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button onClick={handleLike} className="p-2 flex-shrink-0">
                <Heart
                  size={24}
                  className={cn(isLiked ? "fill-green-500 text-green-500" : "")}
                />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
              <Slider
                value={[progress]}
                max={duration ? Math.round(duration) : 0}
                step={1}
                className="w-full h-1.5"
                onValueChange={(value) => seekTo(value[0])}
              />
              <div className="flex justify-between text-xs font-medium text-foreground/50 mt-2">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-10 px-4">
              <button
                onClick={toggleShuffle}
                className={cn("p-2 transition-colors", isShuffled ? "text-green-500" : "text-foreground/50 hover:text-foreground")}
              >
                <Shuffle size={22} />
              </button>
              <button onClick={previousTrack} className="p-2 text-foreground active:scale-90 transition-transform">
                <SkipBack size={40} className="fill-current" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-foreground text-background rounded-full w-20 h-20 flex items-center justify-center active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause size={36} className="fill-current" />
                ) : (
                  <Play size={36} className="fill-current ml-2" />
                )}
              </button>
              <button onClick={nextTrack} className="p-2 text-foreground active:scale-90 transition-transform">
                <SkipForward size={40} className="fill-current" />
              </button>
              <button
                onClick={setRepeatMode}
                className={cn("p-2 transition-colors relative", repeatMode !== "none" ? "text-green-500" : "text-foreground/50 hover:text-foreground")}
              >
                <Repeat size={22} />
                {repeatMode === "track" && (
                  <div className="w-1 h-1 bg-green-500 rounded-full absolute -top-0 right-1" />
                )}
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center items-center text-foreground/50 pb-8">
              <button className="p-3 hover:text-foreground transition-colors bg-white/5 rounded-full backdrop-blur-md">
                <ListMusic size={22} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}