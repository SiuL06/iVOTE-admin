<script setup>
import { createRouter, createWebHistory } from 'vue-router';
import { createApp } from 'vue';
import Home from './components/home.vue';
import Login from './components/Login.vue';
import Electionresults from './components/electionresults.vue';

// Define routes
const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home },
  { path: '/electionresults', component: Electionresults },
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Export App setup
const app = createApp({});
app.use(router).mount('#app');
</script>

<template>
  <router-view />
</template>

<style scoped>
/* Add any global styles here */
</style>
