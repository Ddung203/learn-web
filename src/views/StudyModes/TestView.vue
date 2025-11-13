<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useCardSetStore } from '~/stores';
  import HeaderThird from '~/components/HeaderThird.vue';
  import { useLocale } from '~/composables/useLocale';

  interface TestQuestion {
    card: ICardSetCard;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const cardSetStore = useCardSetStore();

  const cardSet = ref<ICardSet | null>(null);
  const questions = ref<TestQuestion[]>([]);
  const currentQuestionIndex = ref(0);
  const isSubmitted = ref(false);
  const showResults = ref(false);
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
      answered: questions.value.filter(q => q.userAnswer).length,
    };
  });

  const score = computed(() => {
    const correct = questions.value.filter(q => q.userAnswer === q.correctAnswer).length;
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
    questions.value = shuffledCards.map(card => {
      const otherCards = cardSet.value!.cards.filter(c => c.id !== card.id);
      const wrongOptions = shuffleArray(otherCards)
        .slice(0, 3)
        .map(c => c.define);

      const allOptions = shuffleArray([card.define, ...wrongOptions]);

      return {
        card,
        options: allOptions,
        correctAnswer: card.define,
      };
    });

    startTime.value = Date.now();
  };

  const selectAnswer = (answer: string) => {
    if (!isSubmitted.value && currentQuestion.value) {
      currentQuestion.value.userAnswer = answer;
    }
  };

  const submitAnswer = () => {
    if (currentQuestion.value && currentQuestion.value.userAnswer) {
      isSubmitted.value = true;
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
      isSubmitted.value = false;
    } else {
      endTime.value = Date.now();
      showResults.value = true;
    }
  };

  const restart = () => {
    generateQuestions();
    currentQuestionIndex.value = 0;
    isSubmitted.value = false;
    showResults.value = false;
    endTime.value = 0;
  };

  const goBack = () => {
    router.push(`/card-sets/${route.params.id}`);
  };

  const getOptionClass = (option: string) => {
    if (!currentQuestion.value) return 'border-gray-300';
    
    if (!isSubmitted.value) {
      return currentQuestion.value.userAnswer === option
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50';
    }

    if (option === currentQuestion.value.correctAnswer) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-200';
    }

    if (option === currentQuestion.value.userAnswer && option !== currentQuestion.value.correctAnswer) {
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

  onMounted(() => {
    loadCardSet();
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
        <p class="text-gray-600">{{ t('studyModes.test.title') }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="!currentQuestion && !showResults" class="flex flex-col items-center justify-center py-20 text-center">
        <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
        <h2 class="mb-2 text-xl font-semibold text-gray-700">
          {{ t('studyModes.test.noQuestions') }}
        </h2>
        <p class="text-gray-500">{{ t('studyModes.test.noQuestionsDescription') }}</p>
      </div>

      <div v-else-if="!showResults && currentQuestion" class="w-full">
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ t('studyModes.test.question') }} {{ progress.current }} / {{ progress.total }}
            </span>
            <span class="text-sm text-gray-500">
              {{ progress.answered }} {{ t('studyModes.test.answered') }}
            </span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 transition-all duration-300"
              :style="{ width: `${progress.percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <Card class="mb-6">
          <template #content>
            <div>
              <div class="text-sm text-gray-500 mb-3 uppercase tracking-wide">
                {{ t('studyModes.test.whatIsDefinition') }}
              </div>
              <div class="text-2xl font-semibold mb-6 text-gray-900">
                {{ currentQuestion.card.terminology }}
              </div>

              <!-- Options -->
              <div class="space-y-3">
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :class="[
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    getOptionClass(option),
                    !isSubmitted ? '' : 'cursor-default',
                  ]"
                  @click="!isSubmitted && selectAnswer(option)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1">
                      <span class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-semibold text-gray-700">
                        {{ String.fromCharCode(65 + index) }}
                      </span>
                      <span class="text-left flex-1">{{ option }}</span>
                    </div>
                    <i
                      v-if="isSubmitted && option === currentQuestion.correctAnswer"
                      class="pi pi-check-circle text-green-500 text-xl"
                    ></i>
                    <i
                      v-if="isSubmitted && option === currentQuestion.userAnswer && option !== currentQuestion.correctAnswer"
                      class="pi pi-times-circle text-red-500 text-xl"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-3">
          <Button
            v-if="!isSubmitted"
            :label="t('studyModes.test.submit')"
            :disabled="!currentQuestion.userAnswer"
            @click="submitAnswer"
            size="large"
          />
          <Button
            v-else
            icon="pi pi-arrow-right"
            :label="currentQuestionIndex === questions.length - 1 ? t('studyModes.test.finish') : t('studyModes.test.nextQuestion')"
            @click="nextQuestion"
            size="large"
          />
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="showResults" class="w-full">
        <Card>
          <template #content>
            <div class="text-center py-8">
              <i
                :class="[
                  'pi text-6xl mb-4',
                  score.percentage >= 80 ? 'pi-check-circle text-green-500' :
                  score.percentage >= 60 ? 'pi-exclamation-circle text-yellow-500' :
                  'pi-times-circle text-red-500',
                ]"
              ></i>
              <h2 class="text-3xl font-bold mb-4">{{ t('studyModes.test.results') }}</h2>
              <div
                class="text-6xl font-bold mb-6"
                :class="{
                  'text-green-500': score.percentage >= 80,
                  'text-yellow-500': score.percentage >= 60 && score.percentage < 80,
                  'text-red-500': score.percentage < 60,
                }"
              >
                {{ score.percentage }}%
              </div>
              <p class="text-xl text-gray-600 mb-4">
                {{ t('studyModes.test.scoreText', { correct: score.correct, total: score.total }) }}
              </p>
              <p class="text-sm text-gray-500 mb-8">
                <i class="pi pi-clock mr-1"></i>
                {{ t('studyModes.test.timeSpent', { time: timeSpent }) }}
              </p>

              <!-- Detailed Results -->
              <div class="text-left space-y-3 mb-8 max-h-96 overflow-y-auto">
                <div
                  v-for="(question, index) in questions"
                  :key="index"
                  class="p-4 border-2 rounded-lg"
                  :class="{
                    'border-green-300 bg-green-50': question.userAnswer === question.correctAnswer,
                    'border-red-300 bg-red-50': question.userAnswer !== question.correctAnswer,
                  }"
                >
                  <div class="flex items-start gap-3">
                    <i
                      :class="[
                        'pi text-xl mt-1',
                        question.userAnswer === question.correctAnswer
                          ? 'pi-check-circle text-green-500'
                          : 'pi-times-circle text-red-500',
                      ]"
                    ></i>
                    <div class="flex-1">
                      <div class="font-semibold mb-1">{{ question.card.terminology }}</div>
                      <div class="text-sm text-gray-600">
                        <span class="font-medium">{{ t('studyModes.test.yourAnswer') }}:</span>
                        {{ question.userAnswer || t('studyModes.test.noAnswer') }}
                      </div>
                      <div v-if="question.userAnswer !== question.correctAnswer" class="text-sm text-green-700 mt-1">
                        <span class="font-medium">{{ t('studyModes.test.correctAnswer') }}:</span>
                        {{ question.correctAnswer }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 justify-center">
                <Button
                  icon="pi pi-refresh"
                  :label="t('studyModes.test.tryAgain')"
                  size="large"
                  @click="restart"
                />
                <Button
                  icon="pi pi-arrow-left"
                  :label="t('common.backToHome')"
                  severity="secondary"
                  size="large"
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
