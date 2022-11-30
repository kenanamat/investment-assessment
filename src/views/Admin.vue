<template>
  <div v-if="currentUser == 'admin'" id="admin">
    <div id="settings">
      <div class="d-flex align-items-center">
        <h1 class="mb-4 flex-fill">Settings</h1>
        <button class="bg-danger border-0 shadow" @click="store.dispatch('reset')">
          Delete all <i class="fa-solid fa-triangle-exclamation"></i>
        </button>
        <button @click="store.dispatch('removeLocalUser', currentUser)">Log out</button>
      </div>
      <div id="settings-block-wrapper">
        <div id="settings-block">
          <nav>
            <div
              class="nav-item fw-bold"
              :class="{ active: currentSetting === 'session' }"
              @click="currentSetting = 'session'"
            >
              <i class="fa-solid fa-wand-magic-sparkles me-2"></i>
              Session
            </div>
            <div
              class="nav-item fw-bold"
              :class="{ active: currentSetting === 'users' }"
              @click="currentSetting = 'users'"
            >
              <i class="fa-solid fa-users me-2"></i>
              Users
            </div>
            <div
              class="nav-item fw-bold"
              :class="{ active: currentSetting === 'values' }"
              @click="currentSetting = 'values'"
            >
              <i class="fa-solid fa-sliders me-2"></i>
              Values
            </div>
            <div
              class="nav-item fw-bold"
              :class="{ active: currentSetting === 'questions' }"
              @click="currentSetting = 'questions'"
            >
              <i class="fa-solid fa-clipboard-question me-2"></i>
              Questions
            </div>
          </nav>
          <div class="settings" v-if="currentSetting == 'session'">
            <h4 class="mb-4">Session</h4>
            <div>
              <h5 class="mb-4">How many users and groups are partaking?</h5>
            </div>
            <form
              id="amounts"
              @submit.prevent="
                store.dispatch('startSession', {
                  userAmount: userAmount,
                  groupAmount: groupAmount,
                })
              "
            >
              <div class="amount">
                <p>Amount of users {{ currentSession ? "in" : "for" }} session</p>
                <div class="number" v-if="!currentSession">
                  <input type="number" min="1" v-model.number="userAmount" />
                  <div class="chevrons">
                    <i class="fa-solid fa-chevron-up" @click="userAmount++"></i>
                    <i class="fa-solid fa-chevron-down" @click="userAmount--"></i>
                  </div>
                </div>
                <div v-else>
                  {{ Object.keys(currentSession.users).length }}
                </div>
              </div>
              <div class="amount">
                <p>Amount of groups {{ currentSession ? "in" : "for" }} session</p>
                <div class="number" v-if="!currentSession">
                  <input
                    type="number"
                    min="1"
                    :max="userAmount"
                    v-model.number="groupAmount"
                  />
                  <div class="chevrons">
                    <i class="fa-solid fa-chevron-up" @click="groupAmount++"></i>
                    <i class="fa-solid fa-chevron-down" @click="groupAmount--"></i>
                  </div>
                </div>
                <div v-else>
                  {{ Object.keys(currentSession.groups).length }}
                </div>
              </div>
            </form>

            <div v-if="currentSession" class="position-absolute bottom-0 end-0">
              <button v-if="!currentSession.code" @click="store.dispatch('setCode')">
                Set code
              </button>
              <button
                v-if="nextPathItem && !nextPathItem.canContinue && currentSession.code"
                @click="confirmUsers();store.dispatch('unreadyAll')"
              >
                Confirm users
              </button>
              <button
                v-if="pathItem.type == 'pre-game' && currentSession.code"
                @click="store.dispatch('nextPath')"
              >
                Start game
              </button>
              <button
                v-if="pathItem.type == 'game' || pathItem.type == 'fakeGame'"
                @click="ready()"
              >
                Ready all
              </button>
              <button @click="store.dispatch('switchShowPoints')">Point view</button>
              <button @click="download()">Download excel</button>
              <button @click="backup()">Backup database</button>
              <button class="bg-danger border-none" @click="store.dispatch('endSession')">
                End Session
                <i class="fa-solid fa-xmark ms-2"></i>
              </button>
            </div>
            <button
              v-else
              type="submit"
              form="amounts"
              class="position-absolute bottom-0 end-0"
            >
              Start Session
              <i class="fa-solid fa-play ms-2"></i>
            </button>
          </div>
          <div class="settings" v-else-if="currentSetting == 'users'">
            <h4 class="mb-4">
              Users in session:
              {{ store.getters["getActiveSession"]() ? store.getters["getUsersInSession"](currentSession.id).length : 'N/A' }}
            </h4>
            <div v-if="currentSession">
              <div
                v-for="user in store.getters['getUsersInSession'](currentSession.id)"
                :key="user"
              >
                <p v-if="user != 'admin'">
                  {{ user }} | {{ store.getters["getUser"](user).group }} |
                  {{
                    store.getters["getGroup"](store.getters["getUser"](user).group)
                      .treatment
                  }}
                  <p class="d-inline" v-if="pathItem.type == 'game' && store.getters['getGroup'](store.getters['getUser'](user).group).game"> | Answered: 
                    <div class="d-inline" >
                      <i
                      :class="store.getters['getGroup'](store.getters['getUser'](user).group)
                            .game.rounds[currentSession.currentRound].interviewAnswered ? 'text-success' : 'text-danger'" class="fa-solid fa-square"></i>
                    </div>
                  </p>
                
                </p>
              </div>
              <button class="position-absolute bottom-0 end-0" @click="downloadUsers()">
                Download user list
              </button>
            </div>
            <div v-else>
              <p>THERE IS NO SESSION</p>
            </div>
          </div>
          <div class="settings h-100" v-else-if="currentSetting == 'values'">
            <h4>Values</h4>
            <table id="values">
              <tr>
                <th v-for="header in ['Period', 'delta_K', 'min_w', 'p_E', 'p_Y', 'r_K']">
                  {{ header }}
                </th>
              </tr>
              <tr v-for="(round, roundIndex) in startValues" :key="roundIndex">
                <td class="period">Period {{ roundIndex + 1 }}</td>
                <td
                  v-for="(roundValues, key) in Object.fromEntries(
                    Object.entries(round).filter(([key, val]) =>
                      ['min_w', 'p_E', 'p_Y', 'r_K', 'delta_K'].includes(key)
                    )
                  )"
                  :key="key"
                >
                  <input
                    type="number"
                    v-model="startValues[roundIndex][key]"
                    step="0.01"
                    min="0"
                  />
                </td>
              </tr>
            </table>
            <div class="w-50 mt-5">
              <h5>Treatment values</h5>
              <div
                class="d-flex align-items-center"
                v-for="(value, key) in treatmentValues"
              >
                <div class="flex-fill">
                  {{ key }}
                </div>
                <div>
                  <input
                    class="border"
                    type="number"
                    v-model="treatmentValues[key]"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <button
              class="position-absolute bottom-0 end-0"
              @click="
                store.dispatch('setStartValues', startValues);
                store.dispatch('setTreatmentValues', treatmentValues);
              "
            >
              Save Values
            </button>
          </div>
          <div class="settings" v-else-if="currentSetting == 'questions'">
            <pre>{{ JSON.stringify(store.state.db.questionnaires, null, 2) }}</pre>
          </div>
        </div>
      </div>
      <div id="hidden">
        <button @click="store.dispatch('reset')">X</button>
      </div>
      <!-- 
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <button type="submit" form="amounts">Start Session</button>
      <br />
      <button @click="store.dispatch('removeLocalUser', currentUser)">Log out</button>
      <div id="values">
        <div v-for="(value, key) in startValues" :key="value.id">
          <h4>{{ key }}</h4>
          <input type="number" v-model="startValues[key]" step="0.01" min="0" />
        </div>
      </div>
      <button @click="store.dispatch('setStartValues', startValues)">Save Values</button>
      <div id="hidden">
        <button @click="store.dispatch('reset')">X</button>
      </div> -->
    </div>
  </div>
  <div v-else>
    <div class="img-bg admin"></div>
    <div class="row d-flex align-items-center h-100 welcome" id="admin">
      <div class="col-lg-7">
        <h3>Admin</h3>
        <h1>You should not be here&#8230; <br />Unless, you should</h1>
      </div>
      <div class="col-lg-5 d-flex align-items-center login">
        <input type="password" v-model="password" />
        <img
          src="https://cdn-icons-png.flaticon.com/512/3916/3916800.png"
          v-if="password == 'wachtwoord1234'"
          @click="store.dispatch('initiateAdmin')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import exportFromJSON from "export-from-json";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import { ref } from "vue";
