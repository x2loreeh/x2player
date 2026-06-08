import type { Album, Song } from "@/types/types";

const unknownAlbum = "Unknown Album";
const unknownArtist = "Unknown Artist";

export function normalizeLocalArtist(value?: string | null) {
  return (value || unknownArtist)
    .split(";")
    .map((part) => part.trim())
    .find(Boolean) || unknownArtist;
}

export function makeLocalAlbumId(albumName: string, artistName: string) {
  return `local-album-${encodeURIComponent(albumName)}-${encodeURIComponent(
    artistName
  )}`;
}

function decodeLocalAlbumId(albumId: string) {
  try {
    return decodeURIComponent(albumId);
  } catch {
    return albumId;
  }
}

export function buildLocalAlbums(songs: Song[]) {
  const albumMap = new Map<string, Song[]>();

  songs.forEach((song) => {
    const albumName = song.album || unknownAlbum;
    const artistName = song.artist || unknownArtist;
    const key = song.albumId || `${albumName}\u0000${artistName}`;

    if (!albumMap.has(key)) {
      albumMap.set(key, []);
    }

    albumMap.get(key)!.push(song);
  });

  const albums: Album[] = [];
  albumMap.forEach((albumSongs) => {
    const sortedSongs = [...albumSongs].sort(
      (a, b) => (a.track || 0) - (b.track || 0)
    );
    const firstSong = sortedSongs[0];
    const albumName = firstSong.album || unknownAlbum;
    const artistName = firstSong.artistId || firstSong.artist || unknownArtist;

    albums.push({
      id: firstSong.albumId || makeLocalAlbumId(albumName, artistName),
      name: albumName,
      artist: artistName,
      coverArt: firstSong.coverArt || "",
      trackCount: sortedSongs.length,
      duration: sortedSongs.reduce(
        (total, song) => total + (song.duration || 0),
        0
      ),
      createdAt: new Date(),
      artistId: artistName,
      year: firstSong.year || undefined,
      genre: firstSong.genre || undefined,
      songs: sortedSongs,
    });
  });

  return albums;
}

export function getLocalAlbumById(songs: Song[], albumId: string) {
  const requestedAlbumId = decodeLocalAlbumId(albumId);

  return (
    buildLocalAlbums(songs).find(
      (album) =>
        album.id === albumId || decodeLocalAlbumId(album.id) === requestedAlbumId
    ) || null
  );
}
