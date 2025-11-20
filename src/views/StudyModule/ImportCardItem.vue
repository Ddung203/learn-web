<script setup lang="ts">
  import { ref } from 'vue';
  import ImageSearchPopup from '~/components/ImageSearchPopup.vue';
  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();

  const props = defineProps<{
    index: number;
    item: {
      terminology: string;
      define: string;
      example?: string;
      image_url?: string;
      part_of_speech?: string;
      phonetic?: string;
    };
  }>();

  const emits = defineEmits<{
    (
      e: 'update',
      index: number,
      field:
        | 'terminology'
        | 'define'
        | 'example'
        | 'image_url'
        | 'part_of_speech'
        | 'phonetic',
      value: string
    ): void;
    (e: 'remove', index: number): void;
  }>();

  const showImageSearch = ref(false);

  const handleInput = (
    field:
      | 'terminology'
      | 'define'
      | 'example'
      | 'image_url'
      | 'part_of_speech'
      | 'phonetic',
    value: string
  ) => {
    emits('update', props.index, field, value);
  };

  const handleRemove = () => {
    emits('remove', props.index);
  };

  const openImageSearch = () => {
    showImageSearch.value = true;
  };

  const handleImageSelect = (imageUrl: string) => {
    emits('update', props.index, 'image_url', imageUrl);
  };

  const removeImage = () => {
    emits('update', props.index, 'image_url', '');
  };
</script>

<template>
  <div class="w-full px-5 pt-3 pb-6 lg:px-6 rounded-xl cus-box-shadow">
    <ImageSearchPopup
      :visible="showImageSearch"
      @update:visible="showImageSearch = $event"
      @select="handleImageSelect"
      :search-term="item.terminology"
    />

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
    <div class="flex flex-col w-full gap-4 mt-4">
      <div class="flex gap-5">
        <div class="w-full">
          <InputText
            type="text"
            class="w-full"
            :value="item.terminology"
            maxlength="500"
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
            maxlength="2000"
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

      <!-- Example Field -->
      <div class="w-full">
        <InputText
          type="text"
          class="w-full"
          :value="item.example"
          maxlength="1000"
          @input="
            handleInput('example', ($event.target as HTMLInputElement).value)
          "
          :placeholder="t('studyModule.examplePlaceholder')"
        />
        <label
          for="example"
          class="uppercase text-sm font-bold text-[#939bb4]"
          >{{ t('studyModule.example') }} ({{
            t('studyModule.optional')
          }})</label
        >
      </div>

      <!-- Part of Speech and Phonetic Fields -->
      <div class="flex gap-5">
        <div class="w-full">
          <InputText
            type="text"
            class="w-full"
            :value="item.part_of_speech"
            @input="
              handleInput(
                'part_of_speech',
                ($event.target as HTMLInputElement).value
              )
            "
            :placeholder="t('studyModule.partOfSpeechPlaceholder')"
          />
          <label
            for="part_of_speech"
            class="uppercase text-sm font-bold text-[#939bb4]"
            >{{ t('studyModule.partOfSpeech') }} ({{
              t('studyModule.optional')
            }})</label
          >
        </div>

        <div class="w-full">
          <InputText
            type="text"
            class="w-full"
            :value="item.phonetic"
            maxlength="100"
            @input="
              handleInput('phonetic', ($event.target as HTMLInputElement).value)
            "
            :placeholder="t('studyModule.phoneticPlaceholder')"
          />
          <label
            for="phonetic"
            class="uppercase text-sm font-bold text-[#939bb4]"
            >{{ t('studyModule.phonetic') }} ({{
              t('studyModule.optional')
            }})</label
          >
        </div>
      </div>

      <!-- Image Section -->
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-image"
          label="Add Image"
          severity="info"
          size="small"
          @click="openImageSearch"
        />

        <div
          v-if="item.image_url"
          class="relative inline-block"
        >
          <img
            :src="item.image_url"
            alt="Card image"
            class="h-20 border-2 border-gray-200 rounded-lg"
          />
          <Button
            icon="pi pi-times"
            severity="danger"
            size="small"
            rounded
            class="absolute -top-2 -right-2"
            @click="removeImage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cus-box-shadow {
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  }
</style>
