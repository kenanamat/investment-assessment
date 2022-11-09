import { createStore, ActionContext, storeKey } from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { rootDatabase } from '@/data/db'
import firebase from 'firebase/app'
import { DbState, ResultState, GroupState, pathItemState, QuestionState, RootState, RoundState, SessionState, UserState } from './types'
import router from '@/router'
import words from './words'
import translations from './translations'
import { capitalize } from 'vue'

export default createStore<RootState>({
  modules: {
    words,
    translations
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
      return state.db?.users ?? false
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
      return state.db.groups ?? false
    },
    getGroupsFromSession: (state: RootState, getters: any) => (sessionId: string) => {
      const groups = getters['getGroups']()
      return Object.fromEntries(Object.entries(groups ?? []).filter(([key,val]) => 
        (val as GroupState).session == sessionId
      ))
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
    getGroupsNoUsers: (state: RootState, getters: any) => (sessionId: string) => {
      const groups = getters['getGroups']()
      return Object.keys(groups ?? []).filter((s:any) => !groups[s].users)
    },
    getGroupInputs: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).game.rounds[currentRound].inputs
    },
    getGroupOutputs: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).game.rounds[currentRound].outputs
    },
    getGroupResults: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).game.rounds[currentRound].results
    },
    getGroupProfits: (state: RootState, getters: any) => (groupId: string) => {
      return getters['getGroup'](groupId).game.rounds.reduce((profits: Array<number>, round: RoundState) => {
        profits.push(round.profit)
        return profits
      }, [])
    },
    getGroupFakeInputs: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).fakeGame.rounds[currentRound].inputs
    },
    getGroupFakeOutputs: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).fakeGame.rounds[currentRound].outputs
    },
    getGroupFakeResults: (state: RootState, getters: any) => (groupId: string, currentRound: number) => {
      return getters['getGroup'](groupId).fakeGame.rounds[currentRound].results
    },
    getGroupFakeProfits: (state: RootState, getters: any) => (groupId: string) => {
      return getters['getGroup'](groupId).fakeGame.rounds.reduce((profits: Array<number>, round: RoundState) => {
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
    getGroupRoundQuestionnaire: (state: RootState, getters: any) => ( groupId: string, currentRound: number ) => {
      return getters['getGroupGameRound'](groupId, currentRound)['questionnaire'] ?? false
    },
    getGame: (state: RootState) => () => {
      return state.db.game
    },
    getFakeGame: (state: RootState) => () => {
      return state.db.fakeGame
    },
    getGroupGame: (state: RootState, getters: any) => ( groupId: string ) => {
      return getters['getGroup'](groupId)['game'] ?? false
    },
    getGroupFakeGame: (state: RootState, getters: any) => ( groupId: string ) => {
      return getters['getGroup'](groupId)['fakeGame'] ?? false
    },
    getGroupGameRound: (state: RootState, getters: any) => ( groupId: string, roundNumber: number ) => {
      return getters['getGroupGame'](groupId).rounds[roundNumber] ?? false
    },
    getGroupFakeGameRound: (state: RootState, getters: any) => ( groupId: string, roundNumber: number ) => {
      return getters['getGroupFakeGame'](groupId).rounds[roundNumber] ?? false
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
      return capitalize(state.words.adjectives[Math.floor(Math.random() * state.words.adjectives.length)]) + capitalize(state.words.nouns[Math.floor(Math.random() * state.words.nouns.length)]);
    },
    getShuffled: (state: RootState) => ( array: number[] | string[] ) => {
      let currentIndex = array.length,  randomIndex;
    
      // While there remain elements to shuffle.
      while (currentIndex != 0) {
    
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    
      return array;
    },
    getExcelFormat: (state: RootState, getters: any) => () => {
      var excelFormat: Object[] = []

      const users = getters['getUsers']()

      Object.values(users as {[id:string]: UserState}).forEach((user: UserState) => {
        if (user.id == 'admin') return false
        var questions = {}

        if (user.questionnaires){
          Object.values(user.questionnaires as {[id:string]: QuestionState[]}).forEach(
            (questionset: QuestionState[]) => questionset.forEach((q: QuestionState) => {
              if (q.type === 'list-scale') {
                q.questions.forEach((listq, index) => Object.assign(questions, {
                  [listq]: q.answer[index]
                }))
              } else {
                Object.assign(questions, {
                  [q.question]: q.answer.toString()
                })
                if (q.followup) {
                  Object.assign(questions, {
                    [q.question + '-' + q.followup.question]: q.followup.answer.toString()
                  })
                }
              }
            })
          )
        }

        var gameQuestions = {}
        var userGroup = getters['getGroup'](user.group)
        var results = {}
        var inputs = {}
        var points = undefined

        if ( userGroup ) {
          userGroup.game.rounds.forEach((round: RoundState) => {
            if (round.questionnaire) {
              round.questionnaire.forEach((rq: QuestionState) => {
                if (rq.answer != "") Object.assign(gameQuestions, {
                  [round.index + ' ' + rq.question]: rq.answer
                })
              })
            }
            if (round.results) {
              Object.assign(results, 
                Object.fromEntries(
                  Object.entries(round.results).map(([k, v]) => [round.index + ' ' + k, v.toFixed(2)])
                )
              )
            }
            if (round.inputs) {
              console.log(round.inputs)
              Object.assign(inputs, 
                Object.fromEntries(
                  Object.entries(round.inputs).map(([k, v]) => [round.index + ' ' + k, v.toFixed(2)])
                )
              )
            }
          })
          points = userGroup.game.points
        } 

        var fakeResults = {}
        var fakeInputs = {}
        var fakeGameQuestions = {}
        if ( userGroup ) {
          userGroup.fakeGame.rounds.forEach((round: RoundState) => {
            if (round.questionnaire) {
              round.questionnaire.forEach((rq: QuestionState) => {
                if (rq.answer != "") Object.assign(fakeGameQuestions, {
                  [round.index + ' ' + rq.question]: rq.answer
                })
              })
            }
            if (round.results) {
              Object.assign(fakeResults, 
                Object.fromEntries(
                  Object.entries(round.results).map(([k, v]) => [round.index + 'Fake ' + k, v.toFixed(2)])
                )
              )
            }
            if (round.inputs) {
              console.log(round.inputs)
              Object.assign(fakeInputs, 
                Object.fromEntries(
                  Object.entries(round.inputs).map(([k, v]) => [round.index + 'Fake ' + k, v.toFixed(2)])
                )
              )
            }
          })
        } 

        excelFormat.push({
          id: user.id,
          group: userGroup.id,
          treatment: userGroup.treatment,
          session: user.session,
          ...questions,
          ...gameQuestions,
          ...results,
          ...inputs,
          ...fakeGameQuestions,
          ...fakeResults,
          ...fakeInputs,
          points: points
        })
      })

      return JSON.parse(JSON.stringify(excelFormat)) ?? false
    },
    getTreatmentResult: (state: RootState, getters: any) => (groupId: string) => {
      const group = getters['getGroup'](groupId)
      const treatmentValues = getters['getGame']().treatmentValues
      const results = group.game.rounds.at(-1).results
      const R_K = group.game.rounds.reduce((acc: number, round: RoundState) => 
        acc + round.inputs.R_K
      , 0);
      const R_E = group.game.rounds.reduce((acc: number, round: RoundState) => 
        acc + round.inputs.R_E
      , 0);
      const R_L = group.game.rounds.reduce((acc: number, round: RoundState) => 
        acc + round.inputs.R_L
      , 0);



      const b_P_g = treatmentValues.b_P_g
      const b_E_g = treatmentValues.b_E_g
      const b_S_g = treatmentValues.b_S_g

      const points_g = b_P_g * results.tot_profit_post_tax + b_E_g * results.tot_environmental_impact + b_S_g * results.tot_social_impact

      const b_P_t = treatmentValues.b_P_t
      const b_RD_t = treatmentValues.b_RD_t
      const b_RDE_t = treatmentValues.b_RDE_t
      const b_E_t = treatmentValues.b_E_t
      const b_S_t = treatmentValues.b_S_t

      switch (group.treatment) {
        case 'profit':
          return points_g + b_P_t * results.tot_profit_post_tax
        case 'r&d':
          return points_g + b_RD_t * (R_K+R_L+R_E)
        case 'footprint':
          return points_g + b_RDE_t* (R_E) + b_E_t * results.tot_environmental_impact + b_S_t * results.tot_social_impact
        default:
          return 0
      }
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
    UPDATE_USERFOLLOWUP(state: RootState, payload) {
      firebase.database().ref('db/users/' +
      payload.userId + '/' +
      'questionnaires/' +
      payload.questionnaire + '/' +
      payload.currentQuestionId + '/followup').update({answer: payload.answer});
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
    REMOVE_GROUP(state: RootState, groupId: string) {
      firebase.database().ref('db/groups').update({[groupId]: null});
    },
    UPDATE_GROUPREADY(state: RootState, payload) {
      if ( payload.id != undefined ) firebase.database().ref('db/groups/' + payload.id + '/ready').update(payload.user);
    },
    UPDATE_GROUPUSERS(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id + '/users').update(payload.user);
    },
    UPDATE_GROUPGAME(state: RootState, payload) {
      firebase.database().ref('db/groups/' + payload.id + '/game').update(payload.game);
    },
    UPDATE_GAME(state: RootState, payload) {
      firebase.database().ref('db/game/').update(payload);
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
    UPDATE_GROUPFAKEROUND(state: RootState, payload: {groupId: string, currentRound: number, object: {}}){
      firebase.database().ref('db/groups/' + payload.groupId + '/fakeGame/rounds/' + payload.currentRound).update(payload.object);
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

      // add user
      context.commit('ADD_USER', {
        group: 'onHold',
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
      const fakeGame = context.getters['getFakeGame']()
      const treatments = ['profit', 'r&d', 'footprint']

      context.commit('ADD_GROUP', {
        id: groupId,
        users: {},
        ready: {},
        game: game,
        fakeGame: fakeGame,
        color: payload.color,
        session: payload.sessionId,
        leader: '',
        treatment: treatments[groupNumber % 3]
      })
    },
    createOnHold(
      context
    ) {
      const game = context.getters['getGame']()
      const sessionId = context.getters['getActiveSession']().id
      const usersInSession = context.getters['getUsersInSession'](sessionId)

      context.commit('ADD_GROUP', {
        id: 'onHold',
        users: {},
        ready: {},
        game: game,
        color: "#000",
        session: sessionId,
        leader: '',
        treatment: ''
      })

      usersInSession.forEach((u: string) => {
              // add user to group
        context.commit('UPDATE_GROUPUSERS', {
          id: 'onHold',
          user: {[u]: true}
        })
        context.commit('UPDATE_GROUPREADY', {
          id: 'onHold',
          user: {[u]: false}
        })
      });
    },
    addUserToGroup(
      context,
      userId: string
    ) {
      // get max per group
      const sessionId = context.getters['getActiveSession']().id
      const groupsInSession = context.getters['getGroupsInSession'](sessionId).filter((g: GroupState) => g.id != 'onHold')
      const usersInSessionLen = context.getters['getUsersInSession'](sessionId).length

      var maxUsersPerGroup = Math.floor(usersInSessionLen / groupsInSession.length)
      var usersInGroupInSession = 0
      groupsInSession.forEach((g: string) => {
        usersInGroupInSession += Object.keys(context.getters['getGroup'](g).users ?? []).length
      });
      // if uneven groups, allow additional player
      if ( usersInGroupInSession >= maxUsersPerGroup * groupsInSession.length ) maxUsersPerGroup += 1
      
      // add to shuffled group
      const shuffledGroups = context.getters['getShuffled'](groupsInSession)
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
        user: {[userId]: true}
      })
      //remove from onHold
      context.commit('UPDATE_GROUPUSERS', {
        id: 'onHold',
        user: {[userId]: null}
      })
      context.commit('UPDATE_GROUPREADY', {
        id: 'onHold',
        user: {[userId]: null}
      })

      // update user
      context.commit('UPDATE_USER', {
        group: gid,
        id: userId,
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
        context.dispatch('createGroup', {sessionId: sessionId, color: colors.pop() ?? '#000'})
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
        code: null,
        path: {
          0: {
            index: 0,
            canContinue: true,
            completed: false,
            type: 'questionnaire',
            id: 'test'
          },
          1: {
            index: 1,
            completed: false,
            canContinue: false,
            type: 'fakeGame'
          },
          2: {
            index: 2,
            completed: false,
            canContinue: true,
            type: 'pre-game'
          },
          3: {
            index: 3,
            canContinue: true,
            completed: false,
            type: 'game',
          },
          4: {
            index: 4,
            completed: false,
            canContinue: true,
            type: 'questionnaire',
            id: 'Ex-post'
          }
        }
        // path: {
        //   0: {
        //     index: 0,
        //     canContinue: true,
        //     completed: false,
        //     type: 'game',
        //   },
        //   1: {
        //     index: 1,
        //     canContinue: true,
        //     completed: false,
        //     type: 'questionnaire',
        //     id: 'Ex-post'
        //   },
        //   2: {
        //     index: 2,
        //     completed: false,
        //     canContinue: true,
        //     type: 'questionnaire',
        //     id: 'Ex-post'
        //   }
        // }
      })
      context.dispatch("createOnHold")
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
    nextPath(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const pathItem = context.getters['getPathItem']()
      context.commit('UPDATE_SESSIONPATH', {
        id: activeSession.id,
        pathItem: pathItem.index,
        object: {completed: true}
      })
    },
    checkRound(
      context
    ){
      const activeSession = context.getters['getActiveSession']()
      const currentRound = activeSession['currentRound']
      

      if ( context.getters['getGroupsReady']() && activeSession ) {
        context.dispatch('unreadyAll')
        context.dispatch('setTimerEnd', -100)

        const pathItem = context.getters['getPathItem']()
        var maxRounds = 1
        pathItem.type == 'game' ? 
          maxRounds = context.getters['getGroup'](context.getters['getGroupsInSession'](context.getters['getActiveSession']().id)[0]).game.rounds.length - 1 : 
          maxRounds = context.getters['getGroup'](context.getters['getGroupsInSession'](context.getters['getActiveSession']().id)[0]).fakeGame.rounds.length - 1

        if (currentRound >= maxRounds) {
          const pathItem = context.getters['getPathItem']()
          if ( pathItem ) {
            context.commit('UPDATE_SESSIONPATH', {
              id: activeSession.id,
              pathItem: pathItem.index,
              object: {completed: true}
            })
            context.commit('UPDATE_SESSION', {
              id: activeSession.id,
              currentRound: 0
            })
          }
        } else {
          context.commit('UPDATE_SESSION', {
            id: activeSession.id,
            currentRound: currentRound + 1
          })
        }
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
    addQuestionnaireToGroupRound(
      context,
      payload: {questionnaireId: string, groupId: string, currentRound: number}
    ){
      const qid = payload.questionnaireId
      const gid = payload.groupId
      const cr = payload.currentRound
      if ( context.getters['getGroupRoundQuestionnaire'](gid, cr)) {
        return
      } else if ( context.getters['getQuestionnaire'](qid) ) {
        const questionnaire = context.getters['getQuestionnaire'](qid)
        context.commit('UPDATE_GROUPROUND', {
          groupId: gid,
          currentRound: cr,
          object: {questionnaire: questionnaire}
        })
      }
    },
    gotoNextQuestion(
      context,
      payload: {
        userId: string,
        questionnaire: string,
        currentQuestionId: string,
        answer: string,
        followup: string
      }
    ){
      if (payload.followup != "") {
        context.commit('UPDATE_USERFOLLOWUP', {
          userId: payload.userId,
          questionnaire: payload.questionnaire,
          currentQuestionId: payload.currentQuestionId,
          answer: payload.followup
        })
      }
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
    submitFakeAnswer(
      context,
      payload: {
        groupId: string,
        values: {
          inputs: Object,
          outputs: Object,
          results: Object
        }
      }
    ){
      const currentRound = context.getters['getCurrentRound']()

      context.commit('UPDATE_GROUPFAKEROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: {completed: true}
      })
      context.commit('UPDATE_GROUPFAKEROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: payload.values
      })
    },
    submitAnswer(
      context,
      payload: {
        groupId: string,
        values: {
          inputs: Object,
          outputs: Object,
          results: Object
        }
      }
    ){
      const currentRound = context.getters['getCurrentRound']()
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: {completed: true}
      })
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: currentRound,
        object: payload.values
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
    readyAll(
      context
    ) {
      const activeSession = context.getters['getActiveSession']()
      const groups = context.getters['getGroupsInSession'](activeSession.id)
      groups.forEach((g: string) => {
        context.dispatch("readyUp", g)
      });
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

      context.getters['getGroupsNoUsers']().forEach((g:string) => {
        context.commit('REMOVE_GROUP', g)
      });
      context.commit('REMOVE_GROUP', 'onHold')

      context.dispatch('checkPath')
    },
    submitInterview(
      context,
      payload: {
        groupId: string,
        questionnaire: Object,
        currentRound: number
      }
    ){
      context.commit('UPDATE_GROUPROUND', {
        groupId: payload.groupId,
        currentRound: payload.currentRound,
        object: {
          questionnaire: payload.questionnaire,
          interviewAnswered: true
        }
      })
    },
    setCode(
      context
    ){
      const sessionId = context.getters['getActiveSession']().id
      context.commit('UPDATE_SESSION', {
        id: sessionId,
        code: 1402
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
    setStartValues(
      context,
      startValues: Object
    ){
      context.commit('UPDATE_GAME', {
        startValues: startValues
      })
    },
    setTreatmentValues(
      context,
      treatmentValues: number[]
    ){
      context.commit('UPDATE_GAME', {
        treatmentValues: treatmentValues
      })
    },
    switchShowPoints(
      context
    ){
      context.commit('UPDATE_SESSION', {
        id: context.getters['getActiveSession']().id,
        showPoints: !context.getters['getActiveSession']().showPoints
      })
    },
    setPoints(
      context,
      groupId: string
    ){
      context.commit('UPDATE_GROUPGAME', {
        id: groupId,
        game: {
          points: context.getters['getTreatmentResult'](groupId)
        }
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
    },
  }
})