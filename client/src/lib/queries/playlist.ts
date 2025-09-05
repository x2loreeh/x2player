import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { navidromeService } from '@/services/navidrome';
import type { Track as SharedTrack, Playlist as SharedPlaylist } from '@shared/schema';

export type Track = SharedTrack;
export type Playlist = SharedPlaylist;

// Definizioni dei tipi per le mutazioni
interface EditPlaylistParams {
  id: string;
  name: string;
  comment?: string;
  isPublic?: boolean;
}

interface RemoveTrackParams {
  playlistId: string;
  trackIndex: number;
}

interface UpdateTracksParams {
  playlistId: string;
  trackIds: string[];
}

interface CreatePlaylistParams {
  name: string;
  comment?: string;
  isPublic?: boolean;
}

// Query Keys
const queryKeys = {
  playlists: ['playlists'],
  playlist: (id: string) => ['playlist', id],
  playlistTracks: (id: string) => ['playlistTracks', id],
};

// Hooks per le Query (lettura dati)
export const usePlaylists = () => {
  return useQuery({
    queryKey: queryKeys.playlists,
    queryFn: () => navidromeService.getPlaylists(),
  });
};

export const usePlaylist = (id: string) => {
  return useQuery({
    queryKey: queryKeys.playlist(id),
    queryFn: () => navidromeService.getPlaylist(id),
    enabled: !!id, // La query non parte se l'id non è valido
  });
};

export const usePlaylistTracks = (id: string) => {
  return useQuery({
    queryKey: queryKeys.playlistTracks(id),
    queryFn: () => navidromeService.getPlaylistTracks(id),
    enabled: !!id,
  });
};

// Hooks per le Mutazioni (creazione, modifica, eliminazione)
export const useCreatePlaylist = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, comment, isPublic }: CreatePlaylistParams) =>
      navidromeService.createPlaylist(name, comment, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      onSuccess?.();
    },
  });
};

export const useEditPlaylist = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, comment, isPublic }: EditPlaylistParams) =>
      navidromeService.updatePlaylist(id, name, comment, isPublic),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      queryClient.invalidateQueries({ queryKey: queryKeys.playlist(data.id) });
      onSuccess?.();
    },
  });
};

export const useDeletePlaylist = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => navidromeService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      onSuccess?.();
    },
  });
};

export const useRemoveTrackFromPlaylist = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackIndex }: RemoveTrackParams) =>
      navidromeService.updatePlaylist(playlistId, undefined, undefined, undefined, undefined, undefined, [trackIndex]),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlistTracks(variables.playlistId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.playlist(variables.playlistId) });
      onSuccess?.();
    },
  });
};

export const useUpdatePlaylistTracks = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackIds }: UpdateTracksParams) =>
      navidromeService.reorderPlaylistTracks(playlistId, trackIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlistTracks(variables.playlistId) });
      onSuccess?.();
    },
  });
};