import { createStore, ActionContext, storeKey } from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { rootDatabase } from '@/data/db'
import firebase from 'firebase/app'
import { DbState, pathItemState, QuestionState, RootState, RoundState, SessionState, UserState } from './types'
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
    getUserGroup: (state: RootState, getters: any) => (userId: string) => {
      return getters['getGroup'](getters['getUser'](userId).group) ?? false
    },
    getUsersInSession: (state: RootState, getters: any) => (sessionId: string) => {
      const users = getters['getUsers']()
      return Object.keys(users).filter((s:any) => users[s].session === sessionId)
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
      return getters['getGroups']()[groupId] ?? false
    },
    getGroupUsers: (state: RootState, getters: any) => ( groupId: string ) => {
      const group = getters['getGroup'](groupId)
      const users = group.users
      return Object.keys(users ?? false) ?? []
    },
    getGroupsInSession: (state: RootState, getters: any) => (sessionId: string) => {
      const groups = getters['getGroups']()
      return Object.keys(groups ?? []).filter((s:any) => groups[s].session == sessionId)
    },
    getGroupValue: (state: RootState, getters: any) => (groupId: string, currentRound: number, type: string) => {
      return getters['getGroup'](groupId).game.rounds[currentRound].values[type]
    },
    getGroupAnswer: (state: RootState, getters: any) => (groupId: string, currentRound: number, type: string) => {
      return getters['getGroup'](groupId).game.rounds[currentRound].answers[type]
    },
    getGroupProfits: (state: RootState, getters: any) => (groupId: string) => {
      return getters['getGroup'](groupId).game.rounds.reduce((profits: Array<number>, round: RoundState) => {
        profits.push(round.profit)
        return profits
      }, [])
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
    getUsersReady: (state: RootState, getters: any) => ( groupId: string ) => {
      const group = getters['getGroup'](groupId)
      const groupReadyUsers = group.ready
      if ( groupReadyUsers == undefined ) {
        return true
      } else return Object.keys(groupReadyUsers).every((u: string) => groupReadyUsers[u] === true)
    }, 
    getGroupsReady: (state: RootState, getters: any) => () => {
      const activeSession = getters['getActiveSession']()
      const groupsInSession = getters['getGroupsInSession'](activeSession.id)
      return groupsInSession.every((g: string) => getters['getUsersReady'](g))
    },
    getPathLoc: (state: RootState, getters: any) => (userId: string) => {
      const sessionPath = getters['getActiveSession']().path
      if ( sessionPath ) {
        const pathLoc = sessionPath.find((p: pathItemState) => p.completed == false ) ?? false
        if (userId != 'admin') {
          if ( pathLoc && pathLoc.canContinue == false) {
            router.push('/waiting')
          }
        }
        return pathLoc
      } else return false
    },
    getReadyUsers: (state: RootState, getters: any) => ( groupId: string ) => {
      const group = getters['getGroup'](groupId)
      return Object.keys(group.ready).filter((u: string) => group.ready[u] == true)
    },
    getUnreadyUsers: (state: RootState, getters: any) => ( groupId: string ) => {
      const group = getters['getGroup'](groupId)
      return Object.keys(group.ready).filter((u: string) => group.ready[u] == false)
    },
    getQuestionnaires: (state: RootState) => () => {
      return state.db.questionnaires
    },
    getQuestionnaire: (state: RootState, getters: any) => ( questionnaireId: string ) => {
      return getters['getQuestionnaires']()[questionnaireId] ?? false
    },
    getUserQuestionnaires: (state: RootState, getters: any) => ( userId: string ) => {
      return getters['getUser'](userId)['questionnaires'] ?? false
    },
    getUserQuestionnaire: (state: RootState, getters: any) => ( userId: string, questionnaireId: string ) => {
      return getters['getUserQuestionnaires'](userId)[questionnaireId] ?? false
    },
    getGame: (state: RootState) => () => {
      return state.db.game
    },
    getGroupGame: (state: RootState, getters: any) => ( groupId: string ) => {
      return getters['getGroup'](groupId)['game'] ?? false
    },
    getGroupGameRound: (state: RootState, getters: any) => ( groupId: string, roundNumber: number ) => {
      return getters['getGroupGame'](groupId).rounds[roundNumber] ?? false
    },
    getCurrentRound: (state: RootState, getters: any) => () => {
      return getters['getActiveSession']()['currentRound'] ?? false
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
    UPDATE_GROUPREADY(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id + '/ready').update(payload.user);
    },
    UPDATE_GROUPUSERS(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id + '/users').update(payload.user);
    },
    UPDATE_GROUPGAME(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id ).update({game: payload.game});
    },
    ADD_SESSION(state: RootState, payload: SessionState) {
      firebase.database().ref('db/sessions/' + payload.id).set(payload);
    },
    UPDATE_SESSION(state: RootState, payload: UserState) {
      firebase.database().ref('db/sessions/' + payload.id).update(payload);
    },
    UPDATE_SESSIONPATH(state: RootState, payload: {id: string, pathLoc: string, object: {}}) {
      firebase.database().ref('db/sessions/' + payload.id + '/path/' + payload.pathLoc ).update(payload.object);
    },
    UPDATE_GROUPROUND(state: RootState, payload: {groupId: string, currentRound: number, object: {}}){
      firebase.database().ref('db/groups/' + payload.groupId + '/game/rounds/' + payload.currentRound).update(payload.object);
    },
    UPDATE_GROUPVALUE(state: RootState, payload: {groupId: string, currentRound: number, value: number, type: string}){
      firebase.database().ref('db/groups/' + payload.groupId + '/game/rounds/' + payload.currentRound + '/values').update({[payload.type]: payload.value});
    },
    UPDATE_GROUPANSWER(state: RootState, payload: {groupId: string, currentRound: number, answers: {}}){
      firebase.database().ref('db/groups/' + payload.groupId + '/game/rounds/' + payload.currentRound + '/answers').update(payload.answers);
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
      localStorage.removeItem('userid')
      if (userList.includes(localUserid)) {
        context.commit('UPDATE_USER', {
          id: localUserid,
          active: false
        })
      }
      router.push('/')
      router.go(0)
    },
    initiateAdmin(
      context
    ){
      localStorage.setItem('userid', 'admin')
      context.commit('UPDATE_USER', {
        id: 'admin',
        active: true
      })
      router.go(0)
    },
    initiateUser( 
      context: ActionContext<RootState, RootState>,
      payload: {userid: string, groupid: string}
    ){
      const uid = payload.userid
      const gid = payload.groupid 

      if ( context.getters['getUserGroup'](uid) ) {
        if ( context.getters['getUser'](uid).active ) {
          return console.log('Already logged in')
        } else {
          localStorage.setItem('userid', uid)
          context.commit('UPDATE_USER', {
            id: uid,
            active: true
          })
          if ( uid == 'admin' && gid == 'dashboard' ) router.push('/admin')
          else router.push('/questionnaire')  
        }
      } else if ( context.getters['validUserAndGroup'](uid, gid) ) {
        localStorage.setItem('userid', uid)
        context.commit('UPDATE_USER', {
          id: uid,
          active: true,
          group: gid
        })
        if (context.getters['getGroup'](gid).leader == '') context.commit('UPDATE_GROUP', {id: gid, leader: uid})
        context.commit('UPDATE_GROUPUSERS', {
          id: gid,
          user: {[uid]: true}
        })
        context.commit('UPDATE_GROUPREADY', {
          id: gid,
          user: {[uid]: false}
        })

        if ( uid == 'admin' && gid == 'dashboard' ) router.push('/admin')
        else router.push('/questionnaire')
      }
    },
    createUser(
      context,
      sessionId: string
    ){
      const userIds = Object.keys(context.getters['getUsers']())
      var userId: string = context.getters['getRandomUserId']()
      while (userIds.includes(userId)) {
        userId = context.getters['getRandomUserId']()
      }

      context.commit('ADD_USER', {
        group: {},
        id: userId,
        active: false,
        session: sessionId,
        questionnaires: {}
      })

      return userId
    },
    createGroup(
      context,
      payload: {
        sessionId: string,
        color: string
      }
    ){
      const groups = context.getters['getGroups']()
      const groupsList = Object.keys(groups ?? [])

      var groupNumber = 0
      while (groupsList.includes('group_' + groupNumber)) {
        groupNumber += 1
      }

      const game = context.getters['getGame']()
      const groupId = 'group_' + groupNumber

      context.commit('ADD_GROUP', {
        id: groupId,
        users: {},
        ready: {},
        game: game,
        color: payload.color,
        session: payload.sessionId,
        leader: ''
      })
    },
    startSession(
      context,
      payload: {userAmount: number, groupAmount: number}
    ){
      const activeSession = context.getters['getActiveSession']()

      var colors = [
        "#25CCF7","#FD7272","#54a0ff","#00d2d3",
        "#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e",
        "#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50",
        "#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6",
        "#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d",
        "#55efc4","#81ecec","#74b9ff","#a29bfe","#dfe6e9",
        "#00b894","#00cec9","#0984e3","#6c5ce7","#ffeaa7",
        "#fab1a0","#ff7675","#fd79a8","#fdcb6e","#e17055",
        "#d63031","#feca57","#5f27cd","#54a0ff","#01a3a4"
      ]

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
        context.dispatch('createUser', sessionId)
      }
      for (let i = 0; i < payload.groupAmount; i++) {
        context.dispatch('createGroup', {sessionId: sessionId, color: colors.pop()})
      }
      
      var users: {[id: string]: boolean} = {}
      context.getters['getUsersInSession'](sessionId).forEach((u: string) => {
        users[u] = true;
      })
      var groups: {[id: string]: boolean} = {}
      context.getters['getGroupsInSession'](sessionId).forEach((u: string) => {
        groups[u] = true;
      })

      context.commit('ADD_SESSION', {
        id: sessionId,
        active: true,
        groups: groups,
        users: users,
        date: dateToday,
        currentRound: 0,
        path: {
          0: {
            index: 0,
            canContinue: true,
            completed: false,
            type: 'questionnaire',
            id: 'entry'
          },
          1: {
            index: 1,
            canContinue: false,
            completed: false,
            type: 'game',
          },
          2: {
            index: 2,
            completed: false,
            canContinue: true,
            type: 'questionnaire',
            id: 'midRound'
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
    unreadyAll(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const users = context.getters['getUsersInSession'](activeSession.id)

      users.forEach((u: string) => {
        context.commit('UPDATE_GROUPREADY', {
          id: context.getters['getUserGroup'](u).id,
          user: {[u]: false}
        })
      });
    },
    checkPath(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const pathLoc = context.getters['getPathLoc']()

      if ( context.getters['getGroupsReady']() && activeSession ) {
        if ( pathLoc ) {
          context.commit('UPDATE_SESSIONPATH', {
            id: activeSession.id,
            pathLoc: pathLoc.index,
            object: {completed: true}
          })
        } 
        context.dispatch('unreadyAll')
      }
    },
    checkRound(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const currentRound = activeSession['currentRound']
      const maxRounds = context.getters['getGroup'](context.getters['getGroupsInSession'](context.getters['getActiveSession']().id)[0]).game.rounds.length - 1

      if ( context.getters['getGroupsReady']() && activeSession ) {
        if (currentRound >= maxRounds) {
          const pathLoc = context.getters['getPathLoc']()
          if ( pathLoc ) {
            context.commit('UPDATE_SESSIONPATH', {
              id: activeSession.id,
              pathLoc: pathLoc.index,
              object: {completed: true}
            })
          }
        } else {
          context.commit('UPDATE_SESSION', {
            id: activeSession.id,
            currentRound: currentRound + 1
          })
        }
        context.dispatch('unreadyAll')
      }
    },
    addQuestionnaireToUser(
      context,
      payload: {questionnaireId: string, userId: string}
    ){
      const qid = payload.questionnaireId
      const uid = payload.userId
      if ( context.getters['getUserQuestionnaire'](uid, qid) || uid == 'admin') {
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
        context.commit('UPDATE_GROUPREADY', {
          id: context.getters['getUserGroup'](payload.userId).id,
          user: {[payload.userId]: true}
        })
        context.commit('UPDATE_USERANSWER', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: payload.currentQuestionId,
          answer: payload.answer,
          active: false
        })
        context.dispatch('checkPath')
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
      payload: {
        groupId: string,
        value: number,
        type: string
      }
    ){
      context.commit('UPDATE_GROUPVALUE', {
        groupId: payload.groupId,
        currentRound: context.getters['getCurrentRound'](),
        value: payload.value,
        type: payload.type
      })
    },
    submitAnswer(
      context,
      payload: {
        groupId: string,
        answers: {
          rd: number,
          factories: number
        }
        profit: number
      }
    ){
      const currentRound = context.getters['getCurrentRound']()
      context.commit('UPDATE_GROUPANSWER', {
        groupId: payload.groupId,
        currentRound: currentRound,
        answers: payload.answers
      })
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: {completed: true}
      })
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: {profit: payload.profit}
      })
    },
    readyUp(
      context,
      groupId: string
    ){
      const usersInGroup = Object.keys(context.getters['getGroup'](groupId).users)
      usersInGroup.forEach((u:string) => {
        context.commit('UPDATE_GROUPREADY', {
          id: groupId,
          user: {[u]: true}
        })
      })
      context.dispatch('checkRound')
    },
    continueSession(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const pathLoc = context.getters['getPathLoc']('admin')
      context.commit('UPDATE_SESSIONPATH', {
        id: activeSession.id,
        pathLoc: pathLoc.index,
        object: {canContinue: true}
      })
    }
  }
})