<script setup lang="ts">
  import NavBar from './components/NavBar.vue';
</script>

<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <div>
    <NavBar />
    <router-view />
  </div>
</template>
