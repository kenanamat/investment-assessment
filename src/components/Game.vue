<template>
  <img id="grclogo" src="@/assets/img/GRC.png" />
  <div v-if="groupSubmitted">
    <div v-if="groupRound.interviewAnswered == false">
      <div v-show="false" v-if="!groupRound.questionnaire">
        {{
          store.dispatch("addQuestionnaireToGroupRound", {
            groupId: userGroup.id,
            currentRound: currentRound,
            questionnaireId: "Ex-durante",
          })
        }}
      </div>
      <div v-show="false">
        {{ resetInputs() }}
        {{ setValues() }}
      </div>
      <div id="question-wrapper" v-if="userGroup.leader == currentUser">
        <div class="header text-center">
          <small>Strategy </small>
          <h2 class="mt-2">Explain yourself</h2>
          <p></p>
        </div>
        <hr />
        <form id="question" class="d-block px-5" @submit.prevent="submitInterview()">
          <QuestionType
            v-if="currentRound === 0"
            v-model:answer="answers[0]"
            :question="groupRound.questionnaire[1]"
            :key="groupRound.questionnaire[1].id"
          />
          <QuestionType
            v-if="currentRound == groupGame.rounds.length - 1 || currentRound === 0"
            v-model:answer="answers[1]"
            :question="groupRound.questionnaire[2]"
            :key="groupRound.questionnaire[2].id"
          />
          <QuestionType
            v-if="currentRound == groupGame.rounds.length - 1 || currentRound === 0"
            v-model:answer="answers[2]"
            :question="groupRound.questionnaire[3]"
            :key="groupRound.questionnaire[3].id"
          />
          <QuestionType
            v-if="currentRound == groupGame.rounds.length - 1 || currentRound === 0"
            v-model:answer="answers[3]"
            :question="groupRound.questionnaire[4]"
            :key="groupRound.questionnaire[4].id"
          />
          <QuestionType
            v-if="currentRound == groupGame.rounds.length - 1"
            v-model:answer="answers[4]"
            :question="groupRound.questionnaire[5]"
            :key="groupRound.questionnaire[5].id"
          />
          <QuestionType
            v-if="currentRound != 0 && currentRound != groupGame.rounds.length - 1"
            v-model:answer="answers[5]"
            :question="groupRound.questionnaire[6]"
            :key="groupRound.questionnaire[6].id"
          />
        </form>
        <button type="submit" form="question" class="next">Submit answers</button>
      </div>
      <div v-else>Discuss with group leader</div>
    </div>
    <div v-else>
      <div id="leaderboard">
        <Leaderboard :key="currentRound" />
      </div>
    </div>
  </div>
  <div class="mb-5 pb-5" v-else id="game">
    <Timer
      v-model:timeLeftGame="timeLeftGame"
      :time="groupGame.time[currentRound]"
      v-if="groupGame"
      :key="currentRound"
    />
    <div class="box col-3 p-3 mb-4">
      <h4>Your group: {{ userGroup.id }}</h4>
      <h4>Your treatment: {{ userGroup.treatment }}</h4>
    </div>
    <div class="row">
      <div class="col-5">
        <div class="box" id="inputs-controller">
          <h2>Your allocations</h2>
          <div
            v-for="input in Object.keys(inputs)"
            :key="input"
            class="inputs-wrapper d-flex"
          >
            <div class="slider flex-fill">
              <h5>{{ store.state.translations[input] }}</h5>
              <input
                type="range"
                :min="input === 'w' ? 3 : 0"
                :max="getMax(input)"
                :step="input === 'w' ? 0.5 : 1"
                v-model.number="currInputs[input as keyof InputState]"
                @input="checkBudget(input)"
              />
            </div>
            <div class="number">
              <input
                type="number"
                :min="input === 'w' ? 3 : 0"
                :max="getMax(input)"
                :step="input === 'w' ? 0.5 : 1"
                v-model.number="currInputs[input as keyof InputState]"
                @input="checkBudget(input)"
              />
              <div class="chevrons">
                <i
                  class="fa-solid fa-chevron-up"
                  @click="input === 'w' ? currInputs[input as keyof InputState] = currInputs[input as keyof InputState] + 0.5 : currInputs[input as keyof InputState]++;
                  checkBudget(input)"
                ></i>
                <i
                  class="fa-solid fa-chevron-down"
                  @click="input === 'w' ? currInputs[input as keyof InputState] = currInputs[input as keyof InputState] - 0.5 : currInputs[input as keyof InputState]--;checkBudget(input)"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-3 mt-4 position-relative">
        <table class="mb-4">
          <tr class="border-bottom fw-bold">
            <td class="pe-3">Information on productivity and R&D</td>
            <td class="ps-3 border-start">Value</td>
          </tr>
          <tr>
            <td class="fw-bold pt-3">Productivity in:</td>
          </tr>
          <tr v-for="(item, idx) in ['A_L', 'A_K', 'A_E']" :key="item">
            <td class="pe-3 ps-3">
              {{ ["Labour efficiency", "Capital efficiency", "Energy efficiency"][idx] }}
            </td>
            <td class="ps-3 fw-bold border-start text-end">
              {{ Math.round(outputs[item] * 100) / 100 }}
            </td>
          </tr>
          <tr>
            <td class="fw-bold pt-3">Cost of research for:</td>
          </tr>
          <tr v-for="(item2, idx2) in ['p_R_L', 'p_R_K', 'p_R_E']" :key="item2">
            <td class="pe-3 ps-3">
              {{ ["Labour efficiency", "Capital efficiency", "Energy efficiency"][idx2] }}
            </td>
            <td class="ps-3 fw-bold border-start text-end">
              {{ Math.round(outputs[item2] * 100) / 100 }}
            </td>
          </tr>
        </table>

        <h3>Left over budget</h3>
        <h2>{{ Math.round((constants.budget - getUse()) * 100) / 100 }}</h2>
        <button
          class="position-absolute bottom-0 end-0"
          v-if="userGroup.leader == currentUser"
          @click="submit()"
        >
          Continue
        </button>
      </div>
    </div>
    <div v-if="currentRound != 0">
      <h4 class="mt-5">Previous allocations</h4>
      <table class="mb-4">
        <thead class="border-bottom">
          <td class="p-3 border-end">Period</td>
          <td class="p-3" v-for="input in Object.keys(inputs)" :key="input">
            {{ store.state.translations[input] }}
          </td>
        </thead>
        <tr v-for="round in groupGame.rounds.slice(0, currentRound)" :key="round.index">
          <td class="p-3 border-end">Period {{ round.index + 1 }}</td>
          <td class="text-end p-3" v-for="input in Object.keys(inputs)" :key="input">
            {{ round.inputs[input] }}
          </td>
        </tr>
      </table>
    </div>
    <div v-show="false" v-if="userGroup.leader == currentUser && timeLeftGame <= 0">
      {{ forceSubmit() }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RoundState, InputState } from "@/store/types";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import type { Ref } from "vue";
