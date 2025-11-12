<script setup lang="ts">
  import { AxiosError } from 'axios';
  import { useToast } from 'primevue/usetoast';
  import { reactive, ref } from 'vue';
  import { z } from 'zod';
  import { useRoute } from 'vue-router';

  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import { notifyError, notifySuccess } from '~/helper';
  import appRouter from '~/routes';
  import { AuthService } from '~/services';
  import { setPasswordFormSchema } from './SetPasswordView.schema';

  const toast = useToast();
  const route = useRoute();

  // UI State
  const isLoading = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);

  // Form Data
  const formData = reactive({
    email: (route?.query?.email as string) || '',
    password: '',
    confirmPassword: '',
  });

  const onSubmitSetPassword = async () => {
    const trimmedFormData = {
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    // Validate using Zod
    try {
      isLoading.value = true;
      const validatedData = setPasswordFormSchema.parse(trimmedFormData);

      // Submit to API
      const { payload } = await AuthService.setPassword(validatedData);

      if (payload.success) {
        notifySuccess(toast, 'Đặt mật khẩu thành công!');

        setTimeout(() => {
          appRouter.push(`/login?email=${formData.email}`);
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

      // Handle API errors
      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
        return;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const goVerifyOTPPage = () => {
    appRouter.push(`/verify-otp?email=${formData.email}`);
  };

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
  };
</script>

<template>
  <HeaderThird></HeaderThird>
  <Loading v-if="isLoading"></Loading>

  <div>
    <!-- Main content -->
    <div
      class="grid grid-cols-1 lg:grid-cols-2 min-h-[100vh] grid-rows-1 gap-2 overflow-hidden"
    >
      <div class="p-10 lg:p-20 layout-left">
        <p class="text-3xl font-semibold leading-normal uppercase">
          Đặt mật khẩu
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

        <p class="text-lg font-medium note">Yêu cầu mật khẩu:</p>
        <ul class="text-sm mt-3 ml-4 space-y-1">
          <li>• Ít nhất 8 ký tự</li>
          <li>• Có ít nhất 1 chữ thường (a-z)</li>
          <li>• Có ít nhất 1 chữ hoa (A-Z)</li>
          <li>• Có ít nhất 1 chữ số (0-9)</li>
          <li>• Có ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
        </ul>

        <p class="text-lg mt-10 font-medium note">
          Hãy chọn mật khẩu mạnh và không chia sẻ với bất kỳ ai!
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
            @submit.prevent="onSubmitSetPassword"
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
                <span class="font-medium">Mật khẩu</span>
                <i
                  class="text-red-600 pi pi-asterisk"
                  style="font-size: 0.56rem"
                ></i>
              </div>

              <div class="mb-5 relative">
                <InputText
                  class="w-full pr-10"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu của bạn"
                  v-model="formData.password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  @click="togglePasswordVisibility"
                >
                  <i
                    :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  ></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <div class="flex items-start gap-1 mb-2">
                <span class="font-medium">Xác nhận mật khẩu</span>
                <i
                  class="text-red-600 pi pi-asterisk"
                  style="font-size: 0.56rem"
                ></i>
              </div>

              <div class="mb-5 relative">
                <InputText
                  class="w-full pr-10"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Nhập lại mật khẩu của bạn"
                  v-model="formData.confirmPassword"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  @click="toggleConfirmPasswordVisibility"
                >
                  <i
                    :class="
                      showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex flex-col gap-3 mt-10">
              <Button
                type="submit"
                class="flex items-center justify-center w-full"
                :disabled="isLoading"
              >
                Đặt mật khẩu
              </Button>

              <Button
                type="button"
                severity="secondary"
                class="flex items-center justify-center w-full"
                @click="goVerifyOTPPage"
              >
                Quay lại xác thực OTP
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
