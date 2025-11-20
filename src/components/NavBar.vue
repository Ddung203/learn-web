<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { createMenuItems } from '~/config/menu.config';
  import appRouter from '~/routes';
  import { useAuthStore, useUIStore } from '~/stores';
  import type { MenuItem } from '~/interfaces/route.interface';

  import { useLocale } from '~/composables/useLocale';

  const { t } = useLocale();
  const uiStore = useUIStore();
  const authStore = useAuthStore();

  const header = ref<string>('');
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  const navigateHandle = (path: string): void => {
    uiStore.visibleMenu = false;
    appRouter.push(path);
  };

  const logout = (): void => {
    authStore.logout();
    uiStore.visibleMenu = false;
    setTimeout(() => appRouter.push('/introduction'), 100);
  };

  const items = computed((): MenuItem[] => {
    header.value = isAuthenticated.value
      ? t('navbar.welcomeUser', {
          name: authStore.user?.full_name || authStore.user?.username,
        })
      : t('navbar.welcome');

    return createMenuItems(navigateHandle, logout, isAuthenticated.value, t);
  });
</script>

<template>
  <div class="menu">
    <Sidebar
      v-model:visible="uiStore.visibleMenu"
      :header="header"
    >
      <!-- MENU HERE -->
      <div class="flex justify-center">
        <PanelMenu
          :model="items"
          class="w-full md:w-80"
        >
          <template #item="{ item }">
            <router-link
              v-if="item.route"
              v-slot="{ href, navigate }"
              :to="item.route"
              custom
            >
              <a
                v-ripple
                class="flex items-center px-4 py-2 cursor-pointer text-surface-700 dark:text-surface-0"
                :href="href"
                @click="navigate"
              >
                <span :class="item.icon" />
                <span class="ml-2">{{ item.label }}</span>
              </a>
            </router-link>
            <a
              v-else
              v-ripple
              class="flex items-center px-4 py-2 cursor-pointer text-surface-700 dark:text-surface-0"
              :href="item.url"
              :target="item.target"
            >
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
              <span
                v-if="item.items"
                class="ml-auto pi pi-angle-down text-primary"
              />
            </a>
          </template>
        </PanelMenu>
      </div>
    </Sidebar>
  </div>
</template>
