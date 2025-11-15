<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import ImportCardItem from './ImportCardItem.vue';
  import ImportPopup from './ImportPopup.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const isLoading = ref(false);
  const isResendLoading = ref(false);
  const isShowPopup = ref(false);

  const formData = reactive({
    title: '',
    description: '',
    data: [{ terminology: '', define: '', image_url: '' }] as Array<{
      terminology: string;
      define: string;
      image_url?: string;
    }>,
  });

  // Thêm mới 1 thẻ
  const addItem = () => {
    formData.data.push({ terminology: '', define: '', image_url: '' });
  };
  const addItems = () => {
    isShowPopup.value = true;
  };

  // Handle imported cards from popup
  const handleImportCards = (
    cards: Array<{ terminology: string; define: string; image_url?: string }>
  ) => {
    formData.data.push(...cards.map(card => ({ ...card, image_url: card.image_url || '' })));
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('studyModule.toast.importSuccess', { count: cards.length }),
      life: 3000,
    });
  };

  // Cập nhật dữ liệu của 1 thẻ
  const updateItem = (
    index: number,
    field: 'terminology' | 'define' | 'image_url',
    value: string
  ) => {
    formData.data[index][field] = value;
  };

  // Xóa 1 thẻ
  const removeItem = (index: number) => {
    formData.data.splice(index, 1);
  };

  // Xóa tất cả
  const clearAll = () => {
    formData.data = [];
  };

  // Save study module
  const saveStudyModule = async () => {
    if (!formData.title.trim()) {
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: t('studyModule.toast.titleRequired'),
        life: 3000,
      });
      return;
    }

    // Lọc bỏ các thẻ rỗng
    const validData = formData.data.filter(
      (item) => item.terminology.trim() !== '' && item.define.trim() !== ''
    );

    if (validData.length < 4) {
      toast.add({
        severity: 'warn',
        summary: t('common.warning'),
        detail: t('studyModule.toast.atLeastOneCard'),
        life: 3000,
      });
      return;
    }

    try {
      isLoading.value = true;

      // Create card set using store
      const newCardSet = await cardSetStore.addCardSet({
        title: formData.title,
        description: formData.description,
        cards: validData,
      });

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('studyModule.toast.createSuccess'),
        life: 3000,
      });

      // Reset form
      formData.title = '';
      formData.description = '';
      formData.data = [];

      // Navigate to the new card set
      setTimeout(() => {
        router.push(`/card-sets/${newCardSet.id}`);
      }, 1000);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('studyModule.toast.createError'),
        life: 3000,
      });
      console.error('Error creating study module:', error);
    } finally {
      isLoading.value = false;
    }
  };
</script>

<template>
  <HeaderThird />
  <ScrollToTop />
  <Loading v-if="isLoading || isResendLoading" />

  <ImportPopup
    :visible="isShowPopup"
    @update:visible="isShowPopup = $event"
    @import="handleImportCards"
  />

  <div class="flex flex-col items-center max-w-full min-h-svh">
    <div
      class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-7xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between bg-white form-header">
        <span class="text-xl font-bold lg:text-3xl">{{
          t('studyModule.title')
        }}</span>
        <Button
          :label="t('studyModule.createButton')"
          @click="saveStudyModule"
          :disabled="isLoading"
        />
      </div>

      <!-- Form -->
      <div class="flex flex-col mt-8 space-y-6 bg-white lg:px-0 form-body">
        <InputText
          v-model="formData.title"
          class="w-full py-4"
          :placeholder="t('studyModule.titlePlaceholder')"
          maxlength="254"
        />
        <InputText
          v-model="formData.description"
          maxlength="500"
          class="w-full py-4"
          :placeholder="t('studyModule.descriptionPlaceholder')"
        />
      </div>

      <!-- Import Buttons -->
      <div class="flex justify-between gap-2 mt-8 lg:gap-0">
        <div class="flex gap-2 lg:gap-5">
          <Button
            icon="pi pi-plus"
            severity="success"
            :label="t('studyModule.addCard')"
            @click="addItem"
          />
          <Button
            icon="pi pi-th-large"
            severity="secondary"
            :label="t('studyModule.importMany')"
            @click="addItems"
          />
        </div>
        <Button
          icon="pi pi-trash"
          :aria-label="t('studyModule.deleteAllTooltip')"
          severity="secondary"
          v-tooltip.bottom="t('studyModule.deleteAllTooltip')"
          @click="clearAll"
        />
      </div>

      <!-- List Items -->
      <div class="flex flex-col items-center max-w-full mt-8 lg:w-full gap-9">
        <ImportCardItem
          v-for="(item, index) in formData.data"
          :key="index"
          :index="index"
          :item="item"
          @update="updateItem"
          @remove="removeItem"
        />
      </div>
    </div>
  </div>
</template>
