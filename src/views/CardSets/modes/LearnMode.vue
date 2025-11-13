<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import type { ICardSet, ICardSetCard } from '~/interfaces';
  import { useLocale } from '~/composables/useLocale';

  interface Props {
    cardSet: ICardSet;
  }

  interface LearnCard {
    card: ICardSetCard;
    correctCount: number;
    incorrectCount: number;
    lastResult?: 'correct' | 'incorrect';
    mastered: boolean;
  }

  const props = defineProps<Props>();
  const { t } = useLocale();

  const learningCards = ref<LearnCard[]>([]);
  const currentCardIndex = ref(0);
  const userAnswer = ref('');
  const showAnswer = ref(false);
  const sessionComplete = ref(false);

  const currentCard = computed(() => {
    if (learningCards.value.length === 0) return null;
    return learningCards.value[currentCardIndex.value];
  });

  const progress = computed(() => {
    const mastered = learningCards.value.filter(c => c.mastered).length;
    return {
      mastered,
      total: learningCards.value.length,
      percentage: (mastered / learningCards.value.length) * 100,
    };
  });

  const needsPractice = computed(() => {
    return learningCards.value.filter(c => !c.mastered);
  });

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
    return normalizedUser === normalizedCorrect;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeLearning = () => {
    if (!props.cardSet.cards || props.cardSet.cards.length === 0) {
      learningCards.value = [];
      return;
    }
    
    const shuffledCards = shuffleArray(props.cardSet.cards);
    learningCards.value = shuffledCards.map(card => ({
      card,
      correctCount: 0,
      incorrectCount: 0,
      mastered: false,
    }));
  };

  const showAnswerForReview = () => {
    showAnswer.value = true;
  };

  const markAsKnown = () => {
    if (currentCard.value) {
      currentCard.value.correctCount++;
      currentCard.value.lastResult = 'correct';

      if (currentCard.value.correctCount >= 2) {
        currentCard.value.mastered = true;
      }

      nextCard();
    }
  };

  const markAsUnknown = () => {
    if (currentCard.value) {
      currentCard.value.incorrectCount++;
      currentCard.value.lastResult = 'incorrect';
      currentCard.value.correctCount = 0;

      nextCard();
    }
  };

  const submitAnswer = () => {
    if (!userAnswer.value.trim() || !currentCard.value) return;

    const isCorrect = checkAnswer(userAnswer.value, currentCard.value.card.define);

    if (isCorrect) {
      currentCard.value.correctCount++;
      currentCard.value.lastResult = 'correct';

      if (currentCard.value.correctCount >= 2) {
        currentCard.value.mastered = true;
      }
    } else {
      currentCard.value.incorrectCount++;
      currentCard.value.lastResult = 'incorrect';
      currentCard.value.correctCount = 0;
    }

    showAnswer.value = true;
  };

  const nextCard = () => {
    userAnswer.value = '';
    showAnswer.value = false;

    const notMastered = learningCards.value.filter(c => !c.mastered);

    if (notMastered.length === 0) {
      sessionComplete.value = true;
      return;
    }

    const priorityCards = notMastered.filter(c => c.incorrectCount > 0);

    if (priorityCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * priorityCards.length);
      currentCardIndex.value = learningCards.value.indexOf(priorityCards[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * notMastered.length);
      currentCardIndex.value = learningCards.value.indexOf(notMastered[randomIndex]);
    }
  };

  const restart = () => {
    initializeLearning();
    currentCardIndex.value = 0;
    userAnswer.value = '';
    showAnswer.value = false;
    sessionComplete.value = false;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !showAnswer.value) {
      submitAnswer();
    }
  };

  onMounted(() => {
    initializeLearning();
  });
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Empty State -->
    <div v-if="!currentCard && !sessionComplete" class="flex flex-col items-center justify-center py-20 text-center">
      <i class="pi pi-inbox mb-4" style="font-size: 4rem; color: #94a3b8"></i>
      <h2 class="mb-2 text-xl font-semibold text-gray-700">
        {{ t('studyModes.learn.noCards') }}
      </h2>
      <p class="text-gray-500">{{ t('studyModes.learn.noCardsDescription') }}</p>
    </div>

    <div v-else-if="!sessionComplete && currentCard" class="w-full max-w-3xl">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">
            {{ t('studyModes.learn.mastered') }}: {{ progress.mastered }} / {{ progress.total }}
          </span>
          <span class="text-gray-600">
            {{ t('studyModes.learn.remaining') }}: {{ needsPractice.length }}
          </span>
        </div>
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Card Status -->
      <div class="mb-4 flex gap-2 justify-center">
        <div
          v-for="(card, index) in learningCards"
          :key="index"
          :class="[
            'w-3 h-3 rounded-full transition-all',
            card.mastered
              ? 'bg-green-500'
              : card.lastResult === 'correct'
              ? 'bg-blue-400'
              : card.lastResult === 'incorrect'
              ? 'bg-red-400'
              : 'bg-gray-300',
          ]"
        ></div>
      </div>

      <!-- Learning Card -->
      <Card class="mb-6">
        <template #content>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-4">
              {{ t('studyModes.learn.defineThis') }}
            </div>
            <div class="text-3xl font-semibold mb-8">
              {{ currentCard.card.terminology }}
            </div>

            <!-- Input or Show Answer Button -->
            <div v-if="!showAnswer" class="mb-6">
              <InputText
                v-model="userAnswer"
                :placeholder="t('studyModes.learn.placeholder')"
                class="w-full p-4 text-lg mb-4"
                @keypress="handleKeyPress"
                autofocus
              />
              <div class="flex gap-4 justify-center">
                <Button
                  :label="t('studyModes.learn.check')"
                  :disabled="!userAnswer.trim()"
                  @click="submitAnswer"
                />
                <Button
                  :label="t('studyModes.learn.showAnswer')"
                  severity="secondary"
                  @click="showAnswerForReview"
                />
              </div>
            </div>

            <!-- Answer Display -->
            <div v-else class="mb-6">
              <div class="p-6 bg-blue-50 border-2 border-blue-500 rounded-lg mb-6">
                <div class="text-sm text-blue-600 mb-2">
                  {{ t('studyModes.learn.correctAnswer') }}
                </div>
                <div class="text-2xl font-semibold text-blue-900">
                  {{ currentCard.card.define }}
                </div>
              </div>

              <!-- Feedback if user answered -->
              <div v-if="userAnswer" class="mb-4">
                <div
                  v-if="currentCard.lastResult === 'correct'"
                  class="p-4 bg-green-50 border-2 border-green-500 rounded-lg"
                >
                  <div class="flex items-center justify-center gap-2 text-green-700">
                    <i class="pi pi-check-circle text-2xl"></i>
                    <span class="text-lg font-semibold">
                      {{ t('studyModes.learn.correctFeedback') }}
                    </span>
                  </div>
                </div>
                <div v-else class="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <div class="flex items-center justify-center gap-2 text-red-700">
                    <i class="pi pi-times-circle text-2xl"></i>
                    <span class="text-lg font-semibold">
                      {{ t('studyModes.learn.incorrectFeedback') }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-700 mt-2">
                    {{ t('studyModes.learn.yourAnswer') }}: {{ userAnswer }}
                  </div>
                </div>
              </div>

              <!-- Rate Understanding -->
              <div v-else>
                <div class="text-sm text-gray-600 mb-4">
                  {{ t('studyModes.learn.rateUnderstanding') }}
                </div>
                <div class="flex gap-4 justify-center">
                  <Button
                    icon="pi pi-check"
                    :label="t('studyModes.learn.iKnowThis')"
                    severity="success"
                    @click="markAsKnown"
                  />
                  <Button
                    icon="pi pi-times"
                    :label="t('studyModes.learn.studyAgain')"
                    severity="danger"
                    @click="markAsUnknown"
                  />
                </div>
              </div>

              <!-- Continue Button (shown after automatic check) -->
              <Button
                v-if="userAnswer"
                icon="pi pi-arrow-right"
                :label="t('studyModes.learn.continue')"
                class="mt-4"
                @click="nextCard"
              />
            </div>

            <!-- Progress Info -->
            <div class="text-sm text-gray-500 mt-4">
              <i class="pi pi-info-circle mr-1"></i>
              {{ t('studyModes.learn.progressInfo') }}
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Session Complete -->
    <div v-else class="w-full max-w-3xl">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-trophy text-6xl text-yellow-500 mb-4"></i>
            <h2 class="text-3xl font-bold mb-4">{{ t('studyModes.learn.congratulations') }}</h2>
            <p class="text-xl text-gray-600 mb-8">
              {{ t('studyModes.learn.completedMessage') }}
            </p>

            <!-- Statistics -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div class="text-3xl font-bold text-green-700 mb-1">
                  {{ learningCards.length }}
                </div>
                <div class="text-sm text-green-600">
                  {{ t('studyModes.learn.cardsMastered') }}
                </div>
              </div>
              <div class="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                <div class="text-3xl font-bold text-blue-700 mb-1">
                  {{ learningCards.reduce((sum, card) => sum + card.correctCount, 0) }}
                </div>
                <div class="text-sm text-blue-600">
                  {{ t('studyModes.learn.totalCorrect') }}
                </div>
              </div>
            </div>

            <Button
              icon="pi pi-refresh"
              :label="t('studyModes.learn.practiceAgain')"
              size="large"
              @click="restart"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
