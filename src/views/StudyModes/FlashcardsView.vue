<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet } from '~/interfaces';
  import { useCardSetStore, useStatisticsStore } from '~/stores';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';
  import type { ICreateSessionRequest } from '~/interfaces/statistics.interface';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();
  const statisticsStore = useStatisticsStore();

  const cardSet = ref<ICardSet | null>(null);
  const currentCardIndex = ref(0);
  const isFlipped = ref(false);
  const showingTerm = ref(true);

  // Swipe state
  const touchStartX = ref(0);
  const touchEndX = ref(0);
  const isDragging = ref(false);
  const dragOffset = ref(0);
  const swipeDirection = ref<'left' | 'right' | null>(null);
  const preventClick = ref(false);

  // Statistics tracking
  const startTime = ref<number>(Date.now());
  const viewedCards = ref<Set<string>>(new Set());
  const sessionRecorded = ref(false);

  const currentCard = computed(() => {
    if (!cardSet.value?.cards || cardSet.value.cards.length === 0) return null;
    return cardSet.value.cards[currentCardIndex.value];
  });

  const progress = computed(() => {
    if (!cardSet.value?.cards) return { current: 0, total: 0, percentage: 0 };
    return {
      current: currentCardIndex.value + 1,
      total: cardSet.value.cards.length,
      percentage:
        ((currentCardIndex.value + 1) / cardSet.value.cards.length) * 100,
    };
  });

  const flipCard = () => {
    isFlipped.value = !isFlipped.value;
  };

  const nextCard = () => {
    if (
      cardSet.value?.cards &&
      currentCardIndex.value < cardSet.value.cards.length - 1
    ) {
      trackCardView();
      currentCardIndex.value++;
      isFlipped.value = false;
    }
  };

  const previousCard = () => {
    if (currentCardIndex.value > 0) {
      trackCardView();
      currentCardIndex.value--;
      isFlipped.value = false;
    }
  };

  const restart = () => {
    trackCardView();
    currentCardIndex.value = 0;
    isFlipped.value = false;
  };

  const trackCardView = () => {
    if (currentCard.value) {
      viewedCards.value.add(currentCard.value.id);
    }
  };

  const toggleStartingSide = () => {
    showingTerm.value = !showingTerm.value;
    isFlipped.value = false;
  };

  const goBack = async () => {
    await recordStudySession();
    router.push(`/card-sets/${route.params.id}`);
  };

  const recordStudySession = async () => {
    if (
      sessionRecorded.value ||
      !cardSet.value ||
      viewedCards.value.size === 0
    ) {
      return;
    }

    trackCardView(); // Track current card before recording
    sessionRecorded.value = true;

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime.value) / 1000); // in seconds
    const avgTimePerCard = Math.floor(totalTime / viewedCards.value.size);

    const sessionData: ICreateSessionRequest = {
      cardset_id: cardSet.value.id,
      mode: 'flashcard',
      start_time: new Date(startTime.value).toISOString(),
      end_time: new Date(endTime).toISOString(),
      attempts: Array.from(viewedCards.value).map((cardId) => ({
        card_id: cardId,
        correct: true, // Flashcards are passive learning, mark all as viewed
        time_spent: avgTimePerCard,
        user_answer: '', // No answer in flashcard mode
        attempted_at: new Date(endTime).toISOString(),
      })),
    };

    await statisticsStore.recordSession(sessionData);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX;
    isDragging.value = true;
    swipeDirection.value = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.value) return;

    touchEndX.value = e.touches[0].clientX;
    dragOffset.value = touchEndX.value - touchStartX.value;

    // Determine swipe direction for visual feedback
    if (Math.abs(dragOffset.value) > 20) {
      swipeDirection.value = dragOffset.value > 0 ? 'right' : 'left';
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.value) return;

    const swipeThreshold = 100; // minimum distance for a swipe
    const diff = touchEndX.value - touchStartX.value;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe right - previous card
        previousCard();
      } else {
        // Swipe left - next card
        nextCard();
      }
    }

    // Reset
    isDragging.value = false;
    dragOffset.value = 0;
    swipeDirection.value = null;
    touchStartX.value = 0;
    touchEndX.value = 0;
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: MouseEvent) => {
    touchStartX.value = e.clientX;
    touchEndX.value = e.clientX;
    isDragging.value = false;
    swipeDirection.value = null;
    preventClick.value = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (touchStartX.value === 0) return;

    touchEndX.value = e.clientX;
    const diff = touchEndX.value - touchStartX.value;

    // Only consider it dragging if moved more than 5px
    if (Math.abs(diff) > 5) {
      isDragging.value = true;
      preventClick.value = true; // Prevent click if dragged
      dragOffset.value = diff;

      if (Math.abs(diff) > 20) {
        swipeDirection.value = diff > 0 ? 'right' : 'left';
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (touchStartX.value === 0) return;

    const swipeThreshold = 100;
    const diff = touchEndX.value - touchStartX.value;

    // If dragged more than threshold, change card
    if (isDragging.value && Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        previousCard();
      } else {
        nextCard();
      }
    }

    // Reset
    isDragging.value = false;
    dragOffset.value = 0;
    swipeDirection.value = null;
    touchStartX.value = 0;
    touchEndX.value = 0;

    // Reset preventClick after a small delay to allow click event to check it
    setTimeout(() => {
      preventClick.value = false;
    }, 10);
  };

  const handleMouseLeave = () => {
    // Reset everything when mouse leaves
    isDragging.value = false;
    dragOffset.value = 0;
    swipeDirection.value = null;
    touchStartX.value = 0;
    touchEndX.value = 0;
    preventClick.value = false;
  };

  const handleCardClick = () => {
    if (!preventClick.value) {
      flipCard();
    }
  };

  const loadCardSet = () => {
    const cardSetId = route.params.id as string;
    const foundCardSet = cardSetStore.getCardSetById(cardSetId);

    if (!foundCardSet) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('cardSets.toast.notFound'),
        life: 3000,
      });
      router.push('/card-sets');
      return;
    }

    cardSet.value = foundCardSet;
  };

  // Keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        flipCard();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        previousCard();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextCard();
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        restart();
        break;
      case 'Escape':
        event.preventDefault();
        goBack();
        break;
    }
  };

  onMounted(() => {
    loadCardSet();
    window.addEventListener('keydown', handleKeyDown);
    startTime.value = Date.now();
  });

  onUnmounted(async () => {
    window.removeEventListener('keydown', handleKeyDown);
    await recordStudySession();
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full py-6 min-h-svh">
    <div class="flex flex-col w-full px-5 lg:px-0 lg:max-w-5xl">
      <!-- Header -->
      <div class="mb-6">
        <Button
          icon="pi pi-arrow-left"
          :label="t('common.backToHome')"
          text
          @click="goBack"
        />
        <h1 class="mt-2 text-2xl font-bold">{{ cardSet?.title }}</h1>
        <p class="text-gray-600">{{ t('studyModes.flashcards.title') }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!currentCard"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <i
          class="mb-4 pi pi-inbox"
          style="font-size: 4rem; color: #94a3b8"
        ></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('studyModes.flashcards.noCards') }}
        </h2>
        <p class="text-gray-500">
          {{ t('studyModes.flashcards.noCardsDescription') }}
        </p>
      </div>

      <div
        v-else
        class="flex flex-col items-center"
      >
        <!-- Progress Bar -->
        <div class="w-full mb-6">
          <div
            class="flex items-center justify-between mb-2 text-sm text-gray-600"
          >
            <span>{{ progress.current }} / {{ progress.total }}</span>
            <span>{{ Math.round(progress.percentage) }}%</span>
          </div>
          <div class="h-2 overflow-hidden bg-gray-200 rounded-full">
            <div
              class="h-full transition-all duration-300 bg-blue-500"
              :style="{ width: `${progress.percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="flex flex-col items-center gap-2 mb-3">
          <div class="text-sm text-center text-gray-500">
            <i class="mr-2 pi pi-arrows-h"></i>
            {{ t('studyModes.flashcards.swipeInstruction') }}
          </div>
          <div class="flex gap-4 text-xs text-gray-400">
            <span
              ><kbd class="px-2 py-1 bg-gray-100 border rounded">Space</kbd>
              {{ t('studyModes.flashcards.toFlip') }}</span
            >
            <span
              ><kbd class="px-2 py-1 bg-gray-100 border rounded">←</kbd>
              <kbd class="px-2 py-1 bg-gray-100 border rounded">→</kbd>
              {{ t('common.navigate') }}</span
            >
            <span
              ><kbd class="px-2 py-1 bg-gray-100 border rounded">R</kbd>
              {{ t('studyModes.flashcards.restart') }}</span
            >
          </div>
        </div>

        <!-- Flashcard -->
        <div
          class="relative w-full max-w-2xl mb-8 cursor-pointer select-none h-96 perspective-1000"
          @click="handleCardClick"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
        >
          <!-- Swipe Indicators -->
          <div
            v-if="isDragging && swipeDirection === 'left'"
            class="absolute z-10 -translate-y-1/2 right-4 top-1/2 opacity-70"
          >
            <div class="flex flex-col items-center text-blue-500">
              <i class="mb-2 text-4xl pi pi-arrow-right"></i>
              <span class="text-sm font-semibold">{{ t('common.next') }}</span>
            </div>
          </div>
          <div
            v-if="isDragging && swipeDirection === 'right'"
            class="absolute z-10 -translate-y-1/2 left-4 top-1/2 opacity-70"
          >
            <div class="flex flex-col items-center text-blue-500">
              <i class="mb-2 text-4xl pi pi-arrow-left"></i>
              <span class="text-sm font-semibold">{{
                t('common.previous')
              }}</span>
            </div>
          </div>

          <div
            :class="[
              'absolute inset-0 transform-style-3d',
              isDragging ? '' : 'transition-transform duration-500',
              isFlipped ? 'rotate-y-180' : '',
            ]"
            :style="{
              transform:
                isDragging && !isFlipped
                  ? `translateX(${dragOffset}px) rotateY(${
                      dragOffset * 0.05
                    }deg)`
                  : isFlipped
                  ? 'rotateY(180deg)'
                  : '',
            }"
          >
            <!-- Front Side -->
            <div
              :class="[
                'absolute inset-0 backface-hidden rounded-lg shadow-lg p-8 flex flex-col items-center justify-center bg-white border-2',
                isFlipped ? 'rotate-y-180' : '',
              ]"
            >
              <div class="text-center">
                <div class="mb-4 text-sm tracking-wide text-gray-500 uppercase">
                  {{
                    showingTerm
                      ? t('studyModule.terminology')
                      : t('studyModule.definition')
                  }}
                </div>
                <div class="text-3xl font-semibold break-words">
                  {{
                    showingTerm ? currentCard.terminology : currentCard.define
                  }}
                </div>
                <div class="mt-6 text-sm text-gray-400">
                  <i class="mr-2 pi pi-replay"></i>
                  {{ t('studyModes.flashcards.clickToFlip') }}
                </div>
              </div>
            </div>

            <!-- Back Side -->
            <div
              :class="[
                'absolute inset-0 backface-hidden rounded-lg shadow-lg p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rotate-y-180',
                isFlipped ? '' : 'rotate-y-180',
              ]"
            >
              <div class="text-center">
                <div
                  class="mb-4 text-sm font-semibold tracking-wide text-blue-600 uppercase"
                >
                  {{
                    showingTerm
                      ? t('studyModule.definition')
                      : t('studyModule.terminology')
                  }}
                </div>
                <div class="text-3xl font-semibold text-blue-900 break-words">
                  {{
                    showingTerm ? currentCard.define : currentCard.terminology
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center gap-3 mb-4">
          <Button
            icon="pi pi-step-backward"
            rounded
            text
            severity="secondary"
            :disabled="currentCardIndex === 0"
            @click.stop="previousCard"
            class="w-12 h-12"
          />
          <Button
            icon="pi pi-replay"
            rounded
            severity="info"
            @click.stop="flipCard"
            class="w-14 h-14"
          />
          <Button
            icon="pi pi-step-forward"
            rounded
            text
            severity="secondary"
            :disabled="
              !cardSet || currentCardIndex === cardSet.cards.length - 1
            "
            @click.stop="nextCard"
            class="w-12 h-12"
          />
        </div>

        <!-- Control Buttons -->
        <div class="flex flex-wrap justify-center gap-2">
          <Button
            icon="pi pi-refresh"
            :label="t('studyModes.flashcards.restart')"
            severity="secondary"
            size="small"
            @click="restart"
          />
          <Button
            icon="pi pi-replay"
            :label="
              showingTerm
                ? t('studyModes.flashcards.startWithDefinition')
                : t('studyModes.flashcards.startWithTerm')
            "
            severity="secondary"
            size="small"
            @click="toggleStartingSide"
          />
        </div>

        <!-- Completion Message -->
        <div
          v-if="
            cardSet &&
            currentCardIndex === cardSet.cards.length - 1 &&
            isFlipped
          "
          class="max-w-lg p-6 mt-8 text-center border-2 border-green-500 rounded-lg bg-green-50"
        >
          <i class="mb-4 text-4xl text-green-500 pi pi-check-circle"></i>
          <h3 class="mb-2 text-xl font-semibold text-green-900">
            {{ t('studyModes.flashcards.completed') }}
          </h3>
          <p class="mb-4 text-green-700">
            {{ t('studyModes.flashcards.completedMessage') }}
          </p>
          <Button
            icon="pi pi-refresh"
            :label="t('studyModes.flashcards.restart')"
            @click="restart"
          />
        </div>
      </div>
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

  .select-none {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
</style>
