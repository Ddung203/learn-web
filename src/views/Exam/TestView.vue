<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import { useExamStore } from '~/stores/exam.store';
  import { useToast } from 'primevue/usetoast';
  import { notifySuccess, notifyError, notifyInfo } from '~/helper';
  import { StudentService } from '~/services';

  const route = useRoute();
  const router = useRouter();
  const examStore = useExamStore();
  const toast = useToast();

  // Timer
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

  // Dialog for cannot take test notification
  const cannotTakeTestDialog = ref<boolean>(false);

  // Computed properties from store
  const currentQuestion = computed(() => examStore.currentQuestion);
  const totalQuestions = computed(() => examStore.totalQuestions);
  const selectedAnswer = computed(() => examStore.selectedAnswer);
  const formattedTime = computed(() => examStore.formattedTime);
  const loading = computed(() => examStore.loading);
  const currentQuestionIndex = computed(() => examStore.currentQuestionIndex);

  const isAnswered = (questionId: string): boolean => {
    return examStore.isAnswered(questionId);
  };

  // Methods
  const startTimer = (): void => {
    timerInterval.value = setInterval(() => {
      examStore.updateTimer();
      if (examStore.timeRemaining <= 0) {
        handleExamComplete();
      }
    }, 1000);
  };

  const goToQuestion = (index: number): void => {
    examStore.goToQuestion(index);
  };

  const goToPrevious = (): void => {
    examStore.goToPrevious();
  };

  const goToNext = (): void => {
    examStore.goToNext();
  };

  const selectAnswer = (answerNumber: number): void => {
    examStore.selectAnswer(answerNumber);
  };

  const submitExam = async (): Promise<void> => {
    try {
      await examStore.submitExam();
      notifySuccess(toast, 'Nộp bài thành công!');
      handleExamComplete();
    } catch (error) {
      console.error('Error submitting exam:', error);
      notifyError(toast, 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  };

  const confirmSubmit = (): void => {
    if (confirm('Bạn có chắc chắn muốn nộp bài không?')) {
      submitExam();
    }
  };

  const handleCannotTakeTestDialogConfirm = (): void => {
    cannotTakeTestDialog.value = false;
    router.push('/introduction');
  };

  const handleExamComplete = (): void => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }

    router.push('/finish-test');
  };

  const initializeExamSession = async (): Promise<void> => {
    const examSessionId =
      (route.query.examSessionId as string) || 'default-session-id';

    // Check if this session was already submitted
    if (examStore.isSessionSubmitted(examSessionId)) {
      notifyInfo(toast, 'Bài thi này đã được nộp trước đó');
      router.push('/finish-test');
      return;
    }

    // Try to load existing exam session from storage
    const hasExistingSession = examStore.loadExamFromStorage();

    if (hasExistingSession && examStore.isExamActive) {
      // Resume existing exam session and validate time integrity
      examStore.validateTimeIntegrity();
      notifyInfo(toast, 'Đã tải lại phiên làm bài trước đó');
      startTimer();
    } else {
      // Start new exam session
      const { payload } = await StudentService.userCanTakeTest();

      if (!payload.canTakeTest) {
        cannotTakeTestDialog.value = true;
        return;
      }

      await examStore.initializeExam(examSessionId);
      startTimer();
    }
  };

  // Lifecycle
  onMounted(async () => {
    await initializeExamSession();
  });

  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
  });
</script>

