<script setup lang="ts">
  import { useLocale } from '~/composables/useLocale';

  const { currentLocale, toggleLocale } = useLocale();
</script>

<template>
  <Button
    :label="currentLocale.toUpperCase()"
    outlined
    @click="toggleLocale"
    severity="secondary"
    class="font-bold"
  >
    <template #icon>
      <i class="pi pi-globe mr-2"></i>
    </template>
  </Button>
</template>
