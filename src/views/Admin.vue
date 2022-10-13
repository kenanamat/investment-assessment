<template>
  <div v-if="currentUser == 'admin'" id="admin">
    <div v-if="currentSession">
      <button @click="store.dispatch('endSession')">End Session</button>
      <button @click="store.dispatch('removeLocalUser', currentUser)">done</button>
      <button v-if="nextPathItem && !nextPathItem.canContinue" @click="store.dispatch('continueSession')">Resume</button>
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
      <div id="hidden">
        <button @click="store.dispatch('reset')">X</button>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="img-bg admin">
    </div>
    <div class="row d-flex align-items-center h-100 welcome" id="admin"> 
      <div class="col-lg-7">
        <h3>Admin</h3>
        <h1>You should not be here&#8230; <br/>Unless, you should</h1>
      </div>
      <div class="col-lg-5 d-flex align-items-center login">
        <input type="password" v-model="password">
        <img src="https://25cjk227xfsu3mkyfg1m9xb7-wpengine.netdna-ssl.com/wp-content/themes/seoeconomics/dist/images/arrow-right_058a4869.svg" 
          v-if="password == 'wachtwoord1234'" @click="store.dispatch('initiateAdmin')">
      </div>
    </div>
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
  const pathItem = computed(() => store.getters['getPathItem'](currentUser))
  const nextPathItem = computed(() => store.getters['getNextPathItem']())

  const userAmount = ref(0)
  const groupAmount = ref(0)
  const password = ref('')
</script>
