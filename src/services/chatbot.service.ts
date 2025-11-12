import type { NewApiResponse } from '~/interfaces';
import { httpCaller } from '../libs';

export class ChatbotService {
  static async chatbot(userMessage: string) {
    const response = await httpCaller.post('/chatbot/ai-support', {
      userMessage,
    });

    return response.data as NewApiResponse<string>;
  }
}
