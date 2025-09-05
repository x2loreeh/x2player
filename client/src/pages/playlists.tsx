import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { navidromeService } from "@/services/navidrome";
import { usePlayerStore } from "@/stores/playerStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        return navidromeService.getPlaylistTracks(playlistId);
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
              <Table {...provided.droppableProps} ref={provided.innerRef}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Album</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track, index) => (
                    <Draggable
                      key={track.id}
                      draggableId={track.id}
                      index={index}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="hover:bg-muted/50"
                          onClick={() => playQueue(tracks, index)}
                        >
                          <TableCell className="text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {track.title}
                          </TableCell>
                          <TableCell>{track.artist}</TableCell>
                          <TableCell>{track.album}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
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