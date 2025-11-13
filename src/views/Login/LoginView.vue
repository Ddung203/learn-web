<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useAuthStore } from '~/stores';
  import { useLocale } from '~/composables/useLocale';

  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const { t } = useLocale();

  const email = ref('');
  const fullName = ref('');
  const password = ref('');
  const loading = ref(false);
  const showPassword = ref(false);

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  onMounted(() => {
    if (authStore.isAuthenticated) {
      router.push('/card-sets');
    }
  });

  watch(
    () => authStore.isAuthenticated,
    (value) => {
      if (value) {
        router.push('/card-sets');
      }
    }
  );

  const handleLoginOrRegister = async () => {
    if (!email.value || !password.value) {
      toast.add({
        severity: 'warn',
        summary: t('login.validation.error'),
        detail: t('login.validation.required'),
        life: 3000,
      });
      return;
    }

    loading.value = true;

    try {
      // Use login-or-register endpoint (backend handles auto-register)
      const payload: any = {
        email: email.value,
        password: password.value,
      };

      // Add full_name if provided
      if (fullName.value && fullName.value.trim()) {
        payload.full_name = fullName.value.trim();
      }

      await authStore.loginOrRegister(payload);

      toast.add({
        severity: 'success',
        summary: t('login.success.title'),
        detail: t('login.success.message'),
        life: 3000,
      });

      router.push('/card-sets');
    } catch (error: any) {
      console.error('Login/Register failed:', error);
      toast.add({
        severity: 'error',
        summary: t('login.error.title'),
        detail: authStore.error || t('login.error.message'),
        life: 5000,
      });
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <HeaderThird />

  <div
    class="flex items-center justify-center min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="w-full max-w-md">
      <Card class="shadow-xl">
        <template #content>
          <div class="p-6 space-y-6">
            <!-- Header -->
            <div class="text-center">
              <h1 class="mb-2 text-3xl font-bold text-gray-900">
                {{ t('login.title') }}
              </h1>
              <p class="text-gray-600">
                {{ t('login.subtitle') }}
              </p>
            </div>

            <!-- Form -->
            <div class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">
                  {{ t('login.email') }}
                </label>
                <InputText
                  v-model="email"
                  type="email"
                  :placeholder="t('login.emailPlaceholder')"
                  class="w-full"
                  :disabled="loading"
                  autocomplete="email"
                />
              </div>

              <!-- Full Name (Optional) -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">
                  {{ t('login.fullName') }}
                  <span class="ml-1 text-xs text-gray-400">{{
                    t('login.optional')
                  }}</span>
                </label>
                <InputText
                  v-model="fullName"
                  type="text"
                  :placeholder="t('login.fullNamePlaceholder')"
                  class="w-full"
                  :disabled="loading"
                  autocomplete="name"
                />
              </div>

              <!-- Password -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">
                  {{ t('login.password') }}
                </label>
                <div class="relative">
                  <InputText
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="t('login.passwordPlaceholder')"
                    class="w-full pr-10"
                    :disabled="loading"
                    autocomplete="current-password"
                    @keyup.enter="handleLoginOrRegister"
                  />
                  <button
                    type="button"
                    class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                    @click="togglePasswordVisibility"
                  >
                    <i
                      :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Info Message -->
              <div class="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div class="flex items-start gap-2">
                  <i class="pi pi-info-circle text-blue-500 mt-0.5"></i>
                  <p class="text-sm text-blue-700">
                    {{ t('login.autoRegisterInfo') }}
                  </p>
                </div>
              </div>

              <!-- Submit Button -->
              <Button
                :label="
                  loading ? t('login.processing') : t('login.loginButton')
                "
                :loading="loading"
                :disabled="loading || !email || !password"
                class="w-full"
                size="large"
                @click="handleLoginOrRegister"
              />
            </div>

            <!-- Footer -->
            <div class="pt-4 text-sm text-center text-gray-600 border-t">
              <p>{{ t('login.noAccount') }}</p>
              <p class="mt-1 font-medium text-blue-600">
                {{ t('login.autoCreateAccount') }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
  :deep(.p-inputtext) {
    padding: 0.75rem 1rem;
  }
</style>
