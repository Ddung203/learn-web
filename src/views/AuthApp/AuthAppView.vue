<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { ref } from 'vue';
  import Header from '~/components/Header.vue';
  import { TOKENS } from '~/config';
  import { notifyError, notifySuccess } from '~/helper';

  const toast = useToast();

  const token = ref('');
  const result = ref<{ success: boolean; verified: boolean } | null>(null);

  // state để bật/tắt QR
  const showQr = ref(false);

  const { TWO_FA_URL, TWO_FA_KEY } = TOKENS;

  const verifyHandle = async () => {
    const response = await fetch(TWO_FA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token.value, secret: TWO_FA_KEY }),
    });

    result.value = await response.json();

    if (result.value?.verified) {
      return notifySuccess(toast, 'Xác thực thành công');
    } else {
      return notifyError(toast, 'Xác thực KHÔNG thành công');
    }
  };
</script>

<template>
  <Header />
  <div class="px-[25px] pt-10">
    <form
      class="flex flex-col items-center justify-center gap-5"
      @submit.prevent="verifyHandle"
      autocomplete="off"
    >
      <!-- Nút toggle -->
      <Button
        type="button"
        @click="showQr = !showQr"
        severity="secondary"
        outlined
      >
        {{ showQr ? 'Ẩn QR' : 'Hiện QR' }}
      </Button>

      <!-- QR -->
      <div
        v-if="showQr"
        class=""
      >
        <img
          src="data:image/png;base64,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"
          alt="QR"
        />
      </div>

      <div class="flex justify-center card">
        <FloatLabel>
          <InputText
            id="token"
            v-model="token"
            maxlength="6"
          />
          <label for="token">OTP CODE</label>
        </FloatLabel>
      </div>

      <Button
        name="btnSubmit"
        type="submit"
        :disabled="!token"
      >
        Kiểm tra mã bài kiểm tra
      </Button>
    </form>
  </div>
</template>
