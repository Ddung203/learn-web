import apiService from './api.service';
import type {
  IStatisticsResponse,
  ICardSetStatistics,
  IStudySession,
  ICreateSessionRequest,
} from '~/interfaces/statistics.interface';

class StatisticsService {
  /**
   * Record a new study session
   */
  async recordSession(data: ICreateSessionRequest): Promise<IStudySession> {
    return apiService.post<IStudySession>('/statistics/sessions', data);
  }

  /**
   * Get comprehensive user statistics
   */
  async getUserStatistics(): Promise<IStatisticsResponse> {
    return apiService.get<IStatisticsResponse>('/statistics');
  }

  /**
   * Get statistics for a specific card set
   */
  async getCardSetStatistics(cardSetId: string): Promise<ICardSetStatistics> {
    return apiService.get<ICardSetStatistics>(
      `/statistics/cardsets/${cardSetId}`
    );
  }
}

export default new StatisticsService();
