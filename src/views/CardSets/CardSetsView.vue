<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import ExportImportDialog from '~/components/ExportImportDialog.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  const router = useRouter();
  const toast = useToast();
  const { t, isVietnamese } = useLocale();
  const cardSetStore = useCardSetStore();

  const showExportImportDialog = ref(false);
  const dialogMode = ref<'export' | 'import' | 'share'>('import');
  const selectedCardSetId = ref<string | undefined>(undefined);
  const showDeleteDialog = ref(false);
  const cardSetToDelete = ref<{ id: string; title: string } | null>(null);

  const cardSets = computed(() => cardSetStore.getAllCardSets);

  const loadCardSets = async () => {
    try {
      await cardSetStore.fetchCardSets();
    } catch (error) {
      console.error('Failed to load card sets:', error);
    }
  };

  const goToCardSetDetail = (cardSetId: string) => {
    router.push(`/card-sets/${cardSetId}`);
  };

  const createNewCardSet = () => {
    router.push('/study-module');
  };

  const confirmDeleteCardSet = (cardSetId: string, cardSetTitle: string, event: Event) => {
    event.stopPropagation();
    cardSetToDelete.value = { id: cardSetId, title: cardSetTitle };
    showDeleteDialog.value = true;
  };

  const deleteCardSet = async () => {
    if (!cardSetToDelete.value) return;

    try {
      await cardSetStore.deleteCardSet(cardSetToDelete.value.id);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('cardSets.toast.deleteSuccess'),
        life: 3000,
      });
      showDeleteDialog.value = false;
      cardSetToDelete.value = null;
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.deleteError'),
        life: 3000,
      });
    }
  };

  const cancelDelete = () => {
    showDeleteDialog.value = false;
    cardSetToDelete.value = null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locate = isVietnamese.value ? 'vi-VN' : 'en-US';

    return date.toLocaleDateString(locate, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openImportDialog = () => {
    dialogMode.value = 'import';
    selectedCardSetId.value = undefined;
    showExportImportDialog.value = true;
  };

  const openExportDialog = (cardSetId: string, event: Event) => {
    event.stopPropagation();
    dialogMode.value = 'export';
    selectedCardSetId.value = cardSetId;
    showExportImportDialog.value = true;
  };

  const openShareDialog = (cardSetId: string, event: Event) => {
    event.stopPropagation();
    dialogMode.value = 'share';
    selectedCardSetId.value = cardSetId;
    showExportImportDialog.value = true;
  };

  onMounted(() => {
    loadCardSets();
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full min-h-svh">
    <div
      class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-7xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">{{ t('cardSets.title') }}</h1>
        <div class="flex gap-2">
          <Button
            icon="pi pi-upload"
            :label="t('cardSets.import')"
            severity="secondary"
            @click="openImportDialog"
          />
          <Button
            icon="pi pi-plus"
            :label="t('cardSets.createNew')"
            @click="createNewCardSet"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="cardSets.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <i
          class="mb-4 pi pi-inbox"
          style="font-size: 4rem; color: #94a3b8"
        ></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('cardSets.empty.title') }}
        </h2>
        <p class="mb-6 text-gray-500">{{ t('cardSets.empty.description') }}</p>
        <Button
          icon="pi pi-plus"
          :label="t('cardSets.createNew')"
          @click="createNewCardSet"
        />
      </div>

      <!-- Card Sets Grid -->
      <div
        v-else
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <Card
          v-for="cardSet in cardSets"
          :key="cardSet.id"
          class="transition-shadow cursor-pointer hover:shadow-lg"
          @click="goToCardSetDetail(cardSet.id)"
        >
          <template #title>
            <div class="text-lg font-semibold">{{ cardSet.title }}</div>
          </template>
          <template #content>
            <p class="mb-4 text-sm text-gray-600 line-clamp-2">
              {{ cardSet.description || t('cardSets.noDescription') }}
            </p>
            <div
              class="flex items-center justify-between text-sm text-gray-500"
            >
              <span>
                <i class="mr-1 pi pi-clone"></i>
                {{ cardSet.cards.length }} {{ t('cardSets.cards') }}
              </span>
              <span>{{ formatDate(cardSet.updated_at) }}</span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2">
              <Button
                icon="pi pi-book"
                :label="t('cardSets.study')"
                severity="secondary"
                size="small"
                class="flex-1"
                @click.stop="goToCardSetDetail(cardSet.id)"
              />
              <Button
                icon="pi pi-share-alt"
                severity="info"
                size="small"
                outlined
                v-tooltip.top="t('cardSets.share')"
                @click="openShareDialog(cardSet.id, $event)"
              />
              <Button
                icon="pi pi-download"
                severity="secondary"
                size="small"
                outlined
                v-tooltip.top="t('cardSets.export')"
                @click="openExportDialog(cardSet.id, $event)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                outlined
                v-tooltip.top="t('common.delete')"
                @click="confirmDeleteCardSet(cardSet.id, cardSet.title, $event)"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <ExportImportDialog
    v-model:visible="showExportImportDialog"
    :card-set-id="selectedCardSetId"
    :mode="dialogMode"
  />

  <Dialog
    v-model:visible="showDeleteDialog"
    :header="t('common.confirmation')"
    :modal="true"
    :style="{ width: '450px' }"
    :breakpoints="{ '575px': '90vw' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-orange-500"></i>
        <div class="flex-1">
          <p class="mb-2 text-gray-800">{{ t('cardSets.confirmDelete') }}</p>
          <p v-if="cardSetToDelete" class="font-semibold text-gray-900">
            "{{ cardSetToDelete.title }}"
          </p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          @click="cancelDelete"
        />
        <Button
          :label="t('common.delete')"
          icon="pi pi-trash"
          severity="danger"
          @click="deleteCardSet"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    /* -webkit-line-clamp: 2; */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
