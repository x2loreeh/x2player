import { useEffect, useState } from "react";
import { Filesystem, Directory, FileInfo } from "@capacitor/filesystem";
import { usePlayerStore } from "@/stores/playerStore";
import { Track } from "@/lib/queries/playlist";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// A simplified function to parse track metadata from filename
const parseTrack = (fileName: string): Partial<Track> => {
  const cleanedName = fileName.replace(/\.(mp3|flac|wav|m4a)$/i, "");
  const parts = cleanedName.split(" - ");
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts[1] };
  }
  return { title: cleanedName, artist: "Unknown Artist" };
};

export function LocalFiles() {
  const [audioFiles, setAudioFiles] = useState<Track[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const { playTrack } = usePlayerStore();

  const requestPermissions = async () => {
    try {
      // This is a simplified permission request.
      // For a real app, you might need @capacitor/android-permissions
      const result = await Filesystem.requestPermissions();
      if (result.publicStorage === "granted") {
        setPermissionStatus("granted");
        loadAudioFiles();
      } else {
        setPermissionStatus("denied");
      }
    } catch (e) {
      console.error("Error requesting permissions", e);
      setPermissionStatus("denied");
    }
  };

  const loadAudioFiles = async () => {
    try {
      // Directory.Music is not available in the current Capacitor version.
      // Using Directory.Documents as a cross-platform fallback.
      // For Android, you might want to use Directory.ExternalStorage with path: "Music".
      const result = await Filesystem.readdir({
        path: "", // An empty path means the directory root.
        directory: Directory.Documents,
      });

      const files = result.files.filter((file: FileInfo) =>
        /\.(mp3|flac|wav|m4a)$/i.test(file.name)
      );

      const tracks: Track[] = files.map((file: FileInfo, index: number) => {
        const metadata = parseTrack(file.name);
        return {
          id: `local-${index}`,
          title: metadata.title || "Unknown Title",
          album: "Local Files",
          artist: metadata.artist || "Unknown Artist",
          coverArt: "default-cover", // Placeholder cover
          duration: 0, // Duration would require a more complex library to read
          path: file.uri,
          // Add missing nullable properties to match the Track type
          year: null,
          genre: null,
          albumId: null,
          track: null,
        };
      });

      setAudioFiles(tracks);
    } catch (e) {
      console.error("Unable to read music directory", e);
      // Fallback for web or if Music directory is not available
      alert("Could not read music directory. Please ensure you've granted permissions.");
    }
  };

  useEffect(() => {
    if (permissionStatus === "granted") {
      loadAudioFiles();
    }
  }, [permissionStatus]);

  if (permissionStatus === "prompt") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl mb-4">Access Local Files</h2>
        <p className="mb-4 text-center">We need your permission to access music files on your device.</p>
        <Button onClick={requestPermissions}>Grant Permission</Button>
      </div>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl mb-4">Permission Denied</h2>
        <p className="text-center">You've denied permission to access local files. Please enable it in your device settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Local Music</h1>
      <ScrollArea className="h-[calc(100vh-150px)]">
        {audioFiles.length > 0 ? (
          <ul>
            {audioFiles.map((track) => (
              <li
                key={track.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                onClick={() => playTrack(track)}
              >
                <div>
                  <div className="font-semibold">{track.title}</div>
                  <div className="text-sm text-muted-foreground">{track.artist}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No audio files found in your Music directory.</p>
        )}
      </ScrollArea>
    </div>
  );
}