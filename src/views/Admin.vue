<template>
  <div v-if="currentUser == 'admin'" id="admin">
    <div v-if="currentSession">
      <button @click="store.dispatch('endSession')">End Session</button>
      <button @click="store.dispatch('removeLocalUser', currentUser)">done</button>
    </div>
    <div v-else>
      <h3>How many users</h3>
      <input type="number" v-model="userAmount"/>
      <h3>How many groups</h3>
      <input type="number" v-model="groupAmount"/>
      <br/>
      <button @click="store.dispatch('startSession', {userAmount: userAmount, groupAmount: groupAmount})">Start Session</button>
      <br/>
      <button @click="store.dispatch('removeLocalUser', currentUser)">Log out</button>
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
  import { ref } from 'vue';
  const store = useStore()
  await store.dispatch('bindDatabase')

  const currentUser = localStorage.getItem('userid')
  const currentSession = computed(() => store.getters['getActiveSession']())

  const userAmount = ref(0)
  const groupAmount = ref(0)
</script>
