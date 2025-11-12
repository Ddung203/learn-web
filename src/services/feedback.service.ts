import { httpCaller } from '../libs';

import type {
  IFeedback,
  ISendFeedbackParams,
  NewApiResponse,
} from '~/interfaces';

export class FeedbackService {
  static async sendFeedback(body: ISendFeedbackParams): Promise<
    NewApiResponse<{
      feedback: IFeedback;
      message: string;
    }>
  > {
    const response = await httpCaller.post('/feedback', {
      ...body,
      phoneNumber: '0123456789',
    });

    return response.data as NewApiResponse<{
      feedback: IFeedback;
      message: string;
    }>;
  }
}
