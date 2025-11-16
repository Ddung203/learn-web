<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import NavBar from './components/NavBar.vue';
  import { useTokenRefresh } from './composables/useTokenRefresh';
  import { useAuthStore } from './stores';

  const router = useRouter();
  const authStore = useAuthStore();

  // Setup proactive token refresh
  useTokenRefresh();

  // Handle authentication failures globally
  const handleAuthFailure = () => {
    // Clear the user state
    authStore.user = null;

    // Redirect to login if not already there
    if (router.currentRoute.value.path !== '/login') {
      router.push({ name: 'login' });
    }
  };

  onMounted(() => {
    window.addEventListener('auth:failed', handleAuthFailure);
  });

  onUnmounted(() => {
    window.removeEventListener('auth:failed', handleAuthFailure);
  });
</script>

<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <div>
    <NavBar />
    <router-view />
  </div>
</template>
