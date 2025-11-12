<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import Loading from '~/components/Loading.vue';
  import { STATUS_CODE } from '~/constants';
  import { checkFalsy, notifyError, notifySuccess } from '~/helper';
  import appRouter from '~/routes';
  import { AuthService } from '~/services';
  import { useAuthStore } from '~/stores';
  import { buildErrorMessage } from '~/utils';

  const toast = useToast();

  const loading = ref(false);
  const authStore = useAuthStore();

  const isShowForm = ref(false); // for animation

  const route = useRoute();

  const username = ref((route?.query?.email as string) || '');
  const password = ref('');

  if (authStore.isLoggedIn) {
    appRouter.push('/introduction');
  }

  const loginHandle = async () => {
    const loginData = {
      username: username.value.trim(),
      password: password.value,
    };
    try {
      loading.value = true;

      if (checkFalsy(loginData)) {
        notifyError(toast, 'Vui lòng nhập đầy đủ thông tin đăng nhập');

        authStore.reset();

        return;
      }

      const { status, payload } = await AuthService.login(loginData);

      if (status === STATUS_CODE.SUCCESS) {
        authStore.setAccessToken(payload.accessToken);
        authStore.setRefreshToken(payload.refreshToken);

        const { payload: profile } = await AuthService.getProfile();

        authStore.setUser(profile);
        authStore.setIsLoggedIn(true);
        notifySuccess(toast, 'Đăng nhập thành công');
        appRouter.push('/introduction');
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Tài khoản hoặc mật khẩu không đúng'
      );

      notifyError(toast, errorMessage);
      authStore.reset();

      return;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    isShowForm.value = true;
  });
</script>

<template>
  <Loading v-if="loading"></Loading>

  <div class="fontP">
    <div class="background-container"></div>
    <div class="flex items-center justify-center min-h-screen">
      <!-- Animate -->
      <transition
        enter-active-class="animate__animated animate__fadeInDown"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <div
          v-if="isShowForm"
          class="p-6 form-custom"
        >
          <form
            @submit.prevent="loginHandle"
            autocomplete="off"
            class="flex flex-col max-w-[300px] gap-6"
          >
            <span class="mb-4 text-3xl font-bold text-center text-[#fff]">
              Đăng nhập
            </span>
            <!-- Username -->
            <div>
              <FloatLabel>
                <InputText
                  id="username"
                  class="outline-1 outline-[#ffcd94] w-full"
                  v-model="username"
                />
                <label
                  class="text-[#41444B]"
                  for="username"
                  >Mã sinh viên</label
                >
              </FloatLabel>
            </div>
            <!-- Password -->
            <div class="pt-4">
              <FloatLabel>
                <Password
                  id="password"
                  v-model="password"
                  :feedback="false"
                  toggleMask
                />

                <label
                  class="text-[#41444B]"
                  for="password"
                  >Mật khẩu</label
                >
              </FloatLabel>
            </div>

            <div class="text-base text-right text-[#3674B5]">
              <router-link to="/forgot-password"
                ><span class="underline"> Quên mật khẩu</span></router-link
              >
            </div>
            <!-- Button submit -->
            <div>
              <Button
                :disabled="loading"
                class="flex items-center justify-center w-full"
                type="submit"
                >Đăng nhập</Button
              >
            </div>
          </form>

          <div class="pt-6 text-base text-left text-[#fbfbfb]">
            Bạn chưa có tài khoản?
            <router-link to="/previous-registration"
              ><span class="text-blue-700 underline">
                Đăng ký ngay</span
              ></router-link
            >
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
  .background-container {
    background-image: url('https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2FDDT00475_fixed.jpg?alt=media&token=e9c39dfe-3a0e-4f98-9682-b104110a1bd5');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }

  .form-custom {
    background-color: rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  }
</style>
