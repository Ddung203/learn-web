<script setup lang="ts">
  import { Chart, registerables } from 'chart.js';

  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import { useLocale } from '~/composables/useLocale';
  import { useStatisticsStore } from '~/stores';

  import HeaderThird from '~/components/HeaderThird.vue';

  Chart.register(...registerables);

  const { t, isVietnamese } = useLocale();
  const router = useRouter();
  const statisticsStore = useStatisticsStore();

  const loading = ref(true);
  const activeTab = ref(0);
  const dailyActivityChart = ref<HTMLCanvasElement | null>(null);
  const performanceChart = ref<HTMLCanvasElement | null>(null);
  const accuracyChart = ref<HTMLCanvasElement | null>(null);
  const trendChart = ref<HTMLCanvasElement | null>(null);

  onMounted(async () => {
    loading.value = true;
    await statisticsStore.fetchUserStatistics();
    loading.value = false;

    // Create charts after data is loaded
    if (statisticsStore.hasStatistics) {
      setTimeout(() => {
        createDailyActivityChart();
        createPerformanceByModeChart();
        createAccuracyChart();
        createTrendChart();
      }, 100);
    }
  });

  // All data comes from backend - NO MOCK DATA
  const overview = computed(() => statisticsStore.userStatistics);
  const recentSessions = computed(() => statisticsStore.recentSessions);
  const performanceByMode = computed(() => statisticsStore.performanceByMode);

  // Achievements computed from real backend data
  const achievements = computed(() => {
    if (!overview.value) return [];
    const badges = [];

    if (overview.value.total_sessions >= 10) {
      badges.push({
        icon: '🎯',
        label: t('statistics.badge.dedicatedLearner'),
        desc: t('statistics.badge.dedicatedLearnerDesc'),
      });
    }
    if (overview.value.current_streak >= 7) {
      badges.push({
        icon: '🔥',
        label: t('statistics.badge.weekWarrior'),
        desc: t('statistics.badge.weekWarriorDesc'),
      });
    }
    if (overview.value.cards_mastered >= 50) {
      badges.push({
        icon: '🏆',
        label: t('statistics.badge.master'),
        desc: t('statistics.badge.masterDesc'),
      });
    }
    if (overview.value.overall_accuracy >= 90) {
      badges.push({
        icon: '⭐',
        label: t('statistics.badge.perfectionist'),
        desc: t('statistics.badge.perfectionistDesc'),
      });
    }
    if (overview.value.total_study_time >= 3600) {
      badges.push({
        icon: '⏰',
        label: t('statistics.badge.timeMaster'),
        desc: t('statistics.badge.timeMasterDesc'),
      });
    }

    return badges;
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const locale = isVietnamese.value ? 'vi-VN' : 'en-US';

    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMode = (mode: string): string => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warn';
    return 'danger';
  };

  const getMasteryTagSeverity = (level: number): string => {
    if (level >= 80) return 'success';
    if (level >= 50) return 'warning';
    return 'danger';
  };

  const getModeSeverity = (mode: string): string => {
    const severityMap: Record<string, string> = {
      flashcard: 'info',
      test: 'success',
      write: 'warning',
      learn: 'danger',
    };
    return severityMap[mode] || 'info';
  };

  const createDailyActivityChart = () => {
    if (!dailyActivityChart.value || !overview.value) return;

    const ctx = dailyActivityChart.value.getContext('2d');
    if (!ctx) return;

    const dailyStats = overview.value.daily_stats.slice(-14);
    const labels = dailyStats.map((stat: any) => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: t('statistics.cardsStudiedLabel'),
            data: dailyStats.map((stat: any) => stat.cards_studied),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: t('statistics.timeSpent'),
            data: dailyStats.map((stat: any) =>
              Math.round(stat.time_spent / 60)
            ),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
          },
        },
      },
    });
  };

  const createPerformanceByModeChart = () => {
    if (
      !performanceChart.value ||
      !performanceByMode.value ||
      performanceByMode.value.length === 0
    )
      return;

    const ctx = performanceChart.value.getContext('2d');
    if (!ctx) return;

    const labels = performanceByMode.value.map((perf: any) =>
      formatMode(perf.mode)
    );

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: t('statistics.sessions'),
            data: performanceByMode.value.map((perf: any) => perf.sessions),
            backgroundColor: [
              'rgba(99, 102, 241, 0.9)',
              'rgba(16, 185, 129, 0.9)',
              'rgba(245, 158, 11, 0.9)',
              'rgba(239, 68, 68, 0.9)',
            ],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 13,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} ${t(
                  'statistics.sessions'
                ).toLowerCase()} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  const createAccuracyChart = () => {
    if (
      !accuracyChart.value ||
      !performanceByMode.value ||
      performanceByMode.value.length === 0
    )
      return;

    const ctx = accuracyChart.value.getContext('2d');
    if (!ctx) return;

    const labels = performanceByMode.value.map((perf: any) =>
      formatMode(perf.mode)
    );

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: t('statistics.accuracyPercent'),
            data: performanceByMode.value.map((perf: any) =>
              Math.round(perf.accuracy)
            ),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function (value: any) {
                return value + '%';
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context: any) {
                return `${t('statistics.accuracy')}: ${context.parsed.y}%`;
              },
            },
          },
        },
      },
    });
  };

  const createTrendChart = () => {
    if (!trendChart.value || !overview.value) return;

    const ctx = trendChart.value.getContext('2d');
    if (!ctx) return;

    const dailyStats = overview.value.daily_stats.slice(-30);
    const labels = dailyStats.map((stat: any) => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t('statistics.accuracyTrend'),
            data: dailyStats.map((stat: any) => stat.accuracy),
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function (value: any) {
                return value + '%';
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
          },
        },
      },
    });
  };
