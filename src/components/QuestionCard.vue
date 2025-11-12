<script setup lang="ts">
  import { computed } from 'vue';
  import type {
    ICreateQuestion,
    IQuestion,
    IQuestionForRandom,
  } from '~/interfaces';
  import { QUESTION_LEVELS, QUESTION_TYPES } from '~/interfaces';

  interface Props {
    questions: ICreateQuestion | IQuestion | IQuestionForRandom;
    role?: 'admin' | 'user';
    showActions?: boolean;
    showCorrectAnswer?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    role: 'user',
    showActions: false,
    showCorrectAnswer: false,
  });

  const emit = defineEmits<{
    edit: [question: IQuestion];
    delete: [question: IQuestion];
  }>();

  // Computed properties
  const levelText = computed((): string => {
    return QUESTION_LEVELS[props.questions.level] || 'Unknown';
  });

  const typeText = computed((): string => {
    return QUESTION_TYPES[props.questions.questionType] || 'Unknown';
  });

  const levelSeverity = computed(() => {
    switch (props.questions.level) {
      case 1:
        return 'success';
      case 2:
        return 'info';
      case 3:
        return 'warning';
      case 4:
        return 'danger';
      default:
        return 'secondary';
    }
  });

  const hasCorrectAnswer = computed(() => {
    return 'correctAnswer' in props.questions;
  });

  const correctAnswer = computed(() => {
    if (hasCorrectAnswer.value) {
      const question = props.questions as IQuestion | ICreateQuestion;
      return question.correctAnswer;
    }
    return null;
  });

  // Methods
  const handleEdit = (): void => {
    if ('_id' in props.questions) {
      emit('edit', props.questions as IQuestion);
    }
  };

  const handleDelete = (): void => {
    if ('_id' in props.questions) {
      emit('delete', props.questions as IQuestion);
    }
  };

  const getOptionClass = (optionNumber: number): string => {
    if (props.showCorrectAnswer && correctAnswer.value === optionNumber) {
      return 'correct-option';
    }
    return '';
  };
</script>

<template>
  <Card class="question-card">
    <template #header>
      <div class="question-header">
        <div class="question-meta">
          <Tag
            :severity="levelSeverity"
            class="level-tag"
          >
            {{ levelText }}
          </Tag>
          <Tag
            severity="secondary"
            class="type-tag"
          >
            {{ typeText }}
          </Tag>
        </div>

        <div
          v-if="showActions && role === 'admin'"
          class="question-actions"
        >
          <Button
            icon="pi pi-pencil"
            severity="info"
            outlined
            size="small"
            @click="handleEdit"
            v-tooltip="'Chỉnh sửa'"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            @click="handleDelete"
            v-tooltip="'Xóa'"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="question-content">
        <!-- Question Image -->
        <div
          v-if="questions.imageURL"
          class="question-image"
        >
          <Image
            :src="questions.imageURL"
            :alt="'Question image'"
            width="100%"
            height="200"
            fit="cover"
            preview
          />
        </div>

        <!-- Question Text -->
        <div class="question-text">
          <p class="question-title">{{ questions.content }}</p>
        </div>

        <!-- Options -->
        <div class="question-options">
          <div
            v-for="option in questions.options"
            :key="`option-${option.numbering}`"
            class="option-item"
            :class="getOptionClass(option.numbering)"
          >
            <div class="option-marker">
              {{
                option.numbering === 1
                  ? 'A'
                  : option.numbering === 2
                  ? 'B'
                  : option.numbering === 3
                  ? 'C'
                  : 'D'
              }}
            </div>
            <div class="option-text">
              {{ option.answer }}
            </div>
            <div
              v-if="
                props.showCorrectAnswer && correctAnswer === option.numbering
              "
              class="correct-indicator"
            >
              <i class="text-green-600 pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <!-- Correct Answer Info (for admin) -->
        <div
          v-if="role === 'admin' && hasCorrectAnswer && !showCorrectAnswer"
          class="correct-answer-info"
        >
          <div class="answer-badge">
            <i class="mr-1 pi pi-check"></i>
            Đáp án đúng:
            <strong>
              {{
                correctAnswer === 1
                  ? 'A'
                  : correctAnswer === 2
                  ? 'B'
                  : correctAnswer === 3
                  ? 'C'
                  : 'D'
              }}
            </strong>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
  .question-card {
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .question-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .question-meta {
    display: flex;
    gap: 0.5rem;
  }

  .level-tag,
  .type-tag {
    font-size: 0.75rem;
  }

  .question-actions {
    display: flex;
    gap: 0.5rem;
  }

  .question-content {
    padding: 1.5rem;
  }

  .question-image {
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
  }

  .question-text {
    margin-bottom: 1.5rem;
  }

  .question-title {
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.6;
    margin: 0;
    color: #374151;
  }

  .question-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }

  .option-item:hover {
    background-color: #f9fafb;
  }

  .option-item.correct-option {
    background-color: #ecfdf5;
    border-color: #10b981;
  }

  .option-marker {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #6b7280;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .correct-option .option-marker {
    background: #10b981;
  }

  .option-text {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #374151;
  }

  .correct-indicator {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
  }

  .correct-answer-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .answer-badge {
    display: inline-flex;
    align-items: center;
    background: #dbeafe;
    color: #1d4ed8;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .question-timestamps {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
  }

  .timestamp-info {
    color: #6b7280;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
  }

  @media (max-width: 768px) {
    .question-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .question-content {
      padding: 1rem;
    }

    .option-item {
      padding: 0.5rem;
    }

    .option-marker {
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
    }
  }
</style>
