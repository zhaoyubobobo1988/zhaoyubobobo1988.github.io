<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeSection = ref('about')

const sections = [
  { id: 'about',     num: '01', label: '关于我' },
  { id: 'skills',    num: '02', label: '技能栈' },
  { id: 'projects',  num: '03', label: '项目经历' },
  { id: 'education', num: '04', label: '教育背景' },
]

const skills = [
  {
    category: 'Backend',
    color: '#d4622d',
    items: ['Python', 'FastAPI', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MySQL', 'MinIO'],
  },
  {
    category: 'DevOps',
    color: '#2563eb',
    items: ['Docker', 'Docker Compose', 'Linux', 'Nginx'],
  },
  {
    category: 'AI / LLM',
    color: '#7c3aed',
    items: ['MCP', 'RAG', 'Prompt Engineering', 'Context Engineering', 'LLM 应用'],
  },
  {
    category: 'Hydrology & ML',
    color: '#059669',
    items: ['Torchhydro', 'LSTM', '时序预测', '洪水预报模型'],
  },
]

const projects = [
  {
    name: '实时水文预报服务与智能查询平台',
    period: '2026.01 – 2026.06',
    filename: 'realtime_forecast.py',
    desc: '面向资料稀缺流域的实时洪水预报平台，集数据同步、模型推理、结果存储与智能查询于一体。通过 MCP 工具接入飞书机器人调用链路，支持自然语言触发预报与历史结果查询，已接入 18 个流域三小时级预报调度。',
    metrics: [
      { value: '18', label: '流域覆盖' },
      { value: '3h', label: '预报粒度' },
    ],
    tags: ['FastAPI', 'MCP', 'Docker', 'PostgreSQL', 'MinIO', 'Torchhydro'],
  },
  {
    name: '数据增强系统',
    period: '2025.08 – 2026.04',
    filename: 'data_augment.py',
    desc: '面向水文时序模型训练的数据增强平台，支持用户编辑洪水场次时序数据并提交增强任务。基于 RabbitMQ 实现异步任务调度（解耦 FastAPI 与模型计算进程），Redis 管理任务全生命周期状态，PostgreSQL 幂等写入策略防止数据污染。',
    metrics: [
      { value: '5', label: '任务状态层' },
      { value: '<1s', label: '状态响应' },
    ],
    tags: ['FastAPI', 'RabbitMQ', 'Redis', 'PostgreSQL', 'Docker', 'Vue'],
  },
]

const education = [
  {
    school: '大连理工大学',
    degree: '计算机技术 · 硕士在读',
    period: '2024.09 — 2027.07（预计）',
    color: '#d4622d',
  },
  {
    school: '西安工业大学',
    degree: '软件工程 · 学士',
    period: '2019.09 — 2023.07',
    color: '#2563eb',
  },
]

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => { if (e.isIntersecting) activeSection.value = e.target.id })
    },
    { rootMargin: '-35% 0px -60% 0px', threshold: 0 },
  )
  sections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) observer!.observe(el)
  })
})

