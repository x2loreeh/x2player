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
          className="fixed inset-0 bg-dark-bg z-[100] flex flex-col overflow-hidden"
          variants={playerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Background with blurred cover */}
          {currentTrack?.coverArt && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110"
              style={{
                backgroundImage: currentTrack.coverArt
                  ? `url(${currentTrack.coverArt})`
                  : undefined,
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex-1 flex flex-col p-4 text-white">
            {/* Header */}
            <div className="flex justify-between items-center">
              <button onClick={() => setIsOpen(false)} className="p-2">
                <ChevronDown size={28} />
              </button>
              <div className="text-center">
                <p className="text-sm uppercase">Playing from album</p>
                <p className="font-bold">{currentTrack.album}</p>
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
            <div className="flex-1 flex items-center justify-center my-8">
              <img
                src={currentTrack.coverArt ?? ""}
                alt={currentTrack.title}
                className="w-full max-w-xs aspect-square rounded-lg shadow-2xl"
              />
            </div>

            {/* Track Info & Actions */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 min-w-0 overflow-hidden max-w-[calc(100%-60px)]">
                <div className="overflow-hidden whitespace-nowrap">
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isPlaying && currentTrack?.title && currentTrack.title.length > 20
                      ? "animate-marquee-bidirectional inline-block"
                      : "truncate block"
                  )}>
                    {currentTrack.title}
                  </h2>
                </div>
                <p className="text-lg text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
              <button onClick={handleLike} className="p-2 flex-shrink-0">
                <Heart
                  size={24}
                  className={cn(isLiked ? "fill-green-500 text-green-500" : "")}
                />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[progress]}
                max={duration ? Math.round(duration) : 0}
                step={1}
                className="w-full"
                onValueChange={(value) => seekTo(value[0])}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-around items-center mb-4">
              <button
                onClick={toggleShuffle}
                className={cn("p-2", isShuffled && "text-green-500")}
              >
                <Shuffle size={24} />
              </button>
              <button onClick={previousTrack} className="p-2">
                <SkipBack size={32} />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={32} />
                ) : (
                  <Play size={32} className="ml-1" />
                )}
              </button>
              <button onClick={nextTrack} className="p-2">
                <SkipForward size={32} />
              </button>
              <button
                onClick={setRepeatMode}
                className={cn("p-2", repeatMode !== "none" && "text-green-500")}
              >
                <Repeat size={24} />
                {repeatMode === "track" && (
                  <div className="w-1 h-1 bg-green-500 rounded-full absolute mt-1" />
                )}
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center text-xs">
              <button className="p-2">
                <ListMusic size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}