<template>
  <div v-if="currentUser == null && sessionId">
    <div class="img-bg"></div>
    <div class="row welcome">
      <div class="col-lg-5 title">
        <h3>Welcome</h3>
        <h1>Choose an available username and join a group</h1>
      </div>
      <!-- <div class="col-lg-3 availables">
        <div>
          <h4>Available usernames:</h4>
          <ul>
            <li
              class="valid"
              v-for="user in usersAvailable"
              @click="userid = user"
              :class="{
                active: userid == user,
                hasCode: store.getters['getUser'](user).code != undefined,
              }"
            >
              {{ user }}
            </li>
          </ul>
          <hr />
        </div>
      </div> -->
      <div class="col-lg-4 selected d-flex">
        <form
          @submit.prevent="store.dispatch('initiateUser', userid)"
          id="login"
        >
          <h4>Your selected username:</h4>
          <input
            type="text"
            v-model="userid"
            placeholder="Select a username"
            :class="{ notEmpty: userid != '' }"
            required
          />
          <!-- <input
            v-if="userCode"
            type="text"
            v-model="code"
            placeholder="Enter your code"
            required
          /> -->
        </form>
        <button type="submit" form="login" v-if="users.includes(userid)">
          <img src="https://cdn-icons-png.flaticon.com/512/3916/3916800.png" />
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="currentUser == 'admin'">
    {{ router.push("/admin") }}
  </div>
  <div v-else-if="!sessionId">
    <div class="img-bg"></div>
    <div class="row welcome">
      <div class="col-lg-5 title">
        <h3>Unavailable</h3>
        <h1>There is currently no ongoing survey</h1>
      </div>
    </div>
  </div>
  <div v-show="false" v-else>
    {{ router.push("/questionnaire") }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity"
import { useStore } from "vuex"
import { ref } from "vue"
import router from "@/router"
import Timer from "@/components/Timer.vue"

const store = useStore()
await store.dispatch("bindDatabase")

const currentUser = localStorage.getItem("userid")
const sessionId = computed(() => store.getters["getActiveSession"]().id)
const user = computed(() => store.getters["getUser"](currentUser))
const userInSession = store.getters["getUsersInSession"](sessionId).find(
  (u: string) => u == user.value
)
  ? true
  : false

// remove local user if no session or user doesnt exist in session
if (
  (sessionId.value == undefined && currentUser != null) ||
  (!userInSession && currentUser != null)
)
  store.dispatch("removeLocalUser", currentUser)

const users = computed(() =>
  store.getters["getUsersInSession"](sessionId.value)
)
const usersAvailable = computed(() =>
  users.value.filter((u: string) => {
    const user = store.getters["getUser"](u)
    return (
      (user.active == true && user.code != undefined) || user.active == false
    )
  })
)

const userid = ref("")
const groupid = ref("")

const userCode = computed(
  () => store.getters["getUser"](userid.value).code ?? false
)
const code = ref("")
</script>
