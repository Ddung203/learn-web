import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import statisticsService from '~/services/statistics.service';
import indexedDBService from '~/services/indexeddb.service';
import syncService from '~/services/sync.service';
import type {
  IStatisticsResponse,
  ICardSetStatistics,
  IStudySession,
  ICreateSessionRequest,
  IUserStatistics,
  IPerformanceByMode,
  ICardMastery,
} from '~/interfaces/statistics.interface';

export const useStatisticsStore = defineStore(
  'statistics',
  () => {
    // State
    const userStatistics = ref<IUserStatistics | null>(null);
    const performanceByMode = ref<IPerformanceByMode[]>([]);
    const recentSessions = ref<IStudySession[]>([]);
    const weakCards = ref<ICardMastery[]>([]);
    const masteredCards = ref<ICardMastery[]>([]);
    const cardSetStatistics = ref<Map<string, ICardSetStatistics>>(new Map());
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pendingSessions = ref<ICreateSessionRequest[]>([]);

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

        // Ensure recentSessions is initialized as an array
        if (!recentSessions.value || !Array.isArray(recentSessions.value)) {
          recentSessions.value = [];
        }

        if (navigator.onLine) {
          // Online: record to API
          const session = await statisticsService.recordSession(data);

          // Add to recent sessions
          recentSessions.value.unshift(session);
          if (recentSessions.value.length > 10) {
            recentSessions.value.pop();
          }

          // Save to IndexedDB
          await indexedDBService.saveStatistics(session as any);

          return session;
        } else {
          // Offline: create local session and queue for sync
          const duration = new Date(data.end_time).getTime() - new Date(data.start_time).getTime();
          const correct = data.attempts.filter(a => a.correct).length;
          const incorrect = data.attempts.filter(a => !a.correct).length;
          
          const localSession: IStudySession = {
            id: `temp_${Date.now()}_${Math.random()}`,
            user_id: 'local-user',
            cardset_id: data.cardset_id,
            mode: data.mode,
            start_time: data.start_time,
            end_time: data.end_time,
            duration: Math.floor(duration / 1000),
            total_cards: data.attempts.length,
            correct,
            incorrect,
            accuracy: data.attempts.length > 0 ? (correct / data.attempts.length) * 100 : 0,
            attempts: data.attempts,
            created_at: new Date().toISOString(),
          };

          // Add to recent sessions
          recentSessions.value.unshift(localSession);
          if (recentSessions.value.length > 10) {
            recentSessions.value.pop();
          }

          // Save to IndexedDB
          await indexedDBService.saveStatistics(localSession as any);

          // Queue for sync
          await syncService.queueOperation('create', 'statistics', data);
          pendingSessions.value.push(data);

          return localSession;
        }
      } catch (err: any) {
        error.value = err.message || 'Failed to record session';
        console.error('Error recording session:', err);

        // If online but failed, treat as offline
        if (navigator.onLine) {
          const duration = new Date(data.end_time).getTime() - new Date(data.start_time).getTime();
          const correct = data.attempts.filter(a => a.correct).length;
          const incorrect = data.attempts.filter(a => !a.correct).length;
          
          const localSession: IStudySession = {
            id: `temp_${Date.now()}_${Math.random()}`,
            user_id: 'local-user',
            cardset_id: data.cardset_id,
            mode: data.mode,
            start_time: data.start_time,
            end_time: data.end_time,
            duration: Math.floor(duration / 1000),
            total_cards: data.attempts.length,
            correct,
            incorrect,
            accuracy: data.attempts.length > 0 ? (correct / data.attempts.length) * 100 : 0,
            attempts: data.attempts,
            created_at: new Date().toISOString(),
          };

          recentSessions.value.unshift(localSession);
          await indexedDBService.saveStatistics(localSession as any);
          await syncService.queueOperation('create', 'statistics', data);
          pendingSessions.value.push(data);

          return localSession;
        }

        return null;
      } finally {
        loading.value = false;
      }
    }

    async function fetchUserStatistics(): Promise<void> {
      try {
        loading.value = true;
        error.value = null;

        // Load from IndexedDB first for instant display
        const cachedStats = await indexedDBService.getAllStatistics();
        if (cachedStats.length > 0) {
          // Use cached recent sessions
          recentSessions.value = cachedStats.slice(0, 10) as any;
        }

        // Then fetch from API if online
        if (navigator.onLine) {
          const response = await statisticsService.getUserStatistics();

          userStatistics.value = response.overview;
          performanceByMode.value = response.performance_by_mode;
          recentSessions.value = response.recent_sessions;
          weakCards.value = response.weak_cards;
          masteredCards.value = response.mastered_cards;

          // Update IndexedDB cache
          for (const session of response.recent_sessions) {
            await indexedDBService.saveStatistics(session as any);
          }
        }
      } catch (err: any) {
        error.value = err.message || 'Failed to fetch statistics';
        console.error('Error fetching statistics:', err);

        // If offline, keep cached data
        if (!navigator.onLine && recentSessions.value.length === 0) {
          // Initialize with empty data
          userStatistics.value = null;
          performanceByMode.value = [];
          weakCards.value = [];
          masteredCards.value = [];
        }
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
      pendingSessions,

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
  },
  {
    persist: true,
  }
);
