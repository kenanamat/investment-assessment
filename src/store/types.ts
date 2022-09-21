export interface RootState {
  db: DbState
}

export interface DbState {
  users: { [id: string]: UserState },
  questionnaires: { id: { id: QuestionState } },
  groups: { [id: string]: GroupState },
  sessions: { id: SessionState }
}

export interface UserState {
  group: {},
  id: string,
  active: boolean,
  questionnaires: {}
}

export interface QuestionState {
  id: string,
  answer: string,
  question: string,
  type: string,
  answers: {[letter: string]: string}
}

export interface GroupState {
  id: string,
  number: number,
  session: string,
  users: {}
}

export interface SessionState {
  id: string,
  date: string,
  groups: {},
  active: boolean,
  path: {[id: number]: pathItemState}
}

export interface pathItemState {
  completed: boolean,
  type: string,
  id: string
}