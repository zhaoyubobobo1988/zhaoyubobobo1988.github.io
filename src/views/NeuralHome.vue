<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasEl = ref<HTMLCanvasElement | null>(null)

// ── Types ──────────────────────────────────────────────────────────────────

interface RNode {
  label: string
  sublabel?: string
  clickable: boolean
  route?: string
  x: number
  y: number
  r: number
  color: string
  layerIdx: number
  hovered: boolean
}

interface Packet {
  from: RNode
  to: RNode
  t: number
  speed: number
}

// ── Mutable state (reinitialised by buildLayout) ───────────────────────────

let rNodes: RNode[] = []
let packets: Packet[] = []
let edges: Array<[RNode, RNode]> = []
let tick = 0
let raf = 0
let cleanups: Array<() => void> = []

// ── Colour helpers ─────────────────────────────────────────────────────────

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// ── Network definition ─────────────────────────────────────────────────────

const COLORS = ['#4f9cf9', '#2dd4bf', '#a78bfa', '#d4622d']

type LayerNode = {
  label: string
  sublabel?: string
  clickable?: boolean
  route?: string
}

const LAYERS: LayerNode[][] = [
  [
    { label: 'Python' },
    { label: 'FastAPI' },
    { label: 'Redis' },
    { label: 'Docker' },
    { label: 'LSTM' },
    { label: 'MinIO' },
  ],
  [
    { label: 'Backend' },
    { label: 'DevOps' },
    { label: 'AI/LLM' },
    { label: 'Hydro' },
  ],
  [
    { label: '项目', sublabel: 'Projects' },
    { label: '技能', sublabel: 'Skills' },
    { label: '教育', sublabel: 'Edu' },
  ],
  [
    { label: '赵宇博', sublabel: '个人主页 →', clickable: true, route: '/portfolio' },
  ],
]

// ── Layout builder ─────────────────────────────────────────────────────────

function buildLayout(W: number, H: number) {
  rNodes = []
  packets = []
  edges = []

  const margin = Math.max(110, W * 0.09)
  const xs = LAYERS.map((_, i) => margin + (i / (LAYERS.length - 1)) * (W - margin * 2))

  LAYERS.forEach((layer, li) => {
    const isOutput = li === LAYERS.length - 1
    const R = isOutput ? 46 : 27
    const gap = Math.min(118, (H - 180) / Math.max(layer.length, 1))
    const totalH = (layer.length - 1) * gap
    const startY = (H - totalH) / 2

    layer.forEach((def, ni) => {
      rNodes.push({
        label: def.label,
        sublabel: def.sublabel,
        clickable: def.clickable ?? false,
        route: def.route,
        x: xs[li],
        y: startY + ni * gap,
        r: R,
        color: COLORS[li],
        layerIdx: li,
        hovered: false,
      })
    })
  })

  const byLayer = LAYERS.map((_, li) => rNodes.filter(n => n.layerIdx === li))
  for (let li = 0; li < LAYERS.length - 1; li++) {
    byLayer[li].forEach(fn => {
      byLayer[li + 1].forEach(tn => edges.push([fn, tn]))
    })
  }

  edges.forEach(([fn, tn]) => {
    if (Math.random() < 0.5) {
      packets.push({ from: fn, to: tn, t: Math.random(), speed: 0.0025 + Math.random() * 0.005 })
    }
  })
}

// ── Arrow helper ───────────────────────────────────────────────────────────

function drawArrow(ctx: CanvasRenderingContext2D, fn: RNode, tn: RNode) {
  const dx = tn.x - fn.x
  const dy = tn.y - fn.y
  const d = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / d
  const uy = dy / d
  const tx = tn.x - ux * (tn.r + 5)
  const ty = tn.y - uy * (tn.r + 5)
  const ang = Math.atan2(dy, dx)
  ctx.beginPath()
  ctx.moveTo(tx, ty)
  ctx.lineTo(tx - 8 * Math.cos(ang - 0.45), ty - 8 * Math.sin(ang - 0.45))
  ctx.lineTo(tx - 8 * Math.cos(ang + 0.45), ty - 8 * Math.sin(ang + 0.45))
  ctx.closePath()
  ctx.fillStyle = rgba(fn.color, 0.55)
  ctx.fill()
}

// ── Main draw loop ─────────────────────────────────────────────────────────

