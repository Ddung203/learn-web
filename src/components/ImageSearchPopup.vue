<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { imageService, type IPixabayImage } from '~/services';
  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();
  const toast = useToast();

  const props = defineProps<{
    visible: boolean;
    searchTerm?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'select', imageUrl: string): void;
  }>();

  const searchQuery = ref('');
  const images = ref<IPixabayImage[]>([]);
  const isLoading = ref(false);
  const selectedImageUrl = ref('');

  // Watch for visibility and searchTerm changes
  watch(
    () => props.visible,
    (visible) => {
      if (visible && props.searchTerm) {
        searchQuery.value = props.searchTerm;
        handleSearch();
      }
    }
  );

  const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: 'Please enter a search term',
        life: 3000,
      });
      return;
    }

    try {
      isLoading.value = true;
      const response = await imageService.searchImages(searchQuery.value, 12);
      images.value = response.hits;

      if (images.value.length === 0) {
        toast.add({
          severity: 'info',
          summary: t('common.info'),
          detail: 'No images found',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: 'Failed to search images',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const selectImage = (imageUrl: string) => {
    selectedImageUrl.value = imageUrl;
  };

  const handleConfirm = () => {
    if (selectedImageUrl.value) {
      emit('select', selectedImageUrl.value);
      closePopup();
    } else {
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: 'Please select an image',
        life: 3000,
      });
    }
  };

  const closePopup = () => {
    searchQuery.value = '';
    images.value = [];
    selectedImageUrl.value = '';
    emit('update:visible', false);
  };
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    header="Search Image"
    :style="{ width: '70rem' }"
    position="top"
    :modal="true"
    :draggable="false"
  >
    <div class="flex flex-col gap-4">
      <!-- Search Bar -->
      <div class="flex gap-2">
        <InputText
          v-model="searchQuery"
          class="flex-1"
          placeholder="Enter search term (e.g., 'cat', 'mountain', 'book')"
          @keypress.enter="handleSearch"
        />
        <Button
          icon="pi pi-search"
          label="Search"
          @click="handleSearch"
          :loading="isLoading"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8"
      >
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="4"
        />
      </div>

      <!-- Images Grid -->
      <div
        v-else-if="images.length > 0"
        class="grid grid-cols-4 gap-4 max-h-[32rem] overflow-y-auto"
      >
        <div
          v-for="image in images"
          :key="image.id"
          :class="[
            'relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105',
            selectedImageUrl === image.largeImageURL
              ? 'border-blue-500 ring-2 ring-blue-300'
              : 'border-gray-200 hover:border-gray-300',
          ]"
          @click="selectImage(image.largeImageURL)"
        >
          <img
            :src="image.previewURL"
            :alt="image.tags"
            class="object-cover w-full h-40"
          />
          <div
            v-if="selectedImageUrl === image.largeImageURL"
            class="absolute p-1 text-white bg-blue-500 rounded-full top-2 right-2"
          >
            <i class="text-xs pi pi-check"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!isLoading"
        class="flex flex-col items-center justify-center py-12 text-center text-gray-500"
      >
        <i
          class="mb-4 pi pi-image"
          style="font-size: 3rem"
        ></i>
        <p class="text-lg font-medium">Search for images</p>
        <p class="text-sm">Enter a search term above to find images</p>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          @click="closePopup"
        />
        <Button
          label="Select Image"
          :disabled="!selectedImageUrl"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>
