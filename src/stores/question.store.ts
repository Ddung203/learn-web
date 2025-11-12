import { defineStore } from 'pinia';

import { STATUS_CODE } from '~/constants';
import type {
  IGetListResult,
  IQuestion,
  IQuestionFilters,
  IQuestionForRandom,
  NewApiResponse
} from '~/interfaces';
import { QuestionService } from '~/services';
import { STORE_IDS } from './store-id';

export interface QuestionState {
  questions: IQuestion[];
  selectedQuestion: IQuestion | null;
  randomQuestions: IQuestionForRandom[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: IQuestionFilters;
}

export const useQuestionStore = defineStore(STORE_IDS.QUESTION, {
  state: (): QuestionState => ({
    questions: [],
    selectedQuestion: null,
    randomQuestions: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: {
      page: 1,
      limit: 10,
      search: '',
      level: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    },
  }),

  getters: {
    getQuestionById: (state) => (id: string) => {
      return state.questions.find((question) => question._id === id);
    },

    hasQuestions: (state): boolean => {
      return state.questions.length > 0;
    },

    hasRandomQuestions: (state): boolean => {
      return state.randomQuestions.length > 0;
    },

    getCurrentFilters: (state): IQuestionFilters => {
      return state.filters;
    },

    getTotalPages: (state): number => {
      return state.pagination.totalPages;
    },

    getSelectedQuestion: (state): IQuestion | null => {
      return state.selectedQuestion;
    },
  },

  actions: {
    setLoading(loading: boolean): void {
      this.loading = loading;
    },

    setQuestions(questions: IQuestion[]): void {
      this.questions = questions;
    },

    setSelectedQuestion(question: IQuestion | null): void {
      this.selectedQuestion = question;
    },

    setRandomQuestions(questions: IQuestionForRandom[]): void {
      this.randomQuestions = questions;
    },

    addQuestion(question: IQuestion): void {
      this.questions.push(question);
    },

    removeQuestion(questionId: string): void {
      this.questions = this.questions.filter((q) => q._id !== questionId);
    },

    setFilters(filters: IQuestionFilters): void {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters(): void {
      this.filters = {};
    },

    setPagination(paginationData: IGetListResult<IQuestion>): void {
      this.pagination = {
        page: paginationData.page,
        limit: paginationData.perPage,
        total: paginationData.totalData,
        totalPages: paginationData.totalPages,
        hasNextPage: paginationData.hasNextPage,
        hasPrevPage: paginationData.hasPrevPage,
      };
    },

    async getQuestionsHandle(filters?: IQuestionFilters): Promise<void> {
      this.setLoading(true);

      const queryFilters = { ...this.filters, ...filters };

      const response: NewApiResponse<IGetListResult<IQuestion>> =
        await QuestionService.getQuestions(queryFilters);

      if (response.status === STATUS_CODE.SUCCESS) {
        this.setQuestions(response.payload.data);
        this.setPagination(response.payload);
        this.setFilters(queryFilters);
      }
    },

    async getRandomQuestionsHandle(filters?: {
      numQuestions?: number;
      levels?: (1 | 2 | 3 | 4)[];
      questionTypes?: (1 | 2 | 3 | 4 | 5)[];
    }): Promise<void> {
      this.setLoading(true);
      const response: NewApiResponse<IQuestionForRandom[]> =
        await QuestionService.getRandomQuestions(filters);

      if (response.payload) {
        this.setRandomQuestions(response.payload);
      } else {
        throw new Error(response.message || 'Không thể lấy câu hỏi ngẫu nhiên');
      }
    },
  },
});
