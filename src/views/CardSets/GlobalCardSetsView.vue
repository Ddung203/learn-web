<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import { useCardSetStore } from '~/stores';
  import { useLocale } from '~/composables/useLocale';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import type { ICardSet } from '~/interfaces';

  const { t } = useLocale();
  const toast = useToast();
  const cardSetStore = useCardSetStore();

  const searchQuery = ref('');
  const importing = ref<string | null>(null);
  const showPreviewDialog = ref(false);
  const previewCardSet = ref<ICardSet | null>(null);

  const filteredCardSets = computed(() => {
    if (!searchQuery.value) {
      return cardSetStore.globalCardSets;
    }
    const query = searchQuery.value.toLowerCase();
    return cardSetStore.globalCardSets.filter(
      (cs) =>
        cs.title.toLowerCase().includes(query) ||
        cs.description?.toLowerCase().includes(query)
    );
  });

  const handleImport = async (cardSet: ICardSet) => {
    importing.value = cardSet.id;
    try {
      await cardSetStore.importFromGlobal(cardSet.id);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('globalCardSets.toast.importSuccess'),
        life: 3000,
      });
      showPreviewDialog.value = false;
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('globalCardSets.toast.importError'),
        life: 3000,
      });
    } finally {
      importing.value = null;
    }
  };

  const openPreview = (cardSet: ICardSet, event: Event) => {
    event.stopPropagation();
    previewCardSet.value = cardSet;
    showPreviewDialog.value = true;
  };

  onMounted(async () => {
    try {
      await cardSetStore.fetchGlobalCardSets();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('globalCardSets.toast.loadError'),
        life: 3000,
      });
    }
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full min-h-svh">
    <div class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-7xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ t('globalCardSets.title') }}</h1>
        <p class="text-surface-600 dark:text-surface-400">
          {{ t('globalCardSets.subtitle') }}
        </p>
      </div>

      <div class="mb-6">
        <InputText
          v-model="searchQuery"
          :placeholder="t('globalCardSets.searchPlaceholder')"
          class="w-full"
        />
      </div>

      <div v-if="cardSetStore.loading" class="flex justify-center py-8">
        <ProgressSpinner />
      </div>

      <div
        v-else-if="filteredCardSets.length === 0"
        class="text-center py-12"
      >
        <i class="pi pi-inbox text-6xl text-surface-300 dark:text-surface-600 mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2">
          {{ t('globalCardSets.empty.title') }}
        </h2>
        <p class="text-surface-600 dark:text-surface-400">
          {{ t('globalCardSets.empty.description') }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          v-for="cardSet in filteredCardSets"
          :key="cardSet.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="openPreview(cardSet, $event)"
        >
          <template #header>
            <div class="p-4 bg-primary-50 dark:bg-primary-900/20">
              <h3 class="text-xl font-bold truncate">
                {{ cardSet.title }}
              </h3>
            </div>
          </template>

          <template #content>
            <p class="text-surface-600 dark:text-surface-400 mb-3 line-clamp-2 min-h-[3rem]">
              {{ cardSet.description || t('globalCardSets.noDescription') }}
            </p>

            <div class="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
              <div class="flex items-center gap-1">
                <i class="pi pi-book"></i>
                <span>{{ cardSet.cards.length }} {{ t('globalCardSets.cards') }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="pi pi-download"></i>
                <span>{{ cardSet.download_count || 0 }} {{ t('globalCardSets.downloads') }}</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="flex gap-2">
              <Button
                :label="t('globalCardSets.viewDetails')"
                icon="pi pi-eye"
                severity="secondary"
                outlined
                size="small"
                class="flex-1"
                @click="openPreview(cardSet, $event)"
              />
              <Button
                :label="t('globalCardSets.importButton')"
                icon="pi pi-download"
                size="small"
                :loading="importing === cardSet.id"
                @click.stop="handleImport(cardSet)"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <!-- Preview Dialog -->
  <Dialog
    v-model:visible="showPreviewDialog"
    :header="previewCardSet?.title"
    :modal="true"
    :style="{ width: '800px' }"
    :breakpoints="{ '960px': '90vw' }"
  >
    <div v-if="previewCardSet" class="flex flex-col gap-4">
      <div>
        <p class="text-surface-600 dark:text-surface-400 mb-4">
          {{ previewCardSet.description || t('globalCardSets.noDescription') }}
        </p>
        <div class="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400 mb-4">
          <div class="flex items-center gap-1">
            <i class="pi pi-book"></i>
            <span>{{ previewCardSet.cards.length }} {{ t('globalCardSets.cards') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <i class="pi pi-download"></i>
            <span>{{ previewCardSet.download_count || 0 }} {{ t('globalCardSets.downloads') }}</span>
          </div>
        </div>
      </div>

      <Divider />

      <div class="max-h-96 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-3">{{ t('cardSets.cards') }}</h3>
        <div class="flex flex-col gap-2">
          <div
            v-for="(card, index) in previewCardSet.cards"
            :key="card.id"
            class="p-3 border border-surface-200 dark:border-surface-700 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                {{ index + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-surface-900 dark:text-surface-0 mb-1">
                  {{ card.terminology }}
                </div>
                <div class="text-surface-600 dark:text-surface-400 text-sm">
                  {{ card.define }}
                </div>
                <img
                  v-if="card.image_url"
                  :src="card.image_url"
                  :alt="card.terminology"
                  class="mt-2 max-h-32 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          @click="showPreviewDialog = false"
        />
        <Button
          v-if="previewCardSet"
          :label="t('globalCardSets.importButton')"
          icon="pi pi-download"
          :loading="importing === previewCardSet.id"
          @click="handleImport(previewCardSet)"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
