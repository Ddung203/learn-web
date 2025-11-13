export const STORE_ID = {
  AUTH: 'auth',
  USER: 'user',
  INTERVIEWEE: 'interviewee',
  INTERVIEWER: 'interviewer',
  LEADERBOARD: 'leaderboard',
  EXAM: 'exam',
  QUESTION: 'question',
  STUDENT: 'student',
  UI: 'ui',
  LOCALE: 'locale',
  CARDSET: 'cardset',
} as const;

// Alias for backwards compatibility
export const STORE_IDS = STORE_ID;
