export interface ICardSetCard {
  id: string;
  terminology: string;
  define: string;
}

export interface ICardSet {
  id: string;
  title: string;
  description: string;
  cards: ICardSetCard[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ICreateCardSetParams {
  title: string;
  description: string;
  cards: Omit<ICardSetCard, 'id'>[];
}

export interface IUpdateCardSetParams extends Partial<ICreateCardSetParams> {
  id: string;
}

export type StudyMode = 'flashcards' | 'test' | 'write' | 'learn';

export interface IStudyProgress {
  cardId: string;
  correctCount: number;
  incorrectCount: number;
  lastStudied: string;
}

export interface ITestQuestion {
  card: ICardSetCard;
  options: string[];
  correctAnswer: string;
}

export interface IStudySession {
  cardSetId: string;
  mode: StudyMode;
  progress: IStudyProgress[];
  startedAt: string;
  completedAt?: string;
}
