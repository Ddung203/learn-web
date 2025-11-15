<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :header="t('sync.status')"
    :style="{ width: '32rem' }"
    :closable="!isSyncing"
  >
    <div class="flex flex-col gap-4">
      <!-- Sync Progress -->
      <div v-if="isSyncing" class="flex items-center gap-3">
        <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
        <div class="flex-1">
          <p class="font-medium">{{ t('sync.syncing') }}</p>
          <p class="text-sm text-gray-600">
            {{ t('sync.pleaseWait') }}
          </p>
        </div>
      </div>

      <!-- Pending Operations -->
      <div v-if="!isSyncing && pendingCount > 0" class="bg-yellow-50 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-yellow-600 text-xl"></i>
          <div>
            <p class="font-medium text-yellow-900">
              {{ pendingCount }} {{ t('sync.pendingChanges') }}
            </p>
            <p class="text-sm text-yellow-700 mt-1">
              {{ t('sync.willSyncWhenOnline') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="!isSyncing && syncResult && syncResult.success > 0" class="bg-green-50 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="pi pi-check-circle text-green-600 text-xl"></i>
          <div>
            <p class="font-medium text-green-900">
              {{ t('sync.successfullySynced', { count: syncResult.success }) }}
            </p>
            <p v-if="lastSyncTime" class="text-sm text-green-700 mt-1">
              {{ t('sync.lastSync') }}: {{ formatTime(lastSyncTime) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Failed Operations -->
      <div v-if="!isSyncing && syncResult && syncResult.failed > 0" class="bg-red-50 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="pi pi-times-circle text-red-600 text-xl"></i>
          <div>
            <p class="font-medium text-red-900">
              {{ t('sync.failedToSync', { count: syncResult.failed }) }}
            </p>
            <p class="text-sm text-red-700 mt-1">
              {{ t('sync.willRetryLater') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Online Status -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-2">
          <i :class="isOnline ? 'pi pi-wifi text-green-600' : 'pi pi-wifi text-gray-400'"></i>
          <span class="text-sm font-medium">
            {{ isOnline ? t('sync.online') : t('sync.offline') }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('common.close')"
          text
          @click="close"
          :disabled="isSyncing"
        />
        <Button
          v-if="isOnline && pendingCount > 0 && !isSyncing"
          :label="t('sync.syncNow')"
          @click="handleSync"
          icon="pi pi-refresh"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import Dialog from 'primevue/dialog';
  import Button from 'primevue/button';
  import { useOnline } from '~/composables/useOnline';
  import syncService from '~/services/sync.service';
  import { useLocale } from '~/composables/useLocale';

  const props = defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
  }>();

  const { t } = useLocale();
  const { isOnline } = useOnline();

  const isVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });

  const isSyncing = ref(false);
  const pendingCount = ref(0);
  const lastSyncTime = ref<number | null>(null);
  const syncResult = ref<{ success: number; failed: number } | null>(null);

  const updateData = async () => {
    pendingCount.value = await syncService.getPendingOperationsCount();
    lastSyncTime.value = await syncService.getLastSyncTime();
  };

  const handleSync = async () => {
    if (!isOnline.value || isSyncing.value) return;

    isSyncing.value = true;
    syncResult.value = null;

    try {
      const result = await syncService.syncPendingOperations();
      syncResult.value = result;
      await updateData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      isSyncing.value = false;
    }
  };

  const close = () => {
    if (!isSyncing.value) {
      isVisible.value = false;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('sync.justNow');
    if (minutes < 60) return t('sync.minutesAgo', { count: minutes });
    if (hours < 24) return t('sync.hoursAgo', { count: hours });
    return t('sync.daysAgo', { count: days });
  };

  watch(
    () => props.visible,
    async (newValue) => {
      if (newValue) {
        await updateData();
      }
    }
  );

  onMounted(async () => {
    await updateData();
  });
</script>
