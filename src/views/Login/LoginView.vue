<script setup lang="ts">
  import { useToast } from 'primevue/usetoast';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import HeaderThird from '~/components/HeaderThird.vue';

  import Loading from '~/components/Loading.vue';
  import { STATUS_CODE } from '~/constants';
  import { checkFalsy, notifyError, notifySuccess } from '~/helper';
  import appRouter from '~/routes';
  import { AuthService } from '~/services';
  import { useAuthStore } from '~/stores';
  import { buildErrorMessage } from '~/utils';
  import { useLocale } from '~/composables/useLocale';

  const toast = useToast();
  const { t } = useLocale();

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
        notifyError(toast, t('login.toast.fillAllFields'));

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
        notifySuccess(toast, t('login.toast.loginSuccess'));
        appRouter.push('/introduction');
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        t('login.toast.wrongCredentials')
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
  <HeaderThird />

  <div class="px-5">
    <div class="background-container"></div>
    <div class="flex items-start justify-center mt-10 lg:mt-32">
      <!-- Animate -->
      <transition
        enter-active-class="animate__animated animate__fadeInDown"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <div
          v-if="isShowForm"
          class="px-8 py-6 lg:py-8 lg:px-12 form-custom"
        >
          <form
            @submit.prevent="loginHandle"
            autocomplete="off"
            class="flex flex-col max-w-[300px]"
          >
            <div class="flex justify-center">
              <img
                class="block max-h-[60px]"
                src="https://minio.ddung203.id.vn/api/v1/choco-learn/logo.jpg"
                alt="Logo"
              />
            </div>

            <span class="mb-4 text-3xl font-bold text-center text-[#41444B]">
              {{ t('login.title') }}
            </span>

            <span class="mb-4 text-base text-center text-[#41444B]">
              {{ t('login.subtitle') }}
            </span>
            <!-- Username -->
            <div class="mt-6">
              <FloatLabel>
                <InputText
                  id="username"
                  class="outline-1 outline-[#ffcd94] w-full"
                  v-model="username"
                  maxlength="100"
                />
                <label
                  class="text-[#41444B]"
                  for="username"
                  >{{ t('login.emailOrUsername') }}</label
                >
              </FloatLabel>
            </div>

            <!-- Password -->
            <div class="mt-6">
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
                  >{{ t('login.password') }}</label
                >
              </FloatLabel>
            </div>

            <!-- Button submit -->
            <div class="mt-8">
              <Button
                :disabled="loading"
                class="flex items-center justify-center w-full"
                type="submit"
                >{{ t('login.signIn') }}</Button
              >
            </div>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
  .background-container {
    background-image: url('');
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
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }
</style>
