import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ICardSet } from '~/interfaces/cardset.interface';
import cardSetService from '~/services/cardset.service';
import indexedDBService from '~/services/indexeddb.service';
import syncService from '~/services/sync.service';

// Enhanced sample data for offline mode
const sampleCardSets: ICardSet[] = [
  {
    id: 'sample-1',
    title: 'English Vocabulary - Basics',
    description: 'Essential English words for beginners',
    cards: [
      { id: '1-1', terminology: 'Hello', define: 'A greeting used when meeting someone' },
      { id: '1-2', terminology: 'Goodbye', define: 'A farewell expression when parting' },
      { id: '1-3', terminology: 'Thank you', define: 'Expression of gratitude or appreciation' },
      { id: '1-4', terminology: 'Please', define: 'Polite way to make a request' },
      { id: '1-5', terminology: 'Sorry', define: 'Expression of apology or regret' },
      { id: '1-6', terminology: 'Yes', define: 'Affirmative response' },
      { id: '1-7', terminology: 'No', define: 'Negative response' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Programming Terms',
    description: 'Common programming concepts and terminology',
    cards: [
      { id: '2-1', terminology: 'Variable', define: 'A named storage location that can hold a value' },
      { id: '2-2', terminology: 'Function', define: 'A reusable block of code that performs a specific task' },
      { id: '2-3', terminology: 'Array', define: 'A data structure that stores multiple values in a single variable' },
      { id: '2-4', terminology: 'Loop', define: 'A programming construct that repeats a block of code' },
      { id: '2-5', terminology: 'Condition', define: 'A statement that evaluates to true or false' },
      { id: '2-6', terminology: 'Object', define: 'A collection of key-value pairs representing an entity' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Vietnamese Common Phrases',
    description: 'Everyday Vietnamese expressions',
    cards: [
      { id: '3-1', terminology: 'Xin chào', define: 'Hello / Greetings' },
      { id: '3-2', terminology: 'Tạm biệt', define: 'Goodbye / Farewell' },
      { id: '3-3', terminology: 'Cảm ơn', define: 'Thank you' },
      { id: '3-4', terminology: 'Xin lỗi', define: 'Sorry / Excuse me' },
      { id: '3-5', terminology: 'Không sao', define: 'It\'s okay / No problem' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useCardSetStore = defineStore(
  'cardset',
  () => {
    const cardSets = ref<ICardSet[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isInitialized = ref(false);

    const getAllCardSets = computed(() => cardSets.value);
    const getCardSetCount = computed(() => cardSets.value.length);

    const getCardSetById = (id: string) => {
      return cardSets.value.find((cs) => cs.id === id);
    };

    // Initialize store - load from IndexedDB first, then fetch from API
    const initialize = async () => {
      if (isInitialized.value) return;

      try {
        // Load from IndexedDB first (instant)
        const cachedCardSets = await indexedDBService.getAllCardSets();
        if (cachedCardSets.length > 0) {
          cardSets.value = cachedCardSets;
        } else if (cardSets.value.length === 0) {
          // If no cached data and no data in store, use sample data
          cardSets.value = sampleCardSets;
          // Save sample data to IndexedDB
          for (const cardSet of sampleCardSets) {
            await indexedDBService.saveCardSet(cardSet);
          }
        }

        isInitialized.value = true;

        // Then try to fetch fresh data from API if online
        if (navigator.onLine) {
          fetchCardSets().catch(() => {
            // Silently fail if offline or API error
            console.log('Using cached data - API fetch failed');
          });
        }
      } catch (err) {
        console.error('Failed to initialize store:', err);
        // Fallback to sample data
        cardSets.value = sampleCardSets;
        isInitialized.value = true;
      }
    };

    // Fetch all card sets from API
    const fetchCardSets = async () => {
      loading.value = true;
      error.value = null;
      try {
        const fetchedCardSets = await cardSetService.getCardSets();
        cardSets.value = fetchedCardSets;

        // Save to IndexedDB for offline access
        for (const cardSet of fetchedCardSets) {
          await indexedDBService.saveCardSet(cardSet);
        }
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to fetch card sets';
        console.error('Failed to fetch card sets:', err);

        // If offline and no cached data, use sample data
        if (!navigator.onLine && cardSets.value.length === 0) {
          cardSets.value = sampleCardSets;
        }
      } finally {
        loading.value = false;
      }
    };

  // Fetch single card set (offline-first)
  const fetchCardSet = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Try to get from cache first
      const cachedCardSet = await indexedDBService.getCardSet(id);
      if (cachedCardSet) {
        const index = cardSets.value.findIndex((cs) => cs.id === id);
        if (index !== -1) {
          cardSets.value[index] = cachedCardSet;
        } else {
          cardSets.value.push(cachedCardSet);
        }
      }

      // Then fetch from API if online
      if (navigator.onLine) {
        const cardSet = await cardSetService.getCardSet(id);
        const index = cardSets.value.findIndex((cs) => cs.id === id);
        if (index !== -1) {
          cardSets.value[index] = cardSet;
        } else {
          cardSets.value.push(cardSet);
        }
        // Update cache
        await indexedDBService.saveCardSet(cardSet);
        return cardSet;
      }

      return cachedCardSet;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch card set';
      console.error('Failed to fetch card set:', err);
      // Return cached version if exists
      const cached = await indexedDBService.getCardSet(id);
      if (cached) return cached;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add a new card set (offline-first with optimistic UI)
  const addCardSet = async (cardSet: { title: string; description: string; cards: any[] }) => {
    loading.value = true;
    error.value = null;

    // Create temporary ID for offline mode
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempCardSet: ICardSet = {
      id: tempId,
      ...cardSet,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (navigator.onLine) {
        // Online: create via API
        const newCardSet = await cardSetService.createCardSet(cardSet);
        cardSets.value.unshift(newCardSet);
        // Save to IndexedDB
        await indexedDBService.saveCardSet(newCardSet);
        return newCardSet;
      } else {
        // Offline: save locally and queue for sync
        cardSets.value.unshift(tempCardSet);
        await indexedDBService.saveCardSet(tempCardSet);
        await syncService.queueOperation('create', 'cardset', cardSet);
        return tempCardSet;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create card set';
      console.error('Failed to create card set:', err);

      // If API fails but we're online, treat as offline
      if (navigator.onLine) {
        cardSets.value.unshift(tempCardSet);
        await indexedDBService.saveCardSet(tempCardSet);
        await syncService.queueOperation('create', 'cardset', cardSet);
        return tempCardSet;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update an existing card set (offline-first with optimistic UI)
  const updateCardSet = async (id: string, updates: Partial<ICardSet>) => {
    loading.value = true;
    error.value = null;

    // Find existing card set
    const index = cardSets.value.findIndex((cs) => cs.id === id);
    const existingCardSet = index !== -1 ? cardSets.value[index] : null;

    if (!existingCardSet) {
      throw new Error('Card set not found');
    }

    // Optimistic update
    const updatedCardSet: ICardSet = {
      ...existingCardSet,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    cardSets.value[index] = updatedCardSet;
    await indexedDBService.saveCardSet(updatedCardSet);

    try {
      if (navigator.onLine) {
        // Online: update via API
        const serverCardSet = await cardSetService.updateCardSet(id, updates);
        cardSets.value[index] = serverCardSet;
        await indexedDBService.saveCardSet(serverCardSet);
        return serverCardSet;
      } else {
        // Offline: queue for sync
        await syncService.queueOperation('update', 'cardset', updatedCardSet);
        return updatedCardSet;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update card set';
      console.error('Failed to update card set:', err);

      // Keep optimistic update and queue for sync
      await syncService.queueOperation('update', 'cardset', updatedCardSet);
      return updatedCardSet;
    } finally {
      loading.value = false;
    }
  };

  // Delete a card set (offline-first with optimistic UI)
  const deleteCardSet = async (id: string) => {
    loading.value = true;
    error.value = null;

    const index = cardSets.value.findIndex((cs) => cs.id === id);
    const cardSetToDelete = index !== -1 ? { ...cardSets.value[index] } : null;

    if (index === -1) {
      throw new Error('Card set not found');
    }

    // Optimistic delete
    cardSets.value.splice(index, 1);
    await indexedDBService.deleteCardSet(id);

    try {
      if (navigator.onLine) {
        // Online: delete via API
        await cardSetService.deleteCardSet(id);
        return true;
      } else {
        // Offline: queue for sync
        await syncService.queueOperation('delete', 'cardset', { id });
        return true;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete card set';
      console.error('Failed to delete card set:', err);

      // Keep optimistic delete and queue for sync
      await syncService.queueOperation('delete', 'cardset', { id });
      return true;
    } finally {
      loading.value = false;
    }
  };

  // Initialize with sample data
  const initializeSampleData = () => {
    if (cardSets.value.length === 0) {
      cardSets.value = sampleCardSets;
    }
  };

  // Export cardset as JSON
  const exportCardSet = (id: string): string => {
    const cardSet = getCardSetById(id);
    if (!cardSet) {
      throw new Error('Card set not found');
    }
    return JSON.stringify(cardSet, null, 2);
  };

  // Export all cardsets as JSON
  const exportAllCardSets = (): string => {
    return JSON.stringify(cardSets.value, null, 2);
  };

  // Import cardset from JSON
  const importCardSet = async (jsonString: string): Promise<ICardSet> => {
    try {
      const cardSet = JSON.parse(jsonString) as ICardSet;
      
      // Validate the structure
      if (!cardSet.title || !cardSet.cards || !Array.isArray(cardSet.cards)) {
        throw new Error('Invalid card set format');
      }

      // Create a new cardset with the imported data
      const newCardSet = await addCardSet({
        title: cardSet.title + ' (Imported)',
        description: cardSet.description || '',
        cards: cardSet.cards.map((card) => ({
          terminology: card.terminology,
          define: card.define,
        })),
      });

      return newCardSet;
    } catch (err: any) {
      console.error('Failed to import card set:', err);
      throw new Error('Invalid JSON format or card set structure');
    }
  };

  // Generate shareable link for a cardset
  const generateShareLink = (id: string): string => {
    const cardSet = getCardSetById(id);
    if (!cardSet) {
      throw new Error('Card set not found');
    }

    // Create a simplified version without timestamps and user_id
    const shareData = {
      title: cardSet.title,
      description: cardSet.description,
      cards: cardSet.cards.map((card) => ({
        terminology: card.terminology,
        define: card.define,
      })),
    };

    // Encode to base64
    const jsonString = JSON.stringify(shareData);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    
    // Generate URL with the base64 encoded data
    const baseUrl = window.location.origin;
    return `${baseUrl}/import-shared?data=${base64}`;
  };

  // Import from shared link data
  const importFromShareLink = async (base64Data: string): Promise<ICardSet> => {
    try {
      // Decode from base64
      const jsonString = decodeURIComponent(escape(atob(base64Data)));
      const shareData = JSON.parse(jsonString);

      // Validate the structure
      if (!shareData.title || !shareData.cards || !Array.isArray(shareData.cards)) {
        throw new Error('Invalid shared data format');
      }

      // Create a new cardset with the shared data
      const newCardSet = await addCardSet({
        title: shareData.title,
        description: shareData.description || '',
        cards: shareData.cards,
      });

      return newCardSet;
    } catch (err: any) {
      console.error('Failed to import from share link:', err);
      throw new Error('Invalid share link or data format');
    }
  };

    return {
      cardSets,
      loading,
      error,
      isInitialized,
      getAllCardSets,
      getCardSetById,
      getCardSetCount,
      initialize,
      fetchCardSets,
      fetchCardSet,
      addCardSet,
      updateCardSet,
      deleteCardSet,
      initializeSampleData,
      exportCardSet,
      exportAllCardSets,
      importCardSet,
      generateShareLink,
      importFromShareLink,
    };
  },
  {
    persist: true,
  }
);
