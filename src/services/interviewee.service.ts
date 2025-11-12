import type { PaginationParams } from '.';
import { httpCaller } from '../libs';

export class IntervieweeService {
  static async getInterviewees(params: PaginationParams) {
    const response = await httpCaller.get('/interviewees', {
      params,
    });

    return response.data;
  }
}
