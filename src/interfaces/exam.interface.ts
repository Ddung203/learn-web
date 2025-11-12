export interface ICreateInterviewEvaluationParams {
  examSessionId: string;
  knowledgeScore: number;
  attitudeScore: number;
  interviewNotes: string;
  otherNotes?: string;
  interviewEndTime?: string;
}

export interface IStartInterviewPayloadResponse {
  _id: string;
  userId: string;
  startTime: string;
}

export interface IUserAnswer {
  questionId: string;
  userAnswer: number;
  timeSpent: number;
}

export interface ISubmitExamPayload {
  examSessionId: string;
  answers: IUserAnswer[];
  totalTimeSpent: number;
}

export interface ISubmitInterviewPayload {
  examSessionId: string;
  interviewerId: string;
  knowledgeScore: number;
  attitudeScore: string;
  interviewNotes: string;
  otherNotes?: string;
  interviewEndTime: string;
}

export interface IExamUserAnswer {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: 0 | 1;
  level: number;
  points: number;
  timeSpent: number;
}

export interface ILevelStats {
  level1: {
    correct: number;
    total: number;
    points: number;
  };
  level2: {
    correct: number;
    total: number;
    points: number;
  };
  level3: {
    correct: number;
    total: number;
    points: number;
  };
  level4: {
    correct: number;
    total: number;
    points: number;
  };
}

export interface IExamSession {
  _id: string;
  userId: string;
  startTime: string;
  createdBy?: string;
  updatedBy?: string;
  userAnswers?: IExamUserAnswer[];
  createdAt?: string;
  updatedAt?: string;
  correctAnswers?: number;
  incorrectAnswers?: number;
  levelStats?: ILevelStats;
  maxPossibleScore?: number;
  percentage?: number;
  skippedQuestions: number;
  totalQuestions: number;
  totalScore: number;
  totalTimeSpent: number;
  attitudeScore?: number;
  finalScore?: number;
  interviewEndTime?: string;
  interviewNotes?: string;
  interviewerId?: string;
  knowledgeScore?: number;
  otherNotes?: string;
  id: string;
}

export interface IExamSessionFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  interviewerId?: string;
}
