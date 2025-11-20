<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import updateCampaignService, {
    type IUpdateCampaign,
  } from '~/services/update-campaign.service';

  const visible = ref(false);
  const campaign = ref<IUpdateCampaign | null>(null);

  const STORAGE_KEY = 'update_campaign_version';

  const checkAndShowCampaign = async () => {
    const data = await updateCampaignService.getUpdateCampaign();

    if (!data || !data.is_show_update_info) {
      return;
    }

    const storedVersion = localStorage.getItem(STORAGE_KEY);

    // Lần đầu hoặc version cũ hơn
    if (!storedVersion || storedVersion < data.version) {
      campaign.value = data;
      visible.value = true;
    }
  };

  const handleClose = () => {
    if (campaign.value) {
      localStorage.setItem(STORAGE_KEY, campaign.value.version);
    }
    visible.value = false;
  };

  onMounted(() => {
    checkAndShowCampaign();
  });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="campaign?.title"
    :modal="true"
    :closable="true"
    :style="{ width: '90vw', maxWidth: '600px' }"
    @hide="handleClose"
  >
    <div class="space-y-4">
      <div class="p-4 rounded-lg bg-gray-50">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
          campaign?.content
        }}</pre>
      </div>
    </div>

    <template #footer>
      <Button
        label="Đã hiểu"
        @click="handleClose"
      />
    </template>
  </Dialog>
</template>
