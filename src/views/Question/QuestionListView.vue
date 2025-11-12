<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref, watch } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import {
    levelOptions,
    limitOptions,
    questionTypes,
    sortByOptions,
    sortOrderOptions,
    STATUS_CODE,
  } from '~/constants';
  import { notifyError, notifySuccess, uploadFileToFirebase } from '~/helper';
  import {
    type IImportQuestionPayloadResponse,
    type IQuestion,
    type IUpdateQuestion,
  } from '~/interfaces';
  import { QuestionService } from '~/services';
  import { useAuthStore, useQuestionStore } from '~/stores';
  import {
    buildErrorMessage,
    formatDate,
    getDifficultyColor,
    getDifficultyLabel,
  } from '~/utils';

  //
  const toast = useToast();
  const confirm = useConfirm();
  const questionStore = useQuestionStore();
  const authStore = useAuthStore();
  const { questions, selectedQuestion, loading, pagination, filters } =
    storeToRefs(questionStore);
  const { user } = storeToRefs(authStore);

  const isShowImportForm = ref(false);
  const isShowImportResult = ref(false);
  const importQuestionsResult = ref<IImportQuestionPayloadResponse | null>(
    null
  );
  const isShowUpdateForm = ref(false);
  const fileUrl = ref('');
  const fileupload = ref<any>(null);

  // Methods
  const mapQuestionToUpdateForm = (question?: IQuestion): IUpdateQuestion => ({
    imageURL: question?.imageURL || '',
    content: question?.content || '',
    options: question?.options?.length
      ? question.options
      : [
          { numbering: 1, answer: '' },
          { numbering: 2, answer: '' },
          { numbering: 3, answer: '' },
          { numbering: 4, answer: '' },
        ],
    correctAnswer: question?.correctAnswer || 1,
    level: question?.level || 1,
    questionType: question?.questionType || 1,
  });

  const resetUpdateState = () => {
    isShowUpdateForm.value = false;
    questionStore.setSelectedQuestion(null);
  };

  const updateForm = ref<IUpdateQuestion>(
    mapQuestionToUpdateForm(selectedQuestion.value ?? undefined)
  );

  // Import Questions
  const onUpload = async () => {
    loading.value = true;

    setTimeout(() => {
      loading.value = false;
    }, 30000);

    try {
      const file = fileupload.value?.files[0] || null;

      if (!file) {
        notifyError(toast, 'Vui lòng chọn file');
        return;
      }
      const fileName = `${Date.now()}-${file.name}`;
      const folderName = 'question-files';

      const imgUrl = await uploadFileToFirebase(file, fileName, folderName);

      fileUrl.value = imgUrl;

      notifySuccess(toast, 'Tải lên file thành công');
    } catch (error) {
      notifyError(toast, 'Tải lên file bị gián đoạn! Vui lòng thử lại');
    } finally {
      loading.value = false;
    }
  };
  //

  const applyFilters = async (): Promise<void> => {
    try {
      await questionStore.getQuestionsHandle(filters.value);
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Xảy ra lỗi khi lấy danh sách câu hỏi!'
      );

      notifyError(toast, errorMessage);
    } finally {
      questionStore.setLoading(false);
    }
  };

  const resetFilters = (): void => {
    filters.value = {
      page: 1,
      limit: 10,
      search: '',
      level: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    applyFilters();
  };

  const refreshData = async (): Promise<void> => {
    await applyFilters();
  };

  const openImportQuestions = (): void => {
    isShowImportForm.value = true;
  };

  const importQuestionsHandle = async (): Promise<void> => {
    questionStore.setLoading(true);
    try {
      const response = await QuestionService.importQuestionsFromUrl({
        fileUrl: fileUrl.value,
      });

      if (response.status === STATUS_CODE.SUCCESS) {
        importQuestionsResult.value = response.payload;
        isShowImportResult.value = true;

        refreshData();
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Nhập bộ câu hỏi thất bại!'
      );
      notifyError(toast, errorMessage);
    } finally {
      questionStore.setLoading(false);
      fileUrl.value = '';
      fileupload.value.clear();
    }
  };

  const addOption = () => {
    updateForm.value.options.push({
      numbering: (updateForm.value.options.length + 1) as any,
      answer: '',
    });
  };

  const removeOption = (index: number) => {
    updateForm.value.options.splice(index, 1);
  };

  const editQuestion = (question: IQuestion): void => {
    questionStore.setSelectedQuestion(question);
    isShowUpdateForm.value = true;
    updateForm.value = mapQuestionToUpdateForm(question);
  };

  const updateQuestion = async (): Promise<void> => {
    try {
      const id = selectedQuestion.value?._id;
      if (!id) {
        notifyError(toast, 'Câu hỏi không hợp lệ!');
        return;
      }

      const response = await QuestionService.updateQuestion(
        id,
        updateForm.value
      );

      if (response.status === STATUS_CODE.SUCCESS) {
        notifySuccess(toast, 'Cập nhật câu hỏi thành công!');
        resetUpdateState();
        await applyFilters();
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Cập nhật câu hỏi thất bại!'
      );
      notifyError(toast, errorMessage);
    } finally {
      questionStore.setLoading(false);
    }
  };

  const deleteQuestion = (question: IQuestion): void => {
    confirm.require({
      message: `Bạn có chắc chắn muốn xóa câu hỏi này không?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: async () => {
        try {
          await QuestionService.deleteQuestion(question._id);
          notifySuccess(toast, 'Xóa câu hỏi thành công!');

          await applyFilters();
        } catch (error) {
          const errorMessage = buildErrorMessage(
            error,
            'Xóa câu hỏi thất bại!'
          );

          notifyError(toast, errorMessage);
        } finally {
          questionStore.setLoading(false);
        }
      },
    });
  };

  // Pagination handlers
  const onPageChange = (event: any): void => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
    applyFilters();
  };

  // Debounced search
  let searchTimeout: number;
  const debouncedApplyFilters = (): void => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      filters.value.page = 1; // Reset to first page when filtering
      applyFilters();
    }, 500);
  };

  // Watchers
  watch(
    () => filters.value.search,
    () => {
      debouncedApplyFilters();
    }
  );

  watch(
    [
      () => filters.value.level,
      () => filters.value.sortBy,
      () => filters.value.sortOrder,
      () => filters.value.limit,
    ],
    () => {
      filters.value.page = 1;
      applyFilters();
    }
  );

  // Lifecycle
  onMounted(() => {
    applyFilters();
  });
</script>

<template>
  <Loading v-if="loading" />

  <Header></Header>

  <Dialog
    v-model:visible="isShowImportForm"
    header="Nhập bộ câu hỏi"
    :style="{ width: '40rem' }"
    modal
  >
    <div class="flex flex-col gap-4">
      <!-- Image URL -->
      <div class="flex items-center gap-3">
        <label
          for="imageURL"
          class="font-semibold w-8rem"
          >FileURL</label
        >
        <InputText
          id="imageURL"
          v-model="fileUrl"
          class="flex-auto"
          disabled
          placeholder="None"
        />
      </div>

      <!-- Content -->
      <div>
        <FileUpload
          ref="fileupload"
          mode="basic"
          name="demo[]"
          accept=".xlsx"
          :maxFileSize="1048576"
          :customUpload="true"
          invalidFileSizeMessage="File quá lớn. Vui lòng chọn file nhỏ hơn 1MB."
          chooseLabel="Chọn file"
          @change="onUpload"
        />
      </div>

      <!-- Result -->
      <div v-if="isShowImportResult">
        <h3 class="mb-2 text-lg font-semibold">Kết quả nhập câu hỏi</h3>
        <div class="p-4 bg-gray-100 rounded-lg">
          <p class="mb-1">
            <strong>Tổng số câu hỏi:</strong>
            {{ importQuestionsResult?.totalRows || 0 }}
          </p>
          <p class="mb-1">
            <strong>Nhập thành công:</strong>
            {{ importQuestionsResult?.successCount || 0 }}
          </p>
          <p class="mb-1">
            <strong>Nhập thất bại:</strong>
            {{ importQuestionsResult?.errorCount || 0 }}
          </p>
          <div
            v-if="importQuestionsResult?.errors?.length"
            class="mt-2"
          >
            <strong>Lỗi:</strong>
            <ul class="text-red-600 list-disc list-inside">
              <li
                v-for="(error, index) in importQuestionsResult.errors"
                :key="index"
              >
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button
        label="Hủy"
        severity="secondary"
        @click="isShowImportForm = false"
      />
      <Button
        label="Nhập"
        :disabled="fileupload === null || fileUrl === ''"
        @click="importQuestionsHandle"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="isShowUpdateForm"
    header="Cập nhật câu hỏi"
    :style="{ width: '40rem' }"
    modal
  >
    <div class="flex flex-col gap-4">
      <!-- Image URL -->
      <div class="flex items-center gap-3">
        <label
          for="imageURL"
          class="font-semibold w-8rem"
          >Ảnh minh họa</label
        >
        <InputText
          id="imageURL"
          v-model="updateForm.imageURL"
          class="flex-auto"
          placeholder="Nhập URL hình ảnh"
        />
      </div>

      <!-- Content -->
      <div class="flex items-center gap-3">
        <label
          for="content"
          class="font-semibold w-8rem"
          >Nội dung</label
        >
        <Textarea
          id="content"
          v-model="updateForm.content"
          class="flex-auto"
          autoResize
          rows="3"
          placeholder="Nhập nội dung câu hỏi"
        />
      </div>

      <!-- Options -->
      <div>
        <label class="block mb-2 font-semibold">Các lựa chọn</label>
        <div
          v-for="(opt, index) in updateForm.options"
          :key="index"
          class="flex items-center gap-3 mb-3"
        >
          <InputNumber
            v-model="opt.numbering"
            :min="1"
            class="w-4rem"
            inputClass="w-full"
          />
          <InputText
            v-model="opt.answer"
            class="flex-auto"
            placeholder="Đáp án"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            :disabled="updateForm.options.length <= 1"
            @click="removeOption(index)"
          />
        </div>
        <Button
          label="Thêm lựa chọn"
          icon="pi pi-plus"
          text
          :disabled="updateForm.options.length >= 4"
          @click="addOption"
        />
      </div>

      <!-- Correct Answer -->
      <div class="flex items-center gap-3">
        <label
          for="correctAnswer"
          class="font-semibold w-8rem"
          >Đáp án đúng</label
        >
        <InputNumber
          id="correctAnswer"
          v-model="updateForm.correctAnswer"
          :min="1"
          :max="4"
          class="flex-auto"
        />
      </div>

      <!-- Level -->
      <div class="flex items-center gap-3">
        <label
          for="level"
          class="font-semibold w-8rem"
          >Độ khó</label
        >
        <Dropdown
          id="level"
          v-model="updateForm.level"
          :options="levelOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn độ khó"
          class="flex-auto"
        />
      </div>

      <!-- Question Type -->
      <div class="flex items-center gap-3">
        <label
          for="questionType"
          class="font-semibold w-8rem"
          >Loại câu hỏi</label
        >
        <Dropdown
          id="questionType"
          v-model="updateForm.questionType"
          :options="questionTypes"
          optionLabel="name"
          optionValue="code"
          placeholder="Chọn loại"
          class="flex-auto"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button
        label="Hủy"
        severity="secondary"
        @click="isShowUpdateForm = false"
      />
      <Button
        label="Lưu"
        @click="updateQuestion"
      />
    </template>
  </Dialog>

  <div class="questions-page">
    <!-- Main Content -->
    <div class="container">
      <div class="content-card">
        <!-- Toolbar -->
        <Toolbar class="toolbar">
          <template #start>
            <div
              class="toolbar-start"
              v-if="['R', 'A'].includes(user?.role || 'R')"
            >
              <Button
                label="Thêm câu hỏi"
                icon="pi pi-plus"
                severity="success"
                size="small"
                @click="openImportQuestions"
              />
            </div>
          </template>

          <template #end>
            <div class="toolbar-end">
              <Button
                icon="pi pi-refresh"
                outlined
                size="small"
                :disabled="loading"
                :loading="loading"
                @click="refreshData"
                v-tooltip.bottom="'Làm mới'"
              />

              <Button
                label="Đặt lại bộ lọc"
                icon="pi pi-filter-slash"
                outlined
                :disabled="loading"
                size="small"
                @click="resetFilters"
                v-tooltip.bottom="'Đặt lại bộ lọc'"
              />
            </div>
          </template>
        </Toolbar>

        <!-- Filter Panel -->
        <div class="filter-panel">
          <div class="filter-row">
            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-label">Tìm kiếm:</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters.search"
                  placeholder="Nội dung câu hỏi..."
                  class="filter-input"
                  :disabled="loading"
                />
              </IconField>
            </div>

            <!-- Level Filter -->
            <div class="filter-group">
              <label class="filter-label">Độ khó:</label>
              <Dropdown
                v-model="filters.level"
                :options="levelOptions"
                option-label="label"
                option-value="value"
                placeholder="Chọn độ khó"
                class="filter-dropdown"
                :disabled="loading"
                show-clear
              />
            </div>

            <!-- Sort By Filter -->
            <div class="filter-group">
              <label class="filter-label">Sắp xếp theo:</label>
              <Dropdown
                v-model="filters.sortBy"
                :options="sortByOptions"
                option-label="label"
                option-value="value"
                class="filter-dropdown"
                :disabled="loading"
              />
            </div>

            <!-- Sort Order Filter -->
            <div class="filter-group">
              <label class="filter-label">Thứ tự:</label>
              <Dropdown
                v-model="filters.sortOrder"
                :options="sortOrderOptions"
                option-label="label"
                option-value="value"
                class="filter-dropdown"
                :disabled="loading"
              />
            </div>

            <!-- Limit Filter -->
            <div class="filter-group">
              <label class="filter-label">Số lượng/trang:</label>
              <Dropdown
                v-model="filters.limit"
                :options="limitOptions"
                option-label="label"
                option-value="value"
                class="filter-dropdown filter-dropdown-small"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="questions"
          :loading="loading"
          :lazy="true"
          :paginator="true"
          :rows="pagination.limit"
          :total-records="pagination.total"
          :first="(pagination.page - 1) * pagination.limit"
          @page="onPageChange"
          responsive-layout="scroll"
          class="questions-table"
          :empty-message="'Không có câu hỏi nào'"
          :current-page-report-template="`Hiển thị ${
            (pagination.page - 1) * pagination.limit + 1
          } đến ${Math.min(
            pagination.page * pagination.limit,
            pagination.total
          )} trong tổng số ${pagination.total} câu hỏi`"
          paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        >
          <!-- Question Content Column -->
          <Column
            field="imageURL"
            header="Ảnh minh họa"
            class="content-column"
          >
            <template #body="{ data }">
              <div class="question-content">
                <a
                  :href="data.imageURL"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    :src="data.imageURL"
                    alt="Ảnh minh họa"
                    width="100"
                    height="100"
                    fit="cover"
                    preview
                  />
                </a>
              </div>
            </template>
          </Column>
          <Column
            field="content"
            header="Nội dung câu hỏi"
            class="content-column"
          >
            <template #body="{ data }">
              <div class="question-content">
                <p class="content-text">{{ data.content }}</p>
                <div
                  v-if="data.options && data.options.length"
                  class="options-preview"
                >
                  <small class="options-count">
                    {{ data.options.length }} lựa chọn
                  </small>
                </div>
              </div>
            </template>
          </Column>

          <!-- Category Column -->
          <Column
            field="questionType"
            header="Danh mục"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.questionType"
                :value="data.questionType"
                severity="info"
              />
              <span
                v-else
                class="text-muted"
                >Không xác định</span
              >
            </template>
          </Column>

          <!-- Difficulty Column -->
          <Column
            field="difficulty"
            header="Độ khó"
          >
            <template #body="{ data }">
              <Tag
                :value="getDifficultyLabel(data.level)"
                :severity="getDifficultyColor(data.level)"
              />
            </template>
          </Column>

          <!-- Created Date Column -->
          <Column
            field="createdAt"
            header="Ngày tạo"
          >
            <template #body="{ data }">
              <span class="date-text">{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>

          <Column
            field="updatedAt"
            header="Ngày cập nhật"
          >
            <template #body="{ data }">
              <span class="date-text">{{ formatDate(data.updatedAt) }}</span>
            </template>
          </Column>

          <!-- Actions Column -->
          <Column
            header="Thao tác"
            :exportable="false"
            class="actions-column"
          >
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  outlined
                  size="small"
                  @click="editQuestion(data)"
                  v-tooltip.bottom="'Chỉnh sửa'"
                />

                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  size="small"
                  :disabled="loading"
                  @click="deleteQuestion(data)"
                  v-tooltip.bottom="'Xóa'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- ScrollToTop -->
    <ScrollToTop />
  </div>
</template>

<style scoped>
  .questions-page {
    min-height: 100vh;
    background-color: #f8fafc;
  }

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    margin-bottom: 2rem;
  }

  .page-header .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .header-content {
    text-align: center;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .page-subtitle {
    font-size: 1.125rem;
    opacity: 0.9;
    margin: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .content-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .toolbar {
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
  }

  .filter-panel {
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    flex: 1;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    display: block;
  }

  .filter-input {
    width: 100%;
  }

  .filter-dropdown {
    width: 100%;
    min-width: 150px;
  }

  .filter-dropdown-small {
    min-width: 120px;
    max-width: 120px;
  }

  .toolbar-start {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .toolbar-end {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .search-input {
    min-width: 300px;
  }

  .questions-table {
    margin: 0;
  }

  .questions-table :deep(.p-datatable-table) {
    min-width: 100%;
  }

  .questions-table :deep(.p-datatable-thead > tr > th) {
    background-color: #f9fafb;
    color: #374151;
    font-weight: 600;
    padding: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .questions-table :deep(.p-datatable-tbody > tr > td) {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .questions-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #f9fafb;
  }

  .content-column {
    min-width: 300px;
  }

  .question-content {
    max-width: 400px;
  }

  .content-text {
    margin: 0 0 0.5rem 0;
    font-weight: 500;
    line-height: 1.5;
    color: #1f2937;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }

  .options-preview {
    margin-top: 0.5rem;
  }

  .options-count {
    color: #6b7280;
    font-size: 0.875rem;
    background-color: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
  }

  .actions-column {
    width: 120px;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .date-text {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .text-muted {
    color: #9ca3af;
    font-style: italic;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
    }

    .page-subtitle {
      font-size: 1rem;
    }

    .container {
      padding: 0 0.5rem;
    }

    .toolbar {
      padding: 1rem;
    }

    .toolbar-start,
    .toolbar-end {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .filter-panel {
      padding: 1rem;
    }

    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-group {
      min-width: auto;
      width: 100%;
    }

    .filter-dropdown-small {
      min-width: auto;
      max-width: none;
    }

    .questions-table :deep(.p-datatable-thead > tr > th),
    .questions-table :deep(.p-datatable-tbody > tr > td) {
      padding: 0.75rem;
    }

    .content-text {
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }

    .action-buttons {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  /* Loading State */
  .questions-table :deep(.p-datatable-loading-overlay) {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
  }

  /* Empty State */
  .questions-table :deep(.p-datatable-emptymessage > td) {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
    font-size: 1.125rem;
  }

  /* Custom Scrollbar */
  .questions-table :deep(.p-datatable-scrollable-wrapper) {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .questions-table :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar) {
    height: 8px;
    width: 8px;
  }

  .questions-table
    :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-track) {
    background: transparent;
  }

  .questions-table
    :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-thumb) {
    background-color: #cbd5e1;
    border-radius: 4px;
  }

  .questions-table
    :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-thumb:hover) {
    background-color: #94a3b8;
  }
</style>
