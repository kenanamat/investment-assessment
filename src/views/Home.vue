<template>
  <div v-if="currentUser == null && sessionId">
    <div class="img-bg">
    </div>
    <div  class="row welcome"> 
      <div class="col-lg-5 title">
        <h3>Welcome</h3>
        <h1>Choose an available username and join a group</h1>
      </div>
      <div class="col-lg-3 availables">
        <div>
          <!-- <h4>Available groups:</h4>
          <ul id="groups">
            <li class="valid" v-for="group in groupsInSession" @click="groupid = group" :class="{'active': groupid == group}">
              {{group}}
            </li>
          </ul> -->
          <h4>Available usernames:</h4>
          <ul>
            <li class="valid" v-for="user in usersAvailable" @click="userid = user" :class="{'active': userid == user}">
              {{user}}
            </li>
          </ul>
          <hr/>
          <ul v-for="group in groupsInSession">
            <h5>{{group}}:</h5>
            <li v-for="user in store.getters['getGroupUsers'](group)">
              {{user}}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-4 selected d-flex">
        <form @submit.prevent="store.dispatch('initiateUser', userid)" id="login">
          <!-- <h4>Your selected group:</h4>
          <input 
            type="text" 
            placeholder="Select a group"
            :class="{'notEmpty': groupid != ''}"
            v-model="groupid"
            required
            readonly
          /> -->
          <h4>Your selected username:</h4>
          <input 
            type="text" 
            v-model="userid" 
            placeholder="Select a username"
            :class="{'notEmpty': userid != ''}"
            required
            readonly
          />
        </form>
        <button type="submit" form="login">
          <img src="https://25cjk227xfsu3mkyfg1m9xb7-wpengine.netdna-ssl.com/wp-content/themes/seoeconomics/dist/images/arrow-right_058a4869.svg">
        </button>
      </div>
      <div v-if="false" id="validIds">
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
    </div>
  </div>
  <div v-else-if="currentUser == 'admin'">
    {{router.push('/admin')}}
  </div>
  <div v-else-if="!sessionId">
    <div class="img-bg">
    </div>
    <div  class="row welcome"> 
      <div class="col-lg-5 title">
        <h3>Unavailable</h3>
        <h1>There is currently no ongoing survey</h1>
      </div>
    </div>
  </div>
  <div v-show="false" v-else>
    {{store.dispatch('removeLocalUser', currentUser)}}
    <!-- <h2>{{currentUser}}</h2>
    Je bent al ingelogd
    <br/>
    <button @click="store.dispatch('removeLocalUser', currentUser)">done</button> -->
  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useStore } from 'vuex';
import { ref } from 'vue';
import router from '@/router';
import { UserState } from '@/store/types';

const store = useStore()
await store.dispatch('bindDatabase')

const currentUser = localStorage.getItem('userid')
const sessionId = computed(() => store.getters['getActiveSession']().id)
if (!sessionId) store.dispatch('removeLocalUser', currentUser)

const users = computed(() => store.getters['getUsersInSession'](sessionId.value))
const usersAvailable = computed(() => users.value.filter((u:string) => {
    const user = store.getters['getUser'](u)
    return (user.group == undefined || user.active == false)
  }))
const groupsInSession = computed(() => store.getters['getGroupsInSession'](sessionId.value))
const groups = computed(() => store.getters['getGroups']())

const userid = ref("")
const groupid = ref("")
</script>
