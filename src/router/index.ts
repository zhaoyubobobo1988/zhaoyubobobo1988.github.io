import { createRouter, createWebHashHistory } from 'vue-router'
import NeuralHome from '@/views/NeuralHome.vue'
import Portfolio from '@/components/Portfolio.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: NeuralHome },
    { path: '/portfolio', component: Portfolio },
  ],
})
