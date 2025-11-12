<script setup lang="ts">
  import { AxiosError } from 'axios';
  import { useToast } from 'primevue/usetoast';
  import { reactive, ref } from 'vue';
  import { z } from 'zod';
  import { useRoute } from 'vue-router';

  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import { notifyError, notifySuccess } from '~/helper';
  import appRouter from '~/routes/index.js';
  import {
    resendOTPFormSchema,
    verifyOTPFormSchema,
  } from './VerifyOTPView.schema.js';
  import { AuthService } from '~/services';

  const toast = useToast();
  const route = useRoute();

  // UI State
  const isLoading = ref(false);
  const isResendLoading = ref(false);

  // Form Data
  const formData = reactive({
    email: (route?.query?.email as string) || '',
    otpCode: '',
  });

  const onSubmitVerifyOTP = async () => {
    const trimmedFormData = {
      email: formData.email.trim(),
      otpCode: formData.otpCode.trim(),
    };

    // Validate using Zod
    try {
      isLoading.value = true;
      const validatedData = verifyOTPFormSchema.parse(trimmedFormData);

      // Submit to API
      const { payload } = await AuthService.verifyOTP(validatedData);

      if (payload.success) {
        notifySuccess(toast, 'Xác thực OTP thành công!');

        setTimeout(() => {
          appRouter.push(`/set-password?email=${formData.email}`);
        }, 100);
      } else {
        notifyError(toast, payload.message);
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        notifyError(toast, firstError.message);
        return;
      }

      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
        return;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const onResendOTP = async () => {
    const trimmedEmail = formData.email.trim();

    try {
      isResendLoading.value = true;
      const validatedData = resendOTPFormSchema.parse({ email: trimmedEmail });

      // Submit to API
      const { payload } = await AuthService.resendOTP(validatedData);

      if (payload.success) {
        notifySuccess(
          toast,
          payload.message || 'Mã OTP mới đã được gửi về email của bạn!'
        );
      } else {
        notifyError(toast, payload.message);
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        notifyError(toast, firstError.message);
        return;
      }

      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
        return;
      }
    } finally {
      isResendLoading.value = false;
    }
  };

  const goBackRegistrationPage = () => {
    appRouter.push('/previous-registration');
  };
</script>

<template>
  <HeaderThird></HeaderThird>
  <Loading v-if="isLoading || isResendLoading"></Loading>

  <div>
    <!-- Main content -->
    <div
      class="grid grid-cols-1 lg:grid-cols-2 min-h-[100vh] grid-rows-1 gap-2 overflow-hidden"
    >
      <div class="p-10 lg:p-20 layout-left">
        <p class="text-3xl font-semibold leading-normal uppercase">
          Xác thực OTP
        </p>
        <p class="text-3xl font-semibold leading-normal">
          CLB Hỗ trợ kỹ thuật IT Supporter
        </p>

        <div
          class="flex items-center justify-center m-5 overflow-hidden demo-img"
        >
          <img
            class="block rounded-xl"
            width="250"
            src="https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2FH%C3%A0-new.jpg?alt=media&token=b16e5f1c-6f34-4123-8a11-a1f75cd53e58"
            alt="Demo Image"
          />
        </div>

        <p class="text-lg font-medium note">
          Lưu ý: Vui lòng kiểm tra email và nhập mã OTP gồm 6 chữ số để xác thực
          tài khoản của bạn. Mã OTP có hiệu lực trong 10 phút.
        </p>

        <p class="text-lg mt-10 font-medium note">
          Nếu không nhận được email, hãy kiểm tra thư mục spam hoặc nhấn "Gửi
          lại OTP" để nhận mã mới.
        </p>
      </div>

      <div
        class="relative layout-right min-h-[100vh] bg-[#fefefe] py-[40px] px-[30px] lg:px-[80px]"
      >
        <div class="absolute hidden lg:block top-0 left-[-150px] cloud">
          <img
            class="block object-contain h-full"
            src="https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/others%2Fcloud.png?alt=media&token=b95433a8-a432-462f-b44e-64dd65afa482"
            alt="cloud image"
          />
        </div>

        <!-- FORM -->
        <div>
          <form
            autocomplete="off"
            @submit.prevent="onSubmitVerifyOTP"
          >
            <div class="form-group">
              <div class="flex items-start gap-1 mb-2">
                <span class="font-medium">Email</span>
                <i
                  class="text-red-600 pi pi-asterisk"
                  style="font-size: 0.56rem"
                ></i>
              </div>

              <div class="mb-5">
                <InputText
                  class="w-full"
                  type="email"
                  placeholder="your-email@gmail.com"
                  v-model="formData.email"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="flex items-start gap-1 mb-2">
                <span class="font-medium">Mã OTP (6 chữ số)</span>
                <i
                  class="text-red-600 pi pi-asterisk"
                  style="font-size: 0.56rem"
                ></i>
              </div>

              <div class="mb-5">
                <InputText
                  class="w-full text-center text-xl tracking-widest"
                  type="text"
                  placeholder="123456"
                  maxlength="6"
                  v-model="formData.otpCode"
                />
              </div>
              <!-- <div class="mb-5">
                <InputOtp
                  :length="6"
                  v-model="formData.otpCode"
                />
              </div> -->
            </div>

            <!-- Buttons -->
            <div class="flex flex-col gap-3 mt-10">
              <Button
                type="submit"
                class="flex items-center justify-center w-full"
                :disabled="isLoading"
              >
                Xác thực OTP
              </Button>

              <Button
                type="button"
                severity="secondary"
                class="flex items-center justify-center w-full"
                :disabled="isResendLoading"
                @click="onResendOTP"
              >
                Gửi lại OTP
              </Button>

              <Button
                type="button"
                severity="help"
                class="flex items-center justify-center w-full"
                @click="goBackRegistrationPage"
              >
                Quay lại đăng ký
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .layout-left {
    background-image: linear-gradient(to right, #fdd359, #f5945d);
    color: #fff;
  }
</style>
