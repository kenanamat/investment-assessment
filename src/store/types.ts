export interface RootState {
  db: DbState
}

export interface DbState {
  users: { [id: string]: UserState },
  questionnaires: { id: { id: QuestionState } },
  groups: { id: GroupState },
  sessions: { id: SessionState }
}

export interface UserState {
  group: {},
  id: string,
  active: boolean,
  questionnaires: {}
}

export interface QuestionState {
  answer: string,
  question: string,
  type: string,
  answers: {[letter: string]: string}
}

export interface GroupState {
  session: string,
  users: {}
}

export interface SessionState {
  id: string,
  date: string,
  groups: {},
  active: boolean,
  path: []
}