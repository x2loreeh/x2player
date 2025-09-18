import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { navidrome } from "@/services/navidrome";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { id: string; name: string; coverArt?: string | null };
}

export default function PlaylistFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: PlaylistFormModalProps) {
  const [name, setName] = useState("");
  // We'll just store the file object in state for now.
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, name }: { id?: string; name:string }) => {
      if (id) {
        return navidrome.updatePlaylist(id, name);
      }
      return navidrome.createPlaylist(name);
    },
    onSuccess: () => {
      toast({
        title: initialData
          ? "Playlist updated successfully"
          : "Playlist created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: initialData
          ? "Error updating playlist"
          : "Error creating playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPreview(initialData.coverArt || null);
    } else {
      setName("");
      setPreview(null);
    }
    setCoverArtFile(null); // Reset file input on open
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverArtFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual file upload.
    // For now, we're not passing the image to the mutation.
    // The mutation would need to be updated to handle file uploads,
    // which likely requires a new backend endpoint.
    mutation.mutate({ id: initialData?.id, name });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Playlist" : "Create Playlist"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            {preview && (
              <img
                src={preview}
                alt="Playlist cover preview"
                className="w-24 h-24 object-cover rounded-md"
              />
            )}
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}