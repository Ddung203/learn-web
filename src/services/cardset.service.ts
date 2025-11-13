import type {
  ICardSet,
  ICardSetCard,
  ICreateCardSetParams,
  IUpdateCardSetParams,
  NewApiResponse,
} from '~/interfaces';

// Fake database
const fakeDatabase: ICardSet[] = [
  {
    id: 'cardset-1',
    title: 'English Vocabulary - Level 1',
    description: 'Basic English vocabulary for beginners',
    cards: [
      { id: 'card-1', terminology: 'Hello', define: 'Xin chào' },
      { id: 'card-2', terminology: 'Goodbye', define: 'Tạm biệt' },
      { id: 'card-3', terminology: 'Thank you', define: 'Cảm ơn' },
      { id: 'card-4', terminology: 'Please', define: 'Làm ơn' },
      { id: 'card-5', terminology: 'Sorry', define: 'Xin lỗi' },
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'cardset-2',
    title: 'Programming Terms',
    description: 'Common programming terminology',
    cards: [
      { id: 'card-6', terminology: 'Variable', define: 'Biến' },
      { id: 'card-7', terminology: 'Function', define: 'Hàm' },
      { id: 'card-8', terminology: 'Array', define: 'Mảng' },
      { id: 'card-9', terminology: 'Object', define: 'Đối tượng' },
      { id: 'card-10', terminology: 'Loop', define: 'Vòng lặp' },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cardset-3',
    title: 'Math Formulas',
    description: 'Essential mathematical formulas',
    cards: [
      { id: 'card-11', terminology: 'a² + b² = c²', define: 'Pythagorean theorem' },
      { id: 'card-12', terminology: 'E = mc²', define: 'Energy-mass equivalence' },
      { id: 'card-13', terminology: '∫ f(x) dx', define: 'Integral' },
      { id: 'card-14', terminology: 'd/dx', define: 'Derivative' },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export class CardSetService {
  static async getAllCardSets(): Promise<NewApiResponse<ICardSet[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      status: 200,
      message: 'Card sets retrieved successfully',
      payload: [...fakeDatabase],
      serverTime: Date.now(),
    };
  }

  static async getCardSetById(id: string): Promise<NewApiResponse<ICardSet>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const cardSet = fakeDatabase.find(cs => cs.id === id);

    if (!cardSet) {
      return {
        status: 404,
        message: 'Card set not found',
        payload: null as any,
        serverTime: Date.now(),
      };
    }

    return {
      status: 200,
      message: 'Card set retrieved successfully',
      payload: cardSet,
      serverTime: Date.now(),
    };
  }

  static async createCardSet(
    params: ICreateCardSetParams
  ): Promise<NewApiResponse<ICardSet>> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newCardSet: ICardSet = {
      id: `cardset-${Date.now()}`,
      title: params.title,
      description: params.description,
      cards: params.cards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fakeDatabase.push(newCardSet);

    return {
      status: 201,
      message: 'Card set created successfully',
      payload: newCardSet,
      serverTime: Date.now(),
    };
  }

  static async updateCardSet(
    params: IUpdateCardSetParams
  ): Promise<NewApiResponse<ICardSet>> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const index = fakeDatabase.findIndex(cs => cs.id === params.id);

    if (index === -1) {
      return {
        status: 404,
        message: 'Card set not found',
        payload: null as any,
        serverTime: Date.now(),
      };
    }

    const updatedCardSet: ICardSet = {
      ...fakeDatabase[index],
      ...(params.title && { title: params.title }),
      ...(params.description && { description: params.description }),
      ...(params.cards && {
        cards: params.cards.map((card, idx) => ({
          id: `card-${Date.now()}-${idx}`,
          terminology: card.terminology,
          define: card.define,
        })) as ICardSetCard[],
      }),
      updatedAt: new Date().toISOString(),
    };

    fakeDatabase[index] = updatedCardSet;

    return {
      status: 200,
      message: 'Card set updated successfully',
      payload: updatedCardSet,
      serverTime: Date.now(),
    };
  }

  static async deleteCardSet(id: string): Promise<NewApiResponse<null>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = fakeDatabase.findIndex(cs => cs.id === id);

    if (index === -1) {
      return {
        status: 404,
        message: 'Card set not found',
        payload: null,
        serverTime: Date.now(),
      };
    }

    fakeDatabase.splice(index, 1);

    return {
      status: 200,
      message: 'Card set deleted successfully',
      payload: null,
      serverTime: Date.now(),
    };
  }
}
