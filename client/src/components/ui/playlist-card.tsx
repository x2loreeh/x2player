import { Play } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface PlaylistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  playlist: any
  width?: number
  height?: number
  compact?: boolean
}

export function PlaylistCard({
  playlist,
  width,
  height,
  compact = false,
  className,
  ...props
}: PlaylistCardProps) {
  if (compact) {
    return (
      <div className={cn("w-full h-full", className)} {...props}>
        {playlist.coverArt ? (
          <img
            src={playlist.coverArt}
            alt={playlist.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            <Play className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="group relative overflow-hidden rounded-md">
            {playlist.coverArt ? (
              <img
                src={playlist.coverArt}
                alt={playlist.name}
                width={width}
                height={height}
                className={cn(
                  "h-auto w-full object-cover transition-all group-hover:scale-105"
                )}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-muted"
                style={{ width, height, aspectRatio: "1" }}
              >
                <Play className="h-1/2 w-1/2 text-muted-foreground" />
              </div>
            )}
            <div className="absolute right-2 bottom-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Play className="h-5 w-5 fill-current" />
              </button>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Add to Queue</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="mt-2 space-y-1">
        <p className="truncate text-sm font-semibold">{playlist.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {playlist.owner}
        </p>
      </div>
    </div>
  )
}