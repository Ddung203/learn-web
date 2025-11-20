<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useCardSetStore, useStatisticsStore } from '~/stores';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';
  import type { ICreateSessionRequest } from '~/interfaces/statistics.interface';
  import { ttsService } from '~/services';

  type LearningMode = 'write' | 'multipleChoice' | 'both';
  type QuestionType = 'write' | 'multipleChoice';

  interface LearnCard {
    card: ICardSetCard;
    correctCount: number;
    incorrectCount: number;
    mastered: boolean;
    attempts: number;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();
  const statisticsStore = useStatisticsStore();

  const cardSet = ref<ICardSet | null>(null);
  const queue = ref<LearnCard[]>([]);
  const masteredCards = ref<LearnCard[]>([]);
  const currentCard = ref<LearnCard | null>(null);
  const userAnswer = ref('');
  const selectedOption = ref('');
  const showAnswer = ref(false);
  const sessionComplete = ref(false);
  const learningMode = ref<LearningMode | null>(null);
  const currentQuestionType = ref<QuestionType>('write');
  const multipleChoiceOptions = ref<string[]>([]);

  // Statistics tracking
  const startTime = ref<number>(0);
  const sessionRecorded = ref(false);
  const isPlayingAudio = ref(false);

  const progress = computed(() => {
    const total = queue.value.length + masteredCards.value.length;
    return {
      mastered: masteredCards.value.length,
      total,
      remaining: queue.value.length,
      percentage: total > 0 ? (masteredCards.value.length / total) * 100 : 0,
    };
  });

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    return normalizeString(userAnswer) === normalizeString(correctAnswer);
  };

  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectLearningMode = (mode: LearningMode) => {
    learningMode.value = mode;
    startTime.value = Date.now(); // Start tracking time when mode is selected
    initializeLearning();
  };

  const determineQuestionType = (): QuestionType => {
    if (learningMode.value === 'write') return 'write';
    if (learningMode.value === 'multipleChoice') return 'multipleChoice';
    // For 'both' mode, randomly choose
    return Math.random() < 0.5 ? 'write' : 'multipleChoice';
  };

  const generateMultipleChoiceOptions = (correctAnswer: string) => {
    if (!cardSet.value?.cards || cardSet.value.cards.length < 2) {
      multipleChoiceOptions.value = [correctAnswer];
      return;
    }

    const otherCards = cardSet.value.cards.filter(
      (c) => c.define !== correctAnswer
    );
    const wrongOptions = shuffleArray(otherCards)
      .slice(0, 3)
      .map((c) => c.define);

    multipleChoiceOptions.value = shuffleArray([
      correctAnswer,
      ...wrongOptions,
    ]);
  };

  const initializeLearning = () => {
    if (!cardSet.value?.cards || cardSet.value.cards.length === 0) {
      queue.value = [];
      return;
    }

    const shuffled = shuffleArray(cardSet.value.cards);
    queue.value = shuffled.map((card) => ({
      card,
      correctCount: 0,
      incorrectCount: 0,
      mastered: false,
      attempts: 0,
    }));

    masteredCards.value = [];
    currentCard.value = queue.value[0];
    prepareQuestion();
  };

  const prepareQuestion = () => {
    if (!currentCard.value) return;

    currentQuestionType.value = determineQuestionType();
    userAnswer.value = '';
    selectedOption.value = '';
    showAnswer.value = false;

    if (currentQuestionType.value === 'multipleChoice') {
      generateMultipleChoiceOptions(currentCard.value.card.define);
    }
  };

  const showAnswerForReview = () => {
    showAnswer.value = true;

    // If user already selected an option in multiple choice, treat it as submission
    if (
      currentQuestionType.value === 'multipleChoice' &&
      selectedOption.value &&
      currentCard.value
    ) {
      currentCard.value.attempts++;
      const isCorrect = checkAnswer(
        selectedOption.value,
        currentCard.value.card.define
      );

      if (isCorrect) {
        currentCard.value.correctCount++;

        if (currentCard.value.correctCount >= 2) {
          currentCard.value.mastered = true;

          toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('studyModes.learn.toast.mastered'),
            life: 2000,
          });
        }
      } else {
        currentCard.value.incorrectCount++;
        currentCard.value.correctCount = 0;
      }
    }

    // Same for write mode if user typed something
    if (
      currentQuestionType.value === 'write' &&
      userAnswer.value.trim() &&
      currentCard.value
    ) {
      currentCard.value.attempts++;
      const isCorrect = checkAnswer(
        userAnswer.value,
        currentCard.value.card.define
      );

      if (isCorrect) {
        currentCard.value.correctCount++;

        if (currentCard.value.correctCount >= 2) {
          currentCard.value.mastered = true;

          toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('studyModes.learn.toast.mastered'),
            life: 2000,
          });
        }
      } else {
        currentCard.value.incorrectCount++;
        currentCard.value.correctCount = 0;
      }
    }
  };

  const markAsKnown = () => {
    if (!currentCard.value) return;

    currentCard.value.correctCount++;
    currentCard.value.attempts++;

    // Cần 2 lần đúng để mastered
    if (currentCard.value.correctCount >= 2) {
      currentCard.value.mastered = true;
      masteredCards.value.push(currentCard.value);
      queue.value.shift();

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('studyModes.learn.toast.mastered'),
        life: 2000,
      });
    } else {
      // Move to end of queue
      queue.value.shift();
      queue.value.push(currentCard.value);
    }

    nextCard();
  };

  const markAsUnknown = () => {
    if (!currentCard.value) return;

    currentCard.value.incorrectCount++;
    currentCard.value.attempts++;
    currentCard.value.correctCount = 0;

    const card = queue.value.shift();
    if (card) {
      queue.value.push(card);
    }

    nextCard();
  };

  const continueToNext = () => {
    if (!currentCard.value) return;

    // Handle mastered cards
    if (currentCard.value.mastered) {
      masteredCards.value.push(currentCard.value);
      queue.value.shift();
    } else {
      // Move to end of queue
      const card = queue.value.shift();
      if (card) {
        queue.value.push(card);
      }
    }

    nextCard();
  };

  const submitAnswer = () => {
    if (!currentCard.value) return;

    const answer =
      currentQuestionType.value === 'write'
        ? userAnswer.value
        : selectedOption.value;
    if (!answer.trim()) return;

    currentCard.value.attempts++;
    const isCorrect = checkAnswer(answer, currentCard.value.card.define);

    if (isCorrect) {
      currentCard.value.correctCount++;

      if (currentCard.value.correctCount >= 2) {
        currentCard.value.mastered = true;

        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('studyModes.learn.toast.mastered'),
          life: 2000,
        });
      }
    } else {
      currentCard.value.incorrectCount++;
      currentCard.value.correctCount = 0;
    }

    showAnswer.value = true;
  };

  const nextCard = () => {
    if (queue.value.length === 0) {
      sessionComplete.value = true;
      return;
    }

    currentCard.value = queue.value[0];
    prepareQuestion();
  };

  const restart = async () => {
    await recordStudySession();
    sessionComplete.value = false;
    learningMode.value = null;
    userAnswer.value = '';
    selectedOption.value = '';
    showAnswer.value = false;
    sessionRecorded.value = false;
  };

  const restartSameMode = async () => {
    await recordStudySession();
    initializeLearning();
    sessionComplete.value = false;
    sessionRecorded.value = false;
    startTime.value = Date.now(); // Reset start time for new session
  };

  const goBack = async () => {
    await recordStudySession();
    router.push(`/card-sets/${route.params.id}`);
  };

  const recordStudySession = async () => {
    if (
      sessionRecorded.value ||
      !cardSet.value ||
      !learningMode.value ||
      masteredCards.value.length === 0
    ) {
      return;
    }

    sessionRecorded.value = true;

    const endTime = Date.now();
    const allCards = [...masteredCards.value, ...queue.value];

    // Map learn mode to statistics mode
    const modeMap: Record<LearningMode, 'learn' | 'learn' | 'learn'> = {
      write: 'learn',
      multipleChoice: 'learn',
      both: 'learn',
    };

    const sessionData: ICreateSessionRequest = {
      cardset_id: cardSet.value.id,
      mode: modeMap[learningMode.value],
      start_time: new Date(startTime.value).toISOString(),
      end_time: new Date(endTime).toISOString(),
      attempts: allCards
        .filter((card) => card.attempts > 0)
        .map((card) => ({
          card_id: card.card.id,
          correct: card.mastered || card.correctCount > card.incorrectCount,
          time_spent: Math.floor(
            (endTime - startTime.value) /
              1000 /
              allCards.filter((c) => c.attempts > 0).length
          ),
          user_answer: card.mastered ? 'mastered' : 'in-progress',
          attempted_at: new Date(endTime).toISOString(),
        })),
    };

    await statisticsStore.recordSession(sessionData);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !showAnswer.value && userAnswer.value.trim()) {
      submitAnswer();
    }
  };

  const selectMultipleChoiceOption = (option: string) => {
    if (!showAnswer.value) {
      selectedOption.value = option;
    }
  };

  const getOptionClass = (option: string) => {
    if (!showAnswer.value) {
      return selectedOption.value === option
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50';
    }

    if (!currentCard.value) return 'border-gray-300';

    if (option === currentCard.value.card.define) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-200';
    }

    if (
      option === selectedOption.value &&
      option !== currentCard.value.card.define
    ) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-200';
    }

    return 'border-gray-300 opacity-60';
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

  const playTerminology = async () => {
    if (!currentCard.value || isPlayingAudio.value) return;

    try {
      isPlayingAudio.value = true;
      await ttsService.playText(currentCard.value.card.terminology);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      isPlayingAudio.value = false;
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      if (
        event.key === 'Enter' &&
        currentQuestionType.value === 'write' &&
        !showAnswer.value
      ) {
        submitAnswer();
      }
      return;
    }

    // Mode selection screen
    if (!learningMode.value && !sessionComplete.value) {
      if (event.key === '1') {
        event.preventDefault();
        selectLearningMode('write');
      } else if (event.key === '2') {
        event.preventDefault();
        selectLearningMode('multipleChoice');
      } else if (event.key === '3') {
        event.preventDefault();
        selectLearningMode('both');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
      return;
    }

    // During learning session
    if (learningMode.value && !sessionComplete.value && currentCard.value) {
      if (currentQuestionType.value === 'multipleChoice' && !showAnswer.value) {
        const optionMap: { [key: string]: number } = {
          '1': 0,
          a: 0,
          A: 0,
          '2': 1,
          b: 1,
          B: 1,
          '3': 2,
          c: 2,
          C: 2,
          '4': 3,
          d: 3,
          D: 3,
        };

        if (event.key in optionMap) {
          event.preventDefault();
          const index = optionMap[event.key];
          if (index < multipleChoiceOptions.value.length) {
            selectMultipleChoiceOption(multipleChoiceOptions.value[index]);
          }
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (
          showAnswer.value &&
          (userAnswer.value.trim() || selectedOption.value)
        ) {
          // If answer is showing and user answered, continue to next
          continueToNext();
        } else if (
          !showAnswer.value &&
          (userAnswer.value.trim() || selectedOption.value)
        ) {
          // If no answer showing yet, submit
          submitAnswer();
        }
      } else if (event.key === ' ' && !showAnswer.value) {
        event.preventDefault();
        showAnswerForReview();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
    }

    // Session complete
    if (sessionComplete.value) {
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        restartSameMode();
      } else if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        restart();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
    }
  };

  onMounted(() => {
    loadCardSet();
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(async () => {
    window.removeEventListener('keydown', handleKeyDown);
    await recordStudySession();
  });

  // Watch for session completion to record statistics
  watch(sessionComplete, async (isComplete) => {
    if (isComplete) {
      await recordStudySession();
    }
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full py-6 min-h-svh">
    <div class="flex flex-col w-full px-5 lg:px-0 lg:max-w-4xl">
      <!-- Header -->
      <div class="mb-6">
        <Button
          icon="pi pi-arrow-left"
          :label="t('common.backToHome')"
          text
          @click="goBack"
        />
        <h1 class="mt-2 text-2xl font-bold">{{ cardSet?.title }}</h1>
        <p class="text-gray-600">{{ t('studyModes.learn.title') }}</p>
      </div>

      <!-- Learning Mode Selection -->
      <div
        v-if="!learningMode && !sessionComplete"
        class="w-full"
      >
        <Card class="mb-6">
          <template #content>
            <div class="py-8 text-center">
              <i class="mb-6 text-6xl text-purple-500 pi pi-cog"></i>
              <h2 class="mb-4 text-2xl font-bold">
                {{ t('studyModes.learn.selectMode') }}
              </h2>
              <p class="mb-8 text-gray-600">
                {{ t('studyModes.learn.selectModeDescription') }}
              </p>

              <div
                class="grid max-w-4xl grid-cols-1 gap-4 mx-auto md:grid-cols-3"
              >
                <!-- Write Mode -->
                <Card
                  class="transition-all border-2 border-transparent cursor-pointer hover:shadow-lg hover:scale-105 hover:border-purple-300"
                  @click="selectLearningMode('write')"
                >
                  <template #content>
                    <div class="py-4 text-center">
                      <i class="mb-4 text-5xl text-purple-500 pi pi-pencil"></i>
                      <h3 class="mb-2 text-lg font-semibold">
                        {{ t('studyModes.learn.modes.write.title') }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ t('studyModes.learn.modes.write.description') }}
                      </p>
                    </div>
                  </template>
                </Card>

                <!-- Multiple Choice Mode -->
                <Card
                  class="transition-all border-2 border-transparent cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300"
                  @click="selectLearningMode('multipleChoice')"
                >
                  <template #content>
                    <div class="py-4 text-center">
                      <i class="mb-4 text-5xl text-blue-500 pi pi-list"></i>
                      <h3 class="mb-2 text-lg font-semibold">
                        {{ t('studyModes.learn.modes.multipleChoice.title') }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{
                          t('studyModes.learn.modes.multipleChoice.description')
                        }}
                      </p>
                    </div>
                  </template>
                </Card>

                <!-- Both Mode -->
                <Card
                  class="transition-all border-2 border-transparent cursor-pointer hover:shadow-lg hover:scale-105 hover:border-green-300"
                  @click="selectLearningMode('both')"
                >
                  <template #content>
                    <div class="py-4 text-center">
                      <i class="mb-4 text-5xl text-green-500 pi pi-star"></i>
                      <h3 class="mb-2 text-lg font-semibold">
                        {{ t('studyModes.learn.modes.both.title') }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ t('studyModes.learn.modes.both.description') }}
                      </p>
                    </div>
                  </template>
                </Card>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!currentCard && !sessionComplete && learningMode"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <i
          class="mb-4 pi pi-inbox"
          style="font-size: 4rem; color: #94a3b8"
        ></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('studyModes.learn.noCards') }}
        </h2>
        <p class="text-gray-500">
          {{ t('studyModes.learn.noCardsDescription') }}
        </p>
      </div>

      <!-- Learning Session -->
      <div
        v-else-if="!sessionComplete && currentCard && learningMode"
        class="w-full"
      >
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              <i class="mr-1 text-green-500 pi pi-check-circle"></i>
              {{ t('studyModes.learn.mastered') }}: {{ progress.mastered }} /
              {{ progress.total }}
            </span>
            <span class="text-sm font-medium text-orange-600">
              <i class="mr-1 pi pi-clock"></i>
              {{ t('studyModes.learn.remaining') }}: {{ progress.remaining }}
            </span>
          </div>
          <div class="h-3 overflow-hidden bg-gray-200 rounded-full">
            <div
              class="h-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              :style="{ width: `${progress.percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Learning Card -->
        <Card class="mb-6">
          <template #content>
            <div class="text-center">
              <div
                class="flex items-center justify-center gap-2 mb-2 text-sm tracking-wide text-gray-500 uppercase"
              >
                <i
                  :class="[
                    'pi',
                    currentQuestionType === 'write'
                      ? 'pi-pencil text-purple-500'
                      : 'pi-list text-blue-500',
                  ]"
                ></i>
                {{ t('studyModes.learn.defineThis') }}
              </div>
              
              <!-- Image if available -->
              <div v-if="currentCard.card.image_url" class="mb-4 flex justify-center">
                <img
                  :src="currentCard.card.image_url"
                  :alt="currentCard.card.terminology"
                  class="max-h-64 rounded-lg border-2 border-gray-200 object-contain"
                />
              </div>
              
              <div class="flex items-center justify-center gap-3 mb-6">
                <div class="text-3xl font-semibold text-gray-900">
                  {{ currentCard.card.terminology }}
                </div>
                <Button
                  icon="pi pi-volume-up"
                  rounded
                  text
                  :loading="isPlayingAudio"
                  @click="playTerminology"
                  class="text-orange-500 hover:bg-orange-50"
                  aria-label="Play pronunciation"
                />
              </div>

              <!-- Difficulty Indicator -->
              <div
                v-if="currentCard.attempts > 0"
                class="mb-4"
              >
                <span
                  class="px-3 py-1 text-xs rounded-full"
                  :class="{
                    'bg-green-100 text-green-700':
                      currentCard.correctCount > currentCard.incorrectCount,
                    'bg-yellow-100 text-yellow-700':
                      currentCard.correctCount === currentCard.incorrectCount,
                    'bg-red-100 text-red-700':
                      currentCard.correctCount < currentCard.incorrectCount,
                  }"
                >
                  {{ currentCard.correctCount }}✓
                  {{ currentCard.incorrectCount }}✗
                </span>
              </div>

              <!-- Write Answer Mode -->
              <div
                v-if="currentQuestionType === 'write' && !showAnswer"
                class="mb-4"
              >
                <InputText
                  v-model="userAnswer"
                  :placeholder="t('studyModes.learn.placeholder')"
                  class="w-full p-4 mb-4 text-lg"
                  @keypress="handleKeyPress"
                  autofocus
                />
                <div class="flex justify-center gap-3">
                  <Button
                    :label="t('studyModes.learn.check')"
                    :disabled="!userAnswer.trim()"
                    @click="submitAnswer"
                    class="flex-1 max-w-xs"
                  />
                  <Button
                    :label="t('studyModes.learn.showAnswer')"
                    severity="secondary"
                    @click="showAnswerForReview"
                    class="flex-1 max-w-xs"
                  />
                </div>
              </div>

              <!-- Multiple Choice Mode -->
              <div
                v-if="currentQuestionType === 'multipleChoice' && !showAnswer"
                class="mb-4"
              >
                <div class="mb-4 space-y-3">
                  <div
                    v-for="(option, index) in multipleChoiceOptions"
                    :key="index"
                    :class="[
                      'p-4 border-2 rounded-lg cursor-pointer transition-all',
                      getOptionClass(option),
                    ]"
                    @click="selectMultipleChoiceOption(option)"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="flex items-center justify-center w-8 h-8 font-semibold text-gray-700 bg-gray-100 rounded-full"
                      >
                        {{ String.fromCharCode(65 + index) }}
                      </span>
                      <span class="flex-1 text-left">{{ option }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex justify-center gap-3">
                  <Button
                    :label="t('studyModes.learn.check')"
                    :disabled="!selectedOption"
                    @click="submitAnswer"
                    class="flex-1 max-w-xs"
                  />
                  <Button
                    :label="t('studyModes.learn.showAnswer')"
                    severity="secondary"
                    @click="showAnswerForReview"
                    class="flex-1 max-w-xs"
                  />
                </div>
              </div>

              <!-- Answer Display -->
              <div
                v-if="showAnswer"
                class="mb-4"
              >
                <div
                  class="p-6 mb-4 border-2 border-blue-500 rounded-lg bg-blue-50"
                >
                  <div
                    class="mb-2 text-sm font-semibold tracking-wide text-blue-600 uppercase"
                  >
                    {{ t('studyModes.learn.correctAnswer') }}
                  </div>
                  <div class="text-2xl font-semibold text-blue-900">
                    {{ currentCard.card.define }}
                  </div>
                </div>

                <!-- Feedback for Write Mode -->
                <div
                  v-if="currentQuestionType === 'write' && userAnswer"
                  class="mb-4"
                >
                  <div
                    v-if="checkAnswer(userAnswer, currentCard.card.define)"
                    class="p-4 border-2 border-green-500 rounded-lg bg-green-50"
                  >
                    <div
                      class="flex items-center justify-center gap-2 text-green-700"
                    >
                      <i class="text-2xl pi pi-check-circle"></i>
                      <span class="text-lg font-semibold">{{
                        t('studyModes.learn.correctFeedback')
                      }}</span>
                    </div>
                    <div
                      v-if="currentCard.correctCount < 2"
                      class="mt-2 text-sm text-green-600"
                    >
                      {{ t('studyModes.learn.needOneMore') }}
                    </div>
                  </div>
                  <div
                    v-else
                    class="p-4 border-2 border-red-500 rounded-lg bg-red-50"
                  >
                    <div
                      class="flex items-center justify-center gap-2 mb-2 text-red-700"
                    >
                      <i class="text-2xl pi pi-times-circle"></i>
                      <span class="text-lg font-semibold">{{
                        t('studyModes.learn.incorrectFeedback')
                      }}</span>
                    </div>
                    <div class="text-sm text-gray-700">
                      {{ t('studyModes.learn.yourAnswer') }}:
                      <strong>{{ userAnswer }}</strong>
                    </div>
                    <div class="mt-2 text-sm text-red-600">
                      {{ t('studyModes.learn.addedToQueue') }}
                    </div>
                  </div>
                </div>

                <!-- Feedback for Multiple Choice Mode -->
                <div
                  v-if="
                    currentQuestionType === 'multipleChoice' && selectedOption
                  "
                  class="mb-4"
                >
                  <div
                    v-if="checkAnswer(selectedOption, currentCard.card.define)"
                    class="p-4 border-2 border-green-500 rounded-lg bg-green-50"
                  >
                    <div
                      class="flex items-center justify-center gap-2 text-green-700"
                    >
                      <i class="text-2xl pi pi-check-circle"></i>
                      <span class="text-lg font-semibold">{{
                        t('studyModes.learn.correctFeedback')
                      }}</span>
                    </div>
                    <div
                      v-if="currentCard.correctCount < 2"
                      class="mt-2 text-sm text-green-600"
                    >
                      {{ t('studyModes.learn.needOneMore') }}
                    </div>
                  </div>
                  <div
                    v-else
                    class="p-4 border-2 border-red-500 rounded-lg bg-red-50"
                  >
                    <div
                      class="flex items-center justify-center gap-2 mb-2 text-red-700"
                    >
                      <i class="text-2xl pi pi-times-circle"></i>
                      <span class="text-lg font-semibold">{{
                        t('studyModes.learn.incorrectFeedback')
                      }}</span>
                    </div>
                    <div class="text-sm text-gray-700">
                      {{ t('studyModes.learn.yourAnswer') }}:
                      <strong>{{ selectedOption }}</strong>
                    </div>
                    <div class="mt-2 text-sm text-red-600">
                      {{ t('studyModes.learn.addedToQueue') }}
                    </div>
                  </div>
                </div>

                <!-- Rate Understanding (if didn't answer) -->
                <div v-if="!userAnswer && !selectedOption">
                  <div class="mb-4 text-sm text-gray-600">
                    {{ t('studyModes.learn.rateUnderstanding') }}
                  </div>
                  <div class="flex justify-center gap-3">
                    <Button
                      icon="pi pi-check"
                      :label="t('studyModes.learn.iKnowThis')"
                      severity="success"
                      @click="markAsKnown"
                      class="flex-1 max-w-xs"
                    />
                    <Button
                      icon="pi pi-times"
                      :label="t('studyModes.learn.studyAgain')"
                      severity="danger"
                      @click="markAsUnknown"
                      class="flex-1 max-w-xs"
                    />
                  </div>
                </div>

                <!-- Continue Button (if answered) -->
                <div
                  v-if="userAnswer || selectedOption"
                  class="mt-4"
                >
                  <Button
                    icon="pi pi-arrow-right"
                    :label="t('studyModes.learn.continue')"
                    size="large"
                    @click="continueToNext"
                    class="w-full max-w-md mx-auto"
                  />
                </div>
              </div>

              <div class="mt-4 text-xs text-gray-400">
                <i class="mr-1 pi pi-info-circle"></i>
                {{ t('studyModes.learn.progressInfo') }}
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Session Complete -->
      <div
        v-else-if="sessionComplete"
        class="w-full"
      >
        <Card>
          <template #content>
            <div class="py-4 text-center">
              <div class="flex items-center justify-center gap-4 mb-4">
                <i class="text-4xl text-yellow-500 pi pi-trophy"></i>
                <div class="text-left">
                  <h2 class="text-2xl font-bold">
                    {{ t('studyModes.learn.congratulations') }}
                  </h2>
                  <p class="text-sm text-gray-600">
                    {{ t('studyModes.learn.completedMessage') }}
                  </p>
                </div>
              </div>

              <!-- Statistics -->
              <div class="flex justify-center gap-3 mb-4">
                <div
                  class="px-4 py-2 border border-green-500 rounded-lg bg-green-50"
                >
                  <span class="text-2xl font-bold text-green-700">{{
                    masteredCards.length
                  }}</span>
                  <span class="ml-2 text-xs text-green-600">{{
                    t('studyModes.learn.cardsMastered')
                  }}</span>
                </div>
                <div
                  class="px-4 py-2 border border-blue-500 rounded-lg bg-blue-50"
                >
                  <span class="text-2xl font-bold text-blue-700">{{
                    masteredCards.reduce((sum, c) => sum + c.correctCount, 0)
                  }}</span>
                  <span class="ml-2 text-xs text-blue-600">{{
                    t('studyModes.learn.totalCorrect')
                  }}</span>
                </div>
              </div>

              <div class="flex flex-wrap justify-center gap-2">
                <Button
                  icon="pi pi-refresh"
                  :label="t('studyModes.learn.practiceAgainSameMode')"
                  @click="restartSameMode"
                />
                <Button
                  icon="pi pi-cog"
                  :label="t('studyModes.learn.changeModeAndRestart')"
                  severity="secondary"
                  @click="restart"
                />
                <Button
                  icon="pi pi-arrow-left"
                  :label="t('common.backToHome')"
                  severity="secondary"
                  @click="goBack"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
