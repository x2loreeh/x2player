import React, { useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
import { FilePicker, PickedFile } from "@capawesome/capacitor-file-picker";

// Funzione helper per convertire dati base64 in un Blob
const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

export function LocalFiles() {
  const { setFiles } = useLocalFilesStore();
  const { setDataSource } = useSettingsStore();
  const { clearQueue } = usePlayerStore();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper per aggiornare lo store e navigare
  const updateStoreAndNavigate = (files: File[]) => {
    if (files.length > 0) {
      clearQueue();
      setFiles(files);
      setDataSource("local");
      setLocation("/home");
    } else {
      alert("No compatible audio files found.");
    }
  };

  // Gestisce la selezione di file dal browser web
  const handleWebFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const audioFiles = Array.from(fileList).filter((file) =>
      /\.(mp3|flac|wav|m4a|ogg)$/i.test(file.name)
    );
    updateStoreAndNavigate(audioFiles);
  };

  // Processa i file da una directory (usato per Android)
  const processDirectory = async (directoryPath: string) => {
    const dirContents = await Filesystem.readdir({ path: directoryPath });
    const audioFileInfos = dirContents.files.filter((f) =>
      /\.(mp3|flac|wav|m4a|ogg)$/i.test(f.name)
    );

    const filePromises = audioFileInfos.map(async (fileInfo) => {
      const fileData = await Filesystem.readFile({ path: fileInfo.uri });
      const blob =
        typeof fileData.data === "string"
          ? b64toBlob(fileData.data, "audio/*")
          : fileData.data;
      return new File([blob], fileInfo.name, { type: blob.type });
    });

    const audioFiles = await Promise.all(filePromises);
    updateStoreAndNavigate(audioFiles);
  };

  // Processa i file selezionati individualmente (usato per iOS)
  const processPickedFiles = (pickedFiles: PickedFile[]) => {
    const audioFiles = pickedFiles
      .filter((f) => f.data && /\.(mp3|flac|wav|m4a|ogg)$/i.test(f.name || ""))
      .map((f) => {
        const blob = b64toBlob(f.data!, f.mimeType);
        return new File([blob], f.name || "unknown", { type: f.mimeType });
      });
    updateStoreAndNavigate(audioFiles);
  };

  // Gestisce il click sul pulsante principale
  const handleButtonClick = async () => {
    const platform = Capacitor.getPlatform();
    try {
      if (platform === "android") {
        const result = await FilePicker.pickDirectory();
        if (result && result.path) {
          await processDirectory(result.path);
        }
      } else if (platform === "ios") {
        alert(
          "Folder selection is not supported on iOS. Please select individual music files from your folder."
        );
        const result = await FilePicker.pickFiles({
          readData: true,
          types: ["public.audio"],
        });
        if (result && result.files.length > 0) {
          processPickedFiles(result.files);
        }
      } else {
        // Piattaforma Web
        fileInputRef.current?.click();
      }
    } catch (e) {
      console.error("Error during selection:", e);
      let message = "An error occurred during selection.";
      if (e instanceof Error) {
        // Don't show cancellation errors to the user
        if (e.message.includes("cancelled")) {
          return;
        }
        message += `\nDetails: ${e.message}`;
      } else if (typeof e === "string") {
        message += `\nDetails: ${e}`;
      }
      alert(message);
    }
  };

  const platform = Capacitor.getPlatform();
  const isIos = platform === "ios";
  const isWeb = platform === "web";

  const getButtonText = () => {
    if (isIos) return "Select Music Files";
    return "Select Music Folder";
  };

  const getDescription = () => {
    if (isIos)
      return "Select one or more music files to add to your library.";
    return "Select your music folder to start listening.";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl mb-4">Access Local Files</h2>
      <p className="mb-8">{getDescription()}</p>
      <Button onClick={handleButtonClick}>{getButtonText()}</Button>
      {isWeb && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleWebFileSelect}
          className="hidden"
          multiple
          {...{ directory: "", webkitdirectory: "" }}
        />
      )}
    </div>
  );
}