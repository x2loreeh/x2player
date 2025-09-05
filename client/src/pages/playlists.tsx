import { useState, useMemo, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shuffle, Music, ChevronLeft, GripVertical, Play } from "lucide-react";
import {
  usePlaylists,
  usePlaylist,
  usePlaylistTracks,
  useDeletePlaylist,
} from "@/lib/queries/playlist";
import { Track, Playlist } from "@/lib/queries/playlist";
import { usePlayerStore } from "@/stores/playerStore";
import { formatDuration } from "@/lib/utils";
import PlaylistFormModal from "@/components/ui/playlist-form-modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import { navidromeService } from "@/services/navidrome";

function PlaylistsPage() {
  const { data: playlists, refetch } = usePlaylists();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <Button onClick={() => setIsModalOpen(true)}>New Playlist</Button>
      </div>

      <PlaylistFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playlists?.map((playlist: Playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <div className="cursor-pointer group">
              <div className="relative aspect-square w-full">
                {playlist.coverArt ? (
                  <img
                    src={playlist.coverArt}
                    alt={playlist.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                    <Music className="h-1/2 w-1/2 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="font-semibold truncate">{playlist.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {playlist.owner}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PlaylistDetailsPage({ id }: { id: string }) {
  const { data: playlist, refetch: refetchPlaylist } = usePlaylist(id);
  const { data: tracksData } = usePlaylistTracks(id);
  const [location, navigate] = useLocation();
  const { mutate: deletePlaylist } = useDeletePlaylist({
    onSuccess: () => {
      navigate("/playlists");
    },
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { playQueue } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);

  const { mutate: updatePlaylistMutation } = useMutation({
    mutationFn: (variables: { id: string; trackIds: string[] }) =>
      navidromeService.updatePlaylist(
        variables.id,
        undefined,
        variables.trackIds.join(",")
      ),
    onSuccess: () => {
      refetchPlaylist();
      setIsOrderChanged(false);
    },
  });

  useEffect(() => {
    if (tracksData) {
      setTracks(tracksData);
    }
  }, [tracksData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTracks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        setIsOrderChanged(true);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const handleSaveOrder = () => {
    const trackIds = tracks.map(t => t.id);
    updatePlaylistMutation({ id, trackIds });
  };

  const handlePlay = () => {
    if (tracks.length > 0) {
      playQueue(tracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
      playQueue(shuffledTracks, 0);
    }
  };

  const totalDuration = useMemo(() => {
    return tracks.reduce((acc: number, track: Track) => acc + (track.duration ?? 0), 0);
  }, [tracks]);

  const handleDelete = () => {
    deletePlaylist(id);
  };

  const handleEditSuccess = () => {
    refetchPlaylist();
  };

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-48 md:h-64">
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 bg-black/50 rounded-full p-2 z-10"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent" />
          {playlist.coverArt ? (
            <img
              src={playlist.coverArt}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Music className="h-24 w-24 text-white opacity-60" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{playlist.name}</h1>
            <p className="text-sm text-gray-300 mt-1">
              {tracks.length} tracks, {formatDuration(totalDuration)}
            </p>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
            <button
              onClick={handlePlay}
              className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors"
            >
              <Play className="h-8 w-8 fill-current ml-1" />
            </button>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
              {isOrderChanged && (
                <Button onClick={handleSaveOrder} className="bg-primary hover:bg-primary/90">
                  Save Order
                </Button>
              )}
              <Button onClick={handleShufflePlay} className="bg-black/50 hover:bg-black/70">
                <Shuffle className="mr-2 h-4 w-4" /> Shuffle
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-black/50 hover:bg-black/70 border-none">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    Edit Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>
                    Delete Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        <div className="p-4 md:p-6">
          {isEditModalOpen && (
            <PlaylistFormModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={handleEditSuccess}
              initialData={playlist}
            />
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tracks} strategy={verticalListSortingStrategy}>
              <div>
                {tracks.map((track: Track, index: number) => (
                  <SortableTrackItem key={track.id} track={track} index={index} tracks={tracks} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function SortableTrackItem({ track, index, tracks }: { track: Track; index: number; tracks: Track[] }) {
  const { playQueue } = usePlayerStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 hover:bg-accent rounded-md"
    >
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="w-10 h-10 mr-4 flex-shrink-0">
        {track.coverArt ? (
          <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full bg-muted rounded flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div
        className="flex-grow cursor-pointer min-w-0"
        onClick={() => playQueue(tracks, index)}
      >
        <div className="font-semibold truncate">{track.title}</div>
        <div className="text-sm text-muted-foreground truncate">
          {track.artist}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {formatDuration(track.duration ?? 0)}
      </div>
    </div>
  );
}

export default function Playlists() {
  const [match, params] = useRoute("/playlists/:id");

  if (match && params?.id) {
    return <PlaylistDetailsPage id={params.id} />;
  }

  return <PlaylistsPage />;
}