const store = useStore();
await store.dispatch("bindDatabase");

const currentUser = localStorage.getItem("userid");
const currentSession = computed(() => store.getters["getActiveSession"]());
const pathItem = computed(() => store.getters["getPathItem"](currentUser));
const nextPathItem = computed(() => store.getters["getNextPathItem"]());

const currentSetting = ref("session");

const userAmount = ref(0);
const groupAmount = ref(0);
const password = ref("");
const game = computed(() => store.getters["getGame"]());
const startValues = ref(game.value.startValues);
const treatmentValues = ref(game.value.treatmentValues);

const download = () => {
  var data = store.getters["getExcelFormat"]();
  var fileName = "np-data" + Date.now();
  var exportType = exportFromJSON.types.xls;

  if (data) exportFromJSON({ data, fileName, exportType });
  else throw "DATA DOES NOT EXIST";
};

const formattedusers = computed(() =>
  store.getters["getUsersInSession"](currentSession.value.id).map(
    (u: string, index: number) => {
      return { users: u };
    }
  )
);
const downloadUsers = () => {
  var data = formattedusers.value;
  var fileName = "users-" + Date.now();
  var exportType = exportFromJSON.types.xls;

  if (data) exportFromJSON({ data, fileName, exportType });
  else throw "DATA DOES NOT EXIST";
};
const backup = () => {
  var data = JSON.parse(JSON.stringify(store.state));
  var fileName = "np-data" + Date.now() + "bak";
  var exportType = exportFromJSON.types.json;

  if (data) exportFromJSON({ data, fileName, exportType });
};

const ready = () => {
  if (confirm("Ready all groups?")) store.dispatch("readyAll");
};
const confirmUsers = () => {
  if (confirm("All groups in session?")) store.dispatch("continueSession");
};
</script>

<style lang="scss">
@use '@/assets/sass/components/settings';
</style>
