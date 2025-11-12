import { defineStore } from 'pinia';

import { STATUS_CODE } from '~/constants';
import type {
  IQuestion,
  IQuestionForRandom,
  ISubmitExamPayload,
  IUserAnswer,
} from '~/interfaces';
import { ExamService, QuestionService } from '~/services';
import { STORE_IDS } from './store-id';

export interface ExamState {
  examSessionId: string;
  questions: IQuestionForRandom[];
  userAnswers: Map<string, number>;
  questionTimeSpent: Map<string, number>;
  currentQuestionIndex: number;
  timeRemaining: number;
  totalTimeInMinutes: number;
  examStartTime: number;
  questionStartTime: number;
  lastUpdateTime: number;
  loading: boolean;
  isExamActive: boolean;
}

const EXAM_STORAGE_KEY = 'its-interview-exam-state';
const SUBMITTED_SESSIONS_KEY = 'its-interview-submitted-sessions';

export const useExamStore = defineStore(STORE_IDS.EXAM, {
  state: (): ExamState => ({
    examSessionId: '',
    questions: [],
    userAnswers: new Map(),
    questionTimeSpent: new Map(),
    currentQuestionIndex: 0,
    timeRemaining: 0,
    totalTimeInMinutes: 20,
    examStartTime: 0,
    questionStartTime: 0,
    lastUpdateTime: 0,
    loading: false,
    isExamActive: false,
  }),

  getters: {
    currentQuestion: (state): IQuestionForRandom | null => {
      return state.questions[state.currentQuestionIndex] || null;
    },

    totalQuestions: (state): number => {
      return state.questions.length;
    },

    selectedAnswer: (state): number => {
      const currentQ = state.questions[state.currentQuestionIndex];
      return currentQ ? state.userAnswers.get(currentQ._id) || 0 : 0;
    },

    isAnswered:
      (state) =>
      (questionId: string): boolean => {
        return state.userAnswers.has(questionId);
      },

    canGoPrevious: (state): boolean => {
      return state.currentQuestionIndex > 0;
    },

    canGoNext: (state): boolean => {
      return state.currentQuestionIndex < state.questions.length - 1;
    },

    formattedTime: (state): string => {
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = state.timeRemaining % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    },

    answeredCount: (state): number => {
      return state.userAnswers.size;
    },

    progress: (state): number => {
      return state.questions.length > 0
        ? (state.userAnswers.size / state.questions.length) * 100
        : 0;
    },
  },

  actions: {
    loadExamFromStorage(): boolean {
      try {
        const stored = localStorage.getItem(EXAM_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);

          // Restore basic state
          this.examSessionId = data.examSessionId || '';
          this.questions = data.questions || [];
          this.currentQuestionIndex = data.currentQuestionIndex || 0;
          this.totalTimeInMinutes = data.totalTimeInMinutes || 20;
          this.examStartTime = data.examStartTime || 0;
          this.isExamActive = data.isExamActive || false;
          this.lastUpdateTime = data.lastUpdateTime || 0;

          // Restore Maps
          this.userAnswers = new Map(data.userAnswers || []);
          this.questionTimeSpent = new Map(data.questionTimeSpent || []);

          // Calculate remaining time based on last saved state
          if (this.isExamActive && data.timeRemaining && data.lastUpdateTime) {
            const currentTime = Date.now();
            const timeSinceLastUpdate = Math.floor(
              (currentTime - data.lastUpdateTime) / 1000
            ); // seconds

            // Security check: prevent time cheating
            // If system time went backwards or there's an unreasonable gap, clear the exam
            if (
              timeSinceLastUpdate < 0 ||
              timeSinceLastUpdate > this.totalTimeInMinutes * 60 * 2
            ) {
              console.warn(
                'Suspicious time manipulation detected, clearing exam data'
              );
              this.clearExamData();
              return false;
            }

            const calculatedTimeRemaining = Math.max(
              0,
              data.timeRemaining - timeSinceLastUpdate
            );

            // Additional check: ensure time never exceeds original exam duration
            const maxAllowedTime = this.totalTimeInMinutes * 60;
            if (calculatedTimeRemaining > maxAllowedTime) {
              console.warn(
                'Time remaining exceeds maximum allowed, clearing exam data'
              );
              this.clearExamData();
              return false;
            }

            if (calculatedTimeRemaining > 0) {
              this.timeRemaining = calculatedTimeRemaining;
              this.questionStartTime = Date.now();
              this.lastUpdateTime = currentTime;
              return true;
            } else {
              // Time expired, clear storage and return false
              this.clearExamData();
              return false;
            }
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error('Error loading exam from storage:', error);
        return false;
      }
    },

    saveExamToStorage(): void {
      try {
        const currentTime = Date.now();
        const dataToStore = {
          examSessionId: this.examSessionId,
          questions: this.questions,
          userAnswers: Array.from(this.userAnswers.entries()),
          questionTimeSpent: Array.from(this.questionTimeSpent.entries()),
          currentQuestionIndex: this.currentQuestionIndex,
          totalTimeInMinutes: this.totalTimeInMinutes,
          examStartTime: this.examStartTime,
          timeRemaining: this.timeRemaining,
          lastUpdateTime: currentTime,
          isExamActive: this.isExamActive,
        };

        localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(dataToStore));
        this.lastUpdateTime = currentTime;
      } catch (error) {
        console.error('Error saving exam to storage:', error);
      }
    },

    clearExamData(): void {
      this.$reset();
      localStorage.removeItem(EXAM_STORAGE_KEY);
    },

    // Check if session was already submitted
    isSessionSubmitted(sessionId: string): boolean {
      try {
        const submittedSessions = localStorage.getItem(SUBMITTED_SESSIONS_KEY);
        if (submittedSessions) {
          const sessions = JSON.parse(submittedSessions);
          return sessions.includes(sessionId);
        }
        return false;
      } catch (error) {
        console.error('Error checking submitted sessions:', error);
        return false;
      }
    },

    // Mark session as submitted
    markSessionAsSubmitted(sessionId: string): void {
      try {
        let submittedSessions: string[] = [];
        const stored = localStorage.getItem(SUBMITTED_SESSIONS_KEY);
        if (stored) {
          submittedSessions = JSON.parse(stored);
        }

        if (!submittedSessions.includes(sessionId)) {
          submittedSessions.push(sessionId);
          localStorage.setItem(
            SUBMITTED_SESSIONS_KEY,
            JSON.stringify(submittedSessions)
          );
        }
      } catch (error) {
        console.error('Error marking session as submitted:', error);
      }
    },

    async initializeExam(examSessionId: string): Promise<void> {
      const currentTime = Date.now();
      this.examSessionId = examSessionId;
      this.examStartTime = currentTime;
      this.questionStartTime = currentTime;
      this.lastUpdateTime = currentTime;
      this.timeRemaining = this.totalTimeInMinutes * 60;
      this.isExamActive = true;

      await this.loadQuestions();
      this.saveExamToStorage();
    },

    async loadQuestions(): Promise<void> {
      this.loading = true;
      try {
        const response = await QuestionService.getRandomQuestions();
        if (response.status === STATUS_CODE.SUCCESS) {
          this.questions = response.payload;
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        this.loading = false;
      }
    },

    recordQuestionTime(): void {
      const currentQuestion = this.currentQuestion;
      if (currentQuestion) {
        const currentTime = Date.now();
        const timeSpent = currentTime - this.questionStartTime;
        const existingTime =
          this.questionTimeSpent.get(currentQuestion._id) || 0;

        this.questionTimeSpent.set(
          currentQuestion._id,
          existingTime + timeSpent
        );
        this.saveExamToStorage();
      }
    },

    goToQuestion(index: number): void {
      if (index >= 0 && index < this.questions.length) {
        this.recordQuestionTime();
        this.currentQuestionIndex = index;
        this.questionStartTime = Date.now();
        this.saveExamToStorage();
      }
    },

    goToPrevious(): void {
      if (this.canGoPrevious) {
        this.goToQuestion(this.currentQuestionIndex - 1);
      }
    },

    goToNext(): void {
      if (this.canGoNext) {
        this.goToQuestion(this.currentQuestionIndex + 1);
      }
    },

    selectAnswer(answerNumber: number): void {
      const currentQuestion = this.currentQuestion;
      if (currentQuestion) {
        this.userAnswers.set(currentQuestion._id, answerNumber);
        this.saveExamToStorage();
      }
    },

    updateTimer(): void {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        this.lastUpdateTime = Date.now();

        // Validate time integrity every 10 seconds
        if (this.timeRemaining % 10 === 0) {
          this.validateTimeIntegrity();
        }

        // Save every 5 seconds to optimize performance
        if (this.timeRemaining % 5 === 0) {
          this.saveExamToStorage();
        }

        // Auto submit when time runs out
        if (this.timeRemaining <= 0) {
          this.submitExam();
        }
      }
    },

    // Submit exam
    async submitExam(): Promise<void> {
      try {
        this.recordQuestionTime();
        this.isExamActive = false;

        const answers: IUserAnswer[] = [];
        this.questions.forEach((question) => {
          const userAnswer = this.userAnswers.get(question._id) || 0;
          const timeSpent = this.questionTimeSpent.get(question._id) || 0;

          answers.push({
            questionId: question._id,
            userAnswer,
            timeSpent: timeSpent / 1000, // Convert to seconds
          });
        });

        const totalTimeSpent = (Date.now() - this.examStartTime) / 1000;

        const submitData: ISubmitExamPayload = {
          examSessionId: this.examSessionId,
          answers,
          totalTimeSpent,
        };

        console.log('Submit data:', submitData);

        const response = await ExamService.submitExam(submitData);
        console.log('Submit response:', response);

        // Mark session as submitted before clearing data
        this.markSessionAsSubmitted(this.examSessionId);

        // Clear exam data after successful submission
        this.clearExamData();
      } catch (error) {
        console.error('Error submitting exam:', error);
        throw error;
      }
    },

    // Set loading state
    setLoading(loading: boolean): void {
      this.loading = loading;
    },

    // Validate time integrity - additional security check
    validateTimeIntegrity(): boolean {
      if (!this.isExamActive || this.examStartTime === 0) {
        return true; // No validation needed for inactive exams
      }

      const currentTime = Date.now();
      const totalElapsedTime = Math.floor(
        (currentTime - this.examStartTime) / 1000
      ); // seconds
      const totalExamDuration = this.totalTimeInMinutes * 60;
      const expectedTimeRemaining = Math.max(
        0,
        totalExamDuration - totalElapsedTime
      );

      // Allow some tolerance (5 seconds) for processing delays
      const tolerance = 5;
      const timeDifference = Math.abs(
        this.timeRemaining - expectedTimeRemaining
      );

      if (timeDifference > tolerance) {
        console.warn(
          `Time integrity check failed. Expected: ${expectedTimeRemaining}, Actual: ${this.timeRemaining}, Difference: ${timeDifference}`
        );

        // Force correct the time to prevent cheating
        this.timeRemaining = expectedTimeRemaining;
        this.saveExamToStorage();

        return false;
      }

      return true;
    },
  },
});
