<template>
  <Transition name="slide-down">
    <div v-if="showIndicator" :class="indicatorClass" class="offline-indicator">
      <i :class="iconClass"></i>
      <span class="message">{{ message }}</span>
      <Button
        v-if="showSyncButton"
        text
        rounded
        size="small"
        :loading="isSyncing"
        @click="handleSync"
        class="ml-2"
      >
        <i class="pi pi-refresh" v-if="!isSyncing"></i>
      </Button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useOnline } from '~/composables/useOnline';
  import syncService from '~/services/sync.service';
  import Button from 'primevue/button';

  const { isOnline, wasOffline } = useOnline();
  const pendingCount = ref(0);
  const isSyncing = ref(false);
  const showTemporaryMessage = ref(false);

  const showIndicator = computed(() => {
    return !isOnline.value || showTemporaryMessage.value || pendingCount.value > 0;
  });

  const indicatorClass = computed(() => {
    if (!isOnline.value) {
      return 'bg-orange-500 text-white';
    }
    if (isSyncing.value) {
      return 'bg-blue-500 text-white';
    }
    if (pendingCount.value > 0) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-green-500 text-white';
  });

  const iconClass = computed(() => {
    if (!isOnline.value) return 'pi pi-wifi text-lg';
    if (isSyncing.value) return 'pi pi-spin pi-spinner text-lg';
    if (pendingCount.value > 0) return 'pi pi-cloud-upload text-lg';
    return 'pi pi-check text-lg';
  });

  const message = computed(() => {
    if (!isOnline.value) {
      return pendingCount.value > 0
        ? `Offline - ${pendingCount.value} changes pending`
        : 'You are offline';
    }
    if (isSyncing.value) {
      return 'Syncing changes...';
    }
    if (pendingCount.value > 0) {
      return `${pendingCount.value} changes waiting to sync`;
    }
    return 'All changes synced';
  });

  const showSyncButton = computed(() => {
    return isOnline.value && pendingCount.value > 0 && !isSyncing.value;
  });

  const updatePendingCount = async () => {
    try {
      pendingCount.value = await syncService.getPendingOperationsCount();
    } catch (error) {
      console.error('Failed to get pending operations count:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline.value || isSyncing.value) return;

    isSyncing.value = true;
    try {
      const result = await syncService.syncPendingOperations();
      if (result.success > 0) {
        showTemporaryMessage.value = true;
        setTimeout(() => {
          showTemporaryMessage.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      isSyncing.value = false;
      await updatePendingCount();
    }
  };

  let intervalId: number | null = null;

  onMounted(async () => {
    await updatePendingCount();

    // Update pending count every 10 seconds
    intervalId = window.setInterval(updatePendingCount, 10000);

    // Listen for online status changes
    window.addEventListener('online-status-changed', handleOnlineStatusChange);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    window.removeEventListener('online-status-changed', handleOnlineStatusChange);
  });

  const handleOnlineStatusChange = async (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail.isOnline && customEvent.detail.wasOffline) {
      // Auto-sync when coming back online
      await handleSync();
    }
    await updatePendingCount();
  };

  watch(isOnline, async (newValue) => {
    if (newValue) {
      // Just came back online
      await updatePendingCount();
    }
  });
</script>

<style scoped>
  .offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .message {
    flex: 0 1 auto;
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }

  .slide-down-enter-to,
  .slide-down-leave-from {
    transform: translateY(0);
    opacity: 1;
  }
</style>
