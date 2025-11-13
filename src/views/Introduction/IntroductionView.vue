<script setup lang="ts">
  import { ref } from 'vue';
  import { useToast } from 'primevue/usetoast';

  import HeaderThird from '~/components/HeaderThird.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { notifyError, notifySuccess } from '~/helper';
  import { STATUS_CODE } from '~/constants';
  import { AxiosError } from 'axios';
  import { useLocale } from '~/composables/useLocale';

  const toast = useToast();
  const { t } = useLocale();

  const curYear = new Date().getFullYear();
</script>

<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  <HeaderThird></HeaderThird>
  <div
    v-once
    class="w-full"
  >
    <div class="w-full flex min-h-screen justify-center bg-[#f6f6f6]">
      <div
        class="flex flex-col items-center justify-center w-11/12 px-4 py-6 my-12 mb-0 bg-white bg-background rounded-2xl max-w-7xl sm:px-6 xs:w-5/6 sm:w-2/3 md:px-12 lg:p-16 xl:p-20 max-h-[400px]"
      >
        <h3
          class="max-w-5xl text-lg font-bold leading-none tracking-tighter text-center text-primary sm:text-xl md:text-2xl lg:text-4xl lg:max-w-7xl"
        >
          {{ t('introduction.title') }}
        </h3>
        <p
          class="my-3 max-w-xl w-11/12 xs:w-[280px] mx-auto text-sm leading-relaxed text-center text-neutral-800 md:text-lg md:w-11/12 lg:w-3/5 md:my-6 lg:my-8"
        >
          {{ t('introduction.subtitle') }}
        </p>
        <div class="flex flex-col gap-5 lg:w-[50%] xs:flex-row">
          <router-link to="/study-module">
            <Button class="flex items-center justify-center w-full"
              >{{ t('introduction.createSet') }}</Button
            >
          </router-link>
          <router-link to="/card-sets">
            <Button
              severity="secondary"
              class="flex items-center justify-center w-full"
              >{{ t('introduction.viewCardSets') }}</Button
            >
          </router-link>
          <router-link to="/profile">
            <Button
              severity="secondary"
              class="flex items-center justify-center w-full"
              >{{ t('introduction.goToProfile') }}</Button
            >
          </router-link>
        </div>
      </div>
    </div>
  </div>
  <ScrollToTop></ScrollToTop>
</template>
