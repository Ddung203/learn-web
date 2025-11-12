<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref, watch } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import {
    accountStatusOptions,
    userSortByOptions,
    sortOrderOptions,
    limitOptions,
    roleOptions,
    STATUS_CODE,
  } from '~/constants';
  import { notifyError, notifySuccess } from '~/helper';
  import {
    type IUser,
    type IAdminCreateUserParams,
    type IAdminUpdateUserParams,
  } from '~/interfaces';
  import { UserService } from '~/services';
  import { useAuthStore, useUserStore } from '~/stores';
  import { buildErrorMessage, formatDate } from '~/utils';

  //
  const toast = useToast();
  const confirm = useConfirm();
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const { users, selectedUser, loading, pagination, filters } =
    storeToRefs(userStore);
  const { user } = storeToRefs(authStore);

  const isShowCreateForm = ref(false);
  const isShowUpdateForm = ref(false);

  // Form data
  const createForm = ref<IAdminCreateUserParams>({
    username: '',
    fullName: '',
    studentCode: '',
    studentClass: '',
    phoneNumber: '',
    email: '',
    facebookLink: '',
    hometown: '',
    avatarImage: '',
    role: 'U',
    isActive: 1,
  });

  const updateForm = ref<IAdminUpdateUserParams>({
    username: '',
    fullName: '',
    studentCode: '',
    studentClass: '',
    phoneNumber: '',
    email: '',
    facebookLink: '',
    hometown: '',
    avatarImage: '',
  });

  // Methods
  const mapUserToUpdateForm = (user?: IUser): IAdminUpdateUserParams => ({
    username: user?.username || '',
    fullName: user?.fullName || '',
    studentCode: user?.studentCode || '',
    studentClass: user?.studentClass || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    facebookLink: user?.facebookLink || '',
    hometown: user?.hometown || '',
    avatarImage: user?.avatarImage || '',
  });

  const resetCreateForm = () => {
    createForm.value = {
      username: '',
      fullName: '',
      studentCode: '',
      studentClass: '',
      phoneNumber: '',
      email: '',
      facebookLink: '',
      hometown: '',
      avatarImage: '',
      role: 'U',
      isActive: 1,
    };
    isShowCreateForm.value = false;
  };

  const resetUpdateState = () => {
    isShowUpdateForm.value = false;
    userStore.setSelectedUser(null);
  };

  const applyFilters = async (): Promise<void> => {
    try {
      await userStore.getUsersHandle(filters.value);
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Xảy ra lỗi khi lấy danh sách người dùng!'
      );
      notifyError(toast, errorMessage);
    } finally {
      userStore.setLoading(false);
    }
  };

  const resetFilters = (): void => {
    filters.value = {
      page: 1,
      limit: 10,
      search: '',
      studentCode: '',
      email: '',
      phoneNumber: '',
      role: undefined,
      accountStatus: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    };
    applyFilters();
  };

  const refreshData = async (): Promise<void> => {
    await applyFilters();
  };

  const openCreateUser = (): void => {
    resetCreateForm();
    isShowCreateForm.value = true;
  };

  const createUser = async (): Promise<void> => {
    try {
      const trimmedCreateForm = {
        ...createForm.value,
        username: createForm.value.username?.trim() || '',
        fullName: createForm.value.fullName?.trim() || '',
        studentCode: createForm.value.studentCode?.trim() || '',
        studentClass: createForm.value.studentClass?.trim() || '',
        phoneNumber: createForm.value.phoneNumber?.trim() || '',
        email: createForm.value.email?.trim() || '',
        facebookLink: createForm.value.facebookLink?.trim() || '',
        hometown: createForm.value.hometown?.trim() || '',
        avatarImage: createForm.value.avatarImage?.trim() || '',
      };

      const response = await UserService.createUser(trimmedCreateForm);

      if (response.status === STATUS_CODE.SUCCESS) {
        notifySuccess(toast, 'Tạo người dùng thành công!');
        resetCreateForm();
        await applyFilters();
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(error, 'Tạo người dùng thất bại!');
      notifyError(toast, errorMessage);
    } finally {
      userStore.setLoading(false);
    }
  };

  const editUser = (user: IUser): void => {
    userStore.setSelectedUser(user);
    isShowUpdateForm.value = true;
    updateForm.value = mapUserToUpdateForm(user);
  };

  const updateUser = async (): Promise<void> => {
    try {
      const id = selectedUser.value?._id;
      if (!id) {
        notifyError(toast, 'Người dùng không hợp lệ!');
        return;
      }

      const trimmedUpdateForm = {
        ...updateForm.value,
        username: updateForm.value.username?.trim() || '',
        fullName: updateForm.value.fullName?.trim() || '',
        studentCode: updateForm.value.studentCode?.trim() || '',
        studentClass: updateForm.value.studentClass?.trim() || '',
        phoneNumber: updateForm.value.phoneNumber?.trim() || '',
        email: updateForm.value.email?.trim() || '',
        facebookLink: updateForm.value.facebookLink?.trim() || '',
        hometown: updateForm.value.hometown?.trim() || '',
        avatarImage: updateForm.value.avatarImage?.trim() || '',
      };

      const response = await UserService.updateUser(id, trimmedUpdateForm);

      if (response.status === STATUS_CODE.SUCCESS) {
        notifySuccess(toast, 'Cập nhật người dùng thành công!');
        resetUpdateState();
        await applyFilters();
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Cập nhật người dùng thất bại!'
      );
      notifyError(toast, errorMessage);
    } finally {
      userStore.setLoading(false);
    }
  };

  const deleteUser = (user: IUser): void => {
    confirm.require({
      message: `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}" không?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: async () => {
        try {
          await UserService.deleteUser(user._id);
          notifySuccess(toast, 'Xóa người dùng thành công!');
          await applyFilters();
        } catch (error) {
          const errorMessage = buildErrorMessage(
            error,
            'Xóa người dùng thất bại!'
          );
          notifyError(toast, errorMessage);
        } finally {
          userStore.setLoading(false);
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

  // Utility functions
  const getRoleLabel = (role: string): string => {
    const roleOption = roleOptions.value.find((r) => r.value === role);
    return roleOption?.label || role;
  };

  const getRoleSeverity = (role: string): string => {
    switch (role) {
      case 'A':
        return 'danger';
      case 'I':
        return 'info';
      case 'U':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getAccountStatusSeverity = (status: string): string => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getAccountStatusLabel = (status: string): string => {
    const statusOption = accountStatusOptions.value.find(
      (s) => s.value === status
    );
    return statusOption?.label || status;
  };

  // Watchers
  watch(
    [
      () => filters.value.search,
      () => filters.value.studentCode,
      () => filters.value.email,
      () => filters.value.phoneNumber,
    ],
    () => {
      debouncedApplyFilters();
    }
  );

  watch(
    [
      () => filters.value.accountStatus,
      () => filters.value.sortBy,
      () => filters.value.sortOrder,
      () => filters.value.limit,
      () => filters.value.role,
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

  <!-- Create User Dialog -->
  <Dialog
    v-model:visible="isShowCreateForm"
    header="Thêm người dùng mới"
    :style="{ width: '40rem' }"
    modal
  >
    <div class="flex flex-col gap-4">
      <!-- Username -->
      <div class="flex items-center gap-3">
        <label
          for="username"
          class="font-semibold w-8rem"
          >Tên đăng nhập</label
        >
        <InputText
          id="username"
          v-model="createForm.username"
          class="flex-auto"
          size="small"
          placeholder="Nhập tên đăng nhập"
          required
        />
      </div>

      <!-- Full Name -->
      <div class="flex items-center gap-3">
        <label
          for="fullName"
          class="font-semibold w-8rem"
          >Tên đầy đủ</label
        >
        <InputText
          id="fullName"
          v-model="createForm.fullName"
          class="flex-auto"
          size="small"
          placeholder="Nhập tên đầy đủ"
          required
        />
      </div>

      <!-- Email -->
      <div class="flex items-center gap-3">
        <label
          for="email"
          class="font-semibold w-8rem"
          >Email</label
        >
        <InputText
          id="email"
          v-model="createForm.email"
          class="flex-auto"
          size="small"
          placeholder="Nhập email"
          type="email"
          required
        />
      </div>

      <!-- Student Code -->
      <div class="flex items-center gap-3">
        <label
          for="studentCode"
          class="font-semibold w-8rem"
          >Mã sinh viên</label
        >
        <InputText
          id="studentCode"
          v-model="createForm.studentCode"
          class="flex-auto"
          size="small"
          maxlength="10"
          placeholder="Nhập mã sinh viên"
          required
        />
      </div>

      <!-- Student Class -->
      <div class="flex items-center gap-3">
        <label
          for="studentClass"
          class="font-semibold w-8rem"
          >Lớp</label
        >
        <InputText
          id="studentClass"
          v-model="createForm.studentClass"
          class="flex-auto"
          size="small"
          placeholder="Nhập tên lớp"
          required
        />
      </div>

      <!-- Phone Number -->
      <div class="flex items-center gap-3">
        <label
          for="phoneNumber"
          class="font-semibold w-8rem"
          >Số điện thoại</label
        >
        <InputText
          id="phoneNumber"
          v-model="createForm.phoneNumber"
          class="flex-auto"
          size="small"
          maxlength="10"
          placeholder="Nhập số điện thoại"
          required
        />
      </div>

      <!-- Role -->
      <div class="flex items-center gap-3">
        <label
          for="role"
          class="font-semibold w-8rem"
          >Vai trò</label
        >
        <Dropdown
          id="role"
          v-model="createForm.role"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn vai trò"
          class="flex-auto"
        />
      </div>

      <!-- Status -->
      <div class="flex items-center gap-3">
        <label class="font-semibold w-8rem">Trạng thái</label>
        <div class="flex gap-2">
          <div class="flex align-items-center">
            <RadioButton
              v-model="createForm.isActive"
              inputId="active"
              name="isActive"
              :value="1"
            />
            <label
              for="active"
              class="ml-2"
              >Hoạt động</label
            >
          </div>
          <div class="flex align-items-center">
            <RadioButton
              v-model="createForm.isActive"
              inputId="inactive"
              name="isActive"
              :value="0"
            />
            <label
              for="inactive"
              class="ml-2"
              >Không hoạt động</label
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button
        label="Hủy"
        severity="secondary"
        size="small"
        @click="resetCreateForm"
      />
      <Button
        label="Tạo"
        size="small"
        @click="createUser"
      />
    </template>
  </Dialog>

  <!-- Update User Dialog -->
  <Dialog
    v-model:visible="isShowUpdateForm"
    header="Cập nhật người dùng"
    :style="{ width: '40rem' }"
    modal
  >
    <div class="flex flex-col gap-4">
      <!-- Username -->
      <div class="flex items-center gap-3">
        <label
          for="updateUsername"
          class="font-semibold w-8rem"
          >Tên đăng nhập</label
        >
        <InputText
          id="updateUsername"
          disabled
          v-model="updateForm.username"
          class="flex-auto"
          placeholder="Nhập tên đăng nhập"
        />
      </div>

      <!-- Full Name -->
      <div class="flex items-center gap-3">
        <label
          for="updateFullName"
          class="font-semibold w-8rem"
          >Tên đầy đủ</label
        >
        <InputText
          id="updateFullName"
          v-model="updateForm.fullName"
          class="flex-auto"
          placeholder="Nhập tên đầy đủ"
        />
      </div>

      <!-- Email -->
      <div class="flex items-center gap-3">
        <label
          for="updateEmail"
          class="font-semibold w-8rem"
          >Email</label
        >
        <InputText
          id="updateEmail"
          v-model="updateForm.email"
          class="flex-auto"
          placeholder="Nhập email"
          type="email"
        />
      </div>

      <!-- Student Code -->
      <div class="flex items-center gap-3">
        <label
          for="updateStudentCode"
          class="font-semibold w-8rem"
          >Mã sinh viên</label
        >
        <InputText
          id="updateStudentCode"
          v-model="updateForm.studentCode"
          class="flex-auto"
          placeholder="Nhập mã sinh viên"
        />
      </div>

      <!-- Student Class -->
      <div class="flex items-center gap-3">
        <label
          for="updateStudentClass"
          class="font-semibold w-8rem"
          >Lớp</label
        >
        <InputText
          id="updateStudentClass"
          v-model="updateForm.studentClass"
          class="flex-auto"
          placeholder="Nhập tên lớp"
        />
      </div>

      <!-- Phone Number -->
      <div class="flex items-center gap-3">
        <label
          for="updatePhoneNumber"
          class="font-semibold w-8rem"
          >Số điện thoại</label
        >
        <InputText
          id="updatePhoneNumber"
          v-model="updateForm.phoneNumber"
          class="flex-auto"
          placeholder="Nhập số điện thoại"
        />
      </div>

      <!-- Hometown -->
      <div class="flex items-center gap-3">
        <label
          for="updateHometown"
          class="font-semibold w-8rem"
          >Quê quán</label
        >
        <InputText
          id="updateHometown"
          v-model="updateForm.hometown"
          class="flex-auto"
          placeholder="Nhập quê quán"
        />
      </div>

      <!-- Facebook Link -->
      <div class="flex items-center gap-3">
        <label
          for="updateFacebookLink"
          class="font-semibold w-8rem"
          >Facebook</label
        >
        <InputText
          id="updateFacebookLink"
          v-model="updateForm.facebookLink"
          class="flex-auto"
          placeholder="Nhập link Facebook"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button
        label="Hủy"
        severity="secondary"
        @click="resetUpdateState"
      />
      <Button
        label="Lưu"
        @click="updateUser"
      />
    </template>
  </Dialog>

  <div class="users-page">
    <!-- Main Content -->
    <div class="container">
      <div class="content-card">
        <!-- Toolbar -->
        <Toolbar class="toolbar">
          <template #start>
            <div
              v-if="['R', 'A'].includes(user?.role || 'R')"
              class="toolbar-start"
            >
              <Button
                label="Thêm người dùng"
                icon="pi pi-plus"
                severity="success"
                size="small"
                @click="openCreateUser"
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
              <label class="filter-label">Họ tên:</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters.search"
                  placeholder="Nhập tên"
                  size="small"
                  class="filter-input"
                  :disabled="loading"
                />
              </IconField>
            </div>

            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-label">Mã sinh viên:</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters.studentCode"
                  placeholder="Nhập mã sinh viên"
                  size="small"
                  class="filter-input"
                  :disabled="loading"
                />
              </IconField>
            </div>
            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-label">Email:</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters.email"
                  placeholder="Nhập email"
                  class="filter-input"
                  size="small"
                  :disabled="loading"
                />
              </IconField>
            </div>

            <!-- Account Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Loại tài khoản:</label>
              <Dropdown
                v-model="filters.role"
                :options="roleOptions"
                option-label="label"
                option-value="value"
                size="small"
                placeholder="Chọn loại tài khoản"
                class="filter-dropdown"
                :disabled="loading"
                show-clear
              />
            </div>

            <!-- Account Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Trạng thái tài khoản:</label>
              <Dropdown
                v-model="filters.accountStatus"
                :options="accountStatusOptions"
                option-label="label"
                option-value="value"
                size="small"
                placeholder="Chọn trạng thái"
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
                :options="userSortByOptions"
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
          :value="users"
          :loading="loading"
          :lazy="true"
          :paginator="true"
          :rows="pagination.limit"
          :total-records="pagination.total"
          :first="(pagination.page - 1) * pagination.limit"
          @page="onPageChange"
          responsive-layout="scroll"
          class="users-table"
          :empty-message="'Không có người dùng nào'"
          :current-page-report-template="`Hiển thị ${
            (pagination.page - 1) * pagination.limit + 1
          } đến ${Math.min(
            pagination.page * pagination.limit,
            pagination.total
          )} trong tổng số ${pagination.total} người dùng`"
          paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        >
          <!-- Avatar Column -->
          <Column
            field="avatarImage"
            header="Avatar"
            class="avatar-column"
          >
            <template #body="{ data }">
              <div class="flex justify-center">
                <a
                  :href="data.avatarImage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Avatar
                    :image="data.avatarImage"
                    shape="circle"
                    size="normal"
                  />
                </a>
              </div>
            </template>
          </Column>

          <!-- User Info Column -->
          <Column
            field="userInfo"
            header="Thông tin người dùng"
            class="user-info-column"
          >
            <template #body="{ data }">
              <div class="user-info">
                <p class="user-name">{{ data.fullName }}</p>
                <p class="user-detail">{{ data.username }}</p>
                <p class="user-detail">{{ data.phoneNumber }}</p>
              </div>
            </template>
          </Column>

          <!-- Student Info Column -->
          <Column
            field="studentInfo"
            header="Thông tin sinh viên"
          >
            <template #body="{ data }">
              <div class="student-info">
                <p class="student-code">{{ data.studentCode }}</p>
                <p class="student-class">{{ data.studentClass }}</p>
              </div>
            </template>
          </Column>

          <!-- Role Column -->
          <Column
            field="role"
            header="Vai trò"
          >
            <template #body="{ data }">
              <Tag
                :value="getRoleLabel(data.role)"
                :severity="getRoleSeverity(data.role)"
              />
            </template>
          </Column>

          <!-- Account Status Column -->
          <Column
            field="accountStatus"
            header="Trạng thái tài khoản"
          >
            <template #body="{ data }">
              <Tag
                :value="getAccountStatusLabel(data.accountStatus)"
                :severity="getAccountStatusSeverity(data.accountStatus)"
              />
            </template>
          </Column>

          <!-- Last Login Column -->
          <Column
            field="lastLoginAt"
            header="Đăng nhập cuối"
          >
            <template #body="{ data }">
              <span class="date-text">
                {{
                  data.lastLoginAt
                    ? formatDate(data.lastLoginAt)
                    : 'Chưa đăng nhập'
                }}
              </span>
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
                  :disabled="user?.role !== 'R' || loading"
                  @click="editUser(data)"
                  v-tooltip.bottom="'Chỉnh sửa'"
                />

                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  size="small"
                  :disabled="user?.role !== 'R' || loading"
                  @click="deleteUser(data)"
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
  .users-page {
    min-height: 100vh;
    background-color: #f8fafc;
  }

  .container {
    max-width: 1400px;
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
    /* flex: 1; */
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

  .users-table {
    margin: 0;
  }

  .users-table :deep(.p-datatable-table) {
    min-width: 100%;
  }

  .users-table :deep(.p-datatable-thead > tr > th) {
    background-color: #f9fafb;
    color: #374151;
    font-weight: 600;
    padding: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .users-table :deep(.p-datatable-tbody > tr > td) {
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .users-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #f9fafb;
  }

  .avatar-column {
    width: 80px;
  }

  .user-info-column {
    min-width: 250px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .user-name {
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .user-detail {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .student-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .student-code {
    font-weight: 500;
    color: #1f2937;
    margin: 0;
  }

  .student-class {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
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

  /* Responsive Design */
  @media (max-width: 768px) {
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

    .users-table :deep(.p-datatable-thead > tr > th),
    .users-table :deep(.p-datatable-tbody > tr > td) {
      padding: 0.75rem;
    }

    .action-buttons {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  /* Loading State */
  .users-table :deep(.p-datatable-loading-overlay) {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
  }

  /* Empty State */
  .users-table :deep(.p-datatable-emptymessage > td) {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
    font-size: 1.125rem;
  }

  /* Custom Scrollbar */
  .users-table :deep(.p-datatable-scrollable-wrapper) {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .users-table :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar) {
    height: 8px;
    width: 8px;
  }

  .users-table :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-track) {
    background: transparent;
  }

  .users-table :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-thumb) {
    background-color: #cbd5e1;
    border-radius: 4px;
  }

  .users-table
    :deep(.p-datatable-scrollable-wrapper::-webkit-scrollbar-thumb:hover) {
    background-color: #94a3b8;
  }
</style>
