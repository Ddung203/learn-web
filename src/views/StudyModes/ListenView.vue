<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useCardSetStore, useStatisticsStore } from '~/stores';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';
  import type { ICreateSessionRequest } from '~/interfaces/statistics.interface';
  import { ttsService } from '~/services';

  interface ListenQuestion {
    card: ICardSetCard;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
    isSubmitted: boolean;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();
  const statisticsStore = useStatisticsStore();

  const cardSet = ref<ICardSet | null>(null);
  const questions = ref<ListenQuestion[]>([]);
  const currentQuestionIndex = ref(0);
  const showResults = ref(false);
  const isPlayingAudio = ref(false);
  const autoPlayEnabled = ref(true);
  const startTime = ref<number>(0);
  const endTime = ref<number>(0);

  const currentQuestion = computed(() => {
    if (questions.value.length === 0) return null;
    return questions.value[currentQuestionIndex.value];
  });

  const progress = computed(() => {
    return {
      current: currentQuestionIndex.value + 1,
      total: questions.value.length,
      percentage: ((currentQuestionIndex.value + 1) / questions.value.length) * 100,
      answered: questions.value.filter((q) => q.isSubmitted).length,
    };
  });

  const score = computed(() => {
    const correct = questions.value.filter(
      (q) => q.userAnswer === q.correctAnswer
    ).length;
    return {
      correct,
      total: questions.value.length,
      percentage: Math.round((correct / questions.value.length) * 100),
    };
  });

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateQuestions = () => {
    if (!cardSet.value?.cards || cardSet.value.cards.length < 2) {
      questions.value = [];
      return;
    }

    const shuffledCards = shuffleArray(cardSet.value.cards);
    questions.value = shuffledCards.map((card) => {
      const otherCards = cardSet.value!.cards.filter((c) => c.id !== card.id);
      const wrongOptions = shuffleArray(otherCards)
        .slice(0, 3)
        .map((c) => c.define);

      const allOptions = shuffleArray([card.define, ...wrongOptions]);

      return {
        card,
        options: allOptions,
        correctAnswer: card.define,
        isSubmitted: false,
      };
    });

    startTime.value = Date.now();
  };

  const playCurrentQuestion = async () => {
    if (!currentQuestion.value || isPlayingAudio.value) return;

    try {
      isPlayingAudio.value = true;
      await ttsService.playText(currentQuestion.value.card.terminology);
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('studyModes.listen.audioError'),
        life: 3000,
      });
    } finally {
      isPlayingAudio.value = false;
    }
  };

  const selectAnswer = (answer: string) => {
    if (!currentQuestion.value || currentQuestion.value.isSubmitted) return;
    currentQuestion.value.userAnswer = answer;
  };

  const submitAnswer = () => {
    if (!currentQuestion.value || currentQuestion.value.isSubmitted) return;
    if (!currentQuestion.value.userAnswer) return;

    currentQuestion.value.isSubmitted = true;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
      if (autoPlayEnabled.value) {
        setTimeout(() => playCurrentQuestion(), 500);
      }
    } else {
      endTime.value = Date.now();
      showResults.value = true;
      recordStudySession();
    }
  };

  const recordStudySession = async () => {
    if (!cardSet.value) return;

    const sessionData: ICreateSessionRequest = {
      cardset_id: cardSet.value.id,
      mode: 'learn',
      start_time: new Date(startTime.value).toISOString(),
      end_time: new Date(endTime.value).toISOString(),
      attempts: questions.value.map((q) => ({
        card_id: q.card.id,
        correct: q.userAnswer === q.correctAnswer,
        time_spent: Math.round(
          (endTime.value - startTime.value) / questions.value.length / 1000
        ),
        user_answer: q.userAnswer || '',
        attempted_at: new Date(endTime.value).toISOString(),
      })),
    };

    try {
      await statisticsStore.recordSession(sessionData);
    } catch (error) {
      console.error('Failed to record study session:', error);
    }
  };

  const restart = () => {
    generateQuestions();
    currentQuestionIndex.value = 0;
    showResults.value = false;
    endTime.value = 0;
    if (autoPlayEnabled.value) {
      setTimeout(() => playCurrentQuestion(), 500);
    }
  };

  const goBack = () => {
    router.push(`/card-sets/${route.params.id}`);
  };

  const getOptionClass = (option: string) => {
    if (!currentQuestion.value) return 'border-gray-300';

    if (!currentQuestion.value.isSubmitted) {
      return currentQuestion.value.userAnswer === option
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50';
    }

    if (option === currentQuestion.value.correctAnswer) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-200';
    }

    if (
      option === currentQuestion.value.userAnswer &&
      option !== currentQuestion.value.correctAnswer
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
    generateQuestions();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (isTyping) return;

    if (showResults.value) {
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        restart();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
      return;
    }

    if (!currentQuestion.value) return;

    if (!currentQuestion.value.isSubmitted) {
      const optionMap: { [key: string]: number } = {
        '1': 0, 'a': 0, 'A': 0,
        '2': 1, 'b': 1, 'B': 1,
        '3': 2, 'c': 2, 'C': 2,
        '4': 3, 'd': 3, 'D': 3,
      };

      if (event.key in optionMap) {
        event.preventDefault();
        const index = optionMap[event.key];
        if (index < currentQuestion.value.options.length) {
          selectAnswer(currentQuestion.value.options[index]);
        }
      } else if (event.key === ' ') {
        event.preventDefault();
        playCurrentQuestion();
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (currentQuestion.value.isSubmitted) {
        nextQuestion();
      } else if (currentQuestion.value.userAnswer) {
        submitAnswer();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      goBack();
    }
  };

  onMounted(() => {
    loadCardSet();
    if (autoPlayEnabled.value) {
      setTimeout(() => playCurrentQuestion(), 1000);
    }
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    ttsService.stopPlayback();
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
        <p class="text-gray-600">{{ t('studyModes.listen.title') }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!currentQuestion && !showResults"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <i
          class="mb-4 pi pi-inbox"
          style="font-size: 4rem; color: #94a3b8"
        ></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('studyModes.listen.noQuestions') }}
        </h2>
        <p class="text-gray-500">
          {{ t('studyModes.listen.noQuestionsDescription') }}
        </p>
      </div>

      <div v-else-if="!showResults && currentQuestion" class="w-full">
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ t('studyModes.listen.question') }} {{ progress.current }} /
              {{ progress.total }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">
                {{ progress.answered }} {{ t('studyModes.listen.completed') }}
              </span>
            </div>
          </div>
          <div class="h-2 overflow-hidden bg-gray-200 rounded-full">
            <div
              class="h-full transition-all duration-300 bg-indigo-500"
              :style="{ width: `${progress.percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <Card class="mb-6">
          <template #content>
            <div class="text-center">
              <div class="mb-4 text-sm tracking-wide text-gray-500 uppercase">
                {{ t('studyModes.listen.listenAndSelect') }}
              </div>

              <!-- Audio Player -->
              <div class="flex flex-col items-center justify-center gap-4 mb-8">
                <Button
                  icon="pi pi-volume-up"
                  :label="t('studyModes.listen.playAudio')"
                  size="large"
                  rounded
                  :loading="isPlayingAudio"
                  @click="playCurrentQuestion"
                  class="text-white bg-indigo-500 hover:bg-indigo-600"
                  style="min-width: 200px"
                />
                <div class="text-xs text-gray-400">
                  <i class="mr-1 pi pi-info-circle"></i>
                  {{ t('studyModes.listen.pressSpaceToReplay') }}
                </div>
              </div>

              <!-- Image if available -->
              <div v-if="currentQuestion.card.image_url" class="mb-6 flex justify-center">
                <img
                  :src="currentQuestion.card.image_url"
                  :alt="currentQuestion.card.terminology"
                  class="max-h-48 rounded-lg border-2 border-gray-200 object-contain"
                />
              </div>

              <!-- Options -->
              <div class="space-y-3">
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :class="[
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    getOptionClass(option),
                    !currentQuestion.isSubmitted ? '' : 'cursor-not-allowed',
                  ]"
                  @click="!currentQuestion.isSubmitted && selectAnswer(option)"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="flex items-center justify-center w-8 h-8 font-semibold text-gray-700 bg-gray-100 rounded-full flex-shrink-0"
                    >
                      {{ String.fromCharCode(65 + index) }}
                    </span>
                    <span class="flex-1 text-left">{{ option }}</span>
                    <i
                      v-if="
                        currentQuestion.isSubmitted &&
                        option === currentQuestion.correctAnswer
                      "
                      class="pi pi-check-circle text-green-500 text-xl"
                    ></i>
                    <i
                      v-if="
                        currentQuestion.isSubmitted &&
                        option === currentQuestion.userAnswer &&
                        option !== currentQuestion.correctAnswer
                      "
                      class="pi pi-times-circle text-red-500 text-xl"
                    ></i>
                  </div>
                </div>
              </div>

              <!-- Feedback -->
              <div v-if="currentQuestion.isSubmitted" class="mt-6">
                <div
                  v-if="currentQuestion.userAnswer === currentQuestion.correctAnswer"
                  class="p-4 border-2 border-green-500 rounded-lg bg-green-50"
                >
                  <div class="flex items-center justify-center gap-2 text-green-700">
                    <i class="text-2xl pi pi-check-circle"></i>
                    <span class="text-lg font-semibold">
                      {{ t('studyModes.listen.correct') }}
                    </span>
                  </div>
                  <div class="mt-2 text-sm text-gray-700">
                    <div class="mb-1">
                      <span class="font-medium">{{ t('studyModes.listen.word') }}:</span>
                      {{ currentQuestion.card.terminology }}
                    </div>
                    <div v-if="currentQuestion.card.phonetic || currentQuestion.card.part_of_speech" class="flex items-center justify-center gap-2 text-xs text-gray-600">
                      <span v-if="currentQuestion.card.phonetic" class="italic">{{ currentQuestion.card.phonetic }}</span>
                      <span v-if="currentQuestion.card.part_of_speech" class="px-2 py-1 bg-gray-100 rounded font-medium">
                        {{ currentQuestion.card.part_of_speech }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="p-4 border-2 border-red-500 rounded-lg bg-red-50">
                  <div class="flex items-center justify-center gap-2 mb-2 text-red-700">
                    <i class="text-2xl pi pi-times-circle"></i>
                    <span class="text-lg font-semibold">
                      {{ t('studyModes.listen.incorrect') }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-700">
                    <div class="mb-1">
                      <span class="font-medium">{{ t('studyModes.listen.word') }}:</span>
                      {{ currentQuestion.card.terminology }}
                    </div>
                    <div v-if="currentQuestion.card.phonetic || currentQuestion.card.part_of_speech" class="flex items-center justify-center gap-2 text-xs text-gray-600 mb-1">
                      <span v-if="currentQuestion.card.phonetic" class="italic">{{ currentQuestion.card.phonetic }}</span>
                      <span v-if="currentQuestion.card.part_of_speech" class="px-2 py-1 bg-gray-100 rounded font-medium">
                        {{ currentQuestion.card.part_of_speech }}
                      </span>
                    </div>
                    <div class="text-green-700">
                      <span class="font-medium">{{ t('studyModes.listen.correctAnswer') }}:</span>
                      {{ currentQuestion.correctAnswer }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-3">
          <Button
            v-if="!currentQuestion.isSubmitted"
            :label="t('studyModes.listen.check')"
            :disabled="!currentQuestion.userAnswer"
            @click="submitAnswer"
            size="large"
            class="min-w-[200px]"
          />
          <Button
            v-else
            icon="pi pi-arrow-right"
            :label="
              currentQuestionIndex === questions.length - 1
                ? t('studyModes.listen.finish')
                : t('studyModes.listen.continue')
            "
            @click="nextQuestion"
            size="large"
            class="min-w-[200px]"
          />
        </div>

        <!-- Hint -->
        <div class="mt-4 text-sm text-center text-gray-500">
          <i class="mr-1 pi pi-info-circle"></i>
          {{
            currentQuestion.isSubmitted
              ? t('studyModes.listen.pressEnterToContinue')
              : t('studyModes.listen.hint')
          }}
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="showResults" class="w-full">
        <Card>
          <template #content>
            <div class="py-4 text-center">
              <!-- Score Summary -->
              <div class="flex items-center justify-center gap-6 mb-6">
                <i
                  :class="[
                    'pi text-5xl',
                    score.percentage >= 80
                      ? 'pi-check-circle text-green-500'
                      : score.percentage >= 60
                      ? 'pi-exclamation-circle text-yellow-500'
                      : 'pi-times-circle text-red-500',
                  ]"
                ></i>
                <div>
                  <h2 class="text-2xl font-bold mb-2">
                    {{ t('studyModes.listen.results') }}
                  </h2>
                  <div
                    class="text-5xl font-bold mb-2"
                    :class="{
                      'text-green-500': score.percentage >= 80,
                      'text-yellow-500':
                        score.percentage >= 60 && score.percentage < 80,
                      'text-red-500': score.percentage < 60,
                    }"
                  >
                    {{ score.percentage }}%
                  </div>
                  <p class="text-lg text-gray-600">
                    {{ score.correct }}/{{ score.total }}
                    {{ t('studyModes.listen.correctAnswers') }}
                  </p>
                </div>
              </div>

              <!-- Detailed Results -->
              <details class="mb-6 text-left">
                <summary
                  class="px-4 py-2 text-sm font-semibold text-indigo-600 rounded cursor-pointer hover:text-indigo-700 bg-indigo-50"
                >
                  <i class="mr-2 pi pi-list"></i>
                  {{ t('studyModes.listen.viewDetails') }}
                </summary>
                <div class="mt-3 space-y-2 overflow-y-auto max-h-96">
                  <div
                    v-for="(question, index) in questions"
                    :key="index"
                    class="p-3 text-sm border rounded"
                    :class="{
                      'border-green-300 bg-green-50':
                        question.userAnswer === question.correctAnswer,
                      'border-red-300 bg-red-50':
                        question.userAnswer !== question.correctAnswer,
                    }"
                  >
                    <div class="flex items-start gap-2">
                      <i
                        :class="[
                          'pi text-lg mt-0.5',
                          question.userAnswer === question.correctAnswer
                            ? 'pi-check-circle text-green-500'
                            : 'pi-times-circle text-red-500',
                        ]"
                      ></i>
                      <div class="flex-1">
                        <div class="font-semibold mb-1">
                          {{ question.card.terminology }}
                        </div>
                        <div class="text-xs text-gray-600">
                          <span class="font-medium">{{ t('studyModes.listen.yourAnswer') }}:</span>
                          {{ question.userAnswer || t('studyModes.listen.noAnswer') }}
                        </div>
                        <div
                          v-if="question.userAnswer !== question.correctAnswer"
                          class="text-xs text-green-700 mt-1"
                        >
                          <span class="font-medium">{{ t('studyModes.listen.correctAnswer') }}:</span>
                          {{ question.correctAnswer }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              <div class="flex flex-wrap justify-center gap-2">
                <Button
                  icon="pi pi-refresh"
                  :label="t('studyModes.listen.tryAgain')"
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
