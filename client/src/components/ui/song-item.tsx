import { Music } from "lucide-react";
import { Song } from "@/types/types";
import { cn } from "@/lib/utils";

interface SongItemProps {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
  coverArtUrl?: string;
}

export const SongItem = ({
  song,
  isPlaying,
  onClick,
  coverArtUrl,
}: SongItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-[20px] cursor-pointer transition-all duration-300",
        "hover:bg-secondary active:scale-[0.98]",
        isPlaying ? "bg-secondary/80" : ""
      )}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {coverArtUrl ? (
          <img
            src={coverArtUrl}
            alt={song.title}
            className="w-full h-full object-cover rounded-xl shadow-sm"
          />
        ) : (
          <div className="w-full h-full bg-secondary rounded-xl flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground opacity-50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3
          className={cn(
            "text-[16px] font-semibold leading-tight truncate",
            isPlaying ? "text-foreground" : "text-foreground/90"
          )}
        >
          {song.title}
        </h3>
        <p className="text-[14px] font-medium text-muted-foreground truncate mt-1">
          {song.artist}
        </p>
      </div>

      {isPlaying && (
        <div className="flex items-end justify-center gap-[3px] w-5 h-5 ml-2 mr-2">
          <div className="w-[3px] bg-foreground animate-[bounce_1s_infinite_0ms] h-full rounded-full opacity-90" />
          <div className="w-[3px] bg-foreground animate-[bounce_1s_infinite_200ms] h-[60%] rounded-full opacity-90" />
          <div className="w-[3px] bg-foreground animate-[bounce_1s_infinite_400ms] h-[80%] rounded-full opacity-90" />
        </div>
      )}
    </div>
  );
};