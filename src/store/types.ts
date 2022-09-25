export interface RootState {
  db: DbState
}

export interface DbState {
  users: { [id: string]: UserState },
  questionnaires: { id: { id: QuestionState } },
  game: GameState,
  groups: { [id: string]: GroupState },
  sessions: { id: SessionState }
}

export interface UserState {
  group: string,
  id: string,
  active: boolean,
  session: string,
  questionnaires: {}
}

export interface QuestionState {
  id: string,
  answer: string,
  question: string,
  type: string,
  answers: {[letter: string]: string}
}

export interface GameState {
  rounds: [RoundState],
  time: number
}

export interface RoundState {
  completed: boolean,
  index: number,
  profit: number,
  values: {},
  answers: {}
}

export interface GroupState {
  id: string,
  game: GameState,
  number: number,
  session: string,
  users: {},
  ready: {},
  leader: string
}

export interface SessionState {
  id: string,
  date: string,
  groups: {},
  users: {},
  active: boolean,
  path: {[id: number]: pathItemState},
  currentRound: number
}

export interface pathItemState {
  completed: boolean,
  type: string,
  id: string,
  canContinue: boolean,
  index: number
}