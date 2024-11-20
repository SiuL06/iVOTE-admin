import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './components/home.vue'; // Home page component
import Login from './components/Login.vue'; // Login page component

// Define routes
const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home },
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Create Vue app and use the router
const app = createApp(App);

// Use the router in the app
app.use(router);

// Mount the app to the DOM
app.mount('#app');
