<template>
  <div>
    <div id="validIds">
      <ul>
        <li v-for="user in userList">
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
        <button @click="isValid = store.dispatch('initiateUser', {userid, groupid})">Check je iD</button>
      </div>
    </div>
    <br/>
    <br/>
    <br/>
    <span :class="isValid ? 'valid' : 'invalid'">{{isValid}}</span>
  </div>
  <div>

  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useStore } from 'vuex';
import { ref } from 'vue';

const store = useStore()
await store.dispatch('bindDatabase')

const users = computed(() => store.getters['getUsers']())
const userList = Object.keys(users.value)

const userid = ref("")
const groupid = ref("")

const isValid = ref(false)
</script>
