import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Music, Headphones, MoreVertical, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { navidromeService } from "@/services/navidrome";
import { Skeleton } from "@/components/ui/skeleton";
import type { Playlist } from "@shared/schema";
import type { Song } from "@shared/schema"; // Import Song type
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function Playlists() {
  const { credentials } = useAuthStore();
  const { playQueue } = usePlayerStore();

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null); // State to hold the currently selected playlist
  const [currentPlaylistTracks, setCurrentPlaylistTracks] = useState<Song[]>([]); // State to hold tracks of the selected playlist

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["/api/playlists"],
    queryFn: () => navidromeService.getPlaylists(),
    enabled: !!credentials,
  });
  
  const { data: playlistTracks, isLoading: isLoadingPlaylistTracks, refetch: refetchPlaylistTracks } = useQuery({
    queryKey: ["/api/playlists", selectedPlaylist?.id, "tracks"],
    queryFn: () => navidromeService.getPlaylistTracks(selectedPlaylist!.id),
    enabled: !!selectedPlaylist?.id,
  });

  const handlePlaylistClick = (playlist: Playlist) => {
    // If the clicked playlist is already selected, deselect it
    if (selectedPlaylist?.id === playlist.id) {
      setSelectedPlaylist(null);
      return;
    }
    setSelectedPlaylist(playlist); // Set the selected playlist
  };

  useEffect(() => {
    if (playlistTracks) {
      setCurrentPlaylistTracks(playlistTracks);
    }
  }, [playlistTracks]);

  // Placeholder functions for playlist actions - implementation will be in modals
  const handleCreatePlaylist = () => {
    setShowCreateModal(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    try {
      await navidromeService.deletePlaylist(playlist.id);
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      if (selectedPlaylist?.id === playlist.id) {
        setSelectedPlaylist(null); // Deselect if the deleted playlist was the one being viewed
        setCurrentPlaylistTracks([]); // Clear tracks for the deleted playlist
      }
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };

  const removeTrackFromPlaylistMutation = useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
      if (!playlistId) return Promise.reject("Playlist ID is missing.");
      return navidromeService.removeTrackFromPlaylist(playlistId, trackId);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Song removed from playlist!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] }); // Invalidate playlists to update song counts
      setCurrentPlaylistTracks(currentPlaylistTracks.filter(track => track.id !== variables.trackId)); // Optimistically update the UI
    },
    onError: (error) => {
      console.error("Failed to remove track from playlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove song from playlist.",
        variant: "destructive",
      });
    },
  });

  const playPlaylistMutation = useMutation({
    mutationFn: (playlist: Playlist) => {
      return navidromeService.getPlaylistTracks(playlist.id);
    },
    onSuccess: (tracks) => {
      playQueue.setQueue(tracks);
    },
    onError: (error) => {
      console.error("Failed to play playlist:", error);
    },
  });

  const updatePlaylistOrderMutation = useMutation({
    mutationFn: ({ playlistId, trackIds }: { playlistId: string; trackIds: string[] }) => {
      return navidromeService.updatePlaylist(playlistId, { trackIds }); // Assuming updatePlaylist can handle track order
    },
    onSuccess: () => {
    },
  });

  const userPlaylists = playlists?.filter(p => p.owner === credentials?.username) || [];
  const serverPlaylists = playlists?.filter(p => p.owner !== credentials?.username) || [];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Playlists</h1>
            <Button
              size="icon"
              className="w-10 h-10 bg-spotify-green hover:bg-green-600 rounded-full"
              onClick={handleCreatePlaylist}
            >
              <Plus className="h-5 w-5 text-dark-bg" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 space-y-8">
            {/* User Playlists Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 bg-dark-border mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg bg-dark-border" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-dark-border" />
                      <Skeleton className="h-3 w-16 bg-dark-border" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Server Playlists Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 bg-dark-border mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg bg-dark-border" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-dark-border" />
                      <Skeleton className="h-3 w-24 bg-dark-border" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-8">
            {/* Made by You */}
            {userPlaylists.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Made by you</h2>
                <div className="space-y-4">
                  {userPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between space-x-4 cursor-pointer hover:bg-dark-surface p-2 -m-2 rounded-lg transition-colors"
                    >
                      <div
                        className="flex items-center space-x-4 flex-grow"
                        onClick={() => handlePlaylistClick(playlist)}
                     >
                        {playlist.coverArt ? (
                          <img src={playlist.coverArt} alt={`${playlist.name} cover`} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Music className="text-white text-lg" />
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-semibold text-dark-text-primary">
                            {playlist.name}
                          </p>
                          <p className="text-dark-text-secondary text-sm">
                            {playlist.songCount} songs
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4 text-dark-text-secondary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Playlist Options</DropdownMenuLabel>
                           <DropdownMenuGroup>
                             <DropdownMenuItem onClick={() => handleEditPlaylist(playlist)}>Edit</DropdownMenuItem>
                           </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                          {/* <DropdownMenuItem>Add/Remove Songs</DropdownMenuItem> */}
                          <DropdownMenuItem onClick={() => handleDeletePlaylist(playlist)} className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server Playlists */}
            {serverPlaylists.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">From your library</h2>
                <div className="space-y-4">
                  {serverPlaylists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between space-x-4 cursor-pointer hover:bg-dark-surface p-2 -m-2 rounded-lg transition-colors"
                    >
                      <div
                        className="flex items-center space-x-4 flex-grow"
                        onClick={() => handlePlaylistClick(playlist)}
                      >
                         {playlist.coverArt ? (
                          <img src={playlist.coverArt} alt={`${playlist.name} cover`} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Headphones className="text-white text-lg" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-dark-text-primary">
                            {playlist.name}
                          </p>
                          <p className="text-dark-text-secondary text-sm">
                            {playlist.comment ? `${playlist.comment} • ` : ""}
                            {playlist.songCount} songs
                          </p>
                        </div>
                      </div>
                      {/* Add options for server playlists if applicable (likely read-only) */}
                    </div>
                  ))}
                </div>
              </div>
            )}
             {/* Selected Playlist Details */}
             {selectedPlaylist && (
               <div className="mt-8">
                 <h2 className="text-xl font-bold mb-4">{selectedPlaylist.name}</h2>
                 {isLoadingPlaylistTracks ? (
                   <div className="space-y-4">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <div key={i} className="flex items-center space-x-4">
                         <Skeleton className="h-12 w-12 rounded-md bg-dark-border" />
                         <div className="flex-1 space-y-1">
                           <Skeleton className="h-4 w-48 bg-dark-border" />
                           <Skeleton className="h-3 w-32 bg-dark-border" />
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                  <DragDropContext onDragEnd={(result) => {
                    if (!result.destination) {
                      return;
                    }
                    const items = Array.from(currentPlaylistTracks);
                    const [reorderedItem] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, reorderedItem);

                    setCurrentPlaylistTracks(items);

                    // Call API to update the order
                    if (selectedPlaylist) {
                      updatePlaylistOrderMutation.mutate({
                        playlistId: selectedPlaylist.id,
                        trackIds: items.map(item => item.id)
                      });
                    }
                  }}>
                    <Droppable droppableId="playlist-tracks">
                      {(provided) => (
                        <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                          {currentPlaylistTracks?.map((track, index) => (
                            <Draggable key={track.id} draggableId={track.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between space-x-4 bg-dark-surface p-2 rounded-md" // Added background for drag visibility
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-dark-surface rounded-md flex items-center justify-center">
                                      <Music className="h-6 w-6 text-dark-text-secondary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-dark-text-primary">{track.title}</p>
                                      <p className="text-sm text-dark-text-secondary">{track.artist}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => removeTrackFromPlaylistMutation.mutate({ playlistId: selectedPlaylist.id, trackId: track.id })} className="hover:bg-red-500/20">
                                    <Minus className="h-4 w-4 text-red-500" />
                                  </Button>
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
               </div>
             )}
            {/* No Playlists */}
            {(!playlists || playlists.length === 0) && !isLoading && (
              <div className="text-center text-dark-text-secondary py-12">
                <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No playlists found</h3>
                <p className="text-sm">Create your first playlist or check your Navidrome server</p>
                <Button
                  className="mt-4 bg-spotify-green hover:bg-green-600 text-dark-bg"
                  onClick={handleCreatePlaylist}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}