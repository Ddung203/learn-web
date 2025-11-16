<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useLocale } from '~/composables/useLocale';

  interface Props {
    cardSet: ICardSet;
  }

  interface WriteQuestion {
    card: ICardSetCard;
    userAnswer: string;
    isCorrect?: boolean;
    isSubmitted: boolean;
  }

  const props = defineProps<Props>();
  const { t } = useLocale();

  const questions = ref<WriteQuestion[]>([]);
  const currentQuestionIndex = ref(0);
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
    const correct = questions.value.filter(q => q.isCorrect).length;
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

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUser = normalizeString(userAnswer);
    const normalizedCorrect = normalizeString(correctAnswer);
    
    // Check exact match first
    if (normalizedUser === normalizedCorrect) {
      return true;
    }
    
    // Check for compound format: abc(ef) or abc (ef)
    const compoundPattern = /^(.+?)\s*\((.+?)\)$/;
    const match = correctAnswer.match(compoundPattern);
    
    if (match) {
      const mainPart = normalizeString(match[1]);
      const parenthesisPart = normalizeString(match[2]);
      
      // Accept either part as correct
      if (normalizedUser === mainPart || normalizedUser === parenthesisPart) {
        return true;
      }
    }
    
    return false;
  };

  const generateQuestions = () => {
    if (!props.cardSet.cards || props.cardSet.cards.length === 0) {
      questions.value = [];
      return;
    }
    
    const shuffledCards = shuffleArray(props.cardSet.cards);
    questions.value = shuffledCards.map(card => ({
      card,
      userAnswer: '',
      isSubmitted: false,
    }));
  };

  const submitAnswer = () => {
    if (!currentQuestion.value) return;
    if (currentQuestion.value.isSubmitted || !currentQuestion.value.userAnswer.trim()) return;
    
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
      showResults.value = true;
    }
  };

  const restart = () => {
    generateQuestions();
    currentQuestionIndex.value = 0;
    showResults.value = false;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && currentQuestion.value) {
      if (!currentQuestion.value.isSubmitted) {
        submitAnswer();
      } else {
        nextQuestion();
      }
    }
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
        {{ t('studyModes.write.noQuestions') }}
      </h2>
      <p class="text-gray-500">{{ t('studyModes.write.noQuestionsDescription') }}</p>
    </div>

    <div v-else-if="!showResults && currentQuestion" class="w-full max-w-3xl">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">
            {{ t('studyModes.write.question') }} {{ progress.current }} / {{ progress.total }}
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
              {{ t('studyModes.write.typeDefinition') }}
            </div>
            <div class="text-3xl font-semibold mb-8">
              {{ currentQuestion.card.terminology }}
            </div>

            <!-- Input -->
            <div class="mb-6">
              <InputText
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
                class="p-4 bg-green-50 border-2 border-green-500 rounded-lg"
              >
                <div class="flex items-center justify-center gap-2 text-green-700">
                  <i class="pi pi-check-circle text-2xl"></i>
                  <span class="text-lg font-semibold">{{ t('studyModes.write.correct') }}</span>
                </div>
              </div>
              <div v-else class="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <div class="flex items-center justify-center gap-2 text-red-700 mb-2">
                  <i class="pi pi-times-circle text-2xl"></i>
                  <span class="text-lg font-semibold">{{ t('studyModes.write.incorrect') }}</span>
                </div>
                <div class="text-sm text-gray-700">
                  <span class="font-medium">{{ t('studyModes.write.correctAnswer') }}:</span>
                  <span class="ml-2 font-semibold">{{ currentQuestion.card.define }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <Button
          v-if="!currentQuestion.isSubmitted"
          :label="t('studyModes.write.check')"
          :disabled="!currentQuestion.userAnswer.trim()"
          @click="submitAnswer"
        />
        <Button
          v-else
          icon="pi pi-arrow-right"
          :label="
            currentQuestionIndex === questions.length - 1
              ? t('studyModes.write.finish')
              : t('studyModes.write.continue')
          "
          @click="nextQuestion"
        />
      </div>

      <!-- Hint -->
      <div class="mt-4 text-center text-sm text-gray-500">
        <i class="pi pi-info-circle mr-1"></i>
        {{ t('studyModes.write.hint') }}
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
            <h2 class="text-3xl font-bold mb-4">{{ t('studyModes.write.results') }}</h2>
            <div
              class="text-5xl font-bold mb-6"
              :class="
                score.percentage >= 80
                  ? 'text-green-500'
                  : score.percentage >= 60
                  ? 'text-yellow-500'
                  : 'text-red-500'
              "
            >
              {{ score.percentage }}%
            </div>
            <p class="text-xl text-gray-600 mb-8">
              {{ t('studyModes.write.scoreText', { correct: score.correct, total: score.total }) }}
            </p>

            <!-- Detailed Results -->
            <div class="text-left space-y-4 mb-6">
              <div
                v-for="(question, index) in questions"
                :key="index"
                class="p-4 border rounded-lg"
                :class="
                  question.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                "
              >
                <div class="flex items-start gap-3">
                  <i
                    :class="[
                      'pi text-xl mt-1',
                      question.isCorrect
                        ? 'pi-check-circle text-green-500'
                        : 'pi-times-circle text-red-500',
                    ]"
                  ></i>
                  <div class="flex-1">
                    <div class="font-semibold mb-1">{{ question.card.terminology }}</div>
                    <div class="text-sm text-gray-600">
                      <span class="font-medium">{{ t('studyModes.write.yourAnswer') }}:</span>
                      {{ question.userAnswer || t('studyModes.write.noAnswer') }}
                    </div>
                    <div v-if="!question.isCorrect" class="text-sm text-green-700 mt-1">
                      <span class="font-medium">{{ t('studyModes.write.correctAnswer') }}:</span>
                      {{ question.card.define }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              icon="pi pi-refresh"
              :label="t('studyModes.write.tryAgain')"
              size="large"
              @click="restart"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
