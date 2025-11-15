<script setup lang="ts">
  import NavBar from './components/NavBar.vue';
  import { useTokenRefresh } from './composables/useTokenRefresh';

  // Setup proactive token refresh
  useTokenRefresh();
</script>

<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <div>
    <NavBar />
    <router-view />
  </div>
</template>
