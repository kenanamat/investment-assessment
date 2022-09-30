<template>
  <h1>Till tomorrow!</h1>
  {{user.id}}<br/>
  {{user.group}}<br/>
  <h2>Secret code: {{user.code}}</h2>
  <div v-if="pathLoc.canContinue == true">
    {{router.push('/questionnaire')}}
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router';
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex';

  const store = useStore()
  await store.dispatch('bindDatabase')

  const currentUser = localStorage.getItem('userid')
  const pathLoc = computed(() => store.getters['getPathLoc'](currentUser))
  const user = computed(() => store.getters['getUser'](currentUser))

  if ( currentUser && user.value.code == undefined ) {
    store.dispatch('setCode', currentUser)
  }

  if ( !(currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin') ) {
    router.push('/')
  }
</script>