<template>
  <div v-if="pathItem.type == 'questionnaire'">
    <h1>QUESTIONNAIRE WOOO</h1>
    <Question :questionnaire="pathItem.id" :user="currentUser" />
  </div>
  <div v-else-if="pathItem.type == 'game'">
    <h1>It's gamer time</h1>
    <Game :questionnaire="pathItem.id" :user="currentUser" />
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

  const currentUser = localStorage.getItem('userid')
  var pathItem: pathItemState = {
    completed: false,
    type: 'questionnaire',
    id: 'entry'
  }
  if ( currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin' ) {
    // get questionnaire from path in session
    const pathLoc = localStorage.getItem('pathLoc')
    if ( pathLoc == null ) {
      localStorage.setItem('pathLoc', '0')
    }
    pathItem = store.getters['getActiveSession']()['path'][Number(pathLoc)]
    
    store.dispatch('addQuestionnaireToUser', {questionnaireId: pathItem.id, userId: currentUser})
  } else {
    router.push('/')
  }

</script>