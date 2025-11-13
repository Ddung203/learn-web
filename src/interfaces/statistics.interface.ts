export type StudyMode = 'flashcard' | 'test' | 'write' | 'learn';

export interface ICardAttempt {
  card_id: string;
  correct: boolean;
  time_spent: number; // seconds
  user_answer: string;
  confidence_level?: number; // 1-5 scale
  attempted_at: string;
}

export interface IStudySession {
  id: string;
  user_id: string;
  cardset_id: string;
  mode: StudyMode;
  start_time: string;
  end_time: string;
  duration: number; // seconds
  total_cards: number;
  correct: number;
  incorrect: number;
  accuracy: number; // percentage
  attempts: ICardAttempt[];
  created_at: string;
}

export interface IDailyStats {
  date: string;
  sessions_count: number;
  cards_studied: number;
  time_spent: number; // seconds
  accuracy: number;
}

export interface ICardMastery {
  card_id: string;
  user_id: string;
  cardset_id: string;
  times_studied: number;
  times_correct: number;
  times_incorrect: number;
  mastery_level: number; // 0-100%
  last_studied: string;
  last_correct: boolean;
}

export interface IUserStatistics {
  id: string;
  user_id: string;
  total_study_time: number; // seconds
  total_sessions: number;
  total_cards_studied: number;
  total_attempts: number;
  overall_accuracy: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
  daily_stats: IDailyStats[];
  cards_mastered: number;
  cards_learning: number;
  cards_new: number;
  updated_at: string;
}

export interface IPerformanceByMode {
  mode: StudyMode;
  sessions: number;
  total_cards: number;
  accuracy: number;
  avg_time_per_card: number;
}

export interface IStatisticsResponse {
  overview: IUserStatistics;
  performance_by_mode: IPerformanceByMode[];
  recent_sessions: IStudySession[];
  weak_cards: ICardMastery[];
  mastered_cards: ICardMastery[];
}

export interface ICardSetStatistics {
  cardset: {
    id: string;
    title: string;
    description: string;
  };
  sessions: IStudySession[];
  card_mastery: ICardMastery[];
}

export interface ICreateSessionRequest {
  cardset_id: string;
  mode: StudyMode;
  start_time: string;
  end_time: string;
  attempts: ICardAttempt[];
}
