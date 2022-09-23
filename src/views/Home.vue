<template>
  <div v-if="currentUser == null">
    <div id="validIds">
      <ul>
        <li v-for="user in users">
          <p>{{user}}</p>
        </li>
      </ul>
      <div>
        <input 
          type="text" 
          v-model="userid" 
          placeholder="Vul je deelnemerscode in"
        />
        <input 
          type="text" 
          placeholder="Vul je groepscode in"
          v-model="groupid"
        />
        <br/>
        <button @click="store.dispatch('initiateUser', {userid, groupid})">Check je iD</button>
      </div>
    </div>
    <br/>
    <br/>
    <br/>
    <span :class="isValid ? 'valid' : 'invalid'">{{isValid}}</span>
  </div>
  <div v-else-if="currentUser == 'admin'">
    {{router.push('/admin')}}
  </div>
  <div v-else>
    <h2>{{currentUser}}</h2>
    Je bent al ingelogd
    <br/>
    <button @click="store.dispatch('removeLocalUser', currentUser)">done</button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useStore } from 'vuex';
import { ref } from 'vue';
import router from '@/router';

const store = useStore()
await store.dispatch('bindDatabase')

const currentUser = localStorage.getItem('userid')
const sessionId = computed(() => store.getters['getActiveSession']().id)
const users = computed(() => store.getters['getUsersInSession'](sessionId.value))

const userid = ref("")
const groupid = ref("")

const isValid = ref(false)
</script>
