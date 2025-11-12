import { httpCaller } from '../libs';
import type { NewApiResponse, IGetListResult } from '~/interfaces';
import type {
  IQuestion,
  IQuestionForRandom,
  ICreateQuestion,
  IUpdateQuestion,
  IImportQuestionFromUrl,
  IQuestionFilters,
  IRandomQuestionFilters,
  IImportQuestionPayloadResponse,
} from '~/interfaces';

export class QuestionService {
  /**
   * Lấy danh sách câu hỏi với pagination
   */
  static async getQuestions(
    filters?: IQuestionFilters
  ): Promise<NewApiResponse<IGetListResult<IQuestion>>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.level) params.append('level', filters.level.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    // Default values
    if (!filters?.page) params.append('page', '1');
    if (!filters?.limit) params.append('limit', '10');

    const queryString = params.toString();
    const url = `/questions${queryString ? `?${queryString}` : ''}`;

    const response = await httpCaller.get(url);
    return response.data as NewApiResponse<IGetListResult<IQuestion>>;
  }

  /**
   * Lấy câu hỏi ngẫu nhiên cho bài thi
   */
  static async getRandomQuestions(
    filters?: IRandomQuestionFilters
  ): Promise<NewApiResponse<IQuestionForRandom[]>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.numQuestions)
        params.append('numQuestions', filters.numQuestions.toString());
      if (filters.levels) {
        filters.levels.forEach((level) =>
          params.append('levels', level.toString())
        );
      }
      if (filters.questionTypes) {
        filters.questionTypes.forEach((type) =>
          params.append('questionTypes', type.toString())
        );
      }
    }

    const queryString = params.toString();
    const url = `/questions/random${queryString ? `?${queryString}` : ''}`;

    const response = await httpCaller.get(url);
    return response.data as NewApiResponse<IQuestionForRandom[]>;
  }

  /**
   * Lấy thông tin chi tiết một câu hỏi
   */
  static async getQuestionById(
    questionId: string
  ): Promise<NewApiResponse<IQuestion>> {
    const response = await httpCaller.get(`/questions/${questionId}`);
    return response.data as NewApiResponse<IQuestion>;
  }

  /**
   * Tạo câu hỏi mới
   */
  static async createQuestion(
    questionData: ICreateQuestion
  ): Promise<NewApiResponse<IQuestion>> {
    const response = await httpCaller.post('/questions', questionData);
    return response.data as NewApiResponse<IQuestion>;
  }

  /**
   * Cập nhật câu hỏi
   */
  static async updateQuestion(
    questionId: string,
    questionData: IUpdateQuestion
  ): Promise<NewApiResponse<IQuestion>> {
    delete (questionData as any)._id;

    const response = await httpCaller.put(
      `/questions/${questionId}`,
      questionData
    );
    return response.data as NewApiResponse<IQuestion>;
  }

  /**
   * Xóa câu hỏi
   */
  static async deleteQuestion(
    questionId: string
  ): Promise<NewApiResponse<void>> {
    const response = await httpCaller.delete(`/questions/${questionId}`);
    return response.data as NewApiResponse<void>;
  }

  /**
   * Import câu hỏi từ Excel URL
   */
  static async importQuestionsFromUrl(
    importData: IImportQuestionFromUrl
  ): Promise<NewApiResponse<IImportQuestionPayloadResponse>> {
    const response = await httpCaller.post('/questions/import', importData);
    return response.data as NewApiResponse<IImportQuestionPayloadResponse>;
  }
}
