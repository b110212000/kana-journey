// Independent IndexedDB; existing YOMIO localStorage learning records are never migrated or modified.
const DB_NAME = 'yomio-song-study';
const DB_VERSION = 1;
const STORE = 'songs';

function openStore() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('此瀏覽器不支援歌曲本機儲存。'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, {keyPath: 'id'});
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function transaction(mode, run) {
  const db = await openStore();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const request = run(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export const getSavedSongs = async () => {
  const songs = await transaction('readonly', store => store.getAll());
  return songs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};
export const saveSong = song => transaction('readwrite', store => store.put(song));
export const removeSong = id => transaction('readwrite', store => store.delete(id));
