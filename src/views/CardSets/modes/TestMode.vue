<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useLocale } from '~/composables/useLocale';

  interface Props {
    cardSet: ICardSet;
  }

  interface TestQuestion {
    card: ICardSetCard;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
  }

  const props = defineProps<Props>();
  const { t } = useLocale();

  const questions = ref<TestQuestion[]>([]);
  const currentQuestionIndex = ref(0);
  const isSubmitted = ref(false);
  const showResults = ref(false);

  const currentQuestion = computed(() => {
    if (questions.value.length === 0) return null;
    return questions.value[currentQuestionIndex.value];
  });

  const progress = computed(() => {
    return {
      current: currentQuestionIndex.value + 1,
      total: questions.value.length,
      percentage: ((currentQuestionIndex.value + 1) / questions.value.length) * 100,
    };
  });

  const score = computed(() => {
    const correct = questions.value.filter(
      q => q.userAnswer === q.correctAnswer
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
    if (!props.cardSet.cards || props.cardSet.cards.length < 2) {
      questions.value = [];
      return;
    }
    
    const shuffledCards = shuffleArray(props.cardSet.cards);
    questions.value = shuffledCards.map(card => {
      const otherCards = props.cardSet.cards.filter(c => c.id !== card.id);
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
      showResults.value = true;
    }
  };

  const restart = () => {
    generateQuestions();
    currentQuestionIndex.value = 0;
    isSubmitted.value = false;
    showResults.value = false;
  };

  const getOptionClass = (option: string) => {
    if (!currentQuestion.value) return 'border-gray-300';
    
    if (!isSubmitted.value) {
      return currentQuestion.value.userAnswer === option
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300';
    }

    if (option === currentQuestion.value.correctAnswer) {
      return 'border-green-500 bg-green-50';
    }

    if (
      option === currentQuestion.value.userAnswer &&
      option !== currentQuestion.value.correctAnswer
    ) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-300';
  };

  onMounted(() => {
    generateQuestions();
  });
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Empty State -->
    <div v-if="!currentQuestion && !showResults" class="flex flex-col items-center justify-center py-20 text-center">
      <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
      <h2 class="mb-2 text-xl font-semibold text-gray-700">
        {{ t('studyModes.test.noQuestions') }}
      </h2>
      <p class="text-gray-500">{{ t('studyModes.test.noQuestionsDescription') }}</p>
    </div>

    <div v-else-if="!showResults && currentQuestion" class="w-full max-w-3xl">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">
            {{ t('studyModes.test.question') }} {{ progress.current }} / {{ progress.total }}
          </span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-500 transition-all duration-300"
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Question -->
      <Card class="mb-6">
        <template #content>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-4">
              {{ t('studyModes.test.whatIsDefinition') }}
            </div>
            <div class="text-2xl font-semibold mb-6">
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
                  !isSubmitted ? 'hover:border-blue-300' : 'cursor-not-allowed',
                ]"
                @click="!isSubmitted && selectAnswer(option)"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ String.fromCharCode(65 + index) }}.</span>
                  <span class="flex-1 ml-4 text-left">{{ option }}</span>
                  <i
                    v-if="isSubmitted && option === currentQuestion.correctAnswer"
                    class="pi pi-check-circle text-green-500"
                  ></i>
                  <i
                    v-if="
                      isSubmitted &&
                      option === currentQuestion.userAnswer &&
                      option !== currentQuestion.correctAnswer
                    "
                    class="pi pi-times-circle text-red-500"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <Button
          v-if="!isSubmitted"
          :label="t('studyModes.test.submit')"
          :disabled="!currentQuestion.userAnswer"
          @click="submitAnswer"
        />
        <Button
          v-else
          icon="pi pi-arrow-right"
          :label="currentQuestionIndex === questions.length - 1 ? t('studyModes.test.finish') : t('studyModes.test.nextQuestion')"
          @click="nextQuestion"
        />
      </div>
    </div>

    <!-- Results -->
    <div v-else class="w-full max-w-3xl">
      <Card>
        <template #content>
          <div class="text-center">
            <i
              :class="[
                'pi text-6xl mb-4',
                score.percentage >= 80
                  ? 'pi-check-circle text-green-500'
                  : score.percentage >= 60
                  ? 'pi-exclamation-circle text-yellow-500'
                  : 'pi-times-circle text-red-500',
              ]"
            ></i>
            <h2 class="text-3xl font-bold mb-4">{{ t('studyModes.test.results') }}</h2>
            <div class="text-5xl font-bold mb-6" :class="score.percentage >= 80 ? 'text-green-500' : score.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'">
              {{ score.percentage }}%
            </div>
            <p class="text-xl text-gray-600 mb-8">
              {{ t('studyModes.test.scoreText', { correct: score.correct, total: score.total }) }}
            </p>

            <!-- Detailed Results -->
            <div class="text-left space-y-4 mb-6">
              <div
                v-for="(question, index) in questions"
                :key="index"
                class="p-4 border rounded-lg"
                :class="question.userAnswer === question.correctAnswer ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'"
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

            <Button
              icon="pi pi-refresh"
              :label="t('studyModes.test.tryAgain')"
              size="large"
              @click="restart"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
