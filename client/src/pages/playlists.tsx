import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { navidromeService } from "@/services/navidrome";
import { usePlayerStore } from "@/stores/playerStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Music, Plus, Trash2, X } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { toast } from "@/hooks/use-toast";
import type { Playlist, Track as Song } from "@shared/schema";
import { mockPlaylists } from "@/services/mockData";
import PlaylistFormModal from "@/components/ui/playlist-form-modal";
import { useRoute, useLocation } from "wouter";

const mockTracks: Song[] = [
  { id: 't1', title: 'Sunset Drive', artist: 'Synthwave Rider', album: 'Neon Nights', albumId: 'a1', track: 1, year: 2023, genre: 'Synthwave', duration: 245, path: '#', coverArt: 'https://picsum.photos/seed/t1/200' },
  { id: 't2', title: 'Ocean Breeze', artist: 'Chillwave Beats', album: 'Summer Grooves', albumId: 'a2', track: 1, year: 2022, genre: 'Chillwave', duration: 198, path: '#', coverArt: 'https://picsum.photos/seed/t2/200' },
  { id: 't3', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', albumId: 'a3', track: 1, year: 2011, genre: 'Synthpop', duration: 363, path: '#', coverArt: 'https://picsum.photos/seed/t3/200' },
  { id: 't4', title: 'Genesis', artist: 'Grimes', album: 'Visions', albumId: 'a4', track: 1, year: 2012, genre: 'Art Pop', duration: 255, path: '#', coverArt: 'https://picsum.photos/seed/t4/200' },
  { id: 't5', title: 'A Sky Full of Stars', artist: 'Coldplay', album: 'Ghost Stories', albumId: 'a5', track: 8, year: 2014, genre: 'Pop Rock', duration: 268, path: '#', coverArt: 'https://picsum.photos/seed/t5/200' },
  { id: 't6', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', albumId: 'a6', track: 9, year: 2020, genre: 'Synth-pop', duration: 200, path: '#', coverArt: 'https://picsum.photos/seed/t6/200' },
  { id: 't7', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', albumId: 'a7', track: 5, year: 2020, genre: 'Pop', duration: 203, path: '#', coverArt: 'https://picsum.photos/seed/t7/200' },
  { id: 't8', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', albumId: 'a8', track: 6, year: 2021, genre: 'Pop Punk', duration: 178, path: '#', coverArt: 'https://picsum.photos/seed/t8/200' },
  { id: 't9', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3: OVER YOU', albumId: 'a9', track: 1, year: 2021, genre: 'Pop', duration: 141, path: '#', coverArt: 'https://picsum.photos/seed/t9/200' },
  { id: 't10', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', albumId: 'a10', track: 6, year: 2021, genre: 'R&B', duration: 198, path: '#', coverArt: 'https://picsum.photos/seed/t10/200' },
];

function PlaylistsList() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => mockPlaylists,
  });

  const handleSelectPlaylist = (playlist: Playlist) => {
    setLocation(`/playlists/${playlist.id}`);
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["playlists"] });
    setShowCreateModal(false);
  };

  return (
    <div className="h-full p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </div>
      {isLoadingPlaylists ? (
        <p>Loading playlists...</p>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-2">
            {playlists.map((playlist: Playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleSelectPlaylist(playlist)}
              >
                <div className="flex items-center gap-4">
                  <Music className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-semibold truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.songCount} tracks
                    </p>
                  </div>
                </div>
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      <PlaylistFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}

export default function Playlists() {
  const [match, params] = useRoute("/playlists/:id");

  return match ? (
    <PlaylistPage playlistId={params!.id} />
  ) : (
    <PlaylistsList />
  );
}

function PlaylistPage({ playlistId }: { playlistId: string }) {
  const { playQueue } = usePlayerStore();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["playlists"],
    queryFn: async () => mockPlaylists,
  });

  const playlist = useMemo(() => {
    if (!playlists) return undefined;
    return playlists.find((p) => p.id === playlistId);
  }, [playlistId, playlists]);

  const {
    data: tracks = [],
    isLoading: isLoadingTracks,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ["playlistTracks", playlistId],
    queryFn: () => {
      if (playlistId) {
        // return navidromeService.getPlaylistTracks(playlistId);
        return Promise.resolve(mockTracks);
      }
      return Promise.resolve([]);
    },
    enabled: !!playlistId,
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => navidromeService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setLocation("/playlists");
      toast({ title: "Playlist deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error deleting playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: ({
      playlistId,
      trackIndex,
    }: {
      playlistId: string;
      trackIndex: number;
    }) =>
      navidromeService.updatePlaylist(
        playlistId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        [trackIndex]
      ),
    onSuccess: () => {
      refetchTracks();
      toast({ title: "Track removed from playlist" });
    },
    onError: (error) => {
      toast({
        title: "Error removing track",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderTracksMutation = useMutation({
    mutationFn: ({
      playlistId,
      trackIds,
    }: {
      playlistId: string;
      trackIds: string[];
    }) => navidromeService.reorderPlaylistTracks(playlistId, trackIds),
    onSuccess: () => {
      refetchTracks();
      toast({ title: "Playlist reordered" });
    },
    onError: (error) => {
      toast({
        title: "Error reordering playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const playPlaylistMutation = useMutation({
    mutationFn: async (playlist: Playlist) => {
      if (playlist.id) {
        const tracks = await navidromeService.getPlaylistTracks(playlist.id);
        playQueue(tracks, 0);
        return tracks;
      }
      return [];
    },
    onError: (error) => {
      toast({
        title: "Error playing playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !playlist) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const trackIds = items.map((track) => track.id);
    reorderTracksMutation.mutate({ playlistId: playlist.id, trackIds });
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["playlists"] });
    queryClient.invalidateQueries({
      queryKey: ["playlistTracks", playlistId],
    });
    setShowEditModal(false);
  };

  if (!playlist) {
    return <div>Loading playlist...</div>;
  }

  return (
    <div className="px-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold">{playlist.name}</h2>
          <p className="text-muted-foreground">
            {playlist.songCount} songs • {playlist.owner}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => playPlaylistMutation.mutate(playlist)}>
            Play
          </Button>
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deletePlaylistMutation.mutate(playlist.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoadingTracks ? (
        <p>Loading tracks...</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tracks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1"
              >
                {tracks.map((track, index) => (
                  <Draggable
                    key={track.id}
                    draggableId={track.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => playQueue(tracks, index)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-muted-foreground w-6 text-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{track.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {track.artist}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground hidden sm:block">
                            {track.album}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrackMutation.mutate({
                                playlistId: playlist.id,
                                trackIndex: index,
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <PlaylistFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleMutationSuccess}
        initialData={{
          id: playlist.id,
          name: playlist.name,
        }}
      />
    </div>
  );
}