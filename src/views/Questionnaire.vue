<template>
  <div>
    <h1>QUESTIONNAIRE WOOO</h1>
    <Questions :questionnaire="questionnaire"/>
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router';
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex';
  import Questions from '../components/Questions.vue';
  const store = useStore()
  await store.dispatch('bindDatabase')

  const currentUser = localStorage.getItem('userid')
  var questionnaire = ''
  if ( currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin' ) {
    // get questionnaire from path in session
    questionnaire = 'midRound'

    store.dispatch('addQuestionnaireToUser', {questionnaireId: questionnaire, userId: currentUser})
  } else {
    router.push('/')
  }
</script>