import indexedDBService, { type IPendingOperation } from './indexeddb.service';
import cardSetService from './cardset.service';
import type { ICardSet } from '~/interfaces';

class SyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;

  async initialize(): Promise<void> {
    await indexedDBService.init();
    
    // Listen for online status changes
    window.addEventListener('online-status-changed', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.isOnline && customEvent.detail.wasOffline) {
        this.syncPendingOperations();
      }
    });

    // Periodic sync check (every 5 minutes when online)
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncPendingOperations();
      }
    }, 5 * 60 * 1000);
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const operations = await indexedDBService.getPendingOperations();
      
      console.log(`Syncing ${operations.length} pending operations...`);

      for (const operation of operations) {
        try {
          await this.executePendingOperation(operation);
          await indexedDBService.removePendingOperation(operation.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          failedCount++;
          
          // If operation is too old (>7 days), remove it
          const ageInDays = (Date.now() - operation.timestamp) / (1000 * 60 * 60 * 24);
          if (ageInDays > 7) {
            console.warn(`Removing stale operation ${operation.id}`);
            await indexedDBService.removePendingOperation(operation.id);
          }
        }
      }

      // Update last sync time
      await indexedDBService.setSyncMetadata('last_sync', Date.now());

      console.log(`Sync completed: ${successCount} success, ${failedCount} failed`);
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, failed: failedCount };
  }

  private async executePendingOperation(operation: IPendingOperation): Promise<void> {
    switch (operation.entity) {
      case 'cardset':
        await this.syncCardSetOperation(operation);
        break;
      case 'statistics':
        // Statistics sync will be implemented later
        console.log('Statistics sync not yet implemented');
        break;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  private async syncCardSetOperation(operation: IPendingOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await cardSetService.createCardSet(operation.data);
        break;
      case 'update':
        await cardSetService.updateCardSet(operation.data.id, operation.data);
        break;
      case 'delete':
        await cardSetService.deleteCardSet(operation.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  async queueOperation(
    type: 'create' | 'update' | 'delete',
    entity: 'cardset' | 'statistics',
    data: any
  ): Promise<void> {
    await indexedDBService.addPendingOperation({
      type,
      entity,
      data,
      timestamp: Date.now(),
    });
  }

  async getPendingOperationsCount(): Promise<number> {
    const operations = await indexedDBService.getPendingOperations();
    return operations.length;
  }

  async getLastSyncTime(): Promise<number | null> {
    return await indexedDBService.getSyncMetadata('last_sync');
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export default new SyncService();
