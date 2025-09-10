import React, { useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { usePlayerStore } from "@/stores/playerStore";

export function LocalFiles() {
  const { setFiles } = useLocalFilesStore();
  const { setDataSource } = useSettingsStore();
  const { clearQueue } = usePlayerStore();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const audioFiles = Array.from(fileList).filter((file) =>
      /\.(mp3|flac|wav|m4a|ogg)$/i.test(file.name)
    );

    if (audioFiles.length > 0) {
      clearQueue(); // Pulisce la coda precedente
      setFiles(audioFiles);
      setDataSource("local");
      setLocation("/home");
    } else {
      alert("No compatible audio files found in the selected directory.");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
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
        directory=""
        webkitdirectory=""
        multiple
      />
    </div>
  );
}