<!-- <script setup lang="ts">
  import { ref, watch } from 'vue';
  import debounce from 'lodash/debounce';
  import PropTypes from 'vue-types';

  const props = defineProps({
    modelValue: PropTypes.string.def(''),
    placeholder: PropTypes.string.def('Search...'),
  });

  const emit = defineEmits(['update:modelValue']);

  const searchValue = ref(props.modelValue);

  const debouncedSearch = debounce((newVal) => {
    emit('update:modelValue', newVal);
  }, 400);

  watch(
    () => props.modelValue,
    (newValue) => {
      searchValue.value = newValue;
    }
  );
</script>

<template>
  <div class="flex justify-end mt-2 pb-2 border-b border-[#ccc]">
    <IconField iconPosition="left">
      <InputIcon>
        <i class="pi pi-search" />
      </InputIcon>
      <InputText
        v-model="searchValue"
        @input="debouncedSearch($event.target.value)"
        :placeholder="placeholder"
      />
    </IconField>
  </div>
</template>

<style scoped>
  /*  */
</style> -->
