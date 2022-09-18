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
  questions: {},
  id: string,
  active: false
}

export interface QuestionState {
  answer: string,
  question: string,
  type: string
}

export interface GroupState {
  session: string,
  users: {}
}

export interface SessionState {
  date: string,
  groups: {}
  active: false
}