onBeforeUnmount(() => { observer?.disconnect() })

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="portfolio">

    <div class="layout">

      <!-- ══ SIDEBAR ══ -->
      <aside class="sidebar">
        <div class="sb-top">
          <div class="avatar">赵</div>
          <h1 class="name">赵宇博</h1>
          <p class="role">后端开发 · AI 应用工程师</p>
          <p class="school">@ 大连理工大学</p>
        </div>

        <nav class="side-nav">
          <button
            v-for="s in sections"
            :key="s.id"
            class="nav-item"
            :class="{ active: activeSection === s.id }"
            @click="scrollTo(s.id)"
          >
            <span class="nav-num">{{ s.num }}.</span>
            <span class="nav-label">{{ s.label }}</span>
            <span class="nav-bar" />
          </button>
        </nav>

        <div class="sb-bottom">
          <a class="cl" href="mailto:2360828996@qq.com">
            <span>✉</span> 2360828996@qq.com
          </a>
          <a class="cl" href="/赵宇博.pdf" download="赵宇博_简历.pdf">
            <span>↓</span> 下载简历 PDF
          </a>
          <a class="cl home-link" href="#" @click.prevent="router.push('/')">
            <span>⬡</span> 神经网络主页
          </a>
        </div>
      </aside>

      <!-- ══ MAIN CONTENT ══ -->
      <main class="content">

        <!-- 01 关于我 -->
        <section id="about" class="sec">
          <div class="sec-hd">
            <span class="sec-num">01.</span>
            <h2 class="sec-title">关于我</h2>
            <div class="sec-rule" />
          </div>
          <p class="bio">
            本科毕业于西安工业大学软件工程专业，目前在大连理工大学攻读计算机技术硕士学位。
            专注 Python 后端服务开发与 AI 应用落地，在水文智能预报领域积累了完整的工程实践经验，
            具备从接口设计、异步任务编排到容器化部署的全链路开发能力。
          </p>
          <p class="bio">
            熟悉 LLM 应用开发基础，了解 RAG、MCP、Prompt Engineering、Context Engineering 等技术；
            日常使用 Cursor、Claude Code 等 AI 编程工具辅助开发，持续探索 AI 与工程实践的结合边界。
          </p>
          <div class="stats">
            <div class="stat">
              <span class="stat-val">18</span>
              <span class="stat-lbl">流域覆盖</span>
            </div>
            <div class="stat">
              <span class="stat-val">2</span>
              <span class="stat-lbl">在研项目</span>
            </div>
            <div class="stat">
              <span class="stat-val">3h</span>
              <span class="stat-lbl">预报粒度</span>
            </div>
          </div>
        </section>

        <!-- 02 技能栈 -->
        <section id="skills" class="sec">
          <div class="sec-hd">
            <span class="sec-num">02.</span>
            <h2 class="sec-title">技能栈</h2>
            <div class="sec-rule" />
          </div>
          <div class="skill-groups">
            <div v-for="g in skills" :key="g.category" class="sg">
              <div class="sg-cat" :style="{ color: g.color }">{{ g.category }}</div>
              <div class="sg-tags">
                <span
                  v-for="item in g.items"
                  :key="item"
                  class="stag"
                  :style="{ '--c': g.color }"
                >{{ item }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 03 项目经历 -->
        <section id="projects" class="sec">
          <div class="sec-hd">
            <span class="sec-num">03.</span>
            <h2 class="sec-title">项目经历</h2>
            <div class="sec-rule" />
          </div>
          <div class="projects">
            <div v-for="proj in projects" :key="proj.name" class="tcard">
              <div class="tcard-hd">
                <div class="dots">
                  <i class="dot dr" /><i class="dot dy" /><i class="dot dg" />
                </div>
                <span class="tfn">{{ proj.filename }}</span>
                <span class="tperiod">{{ proj.period }}</span>
              </div>
              <div class="tcard-bd">
                <div class="ptitle">{{ proj.name }}</div>
                <p class="pdesc">{{ proj.desc }}</p>
                <div class="pmetrics">
                  <div v-for="m in proj.metrics" :key="m.label" class="pm">
                    <span class="pmv">{{ m.value }}</span>
                    <span class="pml">{{ m.label }}</span>
                  </div>
                </div>
                <div class="ptags">
                  <span v-for="t in proj.tags" :key="t" class="ptag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 04 教育背景 -->
        <section id="education" class="sec">
          <div class="sec-hd">
            <span class="sec-num">04.</span>
            <h2 class="sec-title">教育背景</h2>
            <div class="sec-rule" />
          </div>
          <div class="edu-list">
            <div v-for="e in education" :key="e.school" class="edu" :style="{ '--ec': e.color }">
              <div class="edu-dot" />
              <div class="edu-body">
                <div class="edu-school">{{ e.school }}</div>
                <div class="edu-degree">{{ e.degree }}</div>
                <div class="edu-period">{{ e.period }}</div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ── */
.portfolio {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f7f6f2;
}

.layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* ── Sidebar ── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 52px 32px 36px;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  background: #efece4;
}

.sb-top { margin-bottom: 44px; }

.avatar {
  width: 68px;
  height: 68px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d4622d 0%, #b84a1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 18px;
}

.name {
  font-size: 20px;
  font-weight: 700;
  color: #1c1a18;
  letter-spacing: 3px;
  margin-bottom: 6px;
}

.role {
  font-size: 12px;
  color: #d4622d;
  letter-spacing: 1px;
  margin-bottom: 3px;
}

.school {
  font-size: 11px;
  color: #8a8070;
  letter-spacing: 0.5px;
}

/* ── Nav ── */
.side-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #8a8070;
  font-size: 12px;
  letter-spacing: 1.5px;
  text-align: left;
  transition: color 0.2s;
}

