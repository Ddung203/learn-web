<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { computed, onMounted, ref } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { STATUS_CODE } from '~/constants';
  import { notifyError, notifySuccess } from '~/helper';
  import type { ILeaderboardPayloadResponse, IUserMapping } from '~/interfaces';
  import { LeaderboardService, UserService } from '~/services';
  import { buildErrorMessage, formatDate } from '~/utils';

  const toast = useToast();

  // State
  const loading = ref(false);
  const refreshing = ref(false);
  const leaderboardData = ref<ILeaderboardPayloadResponse | null>(null);
  const testCompletedOnly = ref(true);
  const expandedRows = ref({});
  const usersMapping = ref<IUserMapping[]>([]);

  // Computed
  const leaderboardUsers = computed(() => {
    return (
      leaderboardData.value?.users?.map((user, index) => {
        // Tìm thông tin user từ usersMapping
        const userInfo = usersMapping.value.find((u) => u.id === user.userId);

        return {
          ...user,
          displayRank: parseInt(user.rank) || index + 1,
          statusDisplay: getStatusDisplay(user.currentStatus),
          statusSeverity: getStatusSeverity(user.currentStatus),
          // Thông tin từ usersMapping
          fullName: userInfo?.fullName || 'Chưa cập nhật',
          studentCode: userInfo?.studentCode || 'N/A',
          avatarImage: userInfo?.avatarImage || '',
          // Điểm số
          knowledgeScore: user.knowledgeScore || 0,
          attitudeScore: user.attitudeScore || 0,
          finalScore: user.finalScore || 0,
          testScore: user.testScore || 0,
        };
      }) || []
    );
  });

  const stats = computed(() => ({
    totalUsers: leaderboardUsers.value.length,
    totalWithTest: leaderboardData.value?.totalUsersWithTest || 0,
    totalWithInterview: leaderboardData.value?.totalUsersWithInterview || 0,
    lastUpdated: leaderboardData.value?.lastUpdated
      ? formatDate(leaderboardData.value.lastUpdated)
      : 'Chưa có dữ liệu',
  }));

  // Methods
  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      REGISTRATION_COMPLETE: 'Đã đăng ký',
      TEST_COMPLETE: 'Hoàn thành bài kiểm tra',
      INTERVIEW_COMPLETE: 'Hoàn thành phỏng vấn',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Không duyệt',
      PENDING_INTERVIEW: 'Chờ phỏng vấn',
      TESTING: 'Đang làm bài',
      INTERVIEWING: 'Đang phỏng vấn',
    };
    return statusMap[status] || status;
  };

  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      REGISTRATION_COMPLETE: 'info',
      TEST_COMPLETE: 'warning',
      INTERVIEW_COMPLETE: 'success',
      APPROVED: 'success',
      REJECTED: 'danger',
      PENDING_INTERVIEW: 'warning',
      TESTING: 'warning',
      INTERVIEWING: 'warning',
    };
    return severityMap[status] || 'secondary';
  };

  const getRankBadgeClass = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    if (rank <= 10) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const loadUsersMapping = async (): Promise<void> => {
    try {
      const response = await UserService.getUsersMapping();
      if (response.status === STATUS_CODE.SUCCESS) {
        usersMapping.value = response.payload;
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Không thể tải usersMapping'
      );

      notifyError(toast, errorMessage);
    }
  };

  const loadLeaderboard = async (showLoading = true): Promise<void> => {
    try {
      if (showLoading) {
        loading.value = true;
      } else {
        refreshing.value = true;
      }

      // Load cả leaderboard và usersMapping
      const [leaderboardResponse] = await Promise.all([
        LeaderboardService.getLeaderboard(testCompletedOnly.value, 1000),
        loadUsersMapping(),
      ]);

      if (leaderboardResponse.status === STATUS_CODE.SUCCESS) {
        leaderboardData.value = leaderboardResponse.payload;

        if (!showLoading) {
          notifySuccess(toast, 'Đã cập nhật dữ liệu mới nhất');
        }
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Không thể tải dữ liệu bảng xếp hạng'
      );
      notifyError(toast, errorMessage);
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadLeaderboard(false);
  };

  const toggleFilter = async (): Promise<void> => {
    await loadLeaderboard(true);
  };

  // Lifecycle
  onMounted(async () => {
    await loadLeaderboard();
    const { payload } = await UserService.getUsersMapping();
    usersMapping.value = payload;
  });
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- Loading overlay -->
    <Loading v-if="loading" />

    <div class="container px-4 py-6 mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <div
          class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 class="mb-2 text-3xl font-bold text-gray-900">
              <i class="mr-3 text-blue-600 pi pi-chart-bar"></i>
              Bảng xếp hạng
            </h1>
            <p class="text-gray-600">
              Theo dõi thứ hạng và tiến độ của các ứng viên
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <!-- Filter Toggle -->
            <div
              class="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm"
            >
              <input
                id="testCompleted"
                v-model="testCompletedOnly"
                type="checkbox"
                class="w-4 h-4 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                @change="toggleFilter"
              />
              <label
                for="testCompleted"
                class="text-sm font-medium text-gray-700"
              >
                Chỉ hiển thị hoàn thành bài test
              </label>
            </div>

            <!-- Refresh Button -->
            <Button
              :loading="refreshing"
              icon="pi pi-refresh"
              label="Làm mới"
              class="p-button-outlined"
              @click="refreshData"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card
          class="text-white border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600"
        >
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <div class="mb-1 text-sm opacity-90">Tổng số</div>
                <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
              </div>
              <i class="text-3xl pi pi-users opacity-80"></i>
            </div>
          </template>
        </Card>

        <Card
          class="text-white border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600"
        >
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <div class="mb-1 text-sm opacity-90">Đã làm bài test</div>
                <div class="text-2xl font-bold">{{ stats.totalWithTest }}</div>
              </div>
              <i class="text-3xl pi pi-file-edit opacity-80"></i>
            </div>
          </template>
        </Card>

        <Card
          class="text-white border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600"
        >
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <div class="mb-1 text-sm opacity-90">Đã phỏng vấn</div>
                <div class="text-2xl font-bold">
                  {{ stats.totalWithInterview }}
                </div>
              </div>
              <i class="text-3xl pi pi-comments opacity-80"></i>
            </div>
          </template>
        </Card>

        <Card
          class="text-white border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600"
        >
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <div class="mb-1 text-sm opacity-90">Cập nhật lần cuối</div>
                <div class="text-sm font-medium">{{ stats.lastUpdated }}</div>
              </div>
              <i class="text-3xl pi pi-clock opacity-80"></i>
            </div>
          </template>
        </Card>
      </div>

      <!-- Main Leaderboard Table -->
      <Card class="border-0 shadow-lg">
        <template #header>
          <div
            class="flex items-center justify-between p-4 border-b bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <i class="text-xl text-yellow-500 pi pi-trophy"></i>
              <span class="text-lg font-semibold text-gray-800">
                Danh sách xếp hạng
              </span>
            </div>
          </div>
        </template>

        <template #content>
          <DataTable
            v-model:expandedRows="expandedRows"
            :value="leaderboardUsers"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 100]"
            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="{first} đến {last} trong tổng {totalRecords} ứng viên"
            class="leaderboard-table"
            dataKey="_id"
            responsiveLayout="stack"
            breakpoint="768px"
            stripedRows
            sortMode="single"
          >
            <!-- Rank Column -->
            <Column
              field="displayRank"
              header="Hạng"
              :sortable="true"
              style="width: 100px"
            >
              <template #body="{ data }">
                <div class="flex items-center justify-center">
                  <span
                    :class="getRankBadgeClass(data.displayRank)"
                    class="inline-flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full shadow-sm"
                  >
                    {{ data.displayRank }}
                  </span>
                </div>
              </template>
            </Column>

            <!-- User Info Column -->
            <Column
              field="fullName"
              header="Thông tin ứng viên"
              style="min-width: 280px"
            >
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <Avatar
                      v-if="data.avatarImage"
                      :image="data.avatarImage"
                      class="border-2 border-white shadow-sm"
                      shape="circle"
                      size="large"
                    />
                    <Avatar
                      v-else
                      :label="
                        data.fullName?.charAt(0)?.toUpperCase() ||
                        data.userId?.charAt(0)?.toUpperCase() ||
                        'U'
                      "
                      class="text-blue-600 bg-blue-100 border-2 border-white shadow-sm"
                      shape="circle"
                      size="large"
                    />
                    <!-- Rank badge overlay -->
                    <span
                      v-if="data.displayRank <= 3"
                      class="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-400 border-2 border-white rounded-full -top-1 -right-1"
                    >
                      {{ data.displayRank }}
                    </span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">
                      {{ data.fullName || 'Chưa cập nhật' }}
                    </div>
                    <div class="text-sm text-gray-600">
                      MSSV: {{ data.studentCode || 'N/A' }}
                    </div>
                    <div class="text-xs text-gray-400">
                      ID: {{ data.userId || data._id }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>

            <!-- Test Score Column -->
            <Column
              field="testScore"
              header="Điểm Test"
              :sortable="true"
              style="width: 110px"
            >
              <template #body="{ data }">
                <div class="text-center">
                  <div class="text-lg font-bold text-blue-600">
                    {{ data.testScore }}
                  </div>
                  <div class="text-xs text-gray-500">điểm</div>
                </div>
              </template>
            </Column>

            <!-- Knowledge Score Column -->
            <Column
              field="knowledgeScore"
              header="Kiến thức"
              :sortable="true"
              style="width: 110px"
            >
              <template #body="{ data }">
                <div class="text-center">
                  <div class="text-lg font-bold text-green-600">
                    {{ data.knowledgeScore }}
                  </div>
                  <div class="text-xs text-gray-500">/100</div>
                </div>
              </template>
            </Column>

            <!-- Attitude Score Column -->
            <Column
              field="attitudeScore"
              header="Thái độ"
              :sortable="true"
              style="width: 110px"
            >
              <template #body="{ data }">
                <div class="text-center">
                  <div class="text-lg font-bold text-purple-600">
                    {{ data.attitudeScore }}
                  </div>
                  <div class="text-xs text-gray-500">/100</div>
                </div>
              </template>
            </Column>

            <!-- Final Score Column -->
            <Column
              field="finalScore"
              header="Tổng điểm"
              :sortable="true"
              style="width: 120px"
            >
              <template #body="{ data }">
                <div class="text-center">
                  <div
                    class="text-xl font-bold"
                    :class="{
                      'text-red-600': data.finalScore < 40,
                      'text-yellow-600':
                        data.finalScore >= 40 && data.finalScore < 60,
                      'text-green-600': data.finalScore >= 60,
                    }"
                  >
                    {{ data.finalScore }}
                  </div>
                  <!-- <div class="text-xs text-gray-500">/100</div> -->
                </div>
              </template>
            </Column>

            <!-- Status Column -->
            <Column
              field="currentStatus"
              header="Trạng thái"
              :sortable="true"
              style="min-width: 160px"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.statusDisplay"
                  :severity="data.statusSeverity"
                  class="font-medium"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <ScrollToTop />
  </div>
</template>

<style scoped>
  .leaderboard-table :deep(.p-datatable-thead > tr > th) {
    background-color: #f3f4f6;
    color: #374151;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .leaderboard-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #eff6ff;
    transition: background-color 0.2s;
  }

  .leaderboard-table :deep(.p-paginator) {
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }

  .leaderboard-table
    :deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background-color: #2563eb;
    border-color: #2563eb;
  }
</style>
