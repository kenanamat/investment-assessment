export interface RootState {
  db: DbState,
  timeLeft: number
}

export interface DbState {
  users: { [id: string]: UserState },
  questionnaires: { id: { id: QuestionState } },
  game: GameState,
  fakeGame: GameState,
  groups: { [id: string]: GroupState },
  sessions: { id: SessionState }
}

export interface UserState {
  group: string,
  id: string,
  active: boolean,
  session: string,
  questionnaires: {},
  code: string
}

export interface QuestionState {
  id: string,
  answer: string,
  question: string,
  type: string,
  answers: {[letter: string]: string},
  comment: string,
  followup: QuestionState,
  max: number,
  min: number,
  minText: string,
  maxText: string,
  questions: string[]
}

export interface GameState {
  rounds: [RoundState],
  time: number,
  interview: boolean,
  groupEdit: boolean,
  points: number,
  constants: {[id: string]: number},
  startValues: {[id: string]: number}
}

export interface RoundState {
  completed: boolean,
  index: number,
  profit: number,
  interviewAnswer: string,
  inputs: InputState,
  outputs: OutputState,
  results: ResultState,
  questionnaire: QuestionState[]
}

export interface GroupState {
  id: string,
  game: GameState,
  fakeGame: GameState,
  number: number,
  session: string,
  color: string,
  users: {},
  ready: {},
  leader: string,
  treatment: string
}

export interface SessionState {
  id: string,
  date: string,
  groups: {},
  users: {},
  active: boolean,
  path: {[id: number]: pathItemState},
  currentRound: number,
  timerEnd: number
}

export interface pathItemState {
  completed: boolean,
  type: string,
  id: string,
  canContinue: boolean,
  index: number
}

export interface ResultState {
  Ca: number,
  E: number,
  K: number,
  L: number,
  Q: number,
  Y: number,
  cost: number,
  environmental_impact: number,
  social_impact: number,
  left_over_budget: number,
  profit_post_tax: number,
  profit_pre_tax: number,
  q: number,
  return: number,
  tot_rd: number,
  tot_environmental_impact: number,
  tot_social_impact: number,
  tot_profit_post_tax: number
}

export interface InputState {
  w: number,
  q: number,
  E: number,
  R_L: number,
  R_K: number,
  R_E: number,
}

export interface OutputState {
  A_E: number,
  A_K: number,
  A_L: number,
  I: number,
  K: number,
  L: number,
  Q: number,
  Y: number,
  left_over_budget: number,
  p_R_E: number,
  p_R_K: number,
  p_R_L: number,
  use: number
}