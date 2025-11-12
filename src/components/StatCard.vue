<script setup lang="ts">
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  });
</script>

<template>
  <div class="flex border border-[#ccc] rounded-xl bg-[#fff]">
    <div class="flex items-center justify-center w-1/6 py-5">
      <i class="text-2xl text-[#ff9700] pi pi-info-circle" />
    </div>
    <div class="flex flex-col items-start justify-center w-5/6 gap-3 py-5 pr-5">
      <div>
        <span class="text-lg text-[#ff9700] font-semibold">{{
          props.title
        }}</span>
      </div>
      <div class="grid w-full grid-cols-2">
        <div>
          <span class="text-base">{{ props.count }}</span>
        </div>
        <div class="flex items-center justify-end text-green-500">
          <!-- <i class="pi pi-angle-up" /> -->
          <!-- <span> 15%</span> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /*  */
</style>
