<script setup lang="ts">
  import { AxiosError } from 'axios';
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref } from 'vue';

  import Footer from '~/components/Footer.vue';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { notifyError } from '~/helper';
  import { StudentService } from '~/services';

  const toast = useToast();
  const isShowForm = ref(false);

  const studentCode = ref('');
  const isPassed = ref(false);
  const isShowDialog = ref(false);

  const onSubmitHandle = async () => {
    isPassed.value = false;
    isShowDialog.value = false;

    if (studentCode.value.trim() == '') {
      notifyError(toast, 'Mã sinh viên không được để trống!');
      return;
    }

    try {
      const { payload } = await StudentService.findResult(
        studentCode.value.trim()
      );

      if (payload.isPassed) {
        isShowDialog.value = true;
        isPassed.value = true;
      } else {
        isPassed.value = false;
        isShowDialog.value = true;
      }
    } catch (error) {
      isPassed.value = false;
      isShowDialog.value = false;

      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
        return;
      }

      notifyError(toast, 'Hệ thống tra cứu đang gián đoạn!');
    }
  };

  onMounted(() => {
    isShowForm.value = true;
  });
</script>

<template>
  <HeaderThird></HeaderThird>

  <div class="bg-[#fefefe]">
    <div class="top-content">
      <p class="pt-11 text-4xl text-center font-bold text-[#222222] uppercase">
        Tra cứu kết quả tuyển CTV Gen12 - 2025
      </p>

      <div class="flex items-center justify-center gap-[30px] mt-5">
        <div class="h-1 bg-[#41444B] w-28"></div>
        <div class="text-[#41444B]">
          <i class="text-4xl pi pi-star-fill"></i>
        </div>
        <div class="h-1 bg-[#41444B] w-28"></div>
      </div>
    </div>

    <!--  -->
    <transition
      enter-active-class="animate__animated animate__fadeInDown"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <div v-if="isShowForm">
        <form
          @submit.prevent="onSubmitHandle"
          autocomplete="off"
        >
          <div
            class="grid grid-cols-1 lg:grid-cols-2 grid-rows-1 gap-12 mt-6 pt-4 lg:pt-0 px-[20px] lg:px-[160px]"
          >
            <div class="flex flex-col items-center justify-center w-full gap-4">
              <FloatLabel class="w-full">
                <InputText
                  class="w-full"
                  id="studentCode"
                  v-model="studentCode"
                  maxlength="10"
                />
                <label for="studentCode">Mã sinh viên</label>
              </FloatLabel>

              <Button
                class="w-full"
                label="Tra cứu"
                @click="onSubmitHandle"
              ></Button>
            </div>
            <div
              class="justify-center hidden overflow-hidden rounded-md lg:flex"
            >
              <img
                class="block max-w-full"
                src="https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2F2v2.png?alt=media&token=77413380-dedf-45da-9ccb-7d98c88e526d"
                alt="It's you and me"
              />
            </div>
          </div>
        </form>

        <!-- NOTE -->
        <div class="mt-6 pt-4 lg:pt-0 px-[20px] lg:px-[160px]">
          <p class="pt-7 text-base text-justify font-[400] text-[#000]">
            LƯU Ý: Nếu bạn có tên trong danh sách trúng tuyển nhưng chưa nhận
            được email, bạn vui lòng liên hệ qua
            <a
              target="_blank"
              class="text-blue-600"
              href="https://www.facebook.com/itsupporter.haui"
              >Fanpage Facebook</a
            >
            nhé
          </p>
        </div>
      </div>
    </transition>
  </div>

  <!-- Dialog -->

  <Dialog
    v-model:visible="isShowDialog"
    modal
    header=" "
    :style="{ width: '32rem' }"
    class="dialog-result"
  >
    <div
      class="passed"
      v-if="isPassed"
    >
      <div
        class="flex flex-col items-center justify-center p-8 border border-green-100 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl"
      >
        <div class="p-4 mb-6 bg-green-100 rounded-full">
          <i class="text-5xl text-green-600 pi pi-check-circle"></i>
        </div>

        <h3 class="mb-4 text-xl font-bold text-center text-green-800">
          🎉 Chúc mừng bạn đã trúng tuyển!
        </h3>

        <div class="w-16 h-1 mb-4 bg-green-400 rounded-full"></div>

        <p class="max-w-sm text-sm leading-relaxed text-center text-gray-700">
          Chúc mừng
          <span class="font-semibold text-green-700">{{ studentCode }}</span
          >, bạn đã chính thức trở thành cộng tác viên của
          <span class="font-semibold text-green-700"
            >CLB Hỗ trợ kỹ thuật IT Supporter HaUI</span
          >.
        </p>

        <div
          class="w-full p-4 mt-6 border-l-4 border-blue-400 rounded-lg bg-blue-50"
        >
          <p class="text-sm text-center text-blue-800">
            📧 Thông tin chi tiết vui lòng kiểm tra email của bạn 😘
          </p>
        </div>
      </div>
    </div>

    <div
      class="no-passed"
      v-if="!isPassed"
    >
      <div
        class="flex flex-col items-center justify-center p-8 border border-red-100 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 rounded-xl"
      >
        <div class="p-4 mb-6 bg-red-100 rounded-full">
          <i class="text-5xl text-red-500 pi pi-times-circle"></i>
        </div>

        <h3 class="mb-4 text-xl font-bold text-center text-red-800">
          Kết quả tra cứu
        </h3>

        <div class="w-16 h-1 mb-4 bg-red-400 rounded-full"></div>

        <p
          class="max-w-sm mb-6 text-sm leading-relaxed text-center text-gray-700"
        >
          Rất tiếc! Không tìm thấy thông tin trúng tuyển của bạn trong đợt tuyển
          này.
        </p>

        <div
          class="w-full p-4 mt-4 border-l-4 rounded-lg bg-amber-50 border-amber-400"
        >
          <p class="text-sm text-center text-amber-800">
            💪 IT Supporter cảm ơn bạn đã tham gia tuyển CTV Gen12 - 2025
          </p>
        </div>
      </div>
    </div>
  </Dialog>

  <div class="absolute bottom-0 left-0 hidden w-full lg:block">
    <Footer></Footer>
  </div>
</template>
