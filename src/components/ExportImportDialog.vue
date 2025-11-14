<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useLocale } from '~/composables/useLocale';
  import { useCardSetStore } from '~/stores';

  interface Props {
    visible: boolean;
    cardSetId?: string;
    mode?: 'export' | 'import' | 'share';
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
  }>();

  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const importJsonText = ref('');
  const importFile = ref<File | null>(null);
  const shareLink = ref('');
  const activeTab = ref(0);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });

  const dialogTitle = computed(() => {
    if (props.mode === 'export') return t('cardSets.exportImport.exportTitle');
    if (props.mode === 'import') return t('cardSets.exportImport.importTitle');
    if (props.mode === 'share') return t('cardSets.exportImport.shareTitle');
    return t('cardSets.exportImport.title');
  });

  const handleExport = () => {
    try {
      let jsonData: string;
      let filename: string;

      if (props.cardSetId) {
        jsonData = cardSetStore.exportCardSet(props.cardSetId);
        const cardSet = cardSetStore.getCardSetById(props.cardSetId);
        filename = `${cardSet?.title || 'cardset'}.json`;
      } else {
        jsonData = cardSetStore.exportAllCardSets();
        filename = 'all-cardsets.json';
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('cardSets.toast.exportSuccess'),
        life: 3000,
      });

      dialogVisible.value = false;
    } catch (error) {
      console.error('Export error:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.exportError'),
        life: 3000,
      });
    }
  };

  const handleImport = async () => {
    try {
      let jsonString = importJsonText.value;

      if (importFile.value) {
        jsonString = await importFile.value.text();
      }

      if (!jsonString.trim()) {
        toast.add({
          severity: 'warn',
          summary: t('common.warning'),
          detail: t('cardSets.toast.importError'),
          life: 3000,
        });
        return;
      }

      await cardSetStore.importCardSet(jsonString);

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('cardSets.toast.importSuccess'),
        life: 3000,
      });

      importJsonText.value = '';
      importFile.value = null;
      dialogVisible.value = false;
    } catch (error) {
      console.error('Import error:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.importError'),
        life: 3000,
      });
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      importFile.value = target.files[0];
    }
  };

  const generateShareLink = () => {
    if (!props.cardSetId) return;

    try {
      shareLink.value = cardSetStore.generateShareLink(props.cardSetId);
    } catch (error) {
      console.error('Share link error:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.shareLinkError'),
        life: 3000,
      });
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink.value);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('cardSets.toast.shareLinkCopied'),
        life: 2000,
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: 'Failed to copy link',
        life: 3000,
      });
    }
  };

  const handleDialogShow = () => {
    if (props.mode === 'share' && props.cardSetId) {
      generateShareLink();
    }
  };
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="dialogTitle"
    :modal="true"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @show="handleDialogShow"
  >
    <div v-if="mode === 'export'" class="flex flex-col gap-4">
      <p class="text-gray-600">{{ t('cardSets.exportImport.exportDescription') }}</p>
      <Button
        :label="t('cardSets.exportToFile')"
        icon="pi pi-download"
        @click="handleExport"
      />
    </div>

    <div v-else-if="mode === 'import'" class="flex flex-col gap-4">
      <p class="text-gray-600">{{ t('cardSets.exportImport.importDescription') }}</p>
      
      <div class="flex flex-col gap-2">
        <label class="font-semibold">{{ t('cardSets.exportImport.selectFile') }}</label>
        <input
          type="file"
          accept=".json"
          class="p-2 border rounded"
          @change="handleFileSelect"
        />
      </div>

      <div class="flex items-center gap-2">
        <Divider class="flex-1" />
        <span class="text-gray-500">{{ t('common.or', 'hoặc') }}</span>
        <Divider class="flex-1" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-semibold">{{ t('cardSets.exportImport.pasteJSON') }}</label>
        <Textarea
          v-model="importJsonText"
          rows="10"
          :placeholder="t('cardSets.exportImport.pasteJSON')"
          class="font-mono text-sm"
        />
      </div>

      <div class="flex justify-end gap-2">
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          @click="dialogVisible = false"
        />
        <Button
          :label="t('common.import')"
          icon="pi pi-upload"
          @click="handleImport"
        />
      </div>
    </div>

    <div v-else-if="mode === 'share'" class="flex flex-col gap-4">
      <p class="text-gray-600">{{ t('cardSets.exportImport.shareDescription') }}</p>
      <Message severity="info">
        {{ t('cardSets.exportImport.shareInstructions') }}
      </Message>

      <div class="flex flex-col gap-2">
        <label class="font-semibold">{{ t('cardSets.exportImport.generatedLink') }}</label>
        <div class="flex gap-2">
          <InputText
            v-model="shareLink"
            readonly
            class="flex-1 font-mono text-sm"
          />
          <Button
            :label="t('cardSets.copyLink')"
            icon="pi pi-copy"
            @click="copyShareLink"
          />
        </div>
      </div>
    </div>

    <TabView v-else v-model:activeIndex="activeTab">
      <TabPanel :header="t('cardSets.export')">
        <div class="flex flex-col gap-4">
          <p class="text-gray-600">{{ t('cardSets.exportImport.exportDescription') }}</p>
          <Button
            :label="t('cardSets.exportToFile')"
            icon="pi pi-download"
            @click="handleExport"
          />
        </div>
      </TabPanel>

      <TabPanel :header="t('cardSets.import')">
        <div class="flex flex-col gap-4">
          <p class="text-gray-600">{{ t('cardSets.exportImport.importDescription') }}</p>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold">{{ t('cardSets.exportImport.selectFile') }}</label>
            <input
              type="file"
              accept=".json"
              class="p-2 border rounded"
              @change="handleFileSelect"
            />
          </div>

          <div class="flex items-center gap-2">
            <Divider class="flex-1" />
            <span class="text-gray-500">{{ t('common.or', 'hoặc') }}</span>
            <Divider class="flex-1" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-semibold">{{ t('cardSets.exportImport.pasteJSON') }}</label>
            <Textarea
              v-model="importJsonText"
              rows="10"
              :placeholder="t('cardSets.exportImport.pasteJSON')"
              class="font-mono text-sm"
            />
          </div>

          <div class="flex justify-end gap-2">
            <Button
              :label="t('common.cancel')"
              severity="secondary"
              @click="dialogVisible = false"
            />
            <Button
              :label="t('common.import')"
              icon="pi pi-upload"
              @click="handleImport"
            />
          </div>
        </div>
      </TabPanel>
    </TabView>
  </Dialog>
</template>
