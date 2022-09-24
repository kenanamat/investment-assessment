<template>
  <div v-show="false">{{store.dispatch('addQuestionnaireToUser', {questionnaireId: pathItem.id, userId: currentUser})}}</div> 
  <div v-if="pathItem.type == 'questionnaire'" id="questionnaire">
    <div v-if="!pathItem.completed && isReady">
      <h1>Please wait enzo</h1>
      <h2>Not ready from your group:</h2>
      <div id="validIds">
        <ul>
          <li v-for="user in unreadyFromGroup">
            <p>{{user}}</p>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <Question :questionnaire="pathItem.id" :user="currentUser" />
    </div>
  </div>

  <div v-else-if="pathItem.type == 'game'">
    <h1>It's gamer time</h1>
    <Game :user="currentUser" />
  </div>

</template>

<script lang="ts" setup>
  import router from '@/router';
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex';
  import Question from '../components/Question.vue';
  import { pathItemState } from '../store/types'
  import Game from '@/components/Game.vue';
  const store = useStore()
  await store.dispatch('bindDatabase')


  store.dispatch('checkPath')
  
  const currentUser = localStorage.getItem('userid')
  var isReady: any = false
  // const pathItem = computed(() => store.getters['getPathLoc']())
  const pathItem = computed(() => store.getters['getPathLoc']())
  store.dispatch('addQuestionnaireToUser', {questionnaireId: pathItem.value.id, userId: currentUser})
  
  const groupId = store.getters['getUser'](currentUser).group
  const unreadyFromGroup = computed(() => store.getters['getUnreadyUsers'](groupId))

  if ( currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin' ) {
    isReady = computed( () => store.getters['getGroup'](groupId).ready[currentUser] )
  } else {
    router.push('/')
  }

</script>