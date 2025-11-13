<script setup lang="ts">
  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();
</script>

<template>
  <footer class="h-12 mt-[0px] flex items-center justify-center bg-[#ff9800]">
    <div class="text-sm font-normal text-white select">
      {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
      <span class="inline-block"> DDung203 </span>
    </div>
  </footer>
</template>
