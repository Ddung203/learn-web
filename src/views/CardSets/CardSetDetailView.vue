<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet, StudyMode } from '~/interfaces';
  import HeaderThird from '~/components/HeaderThird.vue';
  import ExportImportDialog from '~/components/ExportImportDialog.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const cardSet = ref<ICardSet | null>(null);
  const showExportImportDialog = ref(false);
  const dialogMode = ref<'export' | 'import' | 'share'>('export');

  const studyModes = computed(() => [
    {
      id: 'flashcards' as StudyMode,
      label: t('studyModes.flashcards.title'),
      icon: 'pi-clone',
      description: t('studyModes.flashcards.description'),
      color: '#3b82f6', // blue
    },
    {
      id: 'test' as StudyMode,
      label: t('studyModes.test.title'),
      icon: 'pi-check-square',
      description: t('studyModes.test.description'),
      color: '#10b981', // green
    },
    {
      id: 'write' as StudyMode,
      label: t('studyModes.write.title'),
      icon: 'pi-pencil',
      description: t('studyModes.write.description'),
      color: '#a855f7', // purple
    },
    {
      id: 'learn' as StudyMode,
      label: t('studyModes.learn.title'),
      icon: 'pi-star',
      description: t('studyModes.learn.description'),
      color: '#f59e0b', // amber
    },
    {
      id: 'listen' as StudyMode,
      label: t('studyModes.listen.title'),
      icon: 'pi-volume-up',
      description: t('studyModes.listen.description'),
      color: '#6366f1', // indigo
    },
  ]);

  const loadCardSet = () => {
    const cardSetId = route.params.id as string;
    if (!cardSetId) {
      router.push('/card-sets');
      return;
    }

    const foundCardSet = cardSetStore.getCardSetById(cardSetId);
    
    if (!foundCardSet) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.notFound'),
        life: 3000,
      });
      router.push('/card-sets');
      return;
    }
    
    cardSet.value = foundCardSet;
  };

  const startStudyMode = (mode: StudyMode) => {
    router.push(`/card-sets/${route.params.id}/${mode}`);
  };

  const openExportDialog = () => {
    dialogMode.value = 'export';
    showExportImportDialog.value = true;
  };

  const openShareDialog = () => {
    dialogMode.value = 'share';
    showExportImportDialog.value = true;
  };

  onMounted(() => {
    loadCardSet();
  });
</script>

<template>
  <HeaderThird />

  <div v-if="cardSet" class="flex flex-col items-center max-w-full min-h-svh">
    <div class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <Button
          icon="pi pi-arrow-left"
          :label="t('common.backToHome')"
          severity="secondary"
          class="mb-4"
          @click="router.push('/card-sets')"
        />
        <div class="flex items-start justify-between gap-4 mb-2">
          <h1 class="text-3xl font-bold">{{ cardSet.title }}</h1>
          <div class="flex gap-2">
            <Button
              icon="pi pi-share-alt"
              :label="t('cardSets.share')"
              severity="info"
              outlined
              @click="openShareDialog"
            />
            <Button
              icon="pi pi-download"
              :label="t('cardSets.export')"
              severity="secondary"
              outlined
              @click="openExportDialog"
            />
          </div>
        </div>
        <p v-if="cardSet.description" class="text-gray-600">
          {{ cardSet.description }}
        </p>
        <div class="mt-2 text-sm text-gray-500">
          <i class="pi pi-clone mr-1"></i>
          {{ cardSet.cards.length }} {{ t('cardSets.cards') }}
        </div>
      </div>

      <!-- Study Mode Selector -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          v-for="mode in studyModes"
          :key="mode.id"
          class="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          @click="startStudyMode(mode.id)"
        >
          <template #content>
            <div class="flex flex-col items-center text-center py-4">
              <i :class="`pi ${mode.icon} text-5xl mb-4`" :style="{ color: mode.color }"></i>
              <h3 class="mb-2 text-lg font-semibold">{{ mode.label }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ mode.description }}</p>
              <Button
                :label="t('cardSets.startStudy')"
                size="small"
                class="w-full"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <ExportImportDialog
    v-model:visible="showExportImportDialog"
    :card-set-id="cardSet?.id"
    :mode="dialogMode"
  />
</template>
