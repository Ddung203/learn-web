<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const cardSets = computed(() => cardSetStore.getAllCardSets);

  const loadCardSets = () => {
    // Initialize sample data if empty
    if (cardSetStore.getTotalCardSets === 0) {
      cardSetStore.initializeSampleData();
    }
  };

  const goToCardSetDetail = (cardSetId: string) => {
    router.push(`/card-sets/${cardSetId}`);
  };

  const createNewCardSet = () => {
    router.push('/study-module');
  };

  const deleteCardSet = (cardSetId: string, event: Event) => {
    event.stopPropagation();
    
    if (confirm(t('cardSets.confirmDelete'))) {
      const success = cardSetStore.deleteCardSet(cardSetId);
      
      if (success) {
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('cardSets.toast.deleteSuccess'),
          life: 3000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: t('cardSets.toast.deleteError'),
          life: 3000,
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  onMounted(() => {
    loadCardSets();
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full min-h-svh">
    <div class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-7xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">{{ t('cardSets.title') }}</h1>
        <Button
          icon="pi pi-plus"
          :label="t('cardSets.createNew')"
          @click="createNewCardSet"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="cardSets.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
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
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="cardSet in cardSets"
          :key="cardSet.id"
          class="cursor-pointer transition-shadow hover:shadow-lg"
          @click="goToCardSetDetail(cardSet.id)"
        >
          <template #title>
            <div class="text-lg font-semibold">{{ cardSet.title }}</div>
          </template>
          <template #content>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ cardSet.description || t('cardSets.noDescription') }}
            </p>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>
                <i class="pi pi-clone mr-1"></i>
                {{ cardSet.cards.length }} {{ t('cardSets.cards') }}
              </span>
              <span>{{ formatDate(cardSet.updatedAt) }}</span>
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
                icon="pi pi-trash"
                severity="danger"
                size="small"
                outlined
                @click="deleteCardSet(cardSet.id, $event)"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
