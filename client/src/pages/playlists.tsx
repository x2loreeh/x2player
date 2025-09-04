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
import { useRoute } from "wouter";

export default function Playlists() {
  const queryClient = useQueryClient();
  const { playQueue } = usePlayerStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => mockPlaylists, // Using mock data
  });

  const {
    data: selectedPlaylistTracks = [],
    isLoading: isLoadingTracks,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ["playlistTracks", selectedPlaylist?.id],
    queryFn: () => {
      if (selectedPlaylist?.id) {
        return navidromeService.getPlaylistTracks(selectedPlaylist.id);
      }
      return Promise.resolve([]);
    },
    enabled: !!selectedPlaylist,
  });

  const userPlaylists = useMemo(() => playlists, [playlists]);

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => navidromeService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setSelectedPlaylist(null);
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
        [trackIndex],
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

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedPlaylist) return;

    const items = Array.from(selectedPlaylistTracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const trackIds = items.map((track) => track.id);
    reorderTracksMutation.mutate({ playlistId: selectedPlaylist.id, trackIds });
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["playlists"] });
    if (selectedPlaylist) {
      queryClient.invalidateQueries({
        queryKey: ["playlistTracks", selectedPlaylist.id],
      });
    }
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  return (
    <div className="h-full p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="lg:col-span-1">
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
                {userPlaylists.map((playlist: Playlist) => (
                  <div
                    key={playlist.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPlaylist?.id === playlist.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
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
        </div>

        <div className="lg:col-span-2">
          {selectedPlaylist && (
            <div>
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{selectedPlaylist.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedPlaylist.songCount} songs •{" "}
                    {selectedPlaylist.owner}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => playPlaylistMutation.mutate(selectedPlaylist)}
                  >
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      deletePlaylistMutation.mutate(selectedPlaylist.id)
                    }
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
                          {selectedPlaylistTracks.map((track, index) => (
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
                                      onClick={() =>
                                        removeTrackMutation.mutate({
                                          playlistId: selectedPlaylist.id,
                                          trackIndex: index,
                                        })
                                      }
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
            </div>
          )}
        </div>
      </div>

      <PlaylistFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleMutationSuccess}
      />

      {selectedPlaylist && (
        <PlaylistFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleMutationSuccess}
          initialData={{
            id: selectedPlaylist.id,
            name: selectedPlaylist.name,
          }}
        />
      )}
    </div>
  );
}

function PlaylistPage() {
  const [, params] = useRoute("/playlist/:id");
  const { playQueue } = usePlayerStore();

  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => mockPlaylists, // Using mock data
  });

  const playlist = useMemo(() => {
    if (!params?.id || !playlists) return undefined;
    return playlists.find((p) => p.id === params.id);
  }, [params?.id, playlists]);

  const { data: tracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: ["playlistTracks", playlist?.id],
    queryFn: () => {
      if (playlist?.id) {
        return navidromeService.getPlaylistTracks(playlist.id);
      }
      return Promise.resolve([]);
    },
    enabled: !!playlist,
  });

  if (isLoadingPlaylists || isLoadingTracks) {
    return <div>Loading...</div>;
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="px-6 pt-6">
      {/* Header */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-muted rounded-md flex items-center justify-center">
          <Music className="w-24 h-24 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Playlist
          </h2>
          <h1 className="text-5xl font-bold">{playlist.name}</h1>
          <p className="text-muted-foreground mt-2">{playlist.comment}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {playlist.songCount} songs
          </p>
        </div>
      </div>

      {/* Tracks */}
      <div>
        {tracks &&
          tracks.map((track: Song, index: number) => (
            <div
              key={track.id}
              className="flex items-center p-2 -mx-2 rounded-md hover:bg-white/10 cursor-pointer"
              onClick={() => playQueue(tracks, index)}
            >
              <div className="w-8 text-center text-gray-400">{index + 1}</div>
              <div className="flex-1">
                <p className="font-medium">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>
              <div className="text-sm text-muted-foreground">{track.album}</div>
            </div>
          ))}
      </div>
    </div>
  );
}