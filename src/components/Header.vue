<script setup lang="ts">
  import { useAuthStore, useUIStore } from '~/stores';

  const authStore = useAuthStore();
  const UIStore = useUIStore();

  const header = authStore.getStudentName || 'Guest';
</script>

<template>
  <header class="w-[100vw] h-[66px]">
    <div class="">
      <div class="fixed top-0 left-0 w-[100%] z-40 bg-white shadow-c">
        <div
          class="flex flex-row-reverse items-center justify-between py-3 md:flex-row lg:grid lg:grid-cols-3 lg:grid-rows-1 lg:gap-0 px-7"
        >
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
          <section class="lg:flex lg:items-center lg:justify-between">
            <!-- LOGO -->
            <div class="logo">
              <img
                class="block h-[40px]"
                src="https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/logos%2Flogofull.png?alt=media&token=ab3380f2-7913-4f93-b996-150248385736"
                alt="Logo"
              />
            </div>
          </section>
          <!--  -->
          <section
            class="hidden gap-5 md:flex lg:flex-row lg:justify-end right"
          >
            <Button
              :label="header"
              outlined
              icon="pi pi-user"
            />
          </section>
        </div>
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
</style>
