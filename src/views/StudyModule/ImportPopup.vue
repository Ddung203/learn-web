<script setup lang="ts">
  import { ref, computed } from 'vue';
  import ImportCardItem from './ImportCardItem.vue';
  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();

  const props = defineProps<{
    visible: boolean;
  }>();
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (
      e: 'import',
      cards: Array<{
        terminology: string;
        define: string;
        example?: string;
        image_url?: string;
        part_of_speech?: string;
        phonetic?: string;
      }>
    ): void;
  }>();

  const inputData = ref('');
  const delimiter = ref(',');
  const customDelimiter = ref('');
  const parsedCards = ref<
    Array<{
      terminology: string;
      define: string;
      example?: string;
      image_url?: string;
      part_of_speech?: string;
      phonetic?: string;
    }>
  >([]);

  const parseInputData = () => {
    if (!inputData.value.trim()) {
      parsedCards.value = [];
      return;
    }

    const activeDelimiter =
      delimiter.value === 'custom-delimiter'
        ? customDelimiter.value
        : delimiter.value;
    if (!activeDelimiter) {
      parsedCards.value = [];
      return;
    }

    const lines = inputData.value.split('\n').filter((line) => line.trim());
    parsedCards.value = lines
      .map((line) => {
        const parts = line.split(activeDelimiter).map((part) => part.trim());
        const terminology = parts[0] || '';
        const define = parts[1] || '';
        const example = parts[2] || '';
        const part_of_speech = parts[3] || '';
        const phonetic = parts[4] || '';

        return {
          terminology,
          define,
          example,
          image_url: '',
          part_of_speech,
          phonetic,
        };
      })
      .filter((card) => card.terminology && card.define);
  };

  const cardCount = computed(() => parsedCards.value.length);

  // Update card data
  const updateCard = (
    index: number,
    field:
      | 'terminology'
      | 'define'
      | 'example'
      | 'image_url'
      | 'part_of_speech'
      | 'phonetic',
    value: string
  ) => {
    if (parsedCards.value[index]) {
      parsedCards.value[index][field] = value;
    }
  };

  // Remove card
  const removeCard = (index: number) => {
    parsedCards.value.splice(index, 1);
  };

  const closePopup = () => {
    inputData.value = '';
    delimiter.value = ',';
    customDelimiter.value = '';
    parsedCards.value = [];
    emit('update:visible', false);
  };

  const handleSave = () => {
    if (parsedCards.value.length > 0) {
      emit('import', parsedCards.value);
      closePopup();
    }
  };
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    :header="t('importPopup.title')"
    :style="{ width: '90rem' }"
    position="top"
    :modal="true"
    :draggable="false"
  >
    <span class="block mb-5 p-text-secondary">{{
      t('importPopup.instruction')
    }}</span>

    <!-- Delimiter Selection -->
    <div class="flex gap-3 mb-3 align-items-center">
      <label class="font-semibold">{{ t('importPopup.delimiter') }}:</label>
      <div class="flex gap-2 align-items-center">
        <Button
          :label="t('importPopup.comma')"
          :severity="delimiter === ',' ? 'primary' : 'secondary'"
          size="small"
          @click="
            delimiter = ',';
            parseInputData();
          "
        />
        <Button
          :label="t('importPopup.semicolon')"
          :severity="delimiter === ';' ? 'primary' : 'secondary'"
          size="small"
          @click="
            delimiter = ';';
            parseInputData();
          "
        />
        <Button
          :label="t('importPopup.customDelimiter')"
          :severity="delimiter === 'custom-delimiter' ? 'primary' : 'secondary'"
          size="small"
          @click="delimiter = 'custom-delimiter'"
        />
        <InputText
          v-if="delimiter === 'custom-delimiter'"
          v-model="customDelimiter"
          class="w-32"
          @input="parseInputData"
        />
      </div>
    </div>

    <div class="flex gap-3 mb-3 align-items-center">
      <Textarea
        v-model="inputData"
        id="username"
        rows="7"
        class="w-full"
        :placeholder="t('importPopup.placeholderWithExample')"
        @input="parseInputData"
      />
    </div>

    <!-- Preview -->
    <div class="mb-5">
      <span class="mb-3 text-xl font-bold"
        >{{ t('importPopup.preview') }}
        <span class="mb-3 text-base font-medium"
          >{{ cardCount }} {{ t('studyModule.cards') }}</span
        ></span
      >

      <div
        v-if="parsedCards.length === 0"
        class="py-3 border-1 border-solid border-gray-300 min-h-[8rem]"
      >
        {{ t('importPopup.noContent') }}
      </div>

      <div
        v-else
        class="py-3 border-1 border-solid border-gray-300 min-h-[8rem] flex flex-col gap-3"
      >
        <ImportCardItem
          v-for="(card, index) in parsedCards"
          :key="index"
          :index="index"
          :item="card"
          @update="updateCard"
          @remove="removeCard"
        />
      </div>
    </div>

    <!-- Button -->
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        :label="t('importPopup.cancel')"
        severity="secondary"
        @click="closePopup"
      ></Button>
      <Button
        type="button"
        :label="t('importPopup.import')"
        :disabled="parsedCards.length === 0"
        @click="handleSave"
      ></Button>
    </div>
  </Dialog>
</template>

<style scoped></style>
