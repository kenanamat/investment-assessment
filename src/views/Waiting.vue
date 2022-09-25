<template>
  <h1>Till tomorrow!</h1>
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

  if ( !(currentUser && store.getters['isActiveUser'](currentUser) && currentUser != 'admin') ) {
    router.push('/')
  }
</script>