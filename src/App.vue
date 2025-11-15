<script setup lang="ts">
  import NavBar from './components/NavBar.vue';
  import OfflineIndicator from './components/OfflineIndicator.vue';
  import { useTokenRefresh } from './composables/useTokenRefresh';

  // Setup proactive token refresh
  useTokenRefresh();
</script>

<template>
  <OfflineIndicator />
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <div>
    <NavBar />
    <router-view />
  </div>
</template>
