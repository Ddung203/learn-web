<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { computed, onMounted, ref } from 'vue';

  import ProgressSpinner from 'primevue/progressspinner';

  import { watch } from 'vue';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useAuthStore } from '~/stores';
  import { ttsService } from '~/services';

  const { t, isVietnamese } = useLocale();
  const authStore = useAuthStore();
  const toast = useToast();

  const editingName = ref(false);
  const newFullName = ref('');
  const editingDateOfBirth = ref(false);
  const newDateOfBirth = ref<Date | null>(null);
  const saving = ref(false);
  const voices = ref<
    Array<{ id: string; name: string; engine: string; gender: string }>
  >([]);
  const selectedVoice = ref('');
  const loadingVoices = ref(false);
  const savingVoice = ref(false);

  const user = computed(() => authStore.user);

  const startEditName = () => {
    newFullName.value = user.value?.full_name || '';
    editingName.value = true;
  };

  const cancelEditName = () => {
    editingName.value = false;
    newFullName.value = '';
  };

  const saveFullName = async () => {
    if (!newFullName.value.trim()) {
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: t('profile.toast.enterFullName'),
        life: 3000,
      });
      return;
    }

    saving.value = true;
    try {
      await authStore.updateProfile({ full_name: newFullName.value.trim() });
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('profile.toast.updateSuccess'),
        life: 3000,
      });
      editingName.value = false;
      newFullName.value = '';
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('profile.toast.updateError'),
        life: 3000,
      });
    } finally {
      saving.value = false;
    }
  };

  const startEditDateOfBirth = () => {
    newDateOfBirth.value = user.value?.date_of_birth ? new Date(user.value.date_of_birth) : null;
    editingDateOfBirth.value = true;
  };

  const cancelEditDateOfBirth = () => {
    editingDateOfBirth.value = false;
    newDateOfBirth.value = null;
  };

  const saveDateOfBirth = async () => {
    saving.value = true;
    try {
      await authStore.updateProfile({ date_of_birth: newDateOfBirth.value?.toISOString() });
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('profile.toast.updateSuccess'),
        life: 3000,
      });
      editingDateOfBirth.value = false;
      newDateOfBirth.value = null;
    } catch (error) {
      console.error('Failed to update date of birth:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('profile.toast.updateError'),
        life: 3000,
      });
    } finally {
      saving.value = false;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('profile.notAvailable');
    try {
      const locate = isVietnamese.value ? 'vi-VN' : 'en-US';

      return new Date(dateString).toLocaleDateString(locate, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return t('profile.notAvailable');
    }
  };

  const loadVoices = async () => {
    loadingVoices.value = true;
    try {
      voices.value = await ttsService.getVoices();
      if (user.value?.preferred_voice_id) {
        selectedVoice.value = user.value.preferred_voice_id;
      } else if (voices.value.length > 0) {
        selectedVoice.value = voices.value[0].id;
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      loadingVoices.value = false;
    }
  };

  const saveVoicePreference = async () => {
    if (!selectedVoice.value) return;

    savingVoice.value = true;
    try {
      await authStore.updateProfile({
        preferred_voice_id: selectedVoice.value,
      });
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('profile.toast.voiceUpdateSuccess'),
        life: 3000,
      });
    } catch (error) {
      console.error('Failed to update voice preference:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('profile.toast.updateError'),
        life: 3000,
      });
    } finally {
      savingVoice.value = false;
    }
  };

  onMounted(() => {
    if (authStore.isAuthenticated) {
      authStore.fetchProfile();
      loadVoices();
    }
  });

  watch(
    () => authStore.isAuthenticated,
    (loggedIn) => {
      if (loggedIn) {
        authStore.fetchProfile();
      }
    }
  );
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <HeaderThird />

    <div class="flex items-start justify-center px-4 pt-24 pb-8">
      <div class="w-full max-w-4xl">
        <Card class="border-0 shadow-2xl">
          <template #header>
            <div
              class="p-8 text-white bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <div class="flex items-center gap-4">
                <Avatar
                  v-if="user?.avatar"
                  :image="user.avatar"
                  class="w-24 h-24 border-4 border-white shadow-lg"
                  shape="circle"
                  size="xlarge"
                />
                <Avatar
                  v-else
                  :label="
                    user?.full_name?.charAt(0).toUpperCase() ||
                    user?.username?.charAt(0).toUpperCase() ||
                    'U'
                  "
                  class="w-24 h-24 text-3xl border-4 border-white shadow-lg"
                  shape="circle"
                  size="xlarge"
                  style="
                    background-color: #ffffff30;
                    color: white;
                    font-weight: bold;
                  "
                />
                <div class="flex-1">
                  <h1 class="mb-1 text-3xl font-bold">
                    {{
                      user?.full_name || user?.username || t('profile.noName')
                    }}
                  </h1>
                  <p class="flex items-center gap-2 text-blue-100">
                    @{{ user?.username }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template #content>
            <div
              v-if="user"
              class="lg:p-6 lg:space-y-6"
            >
              <!-- Full Name Section -->
              <div class="p-4 rounded-lg bg-gray-50">
                <label class="block mb-2 text-sm font-semibold text-gray-700">
                  <i class="mr-2 pi pi-user"></i>
                  {{ t('profile.fullName') }}
                </label>
                <div
                  v-if="!editingName"
                  class="flex items-center gap-2"
                >
                  <span class="text-lg font-medium text-gray-900">
                    {{ user.full_name || t('profile.noName') }}
                  </span>
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="secondary"
                    size="small"
                    class="ml-auto"
                    @click="startEditName"
                  />
                </div>
                <div
                  v-else
                  class="flex flex-col gap-2 sm:flex-row"
                >
                  <InputText
                    v-model="newFullName"
                    class="flex-1"
                    :placeholder="t('profile.edit.enterFullName')"
                    :disabled="saving"
                    @keyup.enter="saveFullName"
                  />
                  <div
                    class="flex flex-row-reverse justify-start gap-4 lg:flex-row"
                  >
                    <Button
                      icon="pi pi-check"
                      rounded
                      severity="success"
                      :loading="saving"
                      :disabled="saving"
                      @click="saveFullName"
                    />
                    <Button
                      icon="pi pi-times"
                      rounded
                      severity="danger"
                      :disabled="saving"
                      @click="cancelEditName"
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <!-- Date of Birth Section -->
              <div class="p-4 rounded-lg bg-gray-50">
                <label class="block mb-2 text-sm font-semibold text-gray-700">
                  <i class="mr-2 pi pi-calendar"></i>
                  {{ t('profile.dateOfBirth') }}
                </label>
                <div
                  v-if="!editingDateOfBirth"
                  class="flex items-center gap-2"
                >
                  <span class="text-lg font-medium text-gray-900">
                    {{ user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US') : t('profile.notSet') }}
                  </span>
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="secondary"
                    size="small"
                    class="ml-auto"
                    @click="startEditDateOfBirth"
                  />
                </div>
                <div
                  v-else
                  class="flex flex-col gap-2 sm:flex-row"
                >
                  <Calendar
                    v-model="newDateOfBirth"
                    class="flex-1"
                    :placeholder="t('profile.edit.selectDate')"
                    :disabled="saving"
                    dateFormat="dd/mm/yy"
                    showIcon
                  />
                  <div class="flex flex-row-reverse justify-start gap-4 lg:flex-row">
                    <Button
                      icon="pi pi-check"
                      rounded
                      severity="success"
                      :loading="saving"
                      :disabled="saving"
                      @click="saveDateOfBirth"
                    />
                    <Button
                      icon="pi pi-times"
                      rounded
                      severity="danger"
                      :disabled="saving"
                      @click="cancelEditDateOfBirth"
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <!-- Voice Preference Section -->
              <div class="p-4 rounded-lg bg-gray-50">
                <label class="block mb-2 text-sm font-semibold text-gray-700">
                  <i class="mr-2 pi pi-volume-up"></i>
                  {{ t('profile.preferredVoice') }}
                </label>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Dropdown
                    v-model="selectedVoice"
                    filter
                    :options="voices"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="t('profile.selectVoice')"
                    class="flex-1"
                    :loading="loadingVoices"
                    :disabled="loadingVoices || savingVoice"
                  >
                    <template #option="{ option }">
                      <div class="flex items-center gap-2">
                        <span>{{ option.name }}</span>
                        <span class="text-xs text-gray-500"
                          >({{ option.engine }})</span
                        >
                      </div>
                    </template>
                  </Dropdown>
                  <Button
                    icon="pi pi-check"
                    :label="t('common.save')"
                    severity="success"
                    :loading="savingVoice"
                    :disabled="
                      savingVoice || selectedVoice === user?.preferred_voice_id
                    "
                    @click="saveVoicePreference"
                  />
                </div>
              </div>

              <Divider />

              <!-- Contact Information -->
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Email -->
                <div class="px-4 py-2 rounded-lg bg-gray-50">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="mr-2 pi pi-envelope"></i>
                    {{ t('profile.email') }}
                  </label>
                  <div class="flex items-center gap-2">
                    <span class="text-base text-gray-900">{{
                      user.email
                    }}</span>
                  </div>
                </div>

                <!-- Username -->
                <div class="p-4 rounded-lg bg-gray-50">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="mr-2 pi pi-at"></i>
                    {{ t('profile.username') }}
                  </label>
                  <div class="text-base text-gray-900">{{ user.username }}</div>
                </div>
              </div>

              <Divider />

              <!-- Account Information -->
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Created At -->
                <div class="p-4 rounded-lg bg-gray-50">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="mr-2 pi pi-calendar-plus"></i>
                    {{ t('common.created') }}
                  </label>
                  <div class="text-base text-gray-900">
                    {{ formatDate(user.created_at) }}
                  </div>
                </div>

                <!-- Updated At -->
                <div class="p-4 rounded-lg bg-gray-50">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="mr-2 pi pi-calendar-clock"></i>
                    {{ t('common.edited') }}
                  </label>
                  <div class="text-base text-gray-900">
                    {{ formatDate(user.updated_at) }}
                  </div>
                </div>
              </div>

              <!-- Statistics (if needed later) -->
              <div class="hidden grid-cols-1 gap-4 mt-8 md:grid-cols-3">
                <div
                  class="p-4 text-center border border-blue-100 rounded-lg bg-blue-50"
                >
                  <div class="text-3xl font-bold text-blue-600">0</div>
                  <div class="mt-1 text-sm text-gray-600">Card Sets</div>
                </div>
                <div
                  class="p-4 text-center border border-green-100 rounded-lg bg-green-50"
                >
                  <div class="text-3xl font-bold text-green-600">0</div>
                  <div class="mt-1 text-sm text-gray-600">Cards Learned</div>
                </div>
                <div
                  class="p-4 text-center border border-purple-100 rounded-lg bg-purple-50"
                >
                  <div class="text-3xl font-bold text-purple-600">0</div>
                  <div class="mt-1 text-sm text-gray-600">Study Sessions</div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="py-12 text-center"
            >
              <ProgressSpinner />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
  :deep(.p-card) {
    border-radius: 1rem;
    overflow: hidden;
  }

  :deep(.p-card-header) {
    padding: 0;
  }

  :deep(.p-card-content) {
    padding: 0;
  }
</style>