function draw(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#070e1e')
  bg.addColorStop(1, '#0c1525')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255,255,255,0.022)'
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Edges
  edges.forEach(([fn, tn]) => {
    const hi = fn.hovered || tn.hovered
    ctx.beginPath()
    ctx.moveTo(fn.x, fn.y)
    ctx.lineTo(tn.x, tn.y)
    ctx.strokeStyle = rgba(fn.color, hi ? 0.28 : 0.07)
    ctx.lineWidth = hi ? 1.5 : 0.75
    ctx.stroke()
    if (hi) drawArrow(ctx, fn, tn)
  })

  // Packets (signal dots flowing along edges)
  packets.forEach(p => {
    const x = p.from.x + (p.to.x - p.from.x) * p.t
    const y = p.from.y + (p.to.y - p.from.y) * p.t
    ctx.save()
    ctx.shadowColor = p.from.color
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(x, y, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = p.from.color
    ctx.fill()
    ctx.restore()
    p.t += p.speed
    if (p.t >= 1) { p.t = 0; p.speed = 0.0025 + Math.random() * 0.005 }
  })

  // Nodes
  tick += 0.02
  rNodes.forEach(n => {
    const pulse = (Math.sin(tick + n.x * 0.004 + n.y * 0.004) + 1) * 0.5
    const glowR = n.r + (n.hovered ? 18 : 5 + pulse * 6)

    // Glow halo
    const grd = ctx.createRadialGradient(n.x, n.y, n.r * 0.35, n.x, n.y, glowR)
    grd.addColorStop(0, rgba(n.color, n.hovered ? 0.28 : 0.1 + pulse * 0.08))
    grd.addColorStop(1, rgba(n.color, 0))
    ctx.beginPath()
    ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()

    // Fill
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = rgba(n.color, n.hovered ? 0.22 : 0.08)
    ctx.fill()

    // Ring
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.strokeStyle = rgba(n.color, n.hovered ? 1 : 0.38 + pulse * 0.22)
    ctx.lineWidth = n.hovered ? 2.5 : 1.2
    ctx.stroke()

    // Label
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (n.sublabel) {
      const mainSz = n.r > 38 ? 15 : 11
      ctx.font = `700 ${mainSz}px Inter, "PingFang SC", "Microsoft YaHei", sans-serif`
      ctx.fillStyle = n.hovered ? '#ffffff' : rgba(n.color, 0.9)
      ctx.fillText(n.label, n.x, n.y - mainSz * 0.72)
      ctx.font = `400 9px Inter, "PingFang SC", sans-serif`
      ctx.fillStyle = n.hovered ? 'rgba(255,255,255,0.65)' : rgba(n.color, 0.5)
      ctx.fillText(n.sublabel, n.x, n.y + mainSz * 0.72)
    } else {
      ctx.font = `600 ${n.r > 32 ? 13 : 10}px Inter, "PingFang SC", "Microsoft YaHei", sans-serif`
      ctx.fillStyle = n.hovered ? '#ffffff' : rgba(n.color, 0.85)
      ctx.fillText(n.label, n.x, n.y)
    }
  })

  // Layer labels
  const margin = Math.max(110, W * 0.09)
  const xs = LAYERS.map((_, i) => margin + (i / (LAYERS.length - 1)) * (W - margin * 2))
  const lLabels = ['输入层', '隐藏层 Ⅰ', '隐藏层 Ⅱ', '输出层']
  xs.forEach((x, i) => {
    ctx.font = '10px "JetBrains Mono", Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = rgba(COLORS[i], 0.36)
    ctx.fillText(lLabels[i], x, 32)
  })

  // Page title (top-left)
  ctx.textAlign = 'left'
  ctx.font = '700 22px Inter, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.fillText('赵宇博', 38, 50)
  ctx.font = '400 12px Inter, "PingFang SC", sans-serif'
  ctx.fillStyle = rgba('#d4622d', 0.68)
  ctx.fillText('后端开发 · AI 应用工程师', 38, 72)

  // Hint (bottom center)
  ctx.textAlign = 'center'
  ctx.font = '11px Inter, "PingFang SC", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText('点击右侧输出节点 · 进入个人主页', W / 2, H - 28)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

onMounted(() => {
  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    buildLayout(canvas.width, canvas.height)
  }

  const handleMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let anyClickable = false
    rNodes.forEach(n => {
      n.hovered = (mx - n.x) ** 2 + (my - n.y) ** 2 <= (n.r + 8) ** 2
      if (n.hovered && n.clickable) anyClickable = true
    })
    canvas.style.cursor = anyClickable ? 'pointer' : 'default'
  }

  const handleClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const hit = rNodes.find(n => n.clickable && (mx - n.x) ** 2 + (my - n.y) ** 2 <= (n.r + 8) ** 2)
    if (hit?.route) router.push(hit.route)
  }

  resize()
  window.addEventListener('resize', resize)
  canvas.addEventListener('mousemove', handleMove)
  canvas.addEventListener('click', handleClick)

  const loop = () => { draw(ctx, canvas.width, canvas.height); raf = requestAnimationFrame(loop) }
  loop()

  cleanups = [
    () => cancelAnimationFrame(raf),
    () => window.removeEventListener('resize', resize),
    () => canvas.removeEventListener('mousemove', handleMove),
    () => canvas.removeEventListener('click', handleClick),
  ]
})

onBeforeUnmount(() => { cleanups.forEach(fn => fn()); cleanups = [] })
</script>

<template>
  <div class="neural-home">
    <canvas ref="canvasEl" class="cv" />
  </div>
</template>

<style scoped>
.neural-home {
  position: fixed;
  inset: 0;
  background: #070e1e;
}
.cv {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
