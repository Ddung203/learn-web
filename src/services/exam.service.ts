import type {
  ICommonPayloadResponse,
  ICreateInterviewEvaluationParams,
  IExamSession,
  IExamSessionFilters,
  IGetListResult,
  IStartInterviewPayloadResponse,
  ISubmitExamPayload,
  ISubmitInterviewPayload,
  NewApiResponse,
} from '~/interfaces';
import { httpCaller } from '../libs';

export class ExamService {
  static async startInterviewExamSession(
    startTime: string
  ): Promise<NewApiResponse<IStartInterviewPayloadResponse>> {
    const response = await httpCaller.post('/exam-sessions/start-exam', {
      startTime,
    });

    return response.data as NewApiResponse<IStartInterviewPayloadResponse>;
  }

  static async createInterviewEvaluation(
    params: ICreateInterviewEvaluationParams
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/exam-sessions/interview', {
      ...params,
    });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async submitExam(
    submitData: ISubmitExamPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/exam-sessions/submit', {
      ...submitData,
    });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async submitInterview(
    submitData: ISubmitInterviewPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/exam-sessions/interview', {
      ...submitData,
    });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async getExamSessionByUserId(
    userId: string
  ): Promise<NewApiResponse<IExamSession[]>> {
    const response = await httpCaller.get(
      `/mapping/exam-sessions/user/${userId}`
    );

    return response.data as NewApiResponse<IExamSession[]>;
  }

  static async getExamSessions(
    filters?: IExamSessionFilters
  ): Promise<NewApiResponse<IGetListResult<IExamSession>>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.interviewerId)
        params.append('interviewerId', filters.interviewerId);
    }

    // Default values
    if (!filters?.page) params.append('page', '1');
    if (!filters?.limit) params.append('limit', '10');

    const queryString = params.toString();
    const url = `/exam-sessions${queryString ? `?${queryString}` : ''}`;

    const response = await httpCaller.get(url);
    return response.data as NewApiResponse<IGetListResult<IExamSession>>;
  }
}
