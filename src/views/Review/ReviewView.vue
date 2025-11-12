<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { computed, onMounted, ref } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { notifyError } from '~/helper';
  import type { IExamSession, IUserMapping } from '~/interfaces';
  import { ExamService, UserService } from '~/services';
  import { formatDate } from '~/utils';

  const toast = useToast();
  const isLoading = ref(false);
  const visible = ref(false);
  const examSessions = ref<IExamSession[]>([]);
  const usersMapping = ref<IUserMapping[]>([]);
  const selectedExamSession = ref<IExamSession | null>(null);
  const selectedUserInfo = ref<IUserMapping | null>(null);
  const sortBy = ref('finalScore');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  const fetchExamSessions = async () => {
    try {
      isLoading.value = true;

      const response = await ExamService.getExamSessions({
        page: 1,
        limit: 1000,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      });

      if (response.status === 0 && response.payload) {
        examSessions.value = response.payload.data || [];
      }
    } catch (error) {
      notifyError(toast, 'Không thể tải danh sách exam sessions!');
      console.error('Error fetching exam sessions:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUsersMapping = async () => {
    try {
      const response = await UserService.getUsersMapping();
      if (response.status === 0 && response.payload) {
        usersMapping.value = response.payload;
      }
    } catch (error) {
      console.error('Error fetching users mapping:', error);
    }
  };

  const showExamSessionDetail = (examSession: IExamSession) => {
    selectedExamSession.value = examSession;
    const userInfo = usersMapping.value.find(
      (u) => u.id === examSession.userId
    );
    selectedUserInfo.value = userInfo || null;
    visible.value = true;
  };

  const nameSearch = ref('');

  // Computed properties for filtering
  const filteredExamSessions = computed(() => {
    // Chỉ hiển thị exam sessions có interviewNotes (nhận xét chính)
    let filtered = examSessions.value.filter(
      (session) =>
        session.interviewNotes && session.interviewNotes.trim() !== ''
    );

    // Nếu có tìm kiếm, lọc thêm theo tên hoặc MSSV
    if (nameSearch.value) {
      const searchLower = nameSearch.value.toLowerCase();
      filtered = filtered.filter((session) => {
        const userInfo = usersMapping.value.find(
          (u) => u.id === session.userId
        );
        return (
          userInfo &&
          (userInfo.fullName.toLowerCase().includes(searchLower) ||
            userInfo.studentCode.toLowerCase().includes(searchLower))
        );
      });
    }

    return filtered;
  });

  const changeSorting = (newSortBy: string) => {
    if (sortBy.value === newSortBy) {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
    } else {
      sortBy.value = newSortBy;
      sortOrder.value = 'desc';
    }
    fetchExamSessions();
  };

  const getSortButtonProps = (buttonSortBy: string) => {
    const isActive = sortBy.value === buttonSortBy;
    const isDesc = sortOrder.value === 'desc';

    return {
      isActive,
      severity: isActive ? 'primary' : 'secondary',
      outlined: !isActive,
      icon: isActive
        ? isDesc
          ? 'pi pi-sort-amount-down'
          : 'pi pi-sort-amount-up'
        : '',
      arrow: isActive ? (isDesc ? '↓' : '↑') : '',
    };
  };

  const getSortDescription = () => {
    const isDesc = sortOrder.value === 'desc';

    if (sortBy.value === 'finalScore') {
      return isDesc ? 'Cao nhất trước' : 'Thấp nhất trước';
    } else if (sortBy.value === 'updatedAt') {
      return isDesc ? 'Muộn nhất trước' : 'Sớm nhất trước';
    }

    return isDesc ? 'Giảm dần' : 'Tăng dần';
  };

  const getSortDescriptionSeverity = () => {
    const isDesc = sortOrder.value === 'desc';

    if (sortBy.value === 'finalScore') {
      return isDesc ? 'success' : 'info';
    } else if (sortBy.value === 'updatedAt') {
      return isDesc ? 'warning' : 'secondary';
    }

    return isDesc ? 'danger' : 'success';
  };

  const getUserInfo = (userId: string): IUserMapping | null => {
    return usersMapping.value.find((u) => u.id === userId) || null;
  };

  const getStatusLabel = (
    examSession: IExamSession
  ): { label: string; severity: string; icon: string } => {
    if (!examSession.finalScore) {
      return { label: 'Chưa có kết quả', severity: 'warn', icon: 'pi-clock' };
    }
    if (examSession.finalScore >= 150) {
      return { label: 'Đạt', severity: 'success', icon: 'pi-check' };
    }
    return { label: 'Không đạt', severity: 'danger', icon: 'pi-times' };
  };

  const formatTimeSpent = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}p${seconds}s`;
  };

  onMounted(async () => {
    await Promise.all([fetchUsersMapping(), fetchExamSessions()]);
  });
</script>

<template>
  <Loading v-if="isLoading"></Loading>
  <Header></Header>

  <!-- Toolbar -->
  <Toolbar class="px-[25px] lg:px-10 mb-6">
    <template #start>
      <div>
        <h1 class="text-2xl font-bold uppercase">Kết quả phỏng vấn</h1>
        <p class="mt-1 text-sm text-gray-600">Chỉ hiển thị đã phỏng vấn</p>
      </div>
    </template>

    <template #center>
      <form
        class="flex items-center justify-center gap-3"
        autocomplete="off"
      >
        <IconField>
          <InputText
            v-model="nameSearch"
            placeholder="Tìm theo tên hoặc MSSV"
          />
        </IconField>
      </form>
    </template>

    <template #end>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-600">Sắp xếp:</span>
        <Button
          :label="`Theo tổng điểm ${getSortButtonProps('finalScore').arrow}`"
          :severity="getSortButtonProps('finalScore').severity"
          :outlined="getSortButtonProps('finalScore').outlined"
          :icon="getSortButtonProps('finalScore').icon"
          rounded
          @click="changeSorting('finalScore')"
        />
        <Button
          :label="`Theo thời gian ${getSortButtonProps('updatedAt').arrow}`"
          :severity="getSortButtonProps('updatedAt').severity"
          :outlined="getSortButtonProps('updatedAt').outlined"
          :icon="getSortButtonProps('updatedAt').icon"
          rounded
          @click="changeSorting('updatedAt')"
        />
        <Divider
          layout="vertical"
          class="h-6"
        />
        <Tag
          :value="getSortDescription()"
          :severity="getSortDescriptionSeverity()"
          :icon="sortOrder === 'desc' ? 'pi pi-arrow-down' : 'pi pi-arrow-up'"
        />
      </div>
    </template>
  </Toolbar>

  <!-- Danh sách exam sessions -->
  <div
    class="grid grid-cols-1 gap-4 px-5 pb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:justify-start lg:px-20"
  >
    <template
      v-for="(examSession, index) in filteredExamSessions"
      :key="examSession.id || index"
    >
      <div class="flex items-center justify-center">
        <Card style="width: 22rem; overflow: hidden">
          <template #header>
            <div class="flex items-center justify-center p-4">
              <img
                v-if="getUserInfo(examSession.userId)?.avatarImage"
                class="h-[150px] w-[150px] object-cover rounded-full cursor-pointer border-4 border-gray-200 hover:border-blue-400 transition-colors"
                alt="user image"
                :src="getUserInfo(examSession.userId)?.avatarImage"
                @click="showExamSessionDetail(examSession)"
              />
              <div
                v-else
                class="h-[150px] w-[150px] rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                @click="showExamSessionDetail(examSession)"
              >
                <i class="text-4xl text-gray-500 pi pi-user"></i>
              </div>
            </div>
          </template>
          <template #title>
            {{
              getUserInfo(examSession.userId)?.fullName || 'Chưa có thông tin'
            }}
          </template>
          <template #subtitle>
            {{
              getUserInfo(examSession.userId)?.studentCode || examSession.userId
            }}
          </template>
          <template #content>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span>Điểm test:</span>
                <strong class="text-blue-600"
                  >{{ examSession.totalScore }}/100</strong
                >
              </div>
              <div
                class="flex items-center justify-between"
                v-if="examSession.knowledgeScore"
              >
                <span>Điểm kiến thức:</span>
                <strong class="text-green-600"
                  >{{ examSession.knowledgeScore }}/100</strong
                >
              </div>
              <div
                class="flex items-center justify-between"
                v-if="examSession.attitudeScore"
              >
                <span>Điểm thái độ:</span>
                <strong class="text-purple-600"
                  >{{ examSession.attitudeScore }}/100</strong
                >
              </div>
              <div
                class="flex items-center justify-between"
                v-if="examSession.finalScore"
              >
                <span>Điểm cuối:</span>
                <strong class="text-red-600">{{
                  examSession.finalScore
                }}</strong>
              </div>
              <div class="flex items-center justify-between">
                <span>Thời gian:</span>
                <span>{{ formatTimeSpent(examSession.totalTimeSpent) }}</span>
              </div>
              <!-- <div class="flex items-center justify-between">
                <span>Trạng thái dự kiến:</span>
                <Tag
                  :class="`uppercase`"
                  :icon="getStatusLabel(examSession).icon"
                  :severity="getStatusLabel(examSession).severity"
                  :value="getStatusLabel(examSession).label"
                ></Tag>
              </div> -->
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 mt-2">
              <Button
                label="Chi tiết"
                icon="pi pi-eye"
                class="w-full"
                @click="showExamSessionDetail(examSession)"
              />
            </div>
          </template>
        </Card>
      </div>
    </template>
  </div>

  <!-- Empty state -->
  <div
    v-if="filteredExamSessions.length === 0 && !isLoading"
    class="py-8 text-center"
  >
    <i class="mb-4 text-6xl text-gray-400 pi pi-inbox"></i>
    <p class="text-lg text-gray-500">Không có dữ liệu phỏng vấn với nhận xét</p>
  </div>

  <!-- Dialog chi tiết exam session -->
  <div class="flex justify-center card">
    <Dialog
      v-model:visible="visible"
      modal
      header="Chi tiết kết quả phỏng vấn"
      :style="{ width: '50rem' }"
      maximizable
      class="p-dialog-custom"
    >
      <div
        v-if="selectedExamSession && selectedUserInfo"
        class="exam-session-detail"
      >
        <!-- User Info Header -->
        <div class="mb-6 profile-header">
          <div class="flex items-center gap-4">
            <img
              v-if="selectedUserInfo.avatarImage"
              class="object-cover w-20 h-20 border-4 border-gray-200 rounded-full"
              :src="selectedUserInfo.avatarImage"
              alt="User Avatar"
            />
            <div
              v-else
              class="flex items-center justify-center w-20 h-20 bg-gray-300 rounded-full"
            >
              <i class="text-2xl text-gray-500 pi pi-user"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">
                {{ selectedUserInfo.fullName }}
              </h2>
              <p class="text-gray-600">{{ selectedUserInfo.studentCode }}</p>
            </div>
          </div>
        </div>

        <!-- Test Scores Section -->
        <div class="p-4 mb-4 shadow-sm bg-gray-50 rounded-xl">
          <h3 class="pb-2 mb-3 text-lg font-semibold text-gray-800 border-b">
            Điểm số tổng quan
          </h3>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="p-3 text-center bg-blue-100 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {{ selectedExamSession.totalScore }}
              </div>
              <div class="text-sm text-gray-600">Điểm test (/100)</div>
            </div>
            <div
              v-if="selectedExamSession.knowledgeScore"
              class="p-3 text-center bg-green-100 rounded-lg"
            >
              <div class="text-2xl font-bold text-green-600">
                {{ selectedExamSession.knowledgeScore }}
              </div>
              <div class="text-sm text-gray-600">Kiến thức (/100)</div>
            </div>
            <div
              v-if="selectedExamSession.attitudeScore"
              class="p-3 text-center bg-purple-100 rounded-lg"
            >
              <div class="text-2xl font-bold text-purple-600">
                {{ selectedExamSession.attitudeScore }}
              </div>
              <div class="text-sm text-gray-600">Thái độ (/100)</div>
            </div>
            <div
              v-if="selectedExamSession.finalScore"
              class="p-3 text-center bg-red-100 rounded-lg"
            >
              <div class="text-2xl font-bold text-red-600">
                {{ selectedExamSession.finalScore }}
              </div>
              <div class="text-sm text-gray-600">Tổng điểm (/300)</div>
            </div>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="p-4 mb-4 shadow-sm bg-gray-50 rounded-xl">
          <h3 class="pb-2 mb-3 text-lg font-semibold text-gray-800 border-b">
            Thống kê chi tiết
          </h3>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-gray-600">Câu đúng:</span>
              <strong class="ml-2 text-green-600"
                >{{ selectedExamSession.correctAnswers }}/{{
                  selectedExamSession.totalQuestions
                }}</strong
              >
            </div>
            <div>
              <span class="text-gray-600">Câu sai:</span>
              <strong class="ml-2 text-red-600"
                >{{ selectedExamSession.incorrectAnswers }}/{{
                  selectedExamSession.totalQuestions
                }}</strong
              >
            </div>
            <div>
              <span class="text-gray-600">Tỷ lệ đúng:</span>
              <strong class="ml-2 text-blue-600"
                >{{ selectedExamSession.percentage }}%</strong
              >
            </div>
            <div>
              <span class="text-gray-600">Thời gian:</span>
              <strong class="ml-2">{{
                formatTimeSpent(selectedExamSession.totalTimeSpent)
              }}</strong>
            </div>
          </div>

          <!-- Level Statistics -->
          <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div
              v-for="(levelData, level) in selectedExamSession.levelStats"
              :key="level"
              class="p-2 text-center bg-white border rounded"
            >
              <div class="text-sm font-semibold text-gray-700 capitalize">
                {{ level.replace('level', 'Cấp ') }}
              </div>
              <div
                class="text-lg font-bold"
                :class="
                  levelData.correct === levelData.total
                    ? 'text-green-600'
                    : 'text-orange-600'
                "
              >
                {{ levelData.correct }}/{{ levelData.total }}
              </div>
              <div class="text-xs text-gray-500">
                {{ levelData.points }} điểm
              </div>
            </div>
          </div>
        </div>

        <!-- Interview Notes Section -->
        <div
          v-if="
            selectedExamSession.interviewNotes || selectedExamSession.otherNotes
          "
          class="p-4 shadow-sm bg-gray-50 rounded-xl"
        >
          <h3 class="pb-2 mb-3 text-lg font-semibold text-gray-800 border-b">
            Nhận xét phỏng vấn
          </h3>

          <div
            v-if="selectedExamSession.interviewNotes"
            class="mb-4"
          >
            <div class="flex items-center mb-2">
              <i class="mr-2 text-blue-500 pi pi-comment"></i>
              <h4 class="font-semibold text-gray-700">Nhận xét chính:</h4>
            </div>
            <div
              class="p-3 pl-6 whitespace-pre-wrap bg-white border-l-4 border-blue-400 rounded"
            >
              {{ selectedExamSession.interviewNotes }}
            </div>
          </div>

          <div
            v-if="selectedExamSession.interviewerId"
            class="mb-4"
          >
            <div class="flex items-center mb-2">
              <i class="mr-2 text-green-500 pi pi-bookmark"></i>
              <h4 class="font-semibold text-gray-700">Phỏng vấn bởi:</h4>
            </div>
            <div
              class="p-3 pl-6 whitespace-pre-wrap bg-white border-l-4 border-green-400 rounded"
            >
              {{ getUserInfo(selectedExamSession.interviewerId)?.fullName }}
            </div>
          </div>

          <div
            v-if="selectedExamSession.interviewEndTime"
            class="flex items-center text-sm text-gray-600"
          >
            <i class="mr-2 pi pi-calendar"></i>
            <span
              >Kết thúc phỏng vấn:
              {{ formatDate(selectedExamSession.interviewEndTime) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Dialog Footer -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          label="Đóng"
          severity="secondary"
          icon="pi pi-times"
          @click="visible = false"
        ></Button>
      </div>
    </Dialog>
  </div>

  <ScrollToTop></ScrollToTop>
</template>

<style scoped>
  .exam-session-detail {
    max-height: 70vh;
    overflow-y: auto;
  }

  .p-dialog-custom {
    min-height: 400px;
  }

  .grid {
    gap: 1rem;
  }

  .score-item {
    transition: all 0.3s ease;
  }

  .score-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card-hover {
    transition: all 0.3s ease;
  }

  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
</style>
