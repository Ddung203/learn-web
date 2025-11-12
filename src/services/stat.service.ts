import { httpCaller } from '../libs';
import type { IStatData, IStatResponse } from '~/interfaces';

export class StatService {
  static async getStatInfo(): Promise<IStatResponse> {
    const response = await httpCaller.get<IStatResponse>('stat');
    return response.data;
  }
}
