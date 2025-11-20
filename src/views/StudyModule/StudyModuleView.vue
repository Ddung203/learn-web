<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import ImportCardItem from './ImportCardItem.vue';
  import ImportPopup from './ImportPopup.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';
  import cardSetService from '~/services/cardset.service';

  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const isEditMode = ref(false);
  const editingCardSetId = ref<string | null>(null);

  const isLoading = ref(false);
  const isResendLoading = ref(false);
  const isShowPopup = ref(false);
  const autoGeneratePhonetics = ref(false);

  const formData = reactive({
    title: '',
    description: '',
    language: '',
    data: [{ terminology: '', define: '', example: '', image_url: '', part_of_speech: '', phonetic: '' }] as Array<{
      id?: string;
      terminology: string;
      define: string;
      example?: string;
      image_url?: string;
      part_of_speech?: string;
      phonetic?: string;
    }>,
  });

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Tiếng Việt', value: 'vi' },
    { label: '中文', value: 'zh' },
    { label: '日本語', value: 'ja' },
    { label: '한국어', value: 'ko' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
  ];

  // Thêm mới 1 thẻ
  const addItem = () => {
    formData.data.push({ terminology: '', define: '', example: '', image_url: '', part_of_speech: '', phonetic: '' });
  };
  const addItems = () => {
    isShowPopup.value = true;
  };

  // Handle imported cards from popup
  const handleImportCards = (
    cards: Array<{ 
      terminology: string; 
      define: string; 
      example?: string; 
      image_url?: string;
      part_of_speech?: string;
      phonetic?: string;
    }>
  ) => {
    formData.data.push(...cards.map(card => ({ 
      ...card, 
      example: card.example || '', 
      image_url: card.image_url || '', 
      part_of_speech: card.part_of_speech || '', 
      phonetic: card.phonetic || '' 
    })));
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
    field: 'terminology' | 'define' | 'example' | 'image_url' | 'part_of_speech' | 'phonetic',
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

  // Generate phonetics (called during update if checkbox is checked)
  const generatePhoneticsForCards = async () => {
    if (!editingCardSetId.value) return;

    try {
      const updatedCardSet = await cardSetService.generatePhonetics(editingCardSetId.value);
      
      // Update form data with generated phonetics
      formData.data = updatedCardSet.cards.map(card => ({
        id: card.id,
        terminology: card.terminology,
        define: card.define,
        example: card.example || '',
        image_url: card.image_url || '',
        part_of_speech: card.part_of_speech || '',
        phonetic: card.phonetic || '',
      }));

      return true;
    } catch (error) {
      console.error('Error generating phonetics:', error);
      return false;
    }
  };

  // Load card set for editing
  const loadCardSetForEdit = async () => {
    const cardSetId = route.params.id as string;
    if (!cardSetId) return;

    try {
      isLoading.value = true;
      editingCardSetId.value = cardSetId;
      isEditMode.value = true;

      const cardSet = await cardSetStore.fetchCardSet(cardSetId);
      
      // Populate form with existing data
      formData.title = cardSet.title;
      formData.description = cardSet.description;
      formData.language = cardSet.language || '';
      formData.data = cardSet.cards.map(card => ({
        id: card.id,
        terminology: card.terminology,
        define: card.define,
        example: card.example || '',
        image_url: card.image_url || '',
        part_of_speech: card.part_of_speech || '',
        phonetic: card.phonetic || '',
      }));
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('studyModule.toast.loadError'),
        life: 3000,
      });
      console.error('Error loading card set:', error);
      router.push('/card-sets');
    } finally {
      isLoading.value = false;
    }
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

      if (isEditMode.value && editingCardSetId.value) {
        // Update existing card set
        const updatedCardSet = await cardSetStore.updateCardSet(editingCardSetId.value, {
          title: formData.title,
          description: formData.description,
          language: formData.language,
          cards: validData.map(card => ({
            id: card.id || '',
            terminology: card.terminology,
            define: card.define,
            example: card.example,
            image_url: card.image_url,
            part_of_speech: card.part_of_speech,
            phonetic: card.phonetic,
          })),
        });

        // Auto-generate phonetics if checkbox is checked and language is English
        if (autoGeneratePhonetics.value && formData.language === 'en') {
          const phoneticSuccess = await generatePhoneticsForCards();
          if (phoneticSuccess) {
            toast.add({
              severity: 'success',
              summary: t('common.success'),
              detail: t('studyModule.toast.updateSuccess') + '. ' + t('studyModule.toast.generatePhoneticsSuccess'),
              life: 3000,
            });
          } else {
            toast.add({
              severity: 'success',
              summary: t('common.success'),
              detail: t('studyModule.toast.updateSuccess'),
              life: 3000,
            });
          }
        } else {
          toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('studyModule.toast.updateSuccess'),
            life: 3000,
          });
        }

        // Navigate to the updated card set
        setTimeout(() => {
          router.push(`/card-sets/${updatedCardSet.id}`);
        }, 1000);
      } else {
        // Create card set using store
        const newCardSet = await cardSetStore.addCardSet({
          title: formData.title,
          description: formData.description,
          language: formData.language,
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
        formData.language = '';
        formData.data = [];

        // Navigate to the new card set
        setTimeout(() => {
          router.push(`/card-sets/${newCardSet.id}`);
        }, 1000);
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: isEditMode.value ? t('studyModule.toast.updateError') : t('studyModule.toast.createError'),
        life: 3000,
      });
      console.error('Error saving study module:', error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    if (route.params.id) {
      loadCardSetForEdit();
    }
  });
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
          isEditMode ? t('studyModule.editTitle') : t('studyModule.title')
        }}</span>
        <Button
          :label="isEditMode ? t('studyModule.updateButton') : t('studyModule.createButton')"
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
      <div class="flex justify-between items-center gap-2 mt-8 lg:gap-4">
        <div class="flex gap-2 lg:gap-5 flex-wrap items-center">
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
          <Dropdown
            v-model="formData.language"
            :options="languageOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('studyModule.languagePlaceholder')"
            class="w-48"
          />
          <div v-if="isEditMode && formData.language === 'en'" class="flex items-center gap-2">
            <Checkbox 
              v-model="autoGeneratePhonetics" 
              inputId="autoGeneratePhonetics" 
              :binary="true"
            />
            <label for="autoGeneratePhonetics" class="text-sm cursor-pointer">
              {{ t('studyModule.autoGeneratePhonetics') }}
            </label>
          </div>
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
