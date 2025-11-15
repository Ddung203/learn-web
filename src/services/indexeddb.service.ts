import type { ICardSet } from '~/interfaces';
import type { IStudySession } from '~/interfaces/statistics.interface';

const DB_NAME = 'chocolearn-db';
const DB_VERSION = 1;

export interface IPendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'cardset' | 'statistics';
  data: any;
  timestamp: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Card sets store
        if (!db.objectStoreNames.contains('cardsets')) {
          const cardSetStore = db.createObjectStore('cardsets', { keyPath: 'id' });
          cardSetStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Statistics store
        if (!db.objectStoreNames.contains('statistics')) {
          const statsStore = db.createObjectStore('statistics', { keyPath: 'id' });
          statsStore.createIndex('user_id', 'user_id', { unique: false });
          statsStore.createIndex('date', 'date', { unique: false });
        }

        // Pending operations queue
        if (!db.objectStoreNames.contains('pending_operations')) {
          const opsStore = db.createObjectStore('pending_operations', { keyPath: 'id' });
          opsStore.createIndex('timestamp', 'timestamp', { unique: false });
          opsStore.createIndex('entity', 'entity', { unique: false });
        }

        // Sync metadata
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Card Sets operations
  async saveCardSet(cardSet: ICardSet): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['cardsets'], 'readwrite');
    const store = tx.objectStore('cardsets');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(cardSet);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCardSet(id: string): Promise<ICardSet | null> {
    const db = await this.ensureDB();
    const tx = db.transaction(['cardsets'], 'readonly');
    const store = tx.objectStore('cardsets');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCardSets(): Promise<ICardSet[]> {
    const db = await this.ensureDB();
    const tx = db.transaction(['cardsets'], 'readonly');
    const store = tx.objectStore('cardsets');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCardSet(id: string): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['cardsets'], 'readwrite');
    const store = tx.objectStore('cardsets');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Statistics operations
  async saveStatistics(statistics: IStudySession): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['statistics'], 'readwrite');
    const store = tx.objectStore('statistics');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(statistics);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllStatistics(): Promise<IStudySession[]> {
    const db = await this.ensureDB();
    const tx = db.transaction(['statistics'], 'readonly');
    const store = tx.objectStore('statistics');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Pending operations queue
  async addPendingOperation(operation: Omit<IPendingOperation, 'id'>): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['pending_operations'], 'readwrite');
    const store = tx.objectStore('pending_operations');
    
    const op: IPendingOperation = {
      ...operation,
      id: `${operation.entity}_${operation.type}_${Date.now()}_${Math.random()}`,
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(op);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<IPendingOperation[]> {
    const db = await this.ensureDB();
    const tx = db.transaction(['pending_operations'], 'readonly');
    const store = tx.objectStore('pending_operations');
    const index = store.index('timestamp');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingOperation(id: string): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['pending_operations'], 'readwrite');
    const store = tx.objectStore('pending_operations');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingOperations(): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['pending_operations'], 'readwrite');
    const store = tx.objectStore('pending_operations');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync metadata
  async getSyncMetadata(key: string): Promise<any> {
    const db = await this.ensureDB();
    const tx = db.transaction(['sync_metadata'], 'readonly');
    const store = tx.objectStore('sync_metadata');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async setSyncMetadata(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['sync_metadata'], 'readwrite');
    const store = tx.objectStore('sync_metadata');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value, updated_at: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['cardsets', 'statistics', 'pending_operations', 'sync_metadata'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore('cardsets').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore('statistics').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore('pending_operations').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore('sync_metadata').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);
  }
}

export default new IndexedDBService();
