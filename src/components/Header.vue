<template>
  <header>
    <div class="header-container d-flex">
      <img :src="logoLight" />
      <div
        class="d-flex flex-column ms-5 fw-bold"
        v-if="userGroup && pathItem.type == 'game'"
      >
        <span>Your group: {{ userGroup.id }}</span>
        <span>Your treatment: {{ capitalize(userGroup.treatment) }}</span>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity";
import { capitalize } from "vue";
import { useStore } from "vuex";

const store = useStore();

const currentUser = localStorage.getItem("userid");
const userGroup = computed(() => store.getters["getUserGroup"](currentUser));
const pathItem = computed(() => store.getters["getPathItem"](currentUser));

const logoLight =
  "https://www.seo.nl/wp-content/themes/seoeconomics/dist/images/seo-economisch-onderzoek-logo-en-light_99f1efaf.svg";
const logoDark =
  "https://www.seo.nl/wp-content/themes/seoeconomics/dist/images/seo-economisch-onderzoek-logo-en-dark_f89a4216.svg";
</script>
