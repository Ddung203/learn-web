export type PaginationParams = {
  skip?: number;
  limit?: number;
  filter?: Record<string, any>;
};

export * from './auth.service';
export * from './chatbot.service';
export * from './exam.service';
export * from './feedback.service';
export * from './interviewee.service';
export * from './leaderboard.service';
export * from './province.service';
export * from './question.service';
export * from './stat.service';
export * from './student.service';
export * from './user.service';
