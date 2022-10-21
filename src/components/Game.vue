<template>
  <div v-if="groupSubmitted">
    <div v-if="groupGame.interview && groupRound.interviewAnswer == ''">
      <div id="question" v-if="userGroup.leader == currentUser">
        <div class="input">
          <div class="title">
            <h2>Why did you choose your answer?</h2>
          </div>
          <textarea
            v-model="interviewAnswer"
            type="text"
            placeholder="Type your answer here..."
          />
        </div>
        <button
          class="next"
          @click="
            store.dispatch('submitInterview', {
              groupId: userGroup.id,
              answer: interviewAnswer,
            });
            interviewAnswer = '';
          "
        >
          Submit answer
        </button>
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
    <Timer :time="groupGame.time" v-if="groupGame" />

    <div class="row">
      <div class="col-6">
        <div
          v-for="input in Object.keys(inputs)"
          :key="input"
          class="d-flex align-items-center justify-content-between"
        >
          <h2>{{ input }}</h2>
          <input
            type="range"
            min="1"
            max="100"
            v-model.number="inputs[input]"
            @input="setValues"
          />
          <input
            type="number"
            min="1"
            max="100"
            v-model.number="inputs[input]"
            @input="setValues"
          />
        </div>
        {{ inputs }}
      </div>
      <div class="col-6 d-flex">
        <pre>{{ JSON.stringify(outputs, null, 2) }}</pre>
        <pre>{{ JSON.stringify(startValues, null, 2) }}</pre>
        <pre>{{ JSON.stringify(constants, null, 2) }}</pre>
      </div>
    </div>
    <pre>{{ JSON.stringify(results, null, 2) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { RoundState } from "@/store/types";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import { useStore } from "vuex";
import Leaderboard from "./Leaderboard.vue";
import Timer from "./Timer.vue";

const store = useStore();

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
const roundInput = (variable: string, index: number) => {
  return groupGame.value.rounds[index]
    ? groupGame.value.rounds[index].inputs[variable]
    : 1;
};
const groupSubmitted = computed(() => groupRound.value.completed);

const interviewAnswer = ref("");

const inputs = computed(() =>
  store.getters["getGroupInputs"](userGroup.value.id, currentRound.value)
);
const results = computed(() =>
  store.getters["getGroupResults"](userGroup.value.id, currentRound.value)
);
const constants = groupGame.value.constants;
const startValues = groupGame.value.startValues;

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
  if (w > min_w) return 2 * (w - min_w);
  else return 0.1 * (w - min_w);
};
const A_benefit = (A_L: number, L: number) => {
  return 0.01 * A_L * L;
};

const outputs = ref(
  store.getters["getGroupOutputs"](userGroup.value.id, currentRound.value)
);
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
  // CHECK DIT KLOPT ROUNDINPUT??????---------------------------------------------
  // Calculation of capital stock
  outputs.value.K =
    (1 - startValues.delta_K) * prevOutput("K") +
    0.5 * roundInput("q", currentRound.value - constants.M + 1);

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
  results.value.q = inputs.value.q;

  outputs.value.I = groupGame.value.rounds.reduce(
    (sum: number, obj: RoundState) => obj.results.q + sum,
    0
  );

  // The calculation of capital adjustment costs
  // results.value.Ca =
  //   0.5 *
  //   q[t - M + 1] *
  //   ((startValues.eta / 2) *
  //     (Results$q[t - M + 1] / outputs.value.K[t] - startValues.delta_C) ** 2);

  // Calculation of all the firm results
  results.value.K = outputs.value.K;
  results.value.L = outputs.value.L;
  results.value.E = outputs.value.E;

  results.value.return = Math.round(startValues.p_Y * outputs.value.Y * 100) / 100;
  results.value.cost =
    Math.round(
      inputs.value.w * outputs.value.L +
        startValues.r_K * outputs.value.K +
        results.value.Ca +
        startValues.p_E * inputs.value.E +
        outputs.value.p_R_L * inputs.value.R_L +
        outputs.value.p_R_K * inputs.value.R_K +
        outputs.value.p_R_E * inputs.value.R_E +
        outputs.value.I
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
  results.value.footprint_enviroment =
    Math.round(
      (-(constants.omega_E * inputs.value.E) - constants.omega_K * outputs.value.K) * 100
    ) / 100;
  results.value.footprint_labour =
    Math.round(
      (min_wage(inputs.value.w, startValues.min_w) * outputs.value.L +
        A_benefit(outputs.value.A_L, outputs.value.L) * outputs.value.L) *
        100
    ) / 100;
};
</script>