.nav-item:hover { color: #1c1a18; }
.nav-item.active { color: #d4622d; }

.nav-num {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 10px;
  min-width: 22px;
  opacity: 0.55;
}
.nav-item.active .nav-num { opacity: 1; }

.nav-label { flex: 1; }

.nav-bar {
  height: 1px;
  width: 0;
  background: currentColor;
  opacity: 0;
  transition: width 0.35s ease, opacity 0.2s;
}
.nav-item.active .nav-bar { width: 36px; opacity: 0.5; }
.nav-item:hover .nav-bar  { width: 20px; opacity: 0.25; }

/* ── Sidebar bottom ── */
.sb-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 20px;
}

.cl {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #8a8070;
  text-decoration: none;
  transition: color 0.2s;
  letter-spacing: 0.3px;
}
.cl:hover { color: #d4622d; }

/* ── Content ── */
.content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 80px 72px 120px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
}

/* ── Section ── */
.sec {
  margin-bottom: 96px;
  scroll-margin-top: 80px;
}

.sec-hd {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 36px;
}

.sec-num {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  color: #d4622d;
  font-size: 13px;
}

.sec-title {
  font-size: 18px;
  font-weight: 600;
  color: #1c1a18;
  letter-spacing: 3px;
  white-space: nowrap;
}

.sec-rule {
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  max-width: 200px;
}

/* ── Bio ── */
.bio {
  font-size: 14px;
  line-height: 1.95;
  color: #5c5649;
  max-width: 560px;
  margin-bottom: 16px;
}

/* ── Stats ── */
.stats {
  display: flex;
  gap: 44px;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.stat { display: flex; flex-direction: column; gap: 5px; }

.stat-val {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 40px;
  font-weight: 700;
  color: #d4622d;
  line-height: 1;
}

.stat-lbl {
  font-size: 11px;
  color: #8a8070;
  letter-spacing: 1.5px;
}

/* ── Skills ── */
.skill-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sg-cat {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.sg-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stag {
  padding: 4px 12px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  border: 1px solid color-mix(in srgb, var(--c, #d4622d) 35%, transparent);
  color: var(--c, #d4622d);
  background: color-mix(in srgb, var(--c, #d4622d) 6%, transparent);
  transition: all 0.2s ease;
  cursor: default;
}

.stag:hover {
  background: color-mix(in srgb, var(--c, #d4622d) 14%, transparent);
  border-color: color-mix(in srgb, var(--c, #d4622d) 60%, transparent);
}

/* ── Terminal cards ── */
.projects {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.tcard {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.tcard:hover {
  border-color: rgba(212, 98, 45, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.tcard-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #f7f5f0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.dots { display: flex; gap: 5px; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.dr { background: #ef4444; }
.dy { background: #f59e0b; }
.dg { background: #22c55e; }

.tfn {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  color: #8a8070;
  flex: 1;
}

.tperiod {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 11px;
  color: rgba(212, 98, 45, 0.55);
}

.tcard-bd { padding: 22px 24px; }

.ptitle {
  font-size: 15px;
  font-weight: 600;
  color: #1c1a18;
  margin-bottom: 10px;
}

.pdesc {
  font-size: 13px;
  color: #5c5649;
  line-height: 1.8;
  margin-bottom: 18px;
}

.pmetrics { display: flex; gap: 32px; margin-bottom: 18px; }

.pm { display: flex; flex-direction: column; gap: 3px; }

.pmv {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 28px;
  font-weight: 700;
  color: #d4622d;
  line-height: 1;
}

.pml { font-size: 11px; color: #8a8070; letter-spacing: 0.5px; }

.ptags { display: flex; flex-wrap: wrap; gap: 6px; }

.ptag {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid rgba(212, 98, 45, 0.2);
  color: #d4622d;
  background: rgba(212, 98, 45, 0.05);
}

/* ── Education ── */
.edu-list {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.edu {
  position: relative;
  display: flex;
  gap: 20px;
  padding: 0 0 36px 28px;
  border-left: 1.5px solid var(--ec, #d4622d);
}
.edu:last-child { border-left-color: transparent; padding-bottom: 0; }

.edu-dot {
  position: absolute;
  left: -5px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ec, #d4622d);
  box-shadow: 0 0 8px color-mix(in srgb, var(--ec, #d4622d) 40%, transparent);
  flex-shrink: 0;
}

.edu-body {}

.edu-school {
  font-size: 16px;
  font-weight: 600;
  color: #1c1a18;
  margin-bottom: 5px;
}

.edu-degree {
  font-size: 13px;
  color: #5c5649;
  margin-bottom: 6px;
}

.edu-period {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 11px;
  color: var(--ec, #d4622d);
  opacity: 0.7;
}
</style>