<template>
  <Header></Header>
  <Loading v-if="loading"></Loading>

  <!-- Dialog thông báo không thể làm bài -->
  <Dialog
    v-model:visible="cannotTakeTestDialog"
    modal
    header="Thông báo"
    :closable="false"
    :style="{ width: '450px' }"
  >
    <div class="p-4 text-center">
      <i class="mb-4 text-4xl text-red-500 pi pi-exclamation-triangle"></i>
      <p class="mb-6 text-lg text-gray-700">
        Bạn không thể thực hiện bài thi này lúc này. Vui lòng kiểm tra lại thông
        tin hoặc liên hệ quản trị viên.
      </p>
      <Button
        @click="handleCannotTakeTestDialogConfirm"
        severity="info"
        class="px-6"
      >
        <i class="mr-2 pi pi-check"></i>
        Đồng ý
      </Button>
    </div>
  </Dialog>
  <div class="py-6 min-h-[calc(100vh-66px)] bg-blue-50">
    <div class="container px-4 mx-auto max-w-7xl">
      <!-- Header với timer và nút nộp bài -->
      <div
        class="flex items-center justify-between p-4 mb-6 bg-white rounded-lg shadow-sm"
      >
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-semibold text-gray-800">CTV Gen12 - 2025</h1>
          <div class="text-sm text-gray-600">
            Câu {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Timer -->
          <div class="flex items-center space-x-2">
            <i class="text-orange-500 pi pi-clock"></i>
            <span
              class="text-lg font-bold"
              :class="
                examStore.timeRemaining < 300 ? 'text-red-500' : 'text-gray-700'
              "
            >
              {{ formattedTime }}
            </span>
          </div>

          <!-- Nút nộp bài -->
          <Button
            @click="confirmSubmit"
            severity="success"
            class="px-6"
          >
            <i class="mr-2 pi pi-send"></i>
            Nộp bài
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- Bảng câu hỏi -->
        <div class="lg:col-span-1">
          <Card class="h-fit">
            <template #title>
              <div class="text-base font-medium">Danh sách câu hỏi</div>
            </template>
            <template #content>
              <div class="grid grid-cols-5 gap-2 lg:grid-cols-4">
                <Button
                  v-for="(question, index) in examStore.questions"
                  :key="question._id"
                  @click="goToQuestion(index)"
                  :severity="isAnswered(question._id) ? 'success' : 'secondary'"
                  :outlined="examStore.currentQuestionIndex !== index"
                  size="small"
                  class="text-base aspect-square"
                >
                  {{ index + 1 }}
                </Button>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Đã trả lời</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Nội dung câu hỏi -->
        <div class="lg:col-span-3">
          <Card
            class="min-h-[600px]"
            v-if="currentQuestion"
          >
            <template #content>
              <div class="space-y-6">
                <!-- Hình ảnh minh họa nếu có -->
                <div
                  v-if="currentQuestion.imageURL"
                  class="flex justify-center mb-4"
                >
                  <div
                    class="relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <Image
                      :src="currentQuestion.imageURL"
                      alt="Hình ảnh minh họa câu hỏi"
                      width="200"
                      class="object-contain max-w-full transition-transform duration-200 cursor-pointer hover:scale-105"
                      :preview="true"
                    />
                    <div
                      class="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded top-2 right-2"
                    >
                      <i class="mr-1 pi pi-search-plus"></i>
                      Click để phóng to
                    </div>
                  </div>
                </div>

                <!-- Nội dung câu hỏi -->
                <div
                  class="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50"
                >
                  <h2 class="text-lg font-medium leading-relaxed text-gray-800">
                    {{ currentQuestion.content }}
                  </h2>
                </div>

                <!-- Các lựa chọn -->
                <div class="space-y-3">
                  <div
                    v-for="option in currentQuestion.options"
                    :key="option.numbering"
                    class="p-4 transition-all border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                    :class="{
                      'border-blue-500 bg-blue-100':
                        selectedAnswer === option.numbering,
                      'hover:border-blue-300 hover:bg-blue-50':
                        selectedAnswer !== option.numbering,
                    }"
                    @click="selectAnswer(option.numbering)"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        class="flex items-center justify-center w-6 h-6 border-2 rounded-full"
                        :class="{
                          'border-blue-500 bg-blue-500':
                            selectedAnswer === option.numbering,
                          'border-gray-300':
                            selectedAnswer !== option.numbering,
                        }"
                      >
                        <div
                          v-if="selectedAnswer === option.numbering"
                          class="w-3 h-3 bg-white rounded-full"
                        ></div>
                      </div>
                      <span class="text-gray-800 select-none">
                        {{ option.numbering }}. {{ option.answer }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Navigation buttons -->
          <div class="flex justify-between mt-6">
            <div :class="{ 'cursor-not-allowed': !examStore.canGoPrevious }">
              <Button
                @click="goToPrevious"
                :disabled="!examStore.canGoPrevious"
                severity="info"
                outlined
              >
                <i class="mr-2 pi pi-chevron-left"></i>
                Câu trước
              </Button>
            </div>
            <div :class="{ 'cursor-not-allowed': !examStore.canGoNext }">
              <Button
                @click="goToNext"
                :disabled="!examStore.canGoNext"
              >
                Câu tiếp
                <i class="ml-2 pi pi-chevron-right"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .aspect-square {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
