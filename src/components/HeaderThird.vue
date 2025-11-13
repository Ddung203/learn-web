<script setup lang="ts">
  import { useUIStore } from '~/stores';
  import LanguageSwitcher from './LanguageSwitcher.vue';

  const UIStore = useUIStore();
</script>

<template>
  <header class="w-[100vw] h-[66px]">
    <div class="fixed top-0 left-0 w-[100%] z-40 bg-white shadow-c">
      <div class="grid grid-cols-3 grid-rows-1 gap-0 py-3 px-7">
        <!--  -->
        <section class="left">
          <div class="flex gap-2 justify-content-center introduction-farm">
            <Button
              outlined
              icon="pi pi-align-justify"
              @click="UIStore.toggleMenu"
            />
          </div>
        </section>

        <!-- Middle -->
        <section class="flex items-center justify-between">
          <!-- LOGO -->
          <div class="logo">
            <a href="#">
              <img
                class="block max-h-[40px]"
                src="https://minio.ddung203.id.vn/api/v1/choco-learn/logo.png"
                alt="Logo"
            /></a>
          </div>
        </section>
        
        <!-- Right -->
        <section class="flex items-center justify-end gap-5 md:flex lg:flex-row right">
          <LanguageSwitcher />
        </section>
      </div>
    </div>
  </header>
</template>

<style scoped>
  .shadow-c {
    box-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px;
  }
  .logo {
    margin: 0 auto;
  }

  header {
    -moz-user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-user-select: none !important;
    -khtml-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }
</style>
