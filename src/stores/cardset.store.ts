import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ICardSet } from '~/interfaces/cardset.interface';
import cardSetService from '~/services/cardset.service';

// Sample data for offline mode
const sampleCardSets: ICardSet[] = [
  {
    id: '1',
    title: 'English Vocabulary',
    description: 'Basic English words for beginners',
    cards: [
      { id: '1-1', terminology: 'Hello', define: 'A greeting' },
      { id: '1-2', terminology: 'Goodbye', define: 'A farewell' },
      { id: '1-3', terminology: 'Thank you', define: 'Expression of gratitude' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Programming Terms',
    description: 'Common programming concepts',
    cards: [
      { id: '2-1', terminology: 'Variable', define: 'A storage location with a name' },
      { id: '2-2', terminology: 'Function', define: 'A reusable block of code' },
      { id: '2-3', terminology: 'Array', define: 'A collection of elements' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useCardSetStore = defineStore('cardset', () => {
  const cardSets = ref<ICardSet[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getAllCardSets = computed(() => cardSets.value);
  const getCardSetCount = computed(() => cardSets.value.length);

  const getCardSetById = (id: string) => {
    return cardSets.value.find((cs) => cs.id === id);
  };

  // Fetch all card sets from API
  const fetchCardSets = async () => {
    loading.value = true;
    error.value = null;
    try {
      cardSets.value = await cardSetService.getCardSets();
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch card sets';
      console.error('Failed to fetch card sets:', err);
      // Fallback to sample data if API fails
      if (cardSets.value.length === 0) {
        cardSets.value = sampleCardSets;
      }
    } finally {
      loading.value = false;
    }
  };

  // Fetch single card set
  const fetchCardSet = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const cardSet = await cardSetService.getCardSet(id);
      // Update in store
      const index = cardSets.value.findIndex((cs) => cs.id === id);
      if (index !== -1) {
        cardSets.value[index] = cardSet;
      } else {
        cardSets.value.push(cardSet);
      }
      return cardSet;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch card set';
      console.error('Failed to fetch card set:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Add a new card set
  const addCardSet = async (cardSet: { title: string; description: string; cards: any[] }) => {
    loading.value = true;
    error.value = null;
    try {
      const newCardSet = await cardSetService.createCardSet(cardSet);
      cardSets.value.unshift(newCardSet);
      return newCardSet;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create card set';
      console.error('Failed to create card set:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update an existing card set
  const updateCardSet = async (id: string, updates: Partial<ICardSet>) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedCardSet = await cardSetService.updateCardSet(id, updates);
      const index = cardSets.value.findIndex((cs) => cs.id === id);
      if (index !== -1) {
        cardSets.value[index] = updatedCardSet;
      }
      return updatedCardSet;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update card set';
      console.error('Failed to update card set:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete a card set
  const deleteCardSet = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await cardSetService.deleteCardSet(id);
      const index = cardSets.value.findIndex((cs) => cs.id === id);
      if (index !== -1) {
        cardSets.value.splice(index, 1);
      }
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete card set';
      console.error('Failed to delete card set:', err);
      throw err;
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
    getAllCardSets,
    getCardSetById,
    getCardSetCount,
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
});
