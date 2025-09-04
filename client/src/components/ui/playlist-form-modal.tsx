import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { navidromeService } from "@/services/navidrome";
import { useToast } from "@/hooks/use-toast";

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { id: string; name: string };
}

const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [playlistName, setPlaylistName] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setPlaylistName(initialData.name);
    } else {
      setPlaylistName("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      toast({
        title: "Error",
        description: "Playlist name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      if (initialData) {
        await navidromeService.updatePlaylist(initialData.id, playlistName);
        toast({ title: "Playlist updated successfully!" });
      } else {
        await navidromeService.createPlaylist(playlistName);
        toast({ title: "Playlist created successfully!" });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Playlist operation failed:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          (initialData
            ? "Failed to update playlist."
            : "Failed to create playlist."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] text-white border-0 rounded-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Playlist" : "Create New Playlist"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-0 text-white"
            />
          </div>
          
            
        
          <DialogFooter className="flex-row justify-end gap-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-black hover:bg-gray-900 text-white"
            >
              {isLoading
                ? "Creating..."
                : initialData
                ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistFormModal;