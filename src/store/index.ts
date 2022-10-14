import { createStore, ActionContext, storeKey } from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { rootDatabase } from '@/data/db'
import firebase from 'firebase/app'
import { DbState, GroupState, pathItemState, QuestionState, RootState, RoundState, SessionState, UserState } from './types'
import router from '@/router'
import words from './words'

export default createStore<RootState>({
  modules: {
    words
  },
  state: {
    db: {},
    timeLeft: 1
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
      return Object.values(getters['getSessions']()).find((s:any) => s.active == true) ?? false
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
    getPathItem: (state: RootState, getters: any) => (userId: string) => {
      const sessionPath = getters['getActiveSession']().path
      if ( sessionPath ) return sessionPath.find((p: pathItemState) => !p.completed && p.canContinue ) ?? false
      else return false
    },
    getNextPathItem: (state: RootState, getters: any) => () => {
      const sessionPath = getters['getActiveSession']().path
      const pathItem = getters['getPathItem']()
      return sessionPath[pathItem.index + 1] ?? false
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
    UPDATE_DB(state: RootState, payload: object) {
      firebase.database().ref('db/').update(payload);
    },
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
      if ( payload.id != undefined ) firebase.database().ref('db/groups/' + payload.id + '/ready').update(payload.user);
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
    UPDATE_SESSIONPATH(state: RootState, payload: {id: string, pathItem: string, object: {}}) {
      firebase.database().ref('db/sessions/' + payload.id + '/path/' + payload.pathItem ).update(payload.object);
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
      userid: string
    ){
      localStorage.setItem('userid', userid)
      context.commit('UPDATE_USER', {
        id: userid,
        active: true
      })
      router.push('/questionnaire')
    },
    createUser(
      context,
      sessionId: string
    ){
      // create username
      const userIds = Object.keys(context.getters['getUsers']())
      var userId: string = context.getters['getRandomUserId']()
      while (userIds.includes(userId)) {
        userId = context.getters['getRandomUserId']()
      }

      // get max per group
      const groupsInSession = context.getters['getGroupsInSession'](sessionId)
      const usersInSessionLen = context.getters['getUsersInSession'](sessionId).length

      var maxUsersPerGroup = Math.floor(usersInSessionLen / groupsInSession.length)
      var usersInGroupInSession = 0
      groupsInSession.forEach((g: string) => {
        usersInGroupInSession += Object.keys(context.getters['getGroup'](g).users ?? []).length
      });
      // if uneven groups, allow additional player
      if ( usersInGroupInSession >= maxUsersPerGroup * groupsInSession.length ) maxUsersPerGroup += 1
      
      // add to shuffled group
      const shuffledGroups = groupsInSession.sort((a: GroupState, b: GroupState) => 0.5 - Math.random())
      var gid = shuffledGroups.pop()
      if ( gid && context.getters['getGroup'](gid).users != undefined ) {
        while ( context.getters['getGroup'](gid).users != undefined && Object.keys(context.getters['getGroup'](gid).users).length >= maxUsersPerGroup ) {
          gid = shuffledGroups.pop()
        }
      }

      // create leader
      if (context.getters['getGroup'](gid).leader == '') context.commit('UPDATE_GROUP', {id: gid, leader: userId})

      // add user to group
      context.commit('UPDATE_GROUPUSERS', {
        id: gid,
        user: {[userId]: true}
      })
      context.commit('UPDATE_GROUPREADY', {
        id: gid,
        user: {[userId]: false}
      })

      // add user
      context.commit('ADD_USER', {
        group: gid,
        id: userId,
        active: false,
        session: sessionId,
        questionnaires: {}
      })
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

      // get group name
      var groupNumber = 0
      while (groupsList.includes('group_' + groupNumber)) {
        groupNumber += 1
      }
      const groupId = 'group_' + groupNumber

      const game = context.getters['getGame']()

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

      // if there is a session, deactivate it
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

      // create groups and users
      for (let i = 0; i < payload.groupAmount; i++) {
        context.dispatch('createGroup', {sessionId: sessionId, color: colors.pop()})
      }
      for (let i = 0; i < payload.userAmount; i++) {
        context.dispatch('createUser', sessionId)
      }
      
      // get list of users and groups
      var users: {[id: string]: boolean} = {}
      context.getters['getUsersInSession'](sessionId).forEach((u: string) => {
        users[u] = true;
      })
      var groups: {[id: string]: boolean} = {}
      context.getters['getGroupsInSession'](sessionId).forEach((u: string) => {
        groups[u] = true;
      })

      // create session
      context.commit('ADD_SESSION', {
        id: sessionId,
        active: true,
        groups: groups,
        users: users,
        date: dateToday,
        currentRound: 0,
        timerEnd: null,
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
      const pathItem = context.getters['getPathItem']()
      const nextpathItem = context.getters['getNextPathItem']()

      if ( !activeSession ) router.push('/')

      else if ( context.getters['getGroupsReady']() ) {
        if ( nextpathItem && !nextpathItem.canContinue ) {
          router.push('/waiting')
        } else if ( pathItem ) {
          context.dispatch('unreadyAll')
          context.commit('UPDATE_SESSIONPATH', {
            id: activeSession.id,
            pathItem: pathItem.index,
            object: {completed: true}
          })
        } 
      }
    },
    checkRound(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const currentRound = activeSession['currentRound']
      const maxRounds = context.getters['getGroup'](context.getters['getGroupsInSession'](context.getters['getActiveSession']().id)[0]).game.rounds.length - 1

      if ( context.getters['getGroupsReady']() && activeSession ) {
        context.dispatch('unreadyAll')
        if (currentRound >= maxRounds) {
          const pathItem = context.getters['getPathItem']()
          if ( pathItem ) {
            context.commit('UPDATE_SESSIONPATH', {
              id: activeSession.id,
              pathItem: pathItem.index,
              object: {completed: true}
            })
          }
        } else {
          context.commit('UPDATE_SESSION', {
            id: activeSession.id,
            currentRound: currentRound + 1
          })
        }
        context.dispatch('setTimerEnd', 0)
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
      const nextPathItem = context.getters['getNextPathItem']()
      context.commit('UPDATE_SESSIONPATH', {
        id: activeSession.id,
        pathItem: nextPathItem.index,
        object: {canContinue: true}
      })
      context.dispatch('checkPath')
    },
    submitInterview(
      context,
      payload: {
        groupId: string,
        answer: string
      }
    ){
      const currentRound = context.getters['getCurrentRound']()
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: {interviewAnswer: payload.answer}
      })
    },
    setCode(
      context,
      userId: string
    ){
      const words = [
        'People',
        'History',
        'Way',
        'Art',
        'World',
        'Information',
        'Map',
        'Two',
        'Family',
        'Government',
        'Health',
        'System',
        'Computer',
        'Meat',
        'Year',
        'Thanks',
        'Music',
        'Person',
        'Reading',
        'Method',
        'Data',
        'Food'
      ]
      const code = words[Math.floor(Math.random() * words.length)]
      context.commit('UPDATE_USER', {
        id: userId,
        code: code
      })
    },
    setTimerEnd(
      context,
      seconds: number
    ) {
      const session = context.getters['getActiveSession']()
      context.commit('UPDATE_SESSION', {
        id: session.id,
        timerEnd: Date.now() + (seconds * 1000)
      })
    },
    reset(
      context
    ){
      if ( confirm('Je gaat alles verwijderen are you sure??') ) {
        context.commit('UPDATE_DB', {
          groups: null,
          sessions: null,
          users: null
        })
        context.commit('ADD_USER', {
          id: 'admin',
          active: false
        })
      } else return
    }
  }
})