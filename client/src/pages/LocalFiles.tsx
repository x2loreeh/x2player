import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { usePlayerStore } from "@/stores/playerStore";
import type { Track } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import jsmediatags from "jsmediatags";

// Funzione per leggere i metadati di un file audio
const readTrackMetadata = (file: File): Promise<Track> => {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const tags = tag.tags;
        let coverUrl = "default-cover";

        if (tags.picture) {
          const { data, format } = tags.picture;
          const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
          coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
        }

        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener("loadedmetadata", () => {
            URL.revokeObjectURL(audio.src); // Pulisce l'URL dell'oggetto
            const trackData: Track = {
                id: `local-${file.name}-${Math.random()}`,
                title: tags.title || file.name.replace(/\.[^/.]+$/, ""),
                artist: tags.artist || "Unknown Artist",
                album: tags.album || "Unknown Album",
                year: tags.year ? parseInt(tags.year, 10) : null,
                genre: tags.genre || null,
                track: tags.track ? parseInt(tags.track.split('/')[0], 10) : null,
                coverArt: coverUrl,
                duration: audio.duration,
                path: audio.src, // Usiamo l'object URL per la riproduzione
                albumId: `local-album-${tags.artist}-${tags.album}`,
            };
            resolve(trackData);
        });
        audio.addEventListener("error", (e) => {
            URL.revokeObjectURL(audio.src);
            reject(new Error("Error loading audio metadata"));
        });
      },
      onError: (error) => {
        console.error("Could not read metadata for file:", file.name, error);
        // Risolve con metadati di base se la lettura fallisce
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener("loadedmetadata", () => {
            URL.revokeObjectURL(audio.src);
            resolve({
                id: `local-${file.name}-${Math.random()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                album: "Unknown Album",
                year: null,
                genre: null,
                track: null,
                coverArt: "default-cover",
                duration: audio.duration,
                path: audio.src,
                albumId: `local-album-unknown`,
            });
        });
         audio.addEventListener("error", (e) => {
            URL.revokeObjectURL(audio.src);
            reject(new Error("Error loading audio metadata"));
        });
      },
    });
  });
};


export function LocalFiles() {
  const [isLoading, setIsLoading] = useState(false);
  const { playQueue } = usePlayerStore();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    const audioFiles = Array.from(files).filter((file) =>
      /\.(mp3|flac|wav|m4a|ogg)$/i.test(file.name)
    );

    try {
      const tracks = await Promise.all(audioFiles.map(readTrackMetadata));
      if (tracks.length > 0) {
        playQueue(tracks);
        setLocation("/"); // Naviga alla home page dopo aver caricato i brani
      } else {
        alert("No compatible audio files found in the selected directory.");
      }
    } catch (error) {
      console.error("Error processing files:", error);
      alert("An error occurred while processing the audio files.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {isLoading ? (
        <>
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <h2 className="text-2xl">Loading your music...</h2>
          <p>This may take a moment.</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl mb-4">Access Local Files</h2>
          <p className="mb-8">
            Select your music folder to start listening.
          </p>
          <Button onClick={handleButtonClick}>Select Music Folder</Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFolderSelect}
            className="hidden"
            webkitdirectory=""
            directory=""
            multiple
          />
        </>
      )}
    </div>
  );
}