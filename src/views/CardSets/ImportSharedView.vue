<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const cardSetTitle = ref<string>('');
  const cardCount = ref<number>(0);
  const importSuccess = ref(false);

  const importFromLink = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = route.query.data as string;
      
      if (!data) {
        throw new Error('No data provided');
      }

      // Preview the data first
      try {
        const jsonString = decodeURIComponent(escape(atob(data)));
        const shareData = JSON.parse(jsonString);
        cardSetTitle.value = shareData.title || 'Untitled';
        cardCount.value = shareData.cards?.length || 0;
      } catch (e) {
        throw new Error('Invalid share link format');
      }

      // Import the card set
      const newCardSet = await cardSetStore.importFromShareLink(data);

      importSuccess.value = true;
      
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('cardSets.toast.importFromLinkSuccess'),
        life: 3000,
      });

      // Redirect to the card sets page after 2 seconds
      setTimeout(() => {
        router.push('/card-sets');
      }, 2000);

    } catch (err: any) {
      error.value = err.message || t('cardSets.toast.importFromLinkError');
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: error.value,
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };

  const goBack = () => {
    router.push('/card-sets');
  };

  onMounted(() => {
    if (route.query.data) {
      importFromLink();
    } else {
      error.value = 'No share data found in URL';
    }
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full min-h-svh">
    <div class="flex flex-col w-full min-h-screen px-5 py-6 lg:px-0 lg:py-16 lg:max-w-4xl">
      <Card class="w-full">
        <template #title>
          <div class="flex items-center gap-3">
            <i class="pi pi-share-alt text-3xl text-blue-500"></i>
            <span>{{ t('cardSets.shareLink') }}</span>
          </div>
        </template>

        <template #content>
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-8 gap-4">
            <ProgressSpinner style="width: 50px; height: 50px" />
            <p class="text-lg text-gray-600">
              {{ t('common.processing', 'Đang xử lý...') }}
            </p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-8 gap-4">
            <i class="pi pi-exclamation-triangle text-5xl text-red-500"></i>
            <h2 class="text-xl font-semibold text-gray-800">
              {{ t('common.error') }}
            </h2>
            <p class="text-gray-600 text-center">{{ error }}</p>
            <Button
              :label="t('common.backToHome')"
              icon="pi pi-arrow-left"
              @click="goBack"
            />
          </div>

          <!-- Success State -->
          <div v-else-if="importSuccess" class="flex flex-col items-center justify-center py-8 gap-4">
            <i class="pi pi-check-circle text-5xl text-green-500"></i>
            <h2 class="text-xl font-semibold text-gray-800">
              {{ t('common.success') }}
            </h2>
            <div class="text-center">
              <p class="text-gray-600 mb-2">
                {{ t('cardSets.toast.importFromLinkSuccess') }}
              </p>
              <p class="text-lg font-semibold text-gray-800">
                "{{ cardSetTitle }}"
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ cardCount }} {{ t('cardSets.cards') }}
              </p>
            </div>
            <Message severity="info" :closable="false">
              {{ t('common.redirecting', 'Đang chuyển hướng...') }}
            </Message>
            <Button
              :label="t('cardSets.title')"
              icon="pi pi-arrow-right"
              @click="goBack"
            />
          </div>

          <!-- Preview State (before import) -->
          <div v-else class="flex flex-col gap-4 py-4">
            <Message severity="info" :closable="false">
              {{ t('cardSets.exportImport.shareInstructions') }}
            </Message>
            
            <div class="p-4 bg-gray-50 rounded-lg">
              <h3 class="font-semibold text-lg mb-2">{{ cardSetTitle }}</h3>
              <p class="text-sm text-gray-600">
                {{ cardCount }} {{ t('cardSets.cards') }}
              </p>
            </div>

            <div class="flex justify-end gap-2">
              <Button
                :label="t('common.cancel')"
                severity="secondary"
                @click="goBack"
              />
              <Button
                :label="t('common.import')"
                icon="pi pi-upload"
                @click="importFromLink"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
