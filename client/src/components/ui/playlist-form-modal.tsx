tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@//components/ui/label';
import { NavidromeService } from '@/services/navidrome'; // Assuming you have this service
import { usePlayerStore } from '@/stores/playerStore'; // Assuming you have this store
import { DialogClose } from '@radix-ui/react-dialog';
import { useToast } from '@/hooks/use-toast';

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id: string; name: string }; // Optional for editing, added id
}

const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistImage, setPlaylistImage] = useState<File | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchPlaylists } = usePlayerStore(); // Assuming an action to refetch playlists
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setPlaylistName(initialData.name);
    } else {
      setPlaylistName('');
      setPlaylistImage(undefined);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const navidromeService = new NavidromeService();

    try {
      if (initialData) {
        // Editing existing playlist
        await navidromeService.updatePlaylist(initialData.id, playlistName, playlistImage);
        toast({ title: 'Playlist updated successfully!' });
      } else {
        // Creating new playlist
        await navidromeService.createPlaylist(playlistName, playlistImage);
        toast({ title: 'Playlist created successfully!' });
      }
      fetchPlaylists(); // Refresh the playlist list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Playlist operation failed:', error);
      toast({
        title: 'Error',
        description: initialData ? 'Failed to update playlist.' : 'Failed to create playlist.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPlaylistImage(e.target.files[0]);
    } else {
      setPlaylistImage(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Playlist' : 'Create Playlist'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
            <Button type="submit" disabled={isLoading}>{initialData ? 'Save changes' : 'Create Playlist'}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistFormModal;