<script setup lang="ts">
  import appRouter from '~/routes';

  const props = defineProps({
    urlPath: {
      type: String,
    },
  });

  const handleBackToHome = () => {
    props.urlPath ? appRouter.push(props.urlPath) : appRouter.push('/');
  };
</script>

<template>
  <div>
    <Button
      @click="handleBackToHome"
      severity="info"
      outlined
    >
      <i
        class="pi pi-arrow-left"
        style="font-size: 1rem"
      ></i>
      <span> Quay lại</span>
    </Button>
  </div>
</template>
