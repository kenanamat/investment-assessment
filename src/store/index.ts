import { createStore, ActionContext } from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { rootDatabase } from '@/data/db'
import firebase from 'firebase/app'
import { DbState, RootState, UserState } from './types'
import router from '@/router'

export default createStore<RootState>({
  state: {
    db: {}
  } as RootState,
  getters: {
    getUsers: (state: RootState) => () => {
      return state.db.users
    },
    getDb: (state: RootState) => () => {
      return state.db
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
    }
  },
  mutations: {
    UPDATE_USER(state: RootState, payload: UserState) {
      firebase.database().ref('db/users/' + payload.id).update(payload);
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
    initiateUser( 
      context: ActionContext<RootState, RootState>,
      payload: {userid: string, groupid: string}
    ){
      const uid = payload.userid
      const gid = payload.groupid 

      if ( context.getters['validUserAndGroup'](uid, gid) ) {
        localStorage.setItem('userid', uid)
        if ( uid == 'admin' && gid == 'dashboard' ) {
          context.commit('UPDATE_USER', {
            id: 'admin',
            active: true
          })
        }
        router.push('/about')
      }
    }
  }
})