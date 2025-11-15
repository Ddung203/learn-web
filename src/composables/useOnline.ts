import { ref, onMounted, onUnmounted } from 'vue';

export function useOnline() {
  const isOnline = ref(navigator.onLine);
  const wasOffline = ref(!navigator.onLine);

  const updateOnlineStatus = () => {
    const newStatus = navigator.onLine;
    const previousStatus = isOnline.value;
    
    isOnline.value = newStatus;
    
    // Track if we just came back online
    if (!previousStatus && newStatus) {
      wasOffline.value = true;
      // Trigger sync after coming back online
      window.dispatchEvent(new CustomEvent('online-status-changed', { 
        detail: { isOnline: true, wasOffline: true } 
      }));
    } else if (previousStatus && !newStatus) {
      window.dispatchEvent(new CustomEvent('online-status-changed', { 
        detail: { isOnline: false, wasOffline: false } 
      }));
    }
  };

  const resetWasOffline = () => {
    wasOffline.value = false;
  };

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return {
    isOnline,
    wasOffline,
    resetWasOffline,
  };
}
