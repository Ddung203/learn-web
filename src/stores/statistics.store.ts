import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import statisticsService from '~/services/statistics.service';
import type {
  IStatisticsResponse,
  ICardSetStatistics,
  IStudySession,
  ICreateSessionRequest,
  IUserStatistics,
  IPerformanceByMode,
  ICardMastery,
} from '~/interfaces/statistics.interface';

export const useStatisticsStore = defineStore('statistics', () => {
  // State
  const userStatistics = ref<IUserStatistics | null>(null);
  const performanceByMode = ref<IPerformanceByMode[]>([]);
  const recentSessions = ref<IStudySession[]>([]);
  const weakCards = ref<ICardMastery[]>([]);
  const masteredCards = ref<ICardMastery[]>([]);
  const cardSetStatistics = ref<Map<string, ICardSetStatistics>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasStatistics = computed(() => userStatistics.value !== null);

  const totalStudyTimeFormatted = computed(() => {
    if (!userStatistics.value) return '0h 0m';
    const seconds = userStatistics.value.total_study_time;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  });

  const averageAccuracy = computed(() => {
    if (!userStatistics.value) return 0;
    return Math.round(userStatistics.value.overall_accuracy);
  });

  // Actions
  async function recordSession(data: ICreateSessionRequest): Promise<IStudySession | null> {
    try {
      loading.value = true;
      error.value = null;
      const session = await statisticsService.recordSession(data);

      // Ensure recentSessions is initialized as an array
      if (!recentSessions.value || !Array.isArray(recentSessions.value)) {
        recentSessions.value = [];
      }

      // Add to recent sessions
      recentSessions.value.unshift(session);
      if (recentSessions.value.length > 10) {
        recentSessions.value.pop();
      }

      // Optionally refresh statistics after recording
      // await fetchUserStatistics();

      return session;
    } catch (err: any) {
      error.value = err.message || 'Failed to record session';
      console.error('Error recording session:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserStatistics(): Promise<void> {
    try {
      loading.value = true;
      error.value = null;
      const response = await statisticsService.getUserStatistics();

      userStatistics.value = response.overview;
      performanceByMode.value = response.performance_by_mode;
      recentSessions.value = response.recent_sessions;
      weakCards.value = response.weak_cards;
      masteredCards.value = response.mastered_cards;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch statistics';
      console.error('Error fetching statistics:', err);

      // Initialize with empty data on error
      userStatistics.value = null;
      performanceByMode.value = [];
      recentSessions.value = [];
      weakCards.value = [];
      masteredCards.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchCardSetStatistics(cardSetId: string): Promise<ICardSetStatistics | null> {
    try {
      loading.value = true;
      error.value = null;
      const stats = await statisticsService.getCardSetStatistics(cardSetId);
      cardSetStatistics.value.set(cardSetId, stats);
      return stats;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch card set statistics';
      console.error('Error fetching card set statistics:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  function getCardSetStats(cardSetId: string): ICardSetStatistics | undefined {
    return cardSetStatistics.value.get(cardSetId);
  }

  function clearStatistics(): void {
    userStatistics.value = null;
    performanceByMode.value = [];
    recentSessions.value = [];
    weakCards.value = [];
    masteredCards.value = [];
    cardSetStatistics.value.clear();
    error.value = null;
  }

  return {
    // State
    userStatistics,
    performanceByMode,
    recentSessions,
    weakCards,
    masteredCards,
    cardSetStatistics,
    loading,
    error,

    // Computed
    hasStatistics,
    totalStudyTimeFormatted,
    averageAccuracy,

    // Actions
    recordSession,
    fetchUserStatistics,
    fetchCardSetStatistics,
    getCardSetStats,
    clearStatistics,
  };
});
