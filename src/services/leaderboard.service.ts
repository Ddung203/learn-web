import type { ILeaderboardPayloadResponse, NewApiResponse } from '~/interfaces';
import { httpCaller } from '../libs';

export class LeaderboardService {
  static async getLeaderboard(
    testCompletedOnly: boolean = false,
    limit: number = 1000
  ): Promise<NewApiResponse<ILeaderboardPayloadResponse>> {
    const response = await httpCaller.get('/user-status/leaderboard', {
      testCompletedOnly,
      limit,
    });

    return response.data as NewApiResponse<ILeaderboardPayloadResponse>;
  }
}
