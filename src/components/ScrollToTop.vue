<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  const isVisible = ref(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      isVisible.value = true;
    } else {
      isVisible.value = false;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  onMounted(() => {
    window.addEventListener('scroll', toggleVisibility);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', toggleVisibility);
  });
</script>

<template>
  <Button
    v-if="isVisible"
    @click="scrollToTop"
    class="z-50 scroll-to-top"
    icon="pi pi-angle-up"
    rounded
  />
</template>

<style scoped>
  .scroll-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s;
  }
</style>
