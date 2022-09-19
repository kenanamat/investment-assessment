<template>
  <div>
    <h1>QUESTIONNAIRE WOOO</h1>
    <Question :questionnaire="questionnaire" :user="currentUser" />
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router';
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex';
  import Question from '../components/Question.vue';
  const store = useStore()
  await store.dispatch('bindDatabase')

  const currentUser = localStorage.getItem('userid')
  var questionnaire = ''
  if ( currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin' ) {
    // get questionnaire from path in session
    const pathLoc = localStorage.getItem('pathLoc')
    if ( pathLoc == null ) {
      localStorage.setItem('pathLoc', '0')
    }
    questionnaire = store.getters['getActiveSession']()['path'][Number(pathLoc)]
    
    store.dispatch('addQuestionnaireToUser', {questionnaireId: questionnaire, userId: currentUser})
  } else {
    router.push('/')
  }

</script>