import { useStore } from "vuex";
import Leaderboard from "./Leaderboard.vue";
import Timer from "./Timer.vue";
import QuestionType from "./QuestionType.vue";
import { BarChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const store = useStore();

const timeLeftGame = ref(10);

const currentUser = localStorage.getItem("userid");

const currentRound = computed(() => store.getters["getCurrentRound"]());
const userGroup = computed(() => store.getters["getUserGroup"](currentUser));
const groupGame = computed(() => store.getters["getGroupGame"](userGroup.value.id));
const groupRound = computed(() =>
  store.getters["getGroupGameRound"](userGroup.value.id, currentRound.value)
);

const answers = ref(["", "", "", "", "", ""]);

const submitInterview = () => {
  groupRound.value.questionnaire[1].answer = answers.value[0];
  groupRound.value.questionnaire[2].answer = answers.value[1];
  groupRound.value.questionnaire[3].answer = answers.value[2];
  groupRound.value.questionnaire[4].answer = answers.value[3];
  groupRound.value.questionnaire[5].answer = answers.value[4];
  groupRound.value.questionnaire[6].answer = answers.value[5];

  store.dispatch("submitInterview", {
    groupId: userGroup.value.id,
    questionnaire: groupRound.value.questionnaire,
    currentRound: currentRound.value,
  });
};

const prevGroupRound = computed(() =>
  store.getters["getGroupGameRound"](userGroup.value.id, currentRound.value - 1)
);
const prevOutput = (variable: string) => {
  return prevGroupRound.value ? prevGroupRound.value.outputs[variable] : 1;
};
const prevOutputK = (variable: string) => {
  return prevGroupRound.value ? prevGroupRound.value.outputs[variable] : 100;
};
const prevInvestment = () => {
  return prevGroupRound.value ? prevGroupRound.value.outputs.I : 0;
};
const roundInput = (variable: string, index: number) => {
  return groupGame.value.rounds[index]
    ? groupGame.value.rounds[index].inputs[variable]
    : 0;
};
const roundResult = (variable: string, index: number) => {
  return groupGame.value.rounds[index]
    ? groupGame.value.rounds[index].results[variable]
    : 0;
};
const groupSubmitted = computed(() => groupRound.value.completed);

const inputs: Ref<{ [id: string]: number }> = ref({
  w: 3,
  q: 0,
  E: 0,
  R_L: 0,
  R_K: 0,
  R_E: 0,
});
const resetInputs = () => {
  inputs.value.E = 0;
  inputs.value.R_E = 0;
  inputs.value.R_K = 0;
  inputs.value.R_L = 0;
  inputs.value.q = 0;
  inputs.value.w = 3;
  currInputs.value.E = 0;
  currInputs.value.R_E = 0;
  currInputs.value.R_K = 0;
  currInputs.value.R_L = 0;
  currInputs.value.q = 0;
  currInputs.value.w = 3;
};
const currInputs = ref({
  w: inputs.value.w,
  q: inputs.value.q,
  E: inputs.value.E,
  R_L: inputs.value.R_L,
  R_K: inputs.value.R_K,
  R_E: inputs.value.R_E,
});
const getMax = (input: string) => {
  switch (input) {
    case "w":
      return 9;
    case "q":
      return 2000;
    default:
      return 500;
  }
};

const results = computed(() =>
  store.getters["getGroupResults"](userGroup.value.id, currentRound.value)
);
const constants = Object.assign(groupGame.value.constants, {
  phi: 1 / groupGame.value.constants.M,
});

const startValues = groupGame.value.startValues[currentRound.value];

// standard formulas
const labour = (w: number) => {
  return Math.max(10 * (-7 + 3 * w), 0);
};
const p_research = (A: number) => {
  return (3 / 2) * A ** 3;
};
const payoff_research = (delta: number, R: number, A: number) => {
  return (1 - delta) * A + (Math.sqrt(1.5 * R) / 80) * A;
};
const min_wage = (w: number, min_w: number) => {
  if (w < min_w) return 2 * (w - min_w);
  else return 0.1 * (w - min_w);
};
const A_benefit = (A_L: number, L: number) => {
  return 0.01 * A_L * L;
};

const outputs = ref(
  store.getters["getGroupOutputs"](userGroup.value.id, currentRound.value)
);

const submit = () => {
  if (!confirm("Are your decisions final?")) return;

  setValues();
  store.dispatch("submitAnswer", {
    groupId: userGroup.value.id,
    values: {
      inputs: inputs.value,
      outputs: outputs.value,
      results: results.value,
    },
  });
};
const forceSubmit = () => {
  timeLeftGame.value = 100;
  setValues();
  store.dispatch("submitAnswer", {
    groupId: userGroup.value.id,
    values: {
      inputs: inputs.value,
      outputs: outputs.value,
      results: results.value,
    },
  });
};
const checkBudget = (input: string) => {
  if (
    getUse() > constants.budget ||
    currInputs.value[input as keyof InputState] < 0 ||
    currInputs.value["w"] < 3
  ) {
    currInputs.value[input as keyof InputState] = inputs.value[input];
  } else {
    inputs.value[input] = currInputs.value[input as keyof InputState];
    setValues();
  }
};
const setValues = () => {
  // Cost of labour.
  outputs.value.L = labour(inputs.value.w);
  // Productivity.
  outputs.value.A_L = payoff_research(
    startValues.delta_A_L,
    inputs.value.R_L,
    prevOutput("A_L")
  );
  outputs.value.A_K = payoff_research(
    startValues.delta_A_K,
    inputs.value.R_K,
    prevOutput("A_K")
  );
  outputs.value.A_E = payoff_research(
    startValues.delta_A_E,
    inputs.value.R_E,
    prevOutput("A_E")
  );
  // Cost of research.
  outputs.value.p_R_L = p_research(outputs.value.A_L);
  outputs.value.p_R_K = p_research(outputs.value.A_K);
  outputs.value.p_R_E = p_research(outputs.value.A_E);

  // Budget constraints
  outputs.value.use =
    outputs.value.L * inputs.value.w +
    startValues.p_E * inputs.value.E +
    inputs.value.q +
    inputs.value.R_L * outputs.value.p_R_L +
    inputs.value.R_K * outputs.value.p_R_K +
    inputs.value.R_E * outputs.value.p_R_E;
  outputs.value.left_over_budget = constants.budget - outputs.value.use;

  // Calculation of capital stock
  outputs.value.K =
    (1 - startValues.delta_K) * prevOutputK("K") +
    0.5 * roundInput("q", currentRound.value - constants.M);

  // Calculation of Q stock
  outputs.value.Q =
    ((outputs.value.A_L * outputs.value.L) ** constants.sigma_Q +
      (outputs.value.A_K * outputs.value.K) ** constants.sigma_Q) **
    (1 / constants.sigma_Q);

  // Calculation of y stock (total number of rubber units)
  outputs.value.Y =
    1000 *
    ((startValues.A_Q * outputs.value.Q) ** constants.sigma_Y +
      (outputs.value.A_E * inputs.value.E) ** constants.sigma_Y) **
      (1 / constants.sigma_Y);

  // Calculate investment
  results.value.q = inputs.value.q * constants.phi;

  outputs.value.I =
    results.value.q +
    prevInvestment() -
    roundResult("q", currentRound.value - constants.M);

  // The calculation of capital adjustment costs
  results.value.Ca =
    0.5 *
    roundResult("q", currentRound.value - constants.M) *
    ((startValues.eta / 2) *
      (roundResult("q", currentRound.value - constants.M) / outputs.value.K -
        startValues.delta_C) **
        2);

  // Calculation of all the firm results
  results.value.K = outputs.value.K;
  results.value.L = outputs.value.L;
  results.value.E = inputs.value.E;
  results.value.Q = outputs.value.Q;
  results.value.Y = outputs.value.Y;

  results.value.return = Math.round(startValues.p_Y * outputs.value.Y * 100) / 100;
  results.value.cost =
    Math.round(
      (inputs.value.w * outputs.value.L +
        startValues.r_K * outputs.value.K +
        results.value.Ca +
        startValues.p_E * inputs.value.E +
        outputs.value.p_R_L * inputs.value.R_L +
        outputs.value.p_R_K * inputs.value.R_K +
        outputs.value.p_R_E * inputs.value.R_E +
        outputs.value.I) *
        100
    ) /
      100 +
    constants.fixed_costs;
  results.value.left_over_budget = Math.round(outputs.value.left_over_budget * 100) / 100;
  results.value.profit_pre_tax =
    Math.round(
      (results.value.return - results.value.cost + results.value.left_over_budget) * 100
    ) / 100;
  results.value.profit_post_tax =
    results.value.profit_pre_tax > 0
      ? Math.round(results.value.profit_pre_tax * (1 - constants.tax_rate) * 100) / 100
      : results.value.profit_pre_tax;
  results.value.environmental_impact =
    Math.round(
      (-(constants.omega_E * inputs.value.E) - constants.omega_K * outputs.value.K) * 100
    ) / 100;
  results.value.social_impact =
    Math.round(
      (min_wage(inputs.value.w, startValues.min_w) * outputs.value.L +
        A_benefit(outputs.value.A_L, outputs.value.L)) *
        100
    ) / 100;
  results.value.tot_environmental_impact =
    Math.round(
      groupGame.value.rounds.reduce(
        (sum: number, obj: RoundState) => obj.results.environmental_impact + sum,
        0
      ) * 100
    ) / 100;
  results.value.tot_social_impact =
    Math.round(
      groupGame.value.rounds.reduce(
        (sum: number, obj: RoundState) => obj.results.social_impact + sum,
        0
      ) * 100
    ) / 100;
  results.value.tot_profit_post_tax =
    Math.round(
      groupGame.value.rounds.reduce(
        (sum: number, obj: RoundState) => obj.results.profit_post_tax + sum,
        0
      ) * 100
    ) / 100;

  return "Set values";
};

const getUse = () => {
  // Cost of labour.
  let L = labour(currInputs.value.w);
  // Productivity.
  let A_L = payoff_research(
    startValues.delta_A_L,
    currInputs.value.R_L,
    prevOutput("A_L")
  );
  let A_K = payoff_research(
    startValues.delta_A_K,
    currInputs.value.R_K,
    prevOutput("A_K")
  );
  let A_E = payoff_research(
    startValues.delta_A_E,
    currInputs.value.R_E,
    prevOutput("A_E")
  );
  // Cost of research.
  let p_R_L = p_research(A_L);
  let p_R_K = p_research(A_K);
  let p_R_E = p_research(A_E);

  // Budget constraints
  return (
    L * currInputs.value.w +
    startValues.p_E * currInputs.value.E +
    currInputs.value.q +
    currInputs.value.R_L * p_R_L +
    currInputs.value.R_K * p_R_K +
    currInputs.value.R_E * p_R_E
  );
};
console.log(getUse());
console.log(setValues());
</script>

<style lang="scss">
@use '@/assets/sass/components/controller';
</style>
