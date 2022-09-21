import { createStore, ActionContext, storeKey } from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { rootDatabase } from '@/data/db'
import firebase from 'firebase/app'
import { DbState, QuestionState, RootState, SessionState, UserState } from './types'
import router from '@/router'
import words from './words'

export default createStore<RootState>({
  modules: {
    words
  },
  state: {
    db: {}
  } as RootState,
  getters: {
    getDb: (state: RootState) => () => {
      return state.db
    },
    getUser: (state: RootState, getters: any) => (userid: string) => {
      const user = Object.values(getters['getUsers']()).find((u:any) => u.id == userid)
      if ( user == undefined ) return false
      else return user
    },
    getUsers: (state: RootState) => () => {
      return state.db.users
    },
    getUsersList: (state: RootState, getters: any) => () => {
      return Object.keys(getters['getUsers']())
    },
    isActiveUser: (state: RootState, getters: any) => ( userid: string ) => {
      const user = getters['getUser'](userid)
      if ( user ) return user.active
      else return false
    },
    isValidUser: (state: RootState) => ( userid: string ) => {
      if ( Object.keys(state.db.users).includes(userid) ) {
        return !state.db.users[userid].active
      } else return false
    },
    isValidGroup: (state: RootState) => ( groupid: string ) => {
      return Object.keys(state.db.groups).includes(groupid)
    },
    validUserAndGroup: (state: RootState, getters: any) => (userid: string, groupid: string) => {
      return getters['isValidUser'](userid) && getters['isValidGroup'](groupid) 
    },
    getGroups: (state: RootState) => () => {
      return state.db.groups
    },
    getGroup: (state: RootState, getters: any) => (groupId: string) => {
      const group = Object.values(getters['getGroups']()).find((g:any) => g.id == groupId)
      if ( group == undefined ) return false
      else return group
    },
    getGroupsInSession: (state: RootState, getters: any) => (sessionId: string) => {
      const groups = getters['getGroups']()
      return Object.keys(groups).filter((s:any) => groups[s].session == sessionId)
    },
    getNumber: (state: RootState, getters: any) => (groupId: string) => {
      return getters['getGroup'](groupId)['number']
    },
    getSessions: (state: RootState) => () => {
      if ( state.db.sessions == undefined ) return false
      else return state.db.sessions
    },
    getSessionsList: (state: RootState, getters: any) => () => {
      return Object.keys(getters['getSessions']())
    },
    getActiveSession: (state: RootState, getters: any) => () => {
      const activeSession = Object.values(getters['getSessions']()).filter((s:any) => s.active == true)
      if ( activeSession.length > 0 ) return activeSession[0]
      else return false
    },
    getQuestionnaires: (state: RootState) => () => {
      return state.db.questionnaires
    },
    getQuestionnaire: (state: RootState, getters: any) => ( questionnaireId: string ) => {
      const questionnaire = getters['getQuestionnaires']()[questionnaireId]
      if ( questionnaire == undefined ) return false
      else return questionnaire
    },
    getUserQuestionnaires: (state: RootState, getters: any) => ( userId: string ) => {
      const questionnaires = getters['getUser'](userId)['questionnaires']
      if ( questionnaires == undefined ) return false
      else return questionnaires
    },
    getUserQuestionnaire: (state: RootState, getters: any) => ( userId: string, questionnaireId: string ) => {
      const questionnaires = getters['getUserQuestionnaires'](userId)
      const questionnaire = questionnaires[questionnaireId]
      if ( questionnaire == undefined ) return false
      else return questionnaire
    },
    getCurrentQuestion: (state: RootState, getters: any) => ( userId: string, questionnaireId: string ) => {
      const questionnaire = getters['getUserQuestionnaire'](userId, questionnaireId)
      const currentQuestion = Object.values(questionnaire).find((q:any) => q['active'] == true)
      return currentQuestion
    },
    getCurrentQuestionByIdx: (state: RootState, getters: any) => ( userId: string, questionnaireId: string, idx: number ) => {
      const questionnaire = getters['getUserQuestionnaire'](userId, questionnaireId)
      return questionnaire[idx]
    },
    getRandomUserId: (state: any) => () => {
      return state.words.adjectives[Math.floor(Math.random() * state.words.adjectives.length)] + state.words.nouns[Math.floor(Math.random() * state.words.nouns.length)];
    }
  },
  mutations: {
    ADD_USER(state: RootState, payload: UserState) {
      firebase.database().ref('db/users/' + payload.id).set(payload);
    },
    UPDATE_USER(state: RootState, payload: UserState) {
      firebase.database().ref('db/users/' + payload.id).update(payload);
    },
    UPDATE_USERANSWER(state: RootState, payload) {
      firebase.database().ref('db/users/' + 
        payload.userId + '/' +
        'questionnaires/' +
        payload.questionnaire + '/' +
        payload.currentQuestionId).update({answer: payload.answer});
    },
    UPDATE_QUESTIONACTIVE(state: RootState, payload) {
      firebase.database().ref('db/users/' + 
        payload.userId + '/' +
        'questionnaires/' +
        payload.questionnaire + '/' +
        payload.currentQuestionId).update({active: payload.active});
    },
    ADD_GROUP(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id).set(payload);
    },
    UPDATE_GROUP(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id).update(payload);
    },
    UPDATE_GROUPUSERS(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id + '/users').update(payload.user);
    },
    ADD_SESSION(state: RootState, payload: SessionState) {
      firebase.database().ref('db/sessions/' + payload.id).set(payload);
    },
    UPDATE_SESSION(state: RootState, payload: UserState) {
      firebase.database().ref('db/sessions/' + payload.id).update(payload);
    },
    UPDATE_VALUE(state: RootState, value: number){
      firebase.database().ref('db/groups/group_0/').update({number: value});
    },
    ...vuexfireMutations,
  },
  actions: {
    bindDatabase: firebaseAction(({ bindFirebaseRef }) => {
      return bindFirebaseRef('db', rootDatabase.ref('db'))
    }),
    addUser(
      context, 
      payload: UserState
    ){
      context.commit('UPDATE_USER', payload)
    },
    removeLocalUser(
      context,
      localUserid
    ){
      const userList = context.getters['getUsersList']()
      if (userList.includes(localUserid)) {
        localStorage.removeItem('userid')
        context.commit('UPDATE_USER', {
          id: localUserid,
          active: false
        })
      }
      router.go(0)
    },
    initiateUser( 
      context: ActionContext<RootState, RootState>,
      payload: {userid: string, groupid: string}
    ){
      const uid = payload.userid
      const gid = payload.groupid 

      if ( context.getters['validUserAndGroup'](uid, gid) ) {

        localStorage.setItem('userid', uid)
        context.commit('UPDATE_USER', {
          id: uid,
          active: true
        })
        context.commit('UPDATE_GROUPUSERS', {
          id: gid,
          user: {[uid]: true}
        })

        if ( uid == 'admin' && gid == 'dashboard' ) router.push('/admin')
        else router.push('/questionnaire')
      }
    },
    createUser(
      context
    ){
      const userIds = Object.keys(context.getters['getUsers']())
      var userId = context.getters['getRandomUserId']()
      while (userIds.includes(userId)) {
        userId = context.getters['getRandomUserId']()
      }

      context.commit('ADD_USER', {
        group: {},
        id: userId,
        active: false,
        questionnaires: {}
      })
    },
    createGroup(
      context,
      sessionId: string
    ){
      const groups = context.getters['getGroups']()
      const groupsList = Object.keys(groups)

      var groupNumber = 0
      while (groupsList.includes('group_' + groupNumber)) {
        groupNumber += 1
      }
      const groupId = 'group_' + groupNumber

      context.commit('ADD_GROUP', {
        id: groupId,
        users: {},
        session: sessionId
      })
    },
    startSession(
      context,
      payload: {userAmount: number, groupAmount: number}
    ){
      const activeSession = context.getters['getActiveSession']()
      if (activeSession) {
        context.commit('UPDATE_SESSION', {
          id: activeSession.id,
          active: false
        })
      }

      // set session id
      const dateToday = new Date().toISOString().split('T')[0]

      const sameDaySessions = context.getters['getSessionsList']().filter((s:string) => s.includes(dateToday))
      const lastSession = sameDaySessions.at(-1)

      if ( lastSession != undefined ) {
        var sessionId = lastSession + 'c'
      } else {
        var sessionId = 's' + dateToday
      }

      for (let i = 0; i < payload.userAmount; i++) {
        context.dispatch('createUser')
      }
      for (let i = 0; i < payload.groupAmount; i++) {
        context.dispatch('createGroup', sessionId)
      }

      const groups = context.getters['getGroupsInSession'](sessionId)

      context.commit('ADD_SESSION', {
        id: sessionId,
        active: true,
        groups: groups,
        date: dateToday,
        path: {
          0: {
            completed: false,
            type: 'questionnaire',
            id: 'entry'
          },
          1: {
            completed: false,
            type: 'game',
            id: 'game'
          },
          2: {
            completed: false,
            type: 'questionnaire',
            id: 'game'
          }
        }
      })
    },
    endSession(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      if (activeSession) {
        context.commit('UPDATE_SESSION', {
          id: activeSession.id,
          active: false
        })
      }
    },
    addQuestionnaireToUser(
      context,
      payload: {questionnaireId: string, userId: string}
    ){
      const qid = payload.questionnaireId
      const uid = payload.userId

      if ( context.getters['getUserQuestionnaire'](uid, qid)) {
        return
      } else if ( context.getters['getQuestionnaire'](qid) ) {
        const questionnaire = context.getters['getQuestionnaire'](qid)
        const user = context.getters['getUser'](uid)

        var adjustedQuestionnaire = {}
        if ( user.questionnaires == undefined ) adjustedQuestionnaire = {[qid]: questionnaire}
        else adjustedQuestionnaire = Object.assign(user.questionnaires, {[qid]: questionnaire})
  
        context.commit('UPDATE_USER', {
          id: uid,
          questionnaires: adjustedQuestionnaire
        })
      }
    },
    gotoNextQuestion(
      context,
      payload: {
        userId: string,
        questionnaire: string,
        currentQuestionId: string,
        answer: string
      }
    ){
      if ( Number(payload.currentQuestionId) == Object.keys(context.getters['getUserQuestionnaire'](payload.userId, payload.questionnaire)).length ) {
        var pathLoc = Number(localStorage.getItem('pathLoc'))
        pathLoc += 1
        localStorage.setItem('pathLoc', String(pathLoc))
        context.commit('UPDATE_USERANSWER', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: payload.currentQuestionId,
          answer: payload.answer,
          active: false
        })
      } else {
        context.commit('UPDATE_USERANSWER', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: payload.currentQuestionId,
          answer: payload.answer
        })
        context.commit('UPDATE_QUESTIONACTIVE', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: payload.currentQuestionId,
          active: false
        })
        context.commit('UPDATE_QUESTIONACTIVE', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: String(Number(payload.currentQuestionId) + 1),
          active: true
        })
      }
    },
    gotoPrevQuestion(
      context,
      payload: {
        userId: string,
        questionnaire: string,
        currentQuestionId: string
      }
    ){
      context.commit('UPDATE_QUESTIONACTIVE', {
        userId: payload.userId,
        questionnaire: payload.questionnaire,
        currentQuestionId: payload.currentQuestionId,
        active: false
      })
      context.commit('UPDATE_QUESTIONACTIVE', {
        userId: payload.userId,
        questionnaire: payload.questionnaire,
        currentQuestionId: String(Number(payload.currentQuestionId) - 1),
        active: true
      })
    },
    updateNumber(
      context,
      value: number
    ){
      context.commit('UPDATE_VALUE', value)
    },
  }
})