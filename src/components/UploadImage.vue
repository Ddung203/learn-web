<script setup lang="ts">
  import { ref } from 'vue';
  import { uploadImageHandle } from '~/helper';

  const uploadStatus = ref<string | null>(null);
  const avatarImage = ref<string | null>(null);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];

    if (!file) {
      uploadStatus.value = 'error';
      avatarImage.value = null;
      return;
    }

    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      uploadStatus.value = 'error';
      avatarImage.value = null;

      return;
    }

    const fileName = 'image' + Date.now() + '.' + file.type.split('/')[1];

    const result = await uploadImageHandle(file, fileName);

    uploadStatus.value = result.status;
    if (result.status === 'success') {
      avatarImage.value = result.url;
    } else {
      avatarImage.value = null;
    }
  };
</script>

<template>
  <div>
    <input
      type="file"
      @change="handleFileUpload"
    />
    <p v-if="uploadStatus">Status: {{ uploadStatus }}</p>
    <p v-if="avatarImage">
      Image URL:
      <a
        :href="avatarImage"
        target="_blank"
        >{{ avatarImage }}</a
      >
    </p>
  </div>
</template>