</script>

<template>
  <HeaderThird />
  <div
    class="min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 md:p-8"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div>
            <h1
              class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {{ t('statistics.title') || 'Learning Statistics' }}
            </h1>
            <p class="mt-1 text-gray-600">
              {{
                t('statistics.subtitle') ||
                'Track your progress and achievements'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State with Skeletons -->
      <div
        v-if="loading"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            v-for="i in 4"
            :key="i"
          >
            <template #content>
              <div class="text-center">
                <Skeleton
                  width="4rem"
                  height="4rem"
                  class="mx-auto mb-4"
                  borderRadius="1rem"
                />
                <Skeleton
                  width="8rem"
                  height="2rem"
                  class="mx-auto mb-2"
                />
                <Skeleton
                  width="10rem"
                  height="1rem"
                  class="mx-auto"
                />
              </div>
            </template>
          </Card>
        </div>
        <Skeleton
          height="400px"
          borderRadius="1rem"
        />
      </div>

      <!-- No Data State -->
      <div
        v-else-if="!overview"
        class="py-20 text-center"
      >
        <Panel class="max-w-md mx-auto shadow-2xl">
          <template #header>
            <div class="flex items-center justify-center w-full">
              <Avatar
                icon="pi pi-chart-line"
                size="xlarge"
                shape="circle"
              />
            </div>
          </template>
          <Message
            severity="info"
            :closable="false"
            class="justify-center mb-4"
          >
            No statistics data available yet
          </Message>
          <h2 class="mb-3 text-2xl font-bold text-gray-800">
            Start Your Learning Journey
          </h2>
          <p class="mb-6 text-gray-600">
            Complete study sessions to see your progress and achievements here!
          </p>
          <Button
            label="Browse Card Sets"
            icon="pi pi-book"
            @click="router.push('/card-sets')"
            severity="info"
            size="large"
            class="w-full"
          />
        </Panel>
      </div>

      <!-- Statistics Content -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <!-- Total Study Time -->
          <div
            class="overflow-hidden transition-all duration-200 transform bg-white shadow-lg rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600">
              <div class="flex items-center justify-between mb-2">
                <Avatar
                  icon="pi pi-clock"
                  size="large"
                  shape="circle"
                  class="text-white bg-white/20"
                />
                <Badge
                  :value="
                    '+' + Math.round(overview.total_study_time / 3600) + 'h'
                  "
                  severity="info"
                />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {{ formatTime(overview.total_study_time) }}
              </h3>
              <p class="mt-1 text-sm text-blue-100">
                {{ t('statistics.totalStudyTime') || 'Total Study Time' }}
              </p>
            </div>
          </div>

          <!-- Total Cards Studied -->
          <div
            class="overflow-hidden transition-all duration-200 transform bg-white shadow-lg rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div class="p-6 bg-gradient-to-br from-green-500 to-emerald-600">
              <div class="flex items-center justify-between mb-2">
                <Avatar
                  icon="pi pi-book"
                  size="large"
                  shape="circle"
                  class="text-white bg-white/20"
                />
                <Badge
                  :value="'+' + overview.total_sessions"
                  severity="success"
                />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {{ overview.total_cards_studied }}
              </h3>
              <p class="mt-1 text-sm text-green-100">
                {{ t('statistics.cardsStudied') || 'Cards Studied' }}
              </p>
            </div>
          </div>

          <!-- Overall Accuracy -->
          <div
            class="overflow-hidden transition-all duration-200 transform bg-white shadow-lg rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div class="p-6 bg-gradient-to-br from-purple-500 to-purple-600">
              <div class="flex items-center justify-between mb-2">
                <Avatar
                  icon="pi pi-check-circle"
                  size="large"
                  shape="circle"
                  class="text-white bg-white/20"
                />
                <Badge
                  :value="Math.round(overview.overall_accuracy) + '%'"
                  severity="info"
                />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {{ Math.round(overview.overall_accuracy) }}%
              </h3>
              <p class="mt-1 text-sm text-purple-100">
                {{ t('statistics.overallAccuracy') || 'Overall Accuracy' }}
              </p>
            </div>
          </div>

          <!-- Current Streak -->
          <div
            class="overflow-hidden transition-all duration-200 transform bg-white shadow-lg rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div class="p-6 bg-gradient-to-br from-orange-500 to-red-600">
              <div class="flex items-center justify-between mb-2">
                <Avatar
                  icon="pi pi-bolt"
                  size="large"
                  shape="circle"
                  class="text-white bg-white/20"
                />
                <Badge
                  :value="'🔥 ' + overview.current_streak"
                  severity="warning"
                />
              </div>
              <h3 class="text-3xl font-bold text-white">
                {{ overview.current_streak }} Days
              </h3>
              <p class="mt-1 text-sm text-orange-100">
                {{ t('statistics.currentStreak') || 'Current Streak' }}
                <span class="opacity-75"
                  >(Best: {{ overview.longest_streak }})</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <Panel
          v-if="achievements.length > 0"
          :header="`🏆 ${t('statistics.achievements')}`"
          class="shadow-lg"
          toggleable
        >
          <div class="flex flex-wrap gap-3">
            <Chip
              v-for="(badge, index) in achievements"
              :key="index"
              :label="badge.label"
              class="px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            >
              <template #icon>
                <span class="mr-2 text-xl">{{ badge.icon }}</span>
              </template>
            </Chip>
          </div>
        </Panel>

        <Divider />

        <!-- Tabs -->
        <TabView
          v-model:activeIndex="activeTab"
          class="shadow-lg custom-tabview"
        >
          <!-- Overview Tab -->
          <TabPanel>
            <template #header>
              <i class="mr-2 pi pi-chart-bar"></i>
              <span class="font-semibold">{{ t('statistics.overview') }}</span>
            </template>

            <div class="space-y-6">
              <!-- Mastery Progress -->
              <Panel
                :header="`🎯 ${t('statistics.masteryProgress')}`"
                toggleable
              >
                <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div
                    class="p-4 transition-all duration-200 border-2 border-green-200 rounded-xl bg-green-50 hover:shadow-md"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-lg font-semibold text-green-700">{{
                        t('statistics.mastered')
                      }}</span>
                      <Badge
                        :value="overview.cards_mastered"
                        severity="success"
                        size="large"
                      />
                    </div>
                    <ProgressBar
                      :value="overview.cards_mastered"
                      :max="overview.total_cards_studied"
                      :showValue="false"
                      severity="success"
                      class="h-3"
                    />
                    <p class="mt-2 text-sm text-green-600">
                      {{
                        Math.round(
                          (overview.cards_mastered /
                            (overview.total_cards_studied || 1)) *
                            100
                        )
                      }}%
                    </p>
                  </div>
                  <div
                    class="p-4 transition-all duration-200 border-2 border-yellow-200 rounded-xl bg-yellow-50 hover:shadow-md"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-lg font-semibold text-yellow-700">{{
                        t('statistics.learning')
                      }}</span>
                      <Badge
                        :value="overview.cards_learning"
                        severity="warning"
                        size="large"
                      />
                    </div>
                    <ProgressBar
                      :value="overview.cards_learning"
                      :max="overview.total_cards_studied"
                      :showValue="false"
                      severity="warn"
                      class="h-3"
                    />
                    <p class="mt-2 text-sm text-yellow-600">
                      {{
                        Math.round(
                          (overview.cards_learning /
                            (overview.total_cards_studied || 1)) *
                            100
                        )
                      }}%
                    </p>
                  </div>
                  <div
                    class="p-4 transition-all duration-200 border-2 border-blue-200 rounded-xl bg-blue-50 hover:shadow-md"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-lg font-semibold text-blue-700">{{
                        t('statistics.new')
                      }}</span>
                      <Badge
                        :value="overview.cards_new"
                        severity="info"
                        size="large"
                      />
                    </div>
                    <ProgressBar
                      :value="overview.cards_new"
                      :max="overview.total_cards_studied"
                      :showValue="false"
                      severity="info"
                      class="h-3"
                    />
                    <p class="mt-2 text-sm text-blue-600">
                      {{
                        Math.round(
                          (overview.cards_new /
                            (overview.total_cards_studied || 1)) *
                            100
                        )
                      }}%
                    </p>
                  </div>
                </div>
              </Panel>

              <!-- Charts Grid -->
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel
                  :header="`📅 ${t('statistics.dailyActivity')}`"
                  class="shadow-md"
                >
                  <div class="h-80">
                    <canvas ref="dailyActivityChart"></canvas>
                  </div>
                </Panel>

                <Panel
                  :header="`📊 ${t('statistics.studyModesDistribution')}`"
                  class="shadow-md"
                >
                  <div class="h-80">
                    <canvas ref="performanceChart"></canvas>
                  </div>
                </Panel>

                <Panel
                  :header="`🎯 ${t('statistics.accuracyByMode')}`"
                  class="shadow-md"
                >
                  <div class="h-80">
                    <canvas ref="accuracyChart"></canvas>
                  </div>
                </Panel>

                <Panel
                  :header="`📈 ${t('statistics.accuracyTrend')}`"
                  class="shadow-md"
                >
                  <div class="h-80">
                    <canvas ref="trendChart"></canvas>
                  </div>
                </Panel>
              </div>
            </div>
          </TabPanel>

          <!-- History Tab -->
          <TabPanel>
            <template #header>
              <i class="mr-2 pi pi-history"></i>
              <span class="font-semibold">{{
                t('statistics.studyHistory')
              }}</span>
            </template>

            <div class="space-y-6">
              <!-- Performance Table -->
              <Panel
                v-if="performanceByMode && performanceByMode.length > 0"
                :header="`📈 ${t('statistics.performanceByMode')}`"
                toggleable
              >
                <DataTable
                  :value="performanceByMode"
                  responsiveLayout="scroll"
                  stripedRows
                  showGridlines
                  :paginator="false"
                >
                  <Column
                    field="mode"
                    :header="t('statistics.studyMode')"
                  >
                    <template #body="slotProps">
                      <Tag
                        :value="formatMode(slotProps.data.mode)"
                        :severity="getModeSeverity(slotProps.data.mode)"
                      />
                    </template>
                  </Column>
                  <Column
                    field="sessions"
                    :header="t('statistics.sessions')"
                    sortable
                  >
                    <template #body="slotProps">
                      <Badge
                        :value="slotProps.data.sessions"
                        severity="info"
                        size="large"
                      />
                    </template>
                  </Column>
                  <Column
                    field="total_cards"
                    :header="`${t('statistics.totalCards')}`"
                    sortable
                  ></Column>
                  <Column
                    field="accuracy"
                    :header="`${t('statistics.accuracy')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      <Tag
                        :value="Math.round(slotProps.data.accuracy) + '%'"
                        :severity="
                          getMasteryTagSeverity(slotProps.data.accuracy)
                        "
                        class="font-bold"
                      />
                    </template>
                  </Column>
                  <Column
                    field="avg_time_per_card"
                    :header="`${t('statistics.avgTimePerCard')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      <Chip
                        :label="
                          Math.round(slotProps.data.avg_time_per_card) + 's'
                        "
                      />
                    </template>
                  </Column>
                </DataTable>
              </Panel>

              <!-- Recent Sessions -->
              <Panel
                v-if="recentSessions && recentSessions.length > 0"
                :header="`🕐 ${t('statistics.recentSessions')}`"
                toggleable
              >
                <DataTable
                  :value="recentSessions"
                  responsiveLayout="scroll"
                  :paginator="true"
                  :rows="10"
                  stripedRows
                  showGridlines
                >
                  <Column
                    field="mode"
                    :header="`${t('statistics.studyMode')}`"
                  >
                    <template #body="slotProps">
                      <Tag
                        :value="formatMode(slotProps.data.mode)"
                        :severity="getModeSeverity(slotProps.data.mode)"
                      />
                    </template>
                  </Column>
                  <Column
                    field="created_at"
                    :header="`${t('statistics.date')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      {{ formatDate(slotProps.data.created_at) }}
                    </template>
                  </Column>
                  <Column
                    field="duration"
                    :header="`${t('statistics.duration')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      <Chip :label="formatTime(slotProps.data.duration)" />
                    </template>
                  </Column>
                  <Column
                    field="total_cards"
                    :header="`${t('statistics.totalCards')}`"
                    sortable
                  ></Column>
                  <Column
                    field="correct"
                    :header="`${t('statistics.correct')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      <Badge
                        :value="slotProps.data.correct"
                        severity="success"
                        size="large"
                      />
                    </template>
                  </Column>
                  <Column
                    field="accuracy"
                    :header="`${t('statistics.accuracyPercent')}`"
                    sortable
                  >
                    <template #body="slotProps">
                      <ProgressBar
                        :value="slotProps.data.accuracy"
                        :showValue="true"
                        :severity="getProgressBarColor(slotProps.data.accuracy)"
                        class="w-32"
                      />
                    </template>
                  </Column>
                </DataTable>
              </Panel>
            </div>
          </TabPanel>

          <!-- !Cards Performance Tab -->
        </TabView>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .custom-tabview :deep(.p-tabview-nav) {
    @apply bg-white border-b-2 border-gray-200 rounded-t-xl;
  }

  .custom-tabview :deep(.p-tabview-nav-link) {
    @apply transition-all duration-200;
  }

  .custom-tabview :deep(.p-tabview-nav-link:hover) {
    @apply bg-gray-50;
  }

  .custom-tabview :deep(.p-highlight .p-tabview-nav-link) {
    @apply border-b-2 border-indigo-600 text-indigo-600 font-semibold;
  }

  .custom-tabview :deep(.p-tabview-panels) {
    @apply bg-white rounded-b-xl p-6;
  }

  /* Smooth animations */
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100 rounded-lg;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-lg hover:bg-gray-400;
  }
</style>
