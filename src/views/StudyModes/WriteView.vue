<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useCardSetStore } from '~/stores';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';

  interface WriteQuestion {
    card: ICardSetCard;
    userAnswer: string;
    isCorrect?: boolean;
    isSubmitted: boolean;
    attempts: number;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const cardSet = ref<ICardSet | null>(null);
  const questions = ref<WriteQuestion[]>([]);
  const currentQuestionIndex = ref(0);
  const showResults = ref(false);
  const startTime = ref<number>(0);
  const endTime = ref<number>(0);
  const inputRef = ref<any>(null);

  const currentQuestion = computed(() => {
    if (questions.value.length === 0) return null;
    return questions.value[currentQuestionIndex.value];
  });

  const progress = computed(() => {
    return {
      current: currentQuestionIndex.value + 1,
      total: questions.value.length,
      percentage: ((currentQuestionIndex.value + 1) / questions.value.length) * 100,
      answered: questions.value.filter(q => q.isSubmitted).length,
    };
  });

  const score = computed(() => {
    const correct = questions.value.filter(q => q.isCorrect).length;
    return {
      correct,
      total: questions.value.length,
      percentage: Math.round((correct / questions.value.length) * 100),
    };
  });

  const timeSpent = computed(() => {
    if (!endTime.value) return 0;
    return Math.round((endTime.value - startTime.value) / 1000);
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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateQuestions = () => {
    if (!cardSet.value?.cards || cardSet.value.cards.length === 0) {
      questions.value = [];
      return;
    }
    
    const shuffledCards = shuffleArray(cardSet.value.cards);
    questions.value = shuffledCards.map(card => ({
      card,
      userAnswer: '',
      isSubmitted: false,
      attempts: 0,
    }));

    startTime.value = Date.now();
  };

  const submitAnswer = () => {
    if (!currentQuestion.value) return;
    if (currentQuestion.value.isSubmitted || !currentQuestion.value.userAnswer.trim()) return;
    
    currentQuestion.value.attempts++;
    currentQuestion.value.isCorrect = checkAnswer(
      currentQuestion.value.userAnswer,
      currentQuestion.value.card.define
    );
    currentQuestion.value.isSubmitted = true;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      endTime.value = Date.now();
      showResults.value = true;
    }
  };

  const restart = () => {
    generateQuestions();
    currentQuestionIndex.value = 0;
    showResults.value = false;
    endTime.value = 0;
  };

  const goBack = () => {
    router.push(`/card-sets/${route.params.id}`);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    // Only handle Enter when typing (not submitted yet)
    if (event.key === 'Enter' && currentQuestion.value && !currentQuestion.value.isSubmitted) {
      event.preventDefault();
      submitAnswer();
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
    generateQuestions();
  };

  // Auto focus when question changes
  watch(currentQuestionIndex, () => {
    setTimeout(() => {
      const input = inputRef.value?.$el?.querySelector('input') || inputRef.value;
      if (input && typeof input.focus === 'function') {
        input.focus();
      }
    }, 100);
  });

  // Keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
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

    // Handle Enter key for submitted questions (continue to next)
    if (event.key === 'Enter' && currentQuestion.value?.isSubmitted) {
      event.preventDefault();
      nextQuestion();
    } else if (event.key === 'Escape' && !showResults.value) {
      event.preventDefault();
      goBack();
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      restart();
    }
  };

  onMounted(() => {
    loadCardSet();
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<template>
  <HeaderThird />

  <div class="flex flex-col items-center max-w-full min-h-svh py-6">
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
        <p class="text-gray-600">{{ t('studyModes.write.title') }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="!currentQuestion && !showResults" class="flex flex-col items-center justify-center py-20 text-center">
        <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('studyModes.write.noQuestions') }}
        </h2>
        <p class="text-gray-500">{{ t('studyModes.write.noQuestionsDescription') }}</p>
      </div>

      <div v-else-if="!showResults && currentQuestion" class="w-full">
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ t('studyModes.write.question') }} {{ progress.current }} / {{ progress.total }}
            </span>
            <span class="text-sm text-gray-500">
              {{ progress.answered }} {{ t('studyModes.write.completed') }}
            </span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-purple-500 transition-all duration-300"
              :style="{ width: `${progress.percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <Card class="mb-6">
          <template #content>
            <div>
              <div class="text-sm text-gray-500 mb-3 uppercase tracking-wide">
                {{ t('studyModes.write.typeDefinition') }}
              </div>
              <div class="text-3xl font-semibold mb-6 text-gray-900">
                {{ currentQuestion.card.terminology }}
              </div>

              <!-- Input -->
              <div class="mb-6">
                <InputText
                  ref="inputRef"
                  v-model="currentQuestion.userAnswer"
                  :placeholder="t('studyModes.write.placeholder')"
                  :disabled="currentQuestion.isSubmitted"
                  class="w-full p-4 text-lg"
                  @keypress="handleKeyPress"
                  autofocus
                />
              </div>

              <!-- Feedback -->
              <div v-if="currentQuestion.isSubmitted" class="mb-4">
                <div
                  v-if="currentQuestion.isCorrect"
                  class="p-4 bg-green-50 border-2 border-green-500 rounded-lg animate__animated animate__bounceIn"
                >
                  <div class="flex items-center justify-center gap-2 text-green-700">
                    <i class="pi pi-check-circle text-2xl"></i>
                    <span class="text-lg font-semibold">{{ t('studyModes.write.correct') }}</span>
                  </div>
                  <div class="text-center text-sm text-green-600 mt-2">
                    {{ currentQuestion.userAnswer }}
                  </div>
                </div>
                <div v-else class="p-4 bg-red-50 border-2 border-red-500 rounded-lg animate__animated animate__shakeX">
                  <div class="flex items-center justify-center gap-2 text-red-700 mb-2">
                    <i class="pi pi-times-circle text-2xl"></i>
                    <span class="text-lg font-semibold">{{ t('studyModes.write.incorrect') }}</span>
                  </div>
                  <div class="text-sm text-gray-700 mb-2">
                    <span class="font-medium">{{ t('studyModes.write.yourAnswer') }}:</span>
                    <span class="ml-2 line-through">{{ currentQuestion.userAnswer }}</span>
                  </div>
                  <div class="text-sm text-green-700 mt-2 p-3 bg-green-100 rounded">
                    <span class="font-medium">{{ t('studyModes.write.correctAnswer') }}:</span>
                    <span class="ml-2 font-semibold">{{ currentQuestion.card.define }}</span>
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
            :label="t('studyModes.write.check')"
            :disabled="!currentQuestion.userAnswer.trim()"
            @click="submitAnswer"
            size="large"
            class="min-w-[200px]"
          />
          <Button
            v-else
            icon="pi pi-arrow-right"
            :label="currentQuestionIndex === questions.length - 1 ? t('studyModes.write.finish') : t('studyModes.write.continue')"
            @click="nextQuestion"
            size="large"
            class="min-w-[200px]"
          />
        </div>

        <!-- Hint -->
        <div class="mt-4 text-center text-sm text-gray-500">
          <i class="pi pi-info-circle mr-1"></i>
          {{ currentQuestion.isSubmitted ? t('studyModes.write.pressEnterToContinue') : t('studyModes.write.hint') }}
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="showResults" class="w-full">
        <Card>
          <template #content>
            <div class="text-center py-4">
              <!-- Score Summary -->
              <div class="flex items-center justify-center gap-6 mb-4">
                <i
                  :class="[
                    'pi text-4xl',
                    score.percentage >= 80 ? 'pi-check-circle text-green-500' :
                    score.percentage >= 60 ? 'pi-exclamation-circle text-yellow-500' :
                    'pi-times-circle text-red-500',
                  ]"
                ></i>
                <div>
                  <div
                    class="text-4xl font-bold"
                    :class="{
                      'text-green-500': score.percentage >= 80,
                      'text-yellow-500': score.percentage >= 60 && score.percentage < 80,
                      'text-red-500': score.percentage < 60,
                    }"
                  >
                    {{ score.percentage }}%
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ score.correct }}/{{ score.total }} {{ t('studyModes.write.completed') }}
                  </p>
                </div>
                <div class="text-left">
                  <div class="text-xs text-gray-500">
                    <i class="pi pi-clock mr-1"></i>{{ timeSpent }}s
                  </div>
                </div>
              </div>

              <!-- Detailed Results (Collapsible) -->
              <details class="text-left mb-4">
                <summary class="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 px-4 bg-blue-50 rounded">
                  <i class="pi pi-list mr-2"></i>{{ t('studyModes.write.viewDetails') }}
                </summary>
                <div class="space-y-2 mt-3 max-h-64 overflow-y-auto">
                  <div
                    v-for="(question, index) in questions"
                    :key="index"
                    class="p-3 border rounded text-sm"
                    :class="{
                      'border-green-300 bg-green-50': question.isCorrect,
                      'border-red-300 bg-red-50': !question.isCorrect,
                    }"
                  >
                    <div class="flex items-start gap-2">
                      <i
                        :class="[
                          'pi text-sm mt-0.5',
                          question.isCorrect ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500',
                        ]"
                      ></i>
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold truncate">{{ question.card.terminology }}</div>
                        <div class="text-xs text-gray-600 truncate">
                          {{ question.userAnswer || t('studyModes.write.noAnswer') }}
                        </div>
                        <div v-if="!question.isCorrect" class="text-xs text-green-700 truncate">
                          ✓ {{ question.card.define }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              <div class="flex gap-2 justify-center flex-wrap">
                <Button
                  icon="pi pi-refresh"
                  :label="t('studyModes.write.tryAgain')"
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
