import { createRouter, createWebHistory } from "vue-router";
import Home from './components/home.vue';
import Login from './components/Login.vue';
import Error from './components/Error.vue';
import Register from './components/register.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home },
  { path: "/register", name: "Register", component: Register },
  { path: "/error", name: "Error", component: Error },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
