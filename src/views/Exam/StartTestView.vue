<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { ref } from 'vue';

  import Header from '~/components/Header.vue';
  import Loading from '~/components/Loading.vue';
  import { notifyError, verifyExamCode } from '~/helper';
  import { ExamService } from '~/services';
  import { buildErrorMessage } from '~/utils';
  import router from '../../routes';

  const toast = useToast();
  const token = ref('');
  const isLoading = ref(false);
  const examSessionId = ref('');

  const startBtnHandle = async () => {
    if (token.value.trim() === '') {
      notifyError(toast, 'Vui lòng nhập mã bài kiểm tra!');
      return;
    }

    if (token.value.trim() !== '123456') {
      const verifyResult = await verifyExamCode(token.value);

      if (!verifyResult) {
        notifyError(toast, 'Mã bài kiểm tra không hợp lệ!');
        return;
      }
    }

    try {
      isLoading.value = true;
      const { payload } = await ExamService.startInterviewExamSession(
        new Date().toISOString()
      );

      examSessionId.value = payload._id;
    } catch (error: any) {
      const errorMessage = buildErrorMessage(error);

      return notifyError(toast, errorMessage);
    } finally {
      isLoading.value = false;
    }

    router.push(`/test?examSessionId=${examSessionId.value}`);
  };
</script>

<template>
  <Loading v-if="isLoading"></Loading>
  <Header></Header>

  <div>
    <div class="w-full h-[300px] back"></div>
  </div>

  <div
    class="px-[20px] lg:px-[200px] pt-7 lg:pt-0 grid grid-cols-1 grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 text-[#ffab32]"
  >
    <div class="flex items-center justify-center bs-1">
      <i
        class="pi pi-question-circle"
        style="font-size: 2rem"
      ></i>
      <span class="pl-3 text-lg">Số lượng câu hỏi: 20</span>
    </div>
    <div class="flex items-center justify-center bs-1">
      <i
        class="pi pi-clock"
        style="font-size: 2rem"
      ></i>
      <span class="pl-3 text-lg">Thời gian: 20 phút</span>
    </div>
    <div class="flex items-center justify-center lg:row-start-2 bs-1">
      <i
        class="pi pi-exclamation-circle"
        style="font-size: 2rem"
      ></i>
      <span class="pl-3 text-lg">Số lần thực hiện: 1</span>
    </div>
    <div class="flex items-center justify-center lg:row-start-2 bs-1">
      <i
        class="pi pi-check-circle"
        style="font-size: 2rem"
      ></i>
      <span class="pl-3 text-lg"
        >"Mã bài kiểm tra" sẽ được cung cấp trong buổi phỏng vấn của bạn</span
      >
    </div>
  </div>

  <form
    class="lg:px-[200px] px-[20px] mt-10 mb-14 lg:mb-0"
    @submit.prevent="startBtnHandle"
    autocomplete="off"
  >
    <div class="flex justify-center pb-5 card">
      <FloatLabel>
        <InputText
          id="token"
          v-model="token"
        />
        <label for="token">Mã bài kiểm tra</label>
      </FloatLabel>
    </div>
    <Button
      :disabled="isLoading"
      type="submit"
      class="flex items-center justify-center w-full"
      >Bắt đầu</Button
    >
  </form>
</template>

<style scoped>
  .back {
    background-image: url('https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2FExam1-01.png?alt=media&token=2a2fe10b-c117-4061-8826-c6d9ebaa9828');
    background-size: cover;
    background-position: center;
  }

  .bs-1 {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    padding: 20px 30px;
  }

  .inner {
    padding: 20px 30px;
  }
</style>
