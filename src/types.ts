export type DecisionMode =
  | 'classic'
  | 'elimination'
  | 'tournament'
  | 'luckydraw'
  | 'team'
  | 'classroom';

export type ExtraTool =
  | 'wheel'
  | 'coin'
  | 'dice'
  | 'number'
  | 'namepicker'
  | 'teamgen'
  | 'dashboard';

export interface WheelOption {
  id: string;
  label: string;
  weight: number; // 1 to 10
  color: string;
  icon?: string;
  eliminated?: boolean;
}

export interface WheelTheme {
  id: string;
  name: string;
  colors: string[];
  backgroundGradient: string;
  pointerColor: string;
  borderColor: string;
  hubColor: string;
}

export interface UserNameTag {
  name: string;
  role?: string;
  color?: string;
  icon?: string;
}

export interface Wheel {
  id: string;
  title: string;
  description?: string;
  options: WheelOption[];
  themeId: string;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
  category?: string;
  authorNameTag?: string;
}

export interface SpinRecord {
  id: string;
  wheelId: string;
  wheelTitle: string;
  winnerOptionId: string;
  winnerLabel: string;
  winnerColor: string;
  timestamp: number;
  mode: DecisionMode;
  spinnerNameTag?: string;
}

export interface AIInsightsData {
  trendSummary: string;
  luckIndex: number;
  favoredOption: string;
  personalityType: string;
  funFact: string;
  actionableAdvice: string;
  insightsList: string[];
}

export interface TournamentMatch {
  id: string;
  round: number;
  itemA: WheelOption;
  itemB: WheelOption;
  winner?: WheelOption;
}
