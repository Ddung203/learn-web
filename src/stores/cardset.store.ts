import { defineStore } from 'pinia';
import type { ICardSet, ICardSetCard, ICreateCardSetParams } from '~/interfaces';
import { STORE_ID } from './store-id';

interface CardSetState {
  cardSets: ICardSet[];
}

export const useCardSetStore = defineStore(STORE_ID.CARDSET, {
  state: (): CardSetState => ({
    cardSets: [],
  }),

  getters: {
    getAllCardSets: (state): ICardSet[] => {
      return state.cardSets.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },

    getCardSetById: (state) => {
      return (id: string): ICardSet | undefined => {
        return state.cardSets.find((cardSet) => cardSet.id === id);
      };
    },

    getTotalCardSets: (state): number => {
      return state.cardSets.length;
    },
  },

  actions: {
    // Initialize with sample data if empty
    initializeSampleData() {
      if (this.cardSets.length === 0) {
        const sampleCardSets: ICardSet[] = [
          {
            id: 'cardset-sample-1',
            title: 'English Vocabulary - Level 1',
            description: 'Basic English vocabulary for beginners',
            cards: [
              { id: 'card-1', terminology: 'Hello', define: 'Xin chào' },
              { id: 'card-2', terminology: 'Goodbye', define: 'Tạm biệt' },
              { id: 'card-3', terminology: 'Thank you', define: 'Cảm ơn' },
              { id: 'card-4', terminology: 'Please', define: 'Làm ơn' },
              { id: 'card-5', terminology: 'Sorry', define: 'Xin lỗi' },
              { id: 'card-6', terminology: 'Yes', define: 'Có' },
              { id: 'card-7', terminology: 'No', define: 'Không' },
              { id: 'card-8', terminology: 'Good morning', define: 'Chào buổi sáng' },
              { id: 'card-9', terminology: 'Good night', define: 'Chúc ngủ ngon' },
              { id: 'card-10', terminology: 'How are you?', define: 'Bạn khỏe không?' },
            ],
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          },
          {
            id: 'cardset-sample-2',
            title: 'Programming Terms',
            description: 'Common programming terminology',
            cards: [
              { id: 'card-11', terminology: 'Variable', define: 'Biến' },
              { id: 'card-12', terminology: 'Function', define: 'Hàm' },
              { id: 'card-13', terminology: 'Array', define: 'Mảng' },
              { id: 'card-14', terminology: 'Object', define: 'Đối tượng' },
              { id: 'card-15', terminology: 'Loop', define: 'Vòng lặp' },
              { id: 'card-16', terminology: 'Condition', define: 'Điều kiện' },
              { id: 'card-17', terminology: 'Class', define: 'Lớp' },
              { id: 'card-18', terminology: 'Method', define: 'Phương thức' },
              { id: 'card-19', terminology: 'Interface', define: 'Giao diện' },
              { id: 'card-20', terminology: 'Algorithm', define: 'Thuật toán' },
            ],
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          },
          {
            id: 'cardset-sample-3',
            title: 'Math Formulas',
            description: 'Essential mathematical formulas',
            cards: [
              { id: 'card-21', terminology: 'a² + b² = c²', define: 'Pythagorean theorem' },
              { id: 'card-22', terminology: 'E = mc²', define: 'Energy-mass equivalence' },
              { id: 'card-23', terminology: '∫ f(x) dx', define: 'Integral' },
              { id: 'card-24', terminology: 'd/dx', define: 'Derivative' },
              { id: 'card-25', terminology: 'π ≈ 3.14159', define: 'Pi constant' },
              { id: 'card-26', terminology: 'e ≈ 2.71828', define: 'Euler\'s number' },
            ],
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ];

        this.cardSets = sampleCardSets;
      }
    },

    createCardSet(params: ICreateCardSetParams): ICardSet {
      const newCardSet: ICardSet = {
        id: `cardset-${Date.now()}`,
        title: params.title,
        description: params.description,
        cards: params.cards.map((card, index) => ({
          id: `card-${Date.now()}-${index}`,
          terminology: card.terminology,
          define: card.define,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.cardSets.push(newCardSet);
      return newCardSet;
    },

    updateCardSet(id: string, params: Partial<ICreateCardSetParams>): ICardSet | null {
      const index = this.cardSets.findIndex((cs) => cs.id === id);

      if (index === -1) {
        return null;
      }

      const updatedCardSet: ICardSet = {
        ...this.cardSets[index],
        ...(params.title && { title: params.title }),
        ...(params.description && { description: params.description }),
        ...(params.cards && {
          cards: params.cards.map((card, idx) => ({
            id: `card-${Date.now()}-${idx}`,
            terminology: card.terminology,
            define: card.define,
          })),
        }),
        updatedAt: new Date().toISOString(),
      };

      this.cardSets[index] = updatedCardSet;
      return updatedCardSet;
    },

    deleteCardSet(id: string): boolean {
      const index = this.cardSets.findIndex((cs) => cs.id === id);

      if (index === -1) {
        return false;
      }

      this.cardSets.splice(index, 1);
      return true;
    },

    // Card operations within a card set
    addCardToSet(cardSetId: string, card: Omit<ICardSetCard, 'id'>): boolean {
      const cardSet = this.cardSets.find((cs) => cs.id === cardSetId);

      if (!cardSet) {
        return false;
      }

      const newCard: ICardSetCard = {
        id: `card-${Date.now()}`,
        ...card,
      };

      cardSet.cards.push(newCard);
      cardSet.updatedAt = new Date().toISOString();
      return true;
    },

    updateCardInSet(
      cardSetId: string,
      cardId: string,
      updates: Partial<Omit<ICardSetCard, 'id'>>
    ): boolean {
      const cardSet = this.cardSets.find((cs) => cs.id === cardSetId);

      if (!cardSet) {
        return false;
      }

      const cardIndex = cardSet.cards.findIndex((c) => c.id === cardId);

      if (cardIndex === -1) {
        return false;
      }

      cardSet.cards[cardIndex] = {
        ...cardSet.cards[cardIndex],
        ...updates,
      };

      cardSet.updatedAt = new Date().toISOString();
      return true;
    },

    deleteCardFromSet(cardSetId: string, cardId: string): boolean {
      const cardSet = this.cardSets.find((cs) => cs.id === cardSetId);

      if (!cardSet) {
        return false;
      }

      const cardIndex = cardSet.cards.findIndex((c) => c.id === cardId);

      if (cardIndex === -1) {
        return false;
      }

      cardSet.cards.splice(cardIndex, 1);
      cardSet.updatedAt = new Date().toISOString();
      return true;
    },

    clearAllCardSets() {
      this.cardSets = [];
    },
  },

  persist: true,
});
