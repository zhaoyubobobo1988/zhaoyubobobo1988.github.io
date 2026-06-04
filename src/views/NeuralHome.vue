<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasEl = ref<HTMLCanvasElement | null>(null)

interface NodeDef {
  label: string; sublabel?: string
  clickable?: boolean; route?: string
  x: number; y: number; z: number
  r: number; color: string
}

interface RNode extends NodeDef {
  clickable: boolean
  sx: number; sy: number; sz: number; sr: number
  hovered: boolean
}

interface Packet { fromIdx: number; toIdx: number; t: number; speed: number }

// ── Whale skeleton nodes ───────────────────────────────────────────────────
const NODE_DEFS: NodeDef[] = [
  // SKULL
  { label:'Python',      x:-462, y:  0, z:  0, r:22, color:'#4f9cf9' }, // 0 rostrum
  { label:'FastAPI',     x:-430, y:-58, z: 14, r:21, color:'#4f9cf9' }, // 1 upper jaw
  { label:'Docker',      x:-430, y: 52, z:-14, r:21, color:'#2dd4bf' }, // 2 lower jaw
  { label:'Redis',       x:-385, y:-90, z:  0, r:19, color:'#4f9cf9' }, // 3 skull crown
  { label:'PostgreSQL',  x:-352, y:-108,z: 10, r:18, color:'#4f9cf9' }, // 4 orbit
  // CERVICAL
  { label:'Backend',     x:-268, y:  0, z:  0, r:25, color:'#4f9cf9' }, // 5
  // THORACIC
  { label:'DevOps',      x:-180, y:  0, z:  0, r:25, color:'#2dd4bf' }, // 6
  // UPPER RIBS
  { label:'Linux',       x:-182, y:-128,z: 28, r:20, color:'#2dd4bf' }, // 7
  { label:'Nginx',       x:-140, y:-150,z: 18, r:18, color:'#2dd4bf' }, // 8
  { label:'MCP',         x:-98,  y:-133,z:  8, r:21, color:'#a78bfa' }, // 9
  // LOWER RIBS
  { label:'RabbitMQ',    x:-182, y: 128,z:-28, r:20, color:'#2dd4bf' }, // 10
  { label:'MySQL',       x:-140, y: 150,z:-18, r:18, color:'#4f9cf9' }, // 11
  { label:'MinIO',       x:-98,  y: 132,z: -8, r:18, color:'#2dd4bf' }, // 12
  // PECTORAL FIN
  { label:'LSTM',        x:-152, y: 178,z: 56, r:22, color:'#a78bfa' }, // 13
  { label:'Torchhydro',  x:-118, y: 228,z: 66, r:20, color:'#a78bfa' }, // 14
  { label:'时序预测',    x: -85, y: 252,z: 50, r:18, color:'#a78bfa' }, // 15
  // LUMBAR 1
  { label:'RAG',         x: -90, y:  0, z:  0, r:22, color:'#a78bfa' }, // 16
  // CENTER
  { label:'赵宇博', sublabel:'个人主页 →',
    x:  0, y:  0, z:  0, r:52, color:'#d4622d',
    clickable:true, route:'/portfolio' },                                  // 17
  // LUMBAR 2
  { label:'Prompt Eng',  x:  90, y:  0, z:  0, r:21, color:'#a78bfa' }, // 18
  // CAUDAL
  { label:'大连理工',    x: 188, y:  0, z:  0, r:27, color:'#34d399' }, // 19
  { label:'西安工业',    x: 272, y:  0, z:  0, r:24, color:'#34d399' }, // 20
  // TAIL
  { label:'Context Eng', x: 348, y:  0, z:  0, r:20, color:'#a78bfa' }, // 21
  { label:'LLM应用',     x: 412, y:  0, z:  0, r:19, color:'#a78bfa' }, // 22
  // FLUKES
  { label:'水文预报',    x: 452, y:-118,z:  0, r:21, color:'#34d399' }, // 23
  { label:'数据增强',    x: 452, y: 118,z:  0, r:21, color:'#34d399' }, // 24
  { label:'洪水预报',    x: 488, y:-162,z:  0, r:18, color:'#a78bfa' }, // 25
  { label:'DockerComp',  x: 488, y: 162,z:  0, r:17, color:'#2dd4bf' }, // 26
]

