<script setup lang="ts">
import { ref } from 'vue';
import HeaderThird from '~/components/HeaderThird.vue';
import { useLocale } from '~/composables/useLocale';
import { useRouter } from 'vue-router';

const { t } = useLocale();
const router = useRouter();

type GuideItem = 
  | { step: string; text: string; action?: () => void }
  | { icon: string; name: string; desc: string }
  | { text: string; action?: () => void };

const sections = ref<Array<{
  title: string;
  icon: string;
  color: string;
  bg: string;
  items: GuideItem[];
}>>([
  {
    title: t('guide.gettingStarted.title'),
    icon: 'pi pi-play-circle',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      { step: '1', text: t('guide.gettingStarted.step1'), action: () => router.push('/login') },
      { step: '2', text: t('guide.gettingStarted.step2'), action: () => router.push('/study-module') },
      { step: '3', text: t('guide.gettingStarted.step3') }
    ]
  },
  {
    title: t('guide.createCardSet.title'),
    icon: 'pi pi-plus-circle',
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: [
      { text: t('guide.createCardSet.step1') },
      { text: t('guide.createCardSet.step2') },
      { text: t('guide.createCardSet.step3') },
      { text: t('guide.createCardSet.step4') }
    ]
  },
  {
    title: t('guide.studyModes.title'),
    icon: 'pi pi-book',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    items: [
      { icon: 'pi-clone', name: t('guide.studyModes.flashcards'), desc: t('guide.studyModes.flashcardsDesc') },
      { icon: 'pi-star', name: t('guide.studyModes.learn'), desc: t('guide.studyModes.learnDesc') },
      { icon: 'pi-check-square', name: t('guide.studyModes.test'), desc: t('guide.studyModes.testDesc') },
      { icon: 'pi-pencil', name: t('guide.studyModes.write'), desc: t('guide.studyModes.writeDesc') },
      { icon: 'pi-volume-up', name: t('guide.studyModes.listen'), desc: t('guide.studyModes.listenDesc') }
    ]
  },
  {
    title: t('guide.sharing.title'),
    icon: 'pi pi-share-alt',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    items: [
      { text: t('guide.sharing.step1') },
      { text: t('guide.sharing.step2') },
      { text: t('guide.sharing.step3'), action: () => router.push('/import-shared') }
    ]
  },
  {
    title: t('guide.library.title'),
    icon: 'pi pi-globe',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    items: [
      { text: t('guide.library.step1'), action: () => router.push('/global-card-sets') },
      { text: t('guide.library.step2') },
      { text: t('guide.library.step3') }
    ]
  },
  {
    title: t('guide.statistics.title'),
    icon: 'pi pi-chart-line',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    items: [
      { text: t('guide.statistics.item1') },
      { text: t('guide.statistics.item2') },
      { text: t('guide.statistics.item3') },
      { text: t('guide.statistics.item4'), action: () => router.push('/statistics') }
    ]
  }
]);
</script>

<template>
  <HeaderThird />
  <div class="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12">
        <i class="pi pi-question-circle text-6xl text-primary mb-4"></i>
        <h1 class="text-4xl font-bold text-gray-800 mb-3">{{ t('guide.title') }}</h1>
        <p class="text-gray-600 text-lg">{{ t('guide.subtitle') }}</p>
      </div>

      <div class="grid gap-8">
        <Card v-for="(section, idx) in sections" :key="idx" class="hover:shadow-xl transition-all">
          <template #content>
            <div class="flex items-center gap-3 mb-6">
              <div :class="[section.bg, 'rounded-lg p-3']">
                <i :class="[section.icon, section.color, 'text-3xl']"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-800">{{ section.title }}</h2>
            </div>

            <div class="space-y-3">
              <div v-for="(item, i) in section.items" :key="i" class="flex gap-3 items-start">
                <div v-if="'step' in item" class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {{ (item as any).step }}
                </div>
                <i v-else-if="'icon' in item" :class="['pi', (item as any).icon, 'text-primary text-xl mt-1 flex-shrink-0']"></i>
                <div v-else class="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                
                <div class="flex-1">
                  <p v-if="'name' in item" class="font-semibold text-gray-800 mb-1">{{ (item as any).name }}</p>
                  <p class="text-gray-600 leading-relaxed">{{ (item as any).text || (item as any).desc }}</p>
                  <Button v-if="'action' in item && (item as any).action" @click="(item as any).action()" text size="small" class="mt-2">
                    {{ t('guide.goNow') }} <i class="pi pi-arrow-right ml-2"></i>
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
