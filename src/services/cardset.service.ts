import apiService from './api.service';
import type { ICardSet, ICardSetCard } from '~/interfaces';

export interface ICreateCardSetRequest {
  title: string;
  description: string;
  language?: string;
  cards: ICardSetCard[];
}

export interface IUpdateCardSetRequest {
  title?: string;
  description?: string;
  language?: string;
  cards?: ICardSetCard[];
}

class CardSetService {
  async getCardSets(): Promise<ICardSet[]> {
    return await apiService.get<ICardSet[]>('/cardsets');
  }

  async getCardSet(id: string): Promise<ICardSet> {
    return await apiService.get<ICardSet>(`/cardsets/${id}`);
  }

  async createCardSet(data: ICreateCardSetRequest): Promise<ICardSet> {
    return await apiService.post<ICardSet>('/cardsets', data);
  }

  async updateCardSet(id: string, data: IUpdateCardSetRequest): Promise<ICardSet> {
    return await apiService.put<ICardSet>(`/cardsets/${id}`, data);
  }

  async deleteCardSet(id: string): Promise<void> {
    await apiService.delete(`/cardsets/${id}`);
  }

  async togglePublish(id: string): Promise<ICardSet> {
    return await apiService.post<ICardSet>(`/cardsets/${id}/publish`);
  }

  async getGlobalCardSets(): Promise<ICardSet[]> {
    return await apiService.get<ICardSet[]>('/cardsets/global');
  }

  async importFromGlobal(id: string): Promise<ICardSet> {
    return await apiService.post<ICardSet>(`/cardsets/${id}/import`);
  }
}

export default new CardSetService();
