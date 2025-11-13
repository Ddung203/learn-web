<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { STATUS_CODE } from '~/constants';
  import { roleOptions } from '~/constants/vue-ref';
  import { notifyError, notifySuccess } from '~/helper';
  import { UserService } from '~/services';
  import { useAuthStore } from '~/stores';
  import { buildErrorMessage } from '~/utils';
  import { useLocale } from '~/composables/useLocale';

  const toast = useToast();
  const { t } = useLocale();
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);

  const isLoading = ref(false);
  const isEditingFullName = ref(false);
  const newFullName = ref('');

  const getRoleLabel = (roleCode: string | undefined): string => {
    if (!roleCode) return t('profile.role.user');
    const role = roleOptions.value.find((option) => option.value === roleCode);
    return role?.label || t('profile.role.user');
  };

  onMounted(() => {
    if (user.value?.fullName) {
      newFullName.value = user.value.fullName;
    }
  });

  const startEditFullName = (): void => {
    isEditingFullName.value = true;
    newFullName.value = user.value?.fullName || '';
  };

  const cancelEditFullName = (): void => {
    isEditingFullName.value = false;
    newFullName.value = user.value?.fullName || '';
  };

  const updateFullName = async (): Promise<void> => {
    if (!user.value || !newFullName.value.trim()) {
      notifyError(toast, t('profile.toast.enterFullName'));
      return;
    }

    if (newFullName.value.trim() === user.value.fullName) {
      isEditingFullName.value = false;
      return;
    }

    isLoading.value = true;

    try {
      const response = await UserService.updateUserPatch(user.value._id, {
        fullName: newFullName.value.trim(),
      });

      if (response.status === STATUS_CODE.SUCCESS) {
        authStore.updateUserFullName(response.payload.fullName);

        isEditingFullName.value = false;
        notifySuccess(toast, t('profile.toast.updateSuccess'));
      } else {
        notifyError(toast, response.message || t('profile.toast.updateError'));
      }
    } catch (error: any) {
      const errorMessage = buildErrorMessage(error);
      notifyError(toast, errorMessage || t('profile.toast.updateError'));
    } finally {
      isLoading.value = false;
    }
  };
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <Header :title="t('profile.title')" />

    <div class="container px-4 py-8 mx-auto">
      <div class="max-w-2xl mx-auto">
        <!-- Profile Card -->
        <div class="p-8 bg-white shadow-lg rounded-xl">
          <!-- Avatar Section -->
          <div class="mb-8 text-center">
            <div class="relative inline-block">
              <img
                :src="user?.avatarImage || '/assets/imgs/nodata.png'"
                :alt="user?.fullName || t('profile.avatar')"
                class="object-cover w-32 h-32 border-4 border-indigo-100 rounded-full shadow-lg"
                @error="
                  ($event.target as HTMLImageElement).src =
                    '/assets/imgs/nodata.png'
                "
              />
            </div>
            <h1 class="mt-4 text-3xl font-bold text-gray-800">
              {{ user?.fullName || t('profile.noName') }}
            </h1>
            <p class="text-lg text-indigo-600">
              {{ getRoleLabel(user?.role) }}
            </p>
          </div>

          <!-- User Information -->
          <div class="space-y-6">
            <!-- Full Name -->
            <div class="pb-4 border-b border-gray-100">
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.fullName') }}
              </label>

              <div
                v-if="!isEditingFullName"
                class="flex items-center justify-between"
              >
                <span class="text-lg text-gray-800">{{
                  user?.fullName || t('profile.notAvailable')
                }}</span>
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  text
                  severity="secondary"
                  @click="startEditFullName"
                  class="ml-2"
                  :disabled="isLoading"
                />
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <InputText
                  v-model="newFullName"
                  :placeholder="t('profile.edit.enterFullName')"
                  class="w-full"
                  :disabled="isLoading"
                  @keyup.enter="updateFullName"
                  @keyup.esc="cancelEditFullName"
                />
                <div class="flex gap-2">
                  <Button
                    :label="t('profile.edit.save')"
                    icon="pi pi-check"
                    size="small"
                    @click="updateFullName"
                    :loading="isLoading"
                    :disabled="!newFullName.trim()"
                  />
                  <Button
                    :label="t('profile.edit.cancel')"
                    icon="pi pi-times"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="cancelEditFullName"
                    :disabled="isLoading"
                  />
                </div>
              </div>
            </div>

            <!-- Username -->
            <div class="pb-4 border-b border-gray-100">
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.username') }}
              </label>
              <span class="text-lg text-gray-800">{{
                user?.username || t('profile.notAvailable')
              }}</span>
            </div>

            <!-- Email -->
            <div class="pb-4 border-b border-gray-100">
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.email') }}
              </label>
              <div class="flex items-center gap-2">
                <span class="text-lg text-gray-800">{{
                  user?.email || t('profile.notAvailable')
                }}</span>
                <Tag
                  v-if="user?.emailVerified === 1"
                  :value="t('profile.emailVerified')"
                  severity="success"
                  icon="pi pi-check"
                />
                <Tag
                  v-else
                  :value="t('profile.emailNotVerified')"
                  severity="warning"
                  icon="pi pi-exclamation-triangle"
                />
              </div>
            </div>

            <!-- Student Code -->
            <div
              v-if="user?.studentCode"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.studentCode') }}
              </label>
              <span class="text-lg text-gray-800">{{ user.studentCode }}</span>
            </div>

            <!-- Student Class -->
            <div
              v-if="user?.studentClass"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.studentClass') }}
              </label>
              <span class="text-lg text-gray-800">{{ user.studentClass }}</span>
            </div>

            <!-- Phone Number -->
            <div
              v-if="user?.phoneNumber"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.phoneNumber') }}
              </label>
              <span class="text-lg text-gray-800">{{ user.phoneNumber }}</span>
            </div>

            <!-- Hometown -->
            <div
              v-if="user?.hometown"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.hometown') }}
              </label>
              <span class="text-lg text-gray-800">{{ user.hometown }}</span>
            </div>

            <!-- Facebook Link -->
            <div
              v-if="user?.facebookLink"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.facebook') }}
              </label>
              <a
                :href="user.facebookLink"
                target="_blank"
                class="text-lg text-blue-600 underline hover:text-blue-800"
              >
                {{ user.facebookLink }}
              </a>
            </div>

            <!-- Account Status -->
            <div class="pb-4 border-b border-gray-100">
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.accountStatus') }}
              </label>
              <Tag
                :value="
                  user?.accountStatus === 'active'
                    ? t('profile.accountActive')
                    : t('profile.accountInactive')
                "
                :severity="
                  user?.accountStatus === 'active' ? 'success' : 'warning'
                "
              />
            </div>

            <!-- Test Scores -->
            <div
              v-if="user?.testScore || user?.finalScore"
              class="pb-4 border-b border-gray-100"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.testScore') }}
              </label>
              <div class="space-y-1">
                <div
                  v-if="user.testScore"
                  class="text-lg text-gray-800"
                >
                  {{ t('profile.testScore') }}:
                  <span class="font-semibold text-indigo-600">{{
                    user.testScore
                  }}</span>
                </div>
                <div
                  v-if="user.finalScore"
                  class="text-lg text-gray-800"
                >
                  {{ t('profile.finalScore') }}:
                  <span class="font-semibold text-indigo-600">{{
                    user.finalScore
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Last Login -->
            <div
              v-if="user?.lastLoginAt"
              class="pb-4"
            >
              <label class="block mb-2 text-sm font-semibold text-gray-600">
                {{ t('profile.lastLogin') }}
              </label>
              <span class="text-lg text-gray-800">
                {{ new Date(user.lastLoginAt).toLocaleString('vi-VN') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Loading v-if="isLoading"></Loading>
    <ScrollToTop />
  </div>
</template>

<style scoped>
  .container {
    max-width: 1200px;
  }
</style>
