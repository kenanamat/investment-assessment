<template>
  <div v-if="groupSubmitted">
    <div v-if="groupGame.interview && groupRound.interviewAnswered == false">
      <div v-show="false">
        {{
          store.dispatch("addQuestionnaireToGroupRound", {
            groupId: userGroup.id,
            currentRound: currentRound,
            questionnaireId: "Ex-durante",
          })
        }}
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
        <form
          id="question"
          class="d-block px-5"
          @submit.prevent="
            store.dispatch('submitInterview', {
              groupId: userGroup.id,
              questionnaire: groupRound.questionnaire,
              currentRound: currentRound,
            })
          "
        >
          <QuestionType
            v-if="currentRound === 0"
            v-model:answer="groupRound.questionnaire[1].answer"
            :question="groupRound.questionnaire[1]"
            :key="groupRound.questionnaire[1].id"
          />
          <QuestionType
            v-model:answer="groupRound.questionnaire[2].answer"
            :question="groupRound.questionnaire[2]"
            :key="groupRound.questionnaire[2].id"
          />
          <QuestionType
            v-model:answer="groupRound.questionnaire[3].answer"
            :question="groupRound.questionnaire[3]"
            :key="groupRound.questionnaire[3].id"
          />
          <QuestionType
            v-model:answer="groupRound.questionnaire[4].answer"
            :question="groupRound.questionnaire[4]"
            :key="groupRound.questionnaire[4].id"
          />
          <QuestionType
            v-if="currentRound == groupGame.rounds.length - 1"
            v-model:answer="groupRound.questionnaire[5].answer"
            :question="groupRound.questionnaire[5]"
            :key="groupRound.questionnaire[5].id"
          />
        </form>
        <button type="submit" form="question" class="next">Submit answers</button>
      </div>
      <div v-else>Discuss with group leader</div>
    </div>
    <div v-else>
      <div id="leaderboard">
        <Leaderboard />
      </div>
    </div>
  </div>
  <div v-else id="game">
    <Timer v-model:timeLeftGame="timeLeftGame" :time="groupGame.time" v-if="groupGame" />

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
      <div class="col-7 mt-4">
        <table class="mb-4">
          <tr>
            <td>Item</td>
            <td class="ps-3">Amount</td>
          </tr>
          <tr
            v-for="item in ['A_E', 'A_K', 'A_L', 'p_R_E', 'p_R_K', 'p_R_L']"
            :key="item"
          >
            <td>
              {{ store.state.translations[item] }}
            </td>
            <td class="ps-3 fw-bold">{{ Math.round(outputs[item] * 100) / 100 }}</td>
          </tr>
        </table>

        <h3>Left over budget</h3>
        <h2>{{ Math.round((constants.budget - getUse()) * 100) / 100 }}</h2>
      </div>
    </div>
    <button v-if="userGroup.leader == currentUser" @click="submit()">Continue</button>
    <div v-show="false" v-if="userGroup.leader == currentUser && timeLeftGame <= 0">
      {{ forceSubmit() }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RoundState, InputState } from "@/store/types";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
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

const inputs = ref(
  store.getters["getGroupInputs"](userGroup.value.id, currentRound.value)
);
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
  E: inputs.value.E,
  R_E: inputs.value.R_E,
  R_K: inputs.value.R_K,
  R_L: inputs.value.R_L,
  q: inputs.value.q,
  w: inputs.value.w,
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
  results.value.footprint_environment =
    Math.round(
      (-(constants.omega_E * inputs.value.E) - constants.omega_K * outputs.value.K) * 100
    ) / 100;
  results.value.footprint_labour =
    Math.round(
      (min_wage(inputs.value.w, startValues.min_w) * outputs.value.L +
        A_benefit(outputs.value.A_L, outputs.value.L)) *
        100
    ) / 100;
  results.value.tot_footprint_environment =
    Math.round(
      groupGame.value.rounds.reduce(
        (sum: number, obj: RoundState) => obj.results.footprint_environment + sum,
        0
      ) * 100
    ) / 100;
  results.value.tot_footprint_labour =
    Math.round(
      groupGame.value.rounds.reduce(
        (sum: number, obj: RoundState) => obj.results.footprint_labour + sum,
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
