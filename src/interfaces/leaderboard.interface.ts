import type { IUserMapping } from './user.interface';

export interface ILeaderboardPayloadResponse {
  users: {
    _id: string;
    userId: string;
    currentStatus: string;
    rank: string;
    knowledgeScore?: number;
    attitudeScore?: number;
    finalScore?: number;
    testScore?: number;
    [key: string]: any;
  }[];
  totalUsersWithTest: number;
  totalUsersWithInterview: number;
  lastUpdated: string;
  usersMapping?: IUserMapping[];
}
