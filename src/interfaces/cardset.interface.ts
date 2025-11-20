export interface ICardSetCard {
  id: string;
  terminology: string;
  define: string;
  example?: string;
  image_url?: string;
  part_of_speech?: string;
  phonetic?: string;
}

export interface ICardSet {
  id: string;
  title: string;
  description: string;
  language?: string;
  cards: ICardSetCard[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_public?: boolean;
  download_count?: number;
}

export interface ICreateCardSetParams {
  title: string;
  description: string;
  language?: string;
  cards: Omit<ICardSetCard, 'id'>[];
}

export interface IUpdateCardSetParams extends Partial<ICreateCardSetParams> {
  id: string;
}

export type StudyMode = 'flashcards' | 'test' | 'write' | 'learn' | 'listen';

export interface IStudyProgress {
  card_id: string;
  correct_count: number;
  incorrect_count: number;
  last_studied: string;
}

export interface ITestQuestion {
  card: ICardSetCard;
  options: string[];
  correct_answer: string;
}

export interface IStudySession {
  cardset_id: string;
  mode: StudyMode;
  progress: IStudyProgress[];
  started_at: string;
  completed_at?: string;
}
