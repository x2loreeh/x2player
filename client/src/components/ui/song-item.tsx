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
        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200",
        "hover:bg-white/10 active:scale-[0.98]",
        isPlaying ? "bg-white/5" : ""
      )}
    >
      <div className="relative w-11 h-11 flex-shrink-0">
        {coverArtUrl ? (
          <img
            src={coverArtUrl}
            alt={song.title}
            className="w-full h-full object-cover rounded-md shadow-sm"
          />
        ) : (
          <div className="w-full h-full bg-secondary rounded-md flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground opacity-50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3
          className={cn(
            "text-[15px] font-medium leading-tight truncate",
            isPlaying ? "text-spotify-green" : "text-foreground"
          )}
        >
          {song.title}
        </h3>
        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
          {song.artist}
        </p>
      </div>

      {isPlaying && (
        <div className="flex items-end justify-center gap-0.5 w-4 h-4 ml-2 mr-1">
          <div className="w-[3px] bg-spotify-green animate-[bounce_1s_infinite_0ms] h-full rounded-full opacity-80" />
          <div className="w-[3px] bg-spotify-green animate-[bounce_1s_infinite_200ms] h-[60%] rounded-full opacity-80" />
          <div className="w-[3px] bg-spotify-green animate-[bounce_1s_infinite_400ms] h-[80%] rounded-full opacity-80" />
        </div>
      )}
    </div>
  );
};