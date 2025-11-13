<script setup lang="ts">
  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();
  
  const props = defineProps<{
    index: number;
    item: { terminology: string; define: string };
  }>();

  const emits = defineEmits<{
    (
      e: 'update',
      index: number,
      field: 'terminology' | 'define',
      value: string
    ): void;
    (e: 'remove', index: number): void;
  }>();

  const handleInput = (field: 'terminology' | 'define', value: string) => {
    emits('update', props.index, field, value);
  };

  const handleRemove = () => {
    emits('remove', props.index);
  };
</script>

<template>
  <div class="w-full px-5 pt-3 pb-6 lg:px-6 rounded-xl cus-box-shadow">
    <!-- Header Card -->
    <div class="flex items-center justify-between max-w-full">
      <span class="font-bold">{{ index + 1 }}</span>
      <Button
        icon="pi pi-trash"
        :aria-label="t('studyModule.deleteTooltip')"
        severity="secondary"
        v-tooltip.bottom="t('studyModule.deleteTooltip')"
        @click="handleRemove"
      />
    </div>

    <!-- Body Card -->
    <div class="flex items-center justify-between w-full gap-5 mt-4">
      <div class="w-full">
        <InputText
          type="text"
          class="w-full"
          :value="item.terminology"
          @input="
            handleInput(
              'terminology',
              ($event.target as HTMLInputElement).value
            )
          "
        />
        <label
          for="terminology"
          class="uppercase text-sm font-bold text-[#939bb4]"
          >{{ t('studyModule.terminology') }}</label
        >
      </div>

      <div class="w-full m-0">
        <InputText
          type="text"
          class="w-full"
          :value="item.define"
          @input="
            handleInput('define', ($event.target as HTMLInputElement).value)
          "
        />
        <label
          for="define"
          class="uppercase text-sm font-bold text-[#939bb4]"
          >{{ t('studyModule.definition') }}</label
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cus-box-shadow {
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  }
</style>
