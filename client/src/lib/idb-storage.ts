import { PersistStorage } from 'zustand/middleware';

const dbName = 'x2player-db';
const storeName = 'keyval';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStore(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(storeName, mode).objectStore(storeName);
}

async function idbGet<T>(key: IDBValidKey): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = getStore(db, 'readonly').get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: IDBValidKey, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = getStore(db, 'readwrite').put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function idbDel(key: IDBValidKey): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const request = getStore(db, 'readwrite').delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

export const idbStorage: PersistStorage<any> = {
  getItem: async (name: string) => {
    console.log(name, 'has been retrieved');
    return await idbGet(name);
  },
  setItem: async (name: string, value: any) => {
    console.log(name, 'with value', value, 'has been saved');
    await idbSet(name, value);
  },
  removeItem: async (name: string) => {
    console.log(name, 'has been deleted');
    await idbDel(name);
  },
};