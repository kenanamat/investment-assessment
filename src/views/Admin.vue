<template>
  <div v-if="currentUser == 'admin'" id="admin">
    <div v-if="currentSession">
      <button @click="store.dispatch('endSession')">End Session</button>
      <button @click="store.dispatch('removeLocalUser', currentUser)">done</button>
    </div>
    <div v-else>
      <button @click="store.dispatch('startSession')">Start Session</button>
    </div>
  </div>
  <div v-else>
    {{router.push('/')}}
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router';
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex';
  const store = useStore()
  await store.dispatch('bindDatabase')

  const currentUser = localStorage.getItem('userid')
  const currentSession = computed(() => store.getters['getActiveSession']())
</script>