const EDGES: [number, number][] = [
  // Skull
  [0,1],[0,2],[1,3],[3,4],[1,4],
  // Skull → spine
  [1,5],[2,5],
  // Spine chain
  [5,6],[6,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],
  // Upper ribs
  [6,7],[7,8],[8,9],[9,16],
  // Lower ribs
  [6,10],[10,11],[11,12],[12,16],
  // Pectoral fin
  [10,13],[13,14],[14,15],[13,15],
  // Flukes
  [22,23],[22,24],[23,25],[24,26],[25,26],[23,24],
]

// ── State ──────────────────────────────────────────────────────────────────
let rNodes: RNode[] = []
let packets: Packet[] = []
let rotY = 0.15, rotX = -0.08
let velY = 0, velX = 0
const AUTO_ROT = 0.0003
let zoom = 1.0
let isDragging = false, didDrag = false, dragX = 0, dragY = 0
let tick = 0, raf = 0
let cleanups: Array<() => void> = []

// ── Helpers ────────────────────────────────────────────────────────────────
function rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${Math.min(1,Math.max(0,a))})`
}

function project3D(wx: number, wy: number, wz: number, ry: number, rx: number) {
  const cy=Math.cos(ry), sy=Math.sin(ry)
  const x1=wx*cy-wz*sy, z1=wx*sy+wz*cy
  const cx=Math.cos(rx), sx=Math.sin(rx)
  const y1=wy*cx-z1*sx, z2=wy*sx+z1*cx
  const d=1100, s=d/(d+z2)
  return { sx:x1*s, sy:y1*s, depth:z2, scale:s }
}

function buildNodes() {
  rNodes = NODE_DEFS.map(d => ({
    ...d, clickable: d.clickable ?? false,
    sx:0, sy:0, sz:0, sr:d.r, hovered:false,
  }))
  packets = []
  EDGES.forEach(([fi,ti]) => {
    if (Math.random() < 0.55)
      packets.push({ fromIdx:fi, toIdx:ti, t:Math.random(), speed:0.003+Math.random()*0.005 })
  })
}

// ── Draw ───────────────────────────────────────────────────────────────────
function draw(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0,0,W,H)
  const bg = ctx.createLinearGradient(0,0,W,H)
  bg.addColorStop(0,'#060c1a'); bg.addColorStop(1,'#0b1422')
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

  ctx.strokeStyle='rgba(255,255,255,0.02)'; ctx.lineWidth=1
  for(let x=0;x<W;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

  if(!isDragging){
    rotY+=velY+AUTO_ROT; rotX+=velX
    rotX=Math.max(-0.7,Math.min(0.7,rotX))
    velY*=0.92; velX*=0.92
  }

  rNodes.forEach(n=>{
    const p=project3D(n.x,n.y,n.z,rotY,rotX)
    n.sx=W/2+p.sx*zoom; n.sy=H/2+p.sy*zoom
    n.sz=p.depth; n.sr=n.r*p.scale*zoom
  })

  // Edges
  const sortedEdges=[...EDGES].sort(([fa,ta],[fb,tb])=>
    (rNodes[fa].sz+rNodes[ta].sz)/2-(rNodes[fb].sz+rNodes[tb].sz)/2)

  sortedEdges.forEach(([fi,ti])=>{
    const fn=rNodes[fi], tn=rNodes[ti]
    const hi=fn.hovered||tn.hovered
    const avgS=((fn.sr/fn.r)+(tn.sr/tn.r))/2
    ctx.beginPath(); ctx.moveTo(fn.sx,fn.sy); ctx.lineTo(tn.sx,tn.sy)
    ctx.strokeStyle=rgba(fn.color, hi?0.55:avgS*0.2)
    ctx.lineWidth=Math.max(0.5,(hi?2:1.2)*avgS); ctx.stroke()
    if(hi){
      const dx=tn.sx-fn.sx,dy=tn.sy-fn.sy,d=Math.sqrt(dx*dx+dy*dy)
      if(d>tn.sr+6){
        const ux=dx/d,uy=dy/d,tx=tn.sx-ux*(tn.sr+4),ty=tn.sy-uy*(tn.sr+4),ang=Math.atan2(dy,dx)
        ctx.beginPath(); ctx.moveTo(tx,ty)
        ctx.lineTo(tx-8*Math.cos(ang-0.45),ty-8*Math.sin(ang-0.45))
        ctx.lineTo(tx-8*Math.cos(ang+0.45),ty-8*Math.sin(ang+0.45))
        ctx.closePath(); ctx.fillStyle=rgba(fn.color,0.55); ctx.fill()
      }
    }
  })

  // Packets
  packets.forEach(p=>{
    const fn=rNodes[p.fromIdx],tn=rNodes[p.toIdx]
    const wx=fn.x+(tn.x-fn.x)*p.t,wy=fn.y+(tn.y-fn.y)*p.t,wz=fn.z+(tn.z-fn.z)*p.t
    const pr=project3D(wx,wy,wz,rotY,rotX)
    const sz=Math.max(1.2,3.2*pr.scale*zoom)
    ctx.save(); ctx.shadowColor=fn.color; ctx.shadowBlur=10
    ctx.beginPath(); ctx.arc(W/2+pr.sx*zoom,H/2+pr.sy*zoom,sz,0,Math.PI*2)
    ctx.fillStyle=rgba(fn.color,pr.scale); ctx.fill(); ctx.restore()
    p.t+=p.speed; if(p.t>=1){p.t=0;p.speed=0.003+Math.random()*0.005}
  })

  // Nodes (back→front)
  tick+=0.02
  ;[...rNodes].sort((a,b)=>a.sz-b.sz).forEach(n=>{
    const ps=n.sr/n.r
    const df=Math.max(0.3,Math.min(1.1,ps))
    const pulse=(Math.sin(tick+n.x*0.005+n.y*0.005)+1)*0.5
    const glowR=n.sr+(n.hovered?18*ps:(4+pulse*4)*ps)

    const grd=ctx.createRadialGradient(n.sx,n.sy,n.sr*0.3,n.sx,n.sy,glowR)
    grd.addColorStop(0,rgba(n.color,(n.hovered?0.3:0.1+pulse*0.06)*df))
    grd.addColorStop(1,rgba(n.color,0))
    ctx.beginPath(); ctx.arc(n.sx,n.sy,glowR,0,Math.PI*2)
    ctx.fillStyle=grd; ctx.fill()

    ctx.beginPath(); ctx.arc(n.sx,n.sy,n.sr,0,Math.PI*2)
    ctx.fillStyle=rgba(n.color,(n.hovered?0.25:0.08)*df); ctx.fill()

    ctx.beginPath(); ctx.arc(n.sx,n.sy,n.sr,0,Math.PI*2)
    ctx.strokeStyle=rgba(n.color,(n.hovered?1:0.4+pulse*0.22)*df)
    ctx.lineWidth=Math.max(0.5,(n.hovered?2.5:1.2)*ps); ctx.stroke()

    // Extra pulsing ring for clickable center node
    if(n.clickable && n.sr>20){
      const ringR=n.sr+6+Math.sin(tick*2.5)*5
      ctx.beginPath(); ctx.arc(n.sx,n.sy,ringR,0,Math.PI*2)
      ctx.strokeStyle=rgba(n.color,0.3+Math.sin(tick*2.5)*0.12)
      ctx.lineWidth=1.5; ctx.stroke()
    }

    if(n.sr>9){
      ctx.textAlign='center'; ctx.textBaseline='middle'
      const la=df*(n.hovered?1:0.85)
      if(n.sublabel){
        const msz=Math.max(8,Math.round((n.r>38?16:11)*ps))
        const ssz=Math.max(7,Math.round(10*ps))
        ctx.font=`700 ${msz}px Inter,"PingFang SC","Microsoft YaHei",sans-serif`
        ctx.fillStyle=n.hovered?`rgba(255,255,255,${la})`:rgba(n.color,la)
        ctx.fillText(n.label,n.sx,n.sy-msz*0.72)
        ctx.font=`400 ${ssz}px Inter,"PingFang SC",sans-serif`
        ctx.fillStyle=n.hovered?`rgba(255,255,255,${la*0.65})`:rgba(n.color,la*0.5)
        ctx.fillText(n.sublabel,n.sx,n.sy+msz*0.72)
      } else {
        const sz=Math.max(7,Math.round(10*ps))
        ctx.font=`600 ${sz}px Inter,"PingFang SC","Microsoft YaHei",sans-serif`
        ctx.fillStyle=n.hovered?`rgba(255,255,255,${la})`:rgba(n.color,la)
        ctx.fillText(n.label,n.sx,n.sy)
      }
    }
  })

  // HUD
  ctx.textAlign='left'
  ctx.font='700 22px Inter,"PingFang SC","Microsoft YaHei",sans-serif'
  ctx.fillStyle='rgba(255,255,255,0.78)'; ctx.fillText('赵宇博',38,50)
  ctx.font='400 12px Inter,"PingFang SC",sans-serif'
  ctx.fillStyle=rgba('#d4622d',0.68); ctx.fillText('后端开发 · AI 应用工程师',38,72)
  ctx.textAlign='center'
  ctx.font='11px Inter,"PingFang SC",sans-serif'
  ctx.fillStyle='rgba(255,255,255,0.18)'
  ctx.fillText('拖拽旋转 · 滚轮缩放 · 点击中央橙色节点进入个人主页',W/2,H-28)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(()=>{
  const canvas=canvasEl.value!, ctx=canvas.getContext('2d')!
  buildNodes()
  const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight}
  resize(); window.addEventListener('resize',resize)

  const onDown=(e:MouseEvent)=>{isDragging=true;didDrag=false;dragX=e.clientX;dragY=e.clientY}
  const onMove=(e:MouseEvent)=>{
    if(isDragging){
      const dx=e.clientX-dragX,dy=e.clientY-dragY
      if(Math.abs(dx)>3||Math.abs(dy)>3) didDrag=true
      velY=dx*0.007;velX=dy*0.007
      rotY+=dx*0.007;rotX+=dy*0.007
      rotX=Math.max(-0.7,Math.min(0.7,rotX))
      dragX=e.clientX;dragY=e.clientY
    }
    if(!isDragging){
      const rect=canvas.getBoundingClientRect()
      const mx=e.clientX-rect.left,my=e.clientY-rect.top
      let anyClick=false
      rNodes.forEach(n=>{
        n.hovered=(mx-n.sx)**2+(my-n.sy)**2<=(n.sr+8)**2
        if(n.hovered&&n.clickable) anyClick=true
      })
      canvas.style.cursor=anyClick?'pointer':'grab'
    } else {
      canvas.style.cursor='grabbing'
      rNodes.forEach(n=>{n.hovered=false})
    }
  }
  const onUp=(e:MouseEvent)=>{
    if(!didDrag){
      const rect=canvas.getBoundingClientRect()
      const mx=e.clientX-rect.left,my=e.clientY-rect.top
      const hit=rNodes.find(n=>n.clickable&&(mx-n.sx)**2+(my-n.sy)**2<=(n.sr+8)**2)
      if(hit?.route) router.push(hit.route)
    }
    isDragging=false; canvas.style.cursor='grab'
  }
  const onWheel=(e:WheelEvent)=>{
    e.preventDefault()
    zoom=Math.max(0.25,Math.min(4,zoom*(e.deltaY>0?0.9:1.1)))
  }

  canvas.addEventListener('mousedown',onDown)
  window.addEventListener('mousemove',onMove)
  window.addEventListener('mouseup',onUp)
  canvas.addEventListener('wheel',onWheel,{passive:false})

  const loop=()=>{draw(ctx,canvas.width,canvas.height);raf=requestAnimationFrame(loop)}
  loop()

  cleanups=[
    ()=>cancelAnimationFrame(raf),
    ()=>window.removeEventListener('resize',resize),
    ()=>canvas.removeEventListener('mousedown',onDown),
    ()=>window.removeEventListener('mousemove',onMove),
    ()=>window.removeEventListener('mouseup',onUp),
    ()=>canvas.removeEventListener('wheel',onWheel),
  ]
})

onBeforeUnmount(()=>{cleanups.forEach(fn=>fn());cleanups=[]})
</script>

<template>
  <div class="neural-home">
    <canvas ref="canvasEl" class="cv" />
  </div>
</template>

<style scoped>
.neural-home { position:fixed;inset:0;background:#060c1a; }
.cv { display:block;width:100%;height:100%;cursor:grab; }
</style>
