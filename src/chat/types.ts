export interface GlobalChatData {
  username: string;
  email: string;
  room: string;
  message: string;
  userUrl?: string;
}

export type CounterField =
  | 'generalEnglishRoom'
  | 'generalSpanishRoom'
  | 'generalPolishRoom'
  | 'teachersEnglishRoom'
  | 'teachersSpanishRoom'
  | 'teachersPolishRoom'
  | 'randomRoom';
