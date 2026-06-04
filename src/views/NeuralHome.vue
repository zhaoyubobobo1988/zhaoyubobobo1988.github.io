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
  // World 3D coords
  wx: number; wy: number; wz: number
  // Screen projected (updated each frame)
  sx: number; sy: number; sr: number; sz: number
  baseR: number
  color: string
  layerIdx: number
  hovered: boolean
}

interface Packet {
  from: RNode; to: RNode
  t: number; speed: number
}

// ── Mutable state ──────────────────────────────────────────────────────────

let rNodes: RNode[] = []
let packets: Packet[] = []
let edges: Array<[RNode, RNode]> = []

let rotY = 0.35
let rotX = -0.12
let velY = 0
let velX = 0
const AUTO_ROT = 0.0005

let zoom = 1.0

let isDragging = false
let didDrag = false
let dragX = 0
let dragY = 0

let tick = 0
let raf = 0
let cleanups: Array<() => void> = []

// ── Colour helper ──────────────────────────────────────────────────────────

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${Math.min(1, Math.max(0, a))})`
}

// ── Network definition ─────────────────────────────────────────────────────

const COLORS = ['#4f9cf9', '#2dd4bf', '#a78bfa', '#d4622d']

type LayerNode = { label: string; sublabel?: string; clickable?: boolean; route?: string }

const LAYERS: LayerNode[][] = [
  [
    { label: 'Python' }, { label: 'FastAPI' }, { label: 'Redis' },
    { label: 'Docker' }, { label: 'LSTM' },   { label: 'MinIO' },
  ],
  [
    { label: 'Backend' }, { label: 'DevOps' }, { label: 'AI/LLM' }, { label: 'Hydro' },
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

// Z offsets within each layer — gives 3D spread when rotated
const LAYER_Z: number[][] = [
  [-100, -55, 15, 65, -30, 85],
  [-75, 75, -50, 55],
  [-55, 5, 60],
  [0],
]

// ── 3D projection ──────────────────────────────────────────────────────────

function project3D(
  wx: number, wy: number, wz: number,
  ry: number, rx: number,
): { sx: number; sy: number; depth: number; scale: number } {
  // Rotate Y
  const cy = Math.cos(ry), sy = Math.sin(ry)
  const x1 = wx * cy - wz * sy
  const z1 = wx * sy + wz * cy

  // Rotate X
  const cx = Math.cos(rx), sx = Math.sin(rx)
  const y1 = wy * cx - z1 * sx
  const z2 = wy * sx + z1 * cx

  const d = 1100
  const scale = d / (d + z2)
  return { sx: x1 * scale, sy: y1 * scale, depth: z2, scale }
}

// ── Layout builder ─────────────────────────────────────────────────────────

function buildLayout() {
  rNodes = []
  packets = []
  edges = []

  const lx = [-460, -155, 155, 460]

  LAYERS.forEach((layer, li) => {
    const isOutput = li === LAYERS.length - 1
    const R = isOutput ? 48 : 28
    const gap = 105
    const totalH = (layer.length - 1) * gap
    const startY = -totalH / 2

    layer.forEach((def, ni) => {
      rNodes.push({
        label: def.label,
        sublabel: def.sublabel,
        clickable: def.clickable ?? false,
        route: def.route,
        wx: lx[li],
        wy: startY + ni * gap,
        wz: LAYER_Z[li]?.[ni] ?? 0,
        sx: 0, sy: 0, sr: R, sz: 0,
        baseR: R,
        color: COLORS[li],
        layerIdx: li,
        hovered: false,
      })
    })
  })

  const byLayer = LAYERS.map((_, li) => rNodes.filter(n => n.layerIdx === li))
  for (let li = 0; li < LAYERS.length - 1; li++) {
    byLayer[li].forEach(fn => byLayer[li + 1].forEach(tn => edges.push([fn, tn])))
  }

  edges.forEach(([fn, tn]) => {
    if (Math.random() < 0.5) {
      packets.push({ from: fn, to: tn, t: Math.random(), speed: 0.003 + Math.random() * 0.005 })
    }
  })
}

// ── Main draw ──────────────────────────────────────────────────────────────

function draw(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#060c1a')
  bg.addColorStop(1, '#0b1422')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Physics
  if (!isDragging) {
    rotY += velY + AUTO_ROT
    rotX += velX
    rotX = Math.max(-0.65, Math.min(0.65, rotX))
    velY *= 0.92
    velX *= 0.92
  }

  // Project all nodes
  rNodes.forEach(n => {
    const p = project3D(n.wx, n.wy, n.wz, rotY, rotX)
    n.sx = W / 2 + p.sx * zoom
    n.sy = H / 2 + p.sy * zoom
    n.sz = p.depth
    n.sr = n.baseR * p.scale * zoom
  })

  // ── Edges (sorted back-to-front) ────────────────────────────────────────

  const sortedEdges = [...edges].sort(
    ([fa, ta], [fb, tb]) => (fa.sz + ta.sz) / 2 - (fb.sz + tb.sz) / 2,
  )

  sortedEdges.forEach(([fn, tn]) => {
    const hi = fn.hovered || tn.hovered
    const avgScale = ((fn.sr / fn.baseR) + (tn.sr / tn.baseR)) / 2
    ctx.beginPath()
    ctx.moveTo(fn.sx, fn.sy)
    ctx.lineTo(tn.sx, tn.sy)
    ctx.strokeStyle = rgba(fn.color, hi ? 0.3 : avgScale * 0.1)
    ctx.lineWidth = hi ? 1.5 : 0.75
    ctx.stroke()

    if (hi) {
      const dx = tn.sx - fn.sx; const dy = tn.sy - fn.sy
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > tn.sr + 6) {
        const ux = dx / d; const uy = dy / d
        const tx = tn.sx - ux * (tn.sr + 4); const ty = tn.sy - uy * (tn.sr + 4)
        const ang = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(tx - 8 * Math.cos(ang - 0.45), ty - 8 * Math.sin(ang - 0.45))
        ctx.lineTo(tx - 8 * Math.cos(ang + 0.45), ty - 8 * Math.sin(ang + 0.45))
        ctx.closePath()
        ctx.fillStyle = rgba(fn.color, 0.55)
        ctx.fill()
      }
    }
  })

  // ── Packets (3D interpolation) ───────────────────────────────────────────

  packets.forEach(p => {
    const wx = p.from.wx + (p.to.wx - p.from.wx) * p.t
    const wy = p.from.wy + (p.to.wy - p.from.wy) * p.t
    const wz = p.from.wz + (p.to.wz - p.from.wz) * p.t
    const proj = project3D(wx, wy, wz, rotY, rotX)
    const pr = Math.max(1.2, 3.5 * proj.scale * zoom)

    ctx.save()
    ctx.shadowColor = p.from.color
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(W / 2 + proj.sx * zoom, H / 2 + proj.sy * zoom, pr, 0, Math.PI * 2)
    ctx.fillStyle = rgba(p.from.color, proj.scale)
    ctx.fill()
    ctx.restore()

    p.t += p.speed
    if (p.t >= 1) { p.t = 0; p.speed = 0.003 + Math.random() * 0.005 }
  })

  // ── Nodes (sorted back-to-front) ─────────────────────────────────────────

  const sortedNodes = [...rNodes].sort((a, b) => a.sz - b.sz)
  tick += 0.02

  sortedNodes.forEach(n => {
    const perspScale = n.sr / n.baseR
    const depthFade = Math.max(0.3, Math.min(1, perspScale))
    const pulse = (Math.sin(tick + n.wx * 0.004 + n.wy * 0.004) + 1) * 0.5
    const glowR = n.sr + (n.hovered ? 18 * perspScale : (5 + pulse * 5) * perspScale)

    // Glow halo
    const grd = ctx.createRadialGradient(n.sx, n.sy, n.sr * 0.3, n.sx, n.sy, glowR)
    grd.addColorStop(0, rgba(n.color, (n.hovered ? 0.28 : 0.1 + pulse * 0.06) * depthFade))
    grd.addColorStop(1, rgba(n.color, 0))
    ctx.beginPath()
    ctx.arc(n.sx, n.sy, glowR, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()

    // Fill
    ctx.beginPath()
    ctx.arc(n.sx, n.sy, n.sr, 0, Math.PI * 2)
    ctx.fillStyle = rgba(n.color, (n.hovered ? 0.22 : 0.08) * depthFade)
    ctx.fill()

    // Ring
    ctx.beginPath()
    ctx.arc(n.sx, n.sy, n.sr, 0, Math.PI * 2)
    ctx.strokeStyle = rgba(n.color, (n.hovered ? 1 : 0.4 + pulse * 0.22) * depthFade)
    ctx.lineWidth = Math.max(0.5, (n.hovered ? 2.5 : 1.2) * perspScale)
    ctx.stroke()

    // Label (skip when too small)
    if (n.sr > 9) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const labelA = depthFade * (n.hovered ? 1 : 0.85)

      if (n.sublabel) {
        const mainSz = Math.max(7, Math.round((n.baseR > 38 ? 15 : 11) * perspScale))
        const subSz  = Math.max(6, Math.round(9 * perspScale))
        ctx.font = `700 ${mainSz}px Inter, "PingFang SC", "Microsoft YaHei", sans-serif`
        ctx.fillStyle = n.hovered ? `rgba(255,255,255,${labelA})` : rgba(n.color, labelA)
        ctx.fillText(n.label, n.sx, n.sy - mainSz * 0.72)
        ctx.font = `400 ${subSz}px Inter, "PingFang SC", sans-serif`
        ctx.fillStyle = n.hovered ? `rgba(255,255,255,${labelA * 0.65})` : rgba(n.color, labelA * 0.5)
        ctx.fillText(n.sublabel, n.sx, n.sy + mainSz * 0.72)
      } else {
        const sz = Math.max(7, Math.round(10 * perspScale))
        ctx.font = `600 ${sz}px Inter, "PingFang SC", "Microsoft YaHei", sans-serif`
        ctx.fillStyle = n.hovered ? `rgba(255,255,255,${labelA})` : rgba(n.color, labelA)
        ctx.fillText(n.label, n.sx, n.sy)
      }
    }
  })

  // ── HUD ───────────────────────────────────────────────────────────────────

  ctx.textAlign = 'left'
  ctx.font = '700 22px Inter, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.fillText('赵宇博', 38, 50)
  ctx.font = '400 12px Inter, "PingFang SC", sans-serif'
  ctx.fillStyle = rgba('#d4622d', 0.68)
  ctx.fillText('后端开发 · AI 应用工程师', 38, 72)

  ctx.textAlign = 'center'
  ctx.font = '11px Inter, "PingFang SC", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillText('拖拽旋转 · 点击右侧橙色节点进入个人主页', W / 2, H - 28)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

onMounted(() => {
  const canvas = canvasEl.value!
  const ctx = canvas.getContext('2d')!

  buildLayout()

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const onDown = (e: MouseEvent) => {
    isDragging = true
    didDrag    = false
    dragX      = e.clientX
    dragY      = e.clientY
  }

  const onMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragX
      const dy = e.clientY - dragY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true
      velY  = dx * 0.007
      velX  = dy * 0.007
      rotY += dx * 0.007
      rotX += dy * 0.007
      rotX  = Math.max(-0.65, Math.min(0.65, rotX))
      dragX = e.clientX
      dragY = e.clientY
    }

    if (!isDragging) {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let anyClick = false
      rNodes.forEach(n => {
        n.hovered = (mx - n.sx) ** 2 + (my - n.sy) ** 2 <= (n.sr + 8) ** 2
        if (n.hovered && n.clickable) anyClick = true
      })
      canvas.style.cursor = anyClick ? 'pointer' : 'grab'
    } else {
      canvas.style.cursor = 'grabbing'
      rNodes.forEach(n => { n.hovered = false })
    }
  }

  const onUp = (e: MouseEvent) => {
    if (!didDrag) {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const hit = rNodes.find(
        n => n.clickable && (mx - n.sx) ** 2 + (my - n.sy) ** 2 <= (n.sr + 8) ** 2,
      )
      if (hit?.route) router.push(hit.route)
    }
    isDragging = false
    canvas.style.cursor = 'grab'
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    zoom = Math.max(0.25, Math.min(4, zoom * delta))
  }

  canvas.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })

  const loop = () => {
    draw(ctx, canvas.width, canvas.height)
    raf = requestAnimationFrame(loop)
  }
  loop()

  cleanups = [
    () => cancelAnimationFrame(raf),
    () => window.removeEventListener('resize', resize),
    () => canvas.removeEventListener('mousedown', onDown),
    () => window.removeEventListener('mousemove', onMove),
    () => window.removeEventListener('mouseup', onUp),
    () => canvas.removeEventListener('wheel', onWheel),
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
  background: #060c1a;
}
.cv {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}
</style>
