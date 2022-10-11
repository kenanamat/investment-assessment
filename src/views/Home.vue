<template>
  <div v-if="currentUser == null && sessionId">
    <div class="img-bg">
    </div>
    <div  class="row welcome"> 
      <div class="col-lg-5 title">
        <Timer/>
        <h3>Welcome</h3>
        <h1>Choose an available username and join a group</h1>
      </div>
      <div class="col-lg-3 availables">
        <div>
          <h4>Available usernames:</h4>
          <ul>
            <li class="valid" v-for="user in usersAvailable" @click="userid = user" :class="{'active': userid == user}">
              {{user}}
            </li>
          </ul>
          <hr/>
        </div>
      </div>
      <div class="col-lg-4 selected d-flex">
        <form @submit.prevent="store.dispatch('initiateUser', userid)" id="login">
          <h4>Your selected username:</h4>
          <input 
            type="text" 
            v-model="userid" 
            placeholder="Select a username"
            :class="{'notEmpty': userid != ''}"
            required
            readonly
          />
          <input
            v-if="userCode"            
            type="text" 
            v-model="code" 
            placeholder="Enter your code"
            required
          />
        </form>
        <button type="submit" form="login" v-if="!userCode || code == userCode">
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
    {{router.push('/questionnaire')}}
  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useStore } from 'vuex';
import { ref } from 'vue';
import router from '@/router';
import Timer from '@/components/Timer.vue';

const store = useStore()
await store.dispatch('bindDatabase')

const currentUser = localStorage.getItem('userid')
const sessionId = computed(() => store.getters['getActiveSession']().id)
const user = computed(() => store.getters['getUser'](currentUser))
const userInSession = store.getters['getUsersInSession'](sessionId).find((u: string) => u == user.value) ? true : false

// remove local user if no session or user doesnt exist in session
if ( ( sessionId.value == undefined && currentUser != null ) || (!userInSession && currentUser != null) ) store.dispatch('removeLocalUser', currentUser) 

const users = computed(() => store.getters['getUsersInSession'](sessionId.value))
const usersAvailable = computed(() => users.value.filter((u:string) => {
  const user = store.getters['getUser'](u)
  return ( (user.active == true && user.code != undefined) || user.active == false )
}))

const userid = ref("")
const groupid = ref("")

const userCode = computed(() => store.getters['getUser'](userid.value).code ?? false)
const code = ref("")

</script>
