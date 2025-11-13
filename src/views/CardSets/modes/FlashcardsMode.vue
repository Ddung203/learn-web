<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { ICardSet } from '~/interfaces';
  import { useLocale } from '~/composables/useLocale';

  interface Props {
    cardSet: ICardSet;
  }

  const props = defineProps<Props>();
  const { t } = useLocale();

  const currentCardIndex = ref(0);
  const isFlipped = ref(false);
  const showingTerm = ref(true);

  const currentCard = computed(() => {
    if (!props.cardSet.cards || props.cardSet.cards.length === 0) return null;
    return props.cardSet.cards[currentCardIndex.value];
  });

  const progress = computed(() => {
    return {
      current: currentCardIndex.value + 1,
      total: props.cardSet.cards.length,
      percentage: ((currentCardIndex.value + 1) / props.cardSet.cards.length) * 100,
    };
  });

  const flipCard = () => {
    isFlipped.value = !isFlipped.value;
  };

  const nextCard = () => {
    if (props.cardSet.cards && currentCardIndex.value < props.cardSet.cards.length - 1) {
      currentCardIndex.value++;
      isFlipped.value = false;
    }
  };

  const previousCard = () => {
    if (currentCardIndex.value > 0) {
      currentCardIndex.value--;
      isFlipped.value = false;
    }
  };

  const restart = () => {
    currentCardIndex.value = 0;
    isFlipped.value = false;
  };

  const toggleStartingSide = () => {
    showingTerm.value = !showingTerm.value;
    isFlipped.value = false;
  };
</script>

<template>
  <!-- Empty State -->
  <div v-if="!currentCard" class="flex flex-col items-center justify-center py-20 text-center">
    <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
    <h2 class="mb-2 text-xl font-semibold text-gray-700">
      {{ t('studyModes.flashcards.noCards') }}
    </h2>
    <p class="text-gray-500">{{ t('studyModes.flashcards.noCardsDescription') }}</p>
  </div>

  <div v-else class="flex flex-col items-center">
    <!-- Controls -->
    <div class="w-full mb-6 flex justify-between items-center">
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          :label="t('studyModes.flashcards.restart')"
          severity="secondary"
          size="small"
          @click="restart"
        />
        <Button
          icon="pi pi-replay"
          :label="showingTerm ? t('studyModes.flashcards.startWithDefinition') : t('studyModes.flashcards.startWithTerm')"
          severity="secondary"
          size="small"
          @click="toggleStartingSide"
        />
      </div>
      <div class="text-gray-600">
        {{ progress.current }} / {{ progress.total }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full mb-8">
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-300"
          :style="{ width: `${progress.percentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Flashcard -->
    <div
      class="relative w-full max-w-2xl h-96 mb-8 perspective-1000"
      @click="flipCard"
    >
      <div
        :class="[
          'absolute inset-0 transition-transform duration-500 transform-style-3d cursor-pointer',
          isFlipped ? 'rotate-y-180' : '',
        ]"
      >
        <!-- Front Side -->
        <div
          :class="[
            'absolute inset-0 backface-hidden rounded-lg shadow-lg p-8 flex items-center justify-center bg-white border-2',
            isFlipped ? 'rotate-y-180' : '',
          ]"
        >
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-4">
              {{ showingTerm ? t('studyModule.terminology') : t('studyModule.definition') }}
            </div>
            <div class="text-3xl font-semibold">
              {{ showingTerm ? currentCard.terminology : currentCard.define }}
            </div>
          </div>
        </div>

        <!-- Back Side -->
        <div
          :class="[
            'absolute inset-0 backface-hidden rounded-lg shadow-lg p-8 flex items-center justify-center bg-blue-50 border-2 border-blue-500 rotate-y-180',
            isFlipped ? '' : 'rotate-y-180',
          ]"
        >
          <div class="text-center">
            <div class="text-sm text-blue-600 mb-4">
              {{ showingTerm ? t('studyModule.definition') : t('studyModule.terminology') }}
            </div>
            <div class="text-3xl font-semibold text-blue-900">
              {{ showingTerm ? currentCard.define : currentCard.terminology }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-4 items-center">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        :disabled="currentCardIndex === 0"
        @click="previousCard"
      >
        {{ t('common.previous') }}
      </Button>
      <Button
        icon="pi pi-replay"
        severity="info"
        @click="flipCard"
      >
        {{ t('common.flip') }}
      </Button>
      <Button
        icon="pi pi-arrow-right"
        :disabled="currentCardIndex === cardSet.cards.length - 1"
        @click="nextCard"
      >
        {{ t('common.next') }}
      </Button>
    </div>

    <!-- Completion Message -->
    <div
      v-if="currentCardIndex === cardSet.cards.length - 1 && isFlipped"
      class="mt-8 p-6 bg-green-50 border-2 border-green-500 rounded-lg text-center"
    >
      <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
      <h3 class="text-xl font-semibold text-green-900 mb-2">
        {{ t('studyModes.flashcards.completed') }}
      </h3>
      <p class="text-green-700 mb-4">{{ t('studyModes.flashcards.completedMessage') }}</p>
      <Button
        icon="pi pi-refresh"
        :label="t('studyModes.flashcards.restart')"
        @click="restart"
      />
    </div>
  </div>
</template>

<style scoped>
  .perspective-1000 {
    perspective: 1000px;
  }

  .transform-style-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }

  .rotate-y-180 {
    transform: rotateY(180deg);
  }
</style>
