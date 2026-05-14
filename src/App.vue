<script setup lang="ts">
import { ref } from 'vue'
import SplashScreen from '@/components/SplashScreen.vue'
import Portfolio from '@/components/Portfolio.vue'

const stage = ref<'splash' | 'portfolio'>('splash')
</script>

<template>
  <Transition name="fade" mode="out-in">
    <SplashScreen v-if="stage === 'splash'" @complete="stage = 'portfolio'" />
    <Portfolio v-else @back="stage = 'splash'" />
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.6s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
