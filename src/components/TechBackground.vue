<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  effect?: 'grid' | 'radar' | 'connections' | 'stars'
  density?: number
  opacity?: number
  fullScreen?: boolean
}>(), {
  effect: 'grid',
  density: 40,
  opacity: 0.5,
  fullScreen: true,
})

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let rafId: number | null = null
let time = 0

interface Particle { x: number; y: number; vx: number; vy: number; r: number; phase: number }
let particles: Particle[] = []
let w = 0, h = 0

function resize() {
  const c = canvas.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  w = window.innerWidth; h = window.innerHeight
  c.width = w * dpr; c.height = h * dpr
  c.style.width = w + 'px'; c.style.height = h + 'px'
  ctx = c.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
  initParticles()
}

function initParticles() {
  const count = Math.round((props.density / 40) * 80)
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 2 + 0.5,
    phase: Math.random() * Math.PI * 2,
  }))
}

function drawGrid() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  const step = Math.round(1200 / props.density * 12)
  ctx.strokeStyle = `rgba(0, 212, 180, ${props.opacity * 0.06})`
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  // floating dots
  time += 0.012
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
    const alpha = (Math.sin(time + p.phase) * 0.15 + 0.2) * props.opacity
    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(0,212,180,${alpha})`
    ctx!.fill()
  }
}

function drawRadar() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2
  const maxR = Math.max(w, h) * 0.6
  time += 0.015
  // rings
  const rings = 5
  for (let i = 1; i <= rings; i++) {
    const r = (maxR / rings) * i
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,212,180,${props.opacity * 0.08})`
    ctx.lineWidth = 1
    ctx.stroke()
  }
  // sweep
  const angle = time * 1.2
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  const sweep = ctx.createLinearGradient(0, 0, maxR, 0)
  sweep.addColorStop(0, `rgba(0,212,180,${props.opacity * 0.4})`)
  sweep.addColorStop(1, `rgba(0,212,180,0)`)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, maxR, -0.4, 0)
  ctx.closePath()
  ctx.fillStyle = sweep
  ctx.fill()
  ctx.restore()
  // dots
  for (const p of particles) {
    const alpha = (Math.sin(time * 2 + p.phase) * 0.15 + 0.15) * props.opacity
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,212,180,${alpha})`
    ctx.fill()
  }
}

function drawConnections() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  time += 0.008
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
  }
  const maxDist = 160
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * props.opacity * 0.25
        ctx!.beginPath()
        ctx!.moveTo(particles[i].x, particles[i].y)
        ctx!.lineTo(particles[j].x, particles[j].y)
        ctx!.strokeStyle = `rgba(0,212,180,${alpha})`
        ctx!.lineWidth = 0.8
        ctx!.stroke()
      }
    }
    const alpha = (Math.sin(time + particles[i].phase) * 0.1 + 0.2) * props.opacity
    ctx!.beginPath()
    ctx!.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(56,189,248,${alpha})`
    ctx!.fill()
  }
}

function drawStars() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  time += 0.008
  for (const p of particles) {
    const alpha = (Math.sin(time * 1.5 + p.phase) * 0.15 + 0.2) * props.opacity
    ctx!.beginPath()
    ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(230,240,255,${Math.max(0.04, alpha)})`
    ctx!.fill()
  }
}

const drawFns: Record<string, () => void> = {
  grid: drawGrid,
  radar: drawRadar,
  connections: drawConnections,
  stars: drawStars,
}

function loop() {
  drawFns[props.effect]?.()
  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  resize()
  loop()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
})

watch(() => props.effect, () => { initParticles() })
</script>

<template>
  <canvas ref="canvas" class="tech-bg" />
</template>

<style scoped>
.tech-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
