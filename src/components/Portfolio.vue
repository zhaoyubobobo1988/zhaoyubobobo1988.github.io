<script setup lang="ts">
import { ref } from 'vue'
import TechBackground from '@/components/TechBackground.vue'

const emit = defineEmits<{ (e: 'back'): void }>()

const tabs = ['基本与技能', '教育与实习', '研究项目', '发表论文']
const activeTab = ref(0)

const skills = [
  { title: '后端与框架', tags: ['Python', 'FastAPI', 'RabbitMQ', 'Redis', 'Vue'] },
  { title: '数据库与存储', tags: ['PostgreSQL', 'MySQL', 'MinIO'] },
  { title: '部署与运维', tags: ['Docker', 'Docker Compose', 'Linux'] },
  { title: 'AI / LLM', tags: ['RAG', 'MCP', 'Prompt Engineering', 'Context Engineering', 'LLM应用'] },
]

const education = [
  {
    period: '2019.09 – 2023.07',
    school: '西安工业大学',
    major: '软件工程',
    degree: '学士',
    note: '',
  },
  {
    period: '2024.09 – 2027.07',
    school: '大连理工大学',
    major: '计算机技术',
    degree: '硕士在读',
    note: '',
  },
]

const projects = [
  {
    name: '实时水文预报服务与智能查询平台',
    period: '2026.01 – 2026.06',
    desc: '面向资料稀缺流域的实时洪水预报平台，集数据同步、模型推理、结果存储与智能查询于一体。通过 MCP 工具接入飞书机器人调用链路，支持自然语言触发预报与历史结果查询，已接入 18 个流域三小时级预报调度。',
    tags: ['FastAPI', 'MCP', 'Docker', 'PostgreSQL', 'MinIO', 'Torchhydro'],
    link: '',
  },
  {
    name: '数据增强系统',
    period: '2025.08 – 2026.04',
    desc: '面向水文时序模型训练的数据增强平台，支持用户编辑洪水场次时序数据并提交增强任务。基于 RabbitMQ 实现异步任务调度，解耦 FastAPI 与模型计算进程；Redis 管理任务全生命周期状态；PostgreSQL 持久化增强结果，幂等写入策略防止数据污染。',
    tags: ['FastAPI', 'RabbitMQ', 'Redis', 'PostgreSQL', 'Docker', 'Vue'],
    link: '',
  },
]

interface Paper { year: string; title: string; desc: string; tags: string[]; link: string }
const papers: Paper[] = []
</script>

<template>
  <div class="portfolio">
    <TechBackground effect="connections" :density="35" :opacity="0.45" :full-screen="true" />

    <!-- 左侧 INTRO 导航按钮 -->
    <button class="nav-arrow prev" @click="emit('back')">
      <span class="arrow-vert">INTRO</span>
      <span class="arrow-icon">‹</span>
    </button>

    <!-- 主内容卡片 -->
    <div class="card-wrap">
      <div class="card">
        <!-- 头像 -->
        <div class="avatar">赵</div>

        <!-- 姓名 & 标语 -->
        <h1 class="name">赵宇博</h1>
        <p class="tagline">大连理工大学 · 计算机技术硕士在读 · 后端开发 & AI 应用</p>

        <!-- Tab 导航 -->
        <nav class="tabs">
          <button
            v-for="(tab, i) in tabs"
            :key="tab"
            class="tab-btn"
            :class="{ active: activeTab === i }"
            @click="activeTab = i"
          >
            <span class="tab-dot" />
            {{ tab }}
          </button>
        </nav>

        <!-- Tab 内容面板 -->
        <div class="panel">

          <!-- ── 基本与技能 ── -->
          <div v-if="activeTab === 0" class="panel-inner">
            <p class="bio">
              本科毕业于西安工业大学软件工程专业，目前在大连理工大学攻读计算机技术硕士学位。专注 Python 后端服务开发与 AI 应用落地，在水文智能预报领域积累了完整的工程实践经验，具备从接口设计、异步任务编排到容器化部署的全链路开发能力。
            </p>
            <p class="bio">
              熟悉 LLM 应用开发基础，了解 RAG、MCP、Prompt Engineering、Context Engineering 等技术；具备 FastAPI 接口设计、RabbitMQ 异步调度、Redis 状态管理和 PostgreSQL 数据建模经验，日常使用 Cursor、Claude Code 等 AI 编程工具辅助开发。
            </p>
            <div class="skill-grid">
              <div v-for="group in skills" :key="group.title" class="skill-group">
                <div class="sg-title">{{ group.title }}</div>
                <div class="sg-tags">
                  <span v-for="tag in group.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── 教育与实习 ── -->
          <div v-if="activeTab === 1" class="panel-inner">
            <div class="timeline">
              <div v-for="item in education" :key="item.period" class="tl-item">
                <div class="tl-period">{{ item.period }}</div>
                <div class="tl-dot" />
                <div class="tl-content">
                  <div class="tl-school">{{ item.school }}</div>
                  <div class="tl-meta">{{ item.major }} · <span class="badge">{{ item.degree }}</span></div>
                  <div v-if="item.note" class="tl-note">{{ item.note }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── 研究项目 ── -->
          <div v-if="activeTab === 2" class="panel-inner">
            <div class="projects">
              <div v-for="proj in projects" :key="proj.name" class="proj-card">
                <div class="proj-icon">◈</div>
                <div class="proj-body">
                  <div class="proj-header">
                    <div class="proj-name">{{ proj.name }}</div>
                    <div class="proj-period">{{ proj.period }}</div>
                  </div>
                  <div class="proj-desc">{{ proj.desc }}</div>
                  <div class="proj-tags">
                    <span v-for="t in proj.tags" :key="t" class="tag">{{ t }}</span>
                    <a v-if="proj.link" :href="proj.link" target="_blank" class="tag link-tag">项目链接 ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── 发表论文 ── -->
          <div v-if="activeTab === 3" class="panel-inner">
            <div class="paper-section-title">期刊论文</div>
            <div v-if="papers.length === 0" class="empty-state">
              <div class="empty-icon">◻</div>
              <div class="empty-text">暂无已发表论文，持续产出中…</div>
            </div>
            <div v-else class="papers">
              <div v-for="paper in papers" :key="paper.title" class="paper-item">
                <div class="paper-year">{{ paper.year }}</div>
                <div class="paper-body">
                  <div class="paper-icon">◻</div>
                  <div>
                    <div class="paper-title">{{ paper.title }}</div>
                    <div class="paper-desc">{{ paper.desc }}</div>
                    <div class="paper-tags">
                      <span v-for="t in paper.tags" :key="t" class="tag">{{ t }}</span>
                      <a v-if="paper.link" :href="paper.link" target="_blank" class="tag link-tag">论文链接 ↗</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <button class="btn-primary">下载简历 PDF</button>
      <button class="btn-ghost">了解我更多 →</button>
    </div>
  </div>
</template>

<style scoped>
.portfolio {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── 导航箭头 ── */
.nav-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 30;
  width: 52px;
  height: 120px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-default);
  color: rgba(255,255,255,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}
.nav-arrow:hover { color: #fff; border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.07); }
.nav-arrow.prev { left: 20px; }
.arrow-vert { font-size: 11px; letter-spacing: 3px; writing-mode: vertical-rl; opacity: 0.6; }
.arrow-icon { font-size: 28px; line-height: 1; }

/* ── 主卡片 ── */
.card-wrap {
  position: relative;
  z-index: 10;
  width: min(780px, calc(100vw - 160px));
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,212,180,0.2) transparent;
}

.card {
  background: rgba(5, 20, 45, 0.75);
  border: 1px solid var(--border-default);
  border-radius: 24px;
  padding: 40px 48px 32px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── 头像 ── */
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4b4 0%, #0891b2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  color: #0a1628;
  margin-bottom: 20px;
  box-shadow: 0 0 40px rgba(0,212,180,0.3);
}

/* ── 姓名 & 标语 ── */
.name {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin-bottom: 10px;
}
.tagline {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 4px;
  margin-bottom: 28px;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.tab-btn {
  padding: 9px 22px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 7px;
}
.tab-btn:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.25); }
.tab-btn.active {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(0,212,180,0.08);
}
.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

/* ── Panel ── */
.panel {
  width: 100%;
  min-height: 220px;
}
.panel-inner {
  animation: fadeUp 0.3s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Bio ── */
.bio {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

/* ── Skill grid ── */
.skill-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}
.skill-group {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 14px 16px;
}
.sg-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.sg-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* ── Tags ── */
.tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid rgba(0,212,180,0.25);
  color: rgba(0,212,180,0.8);
  background: rgba(0,212,180,0.05);
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}
.link-tag { color: var(--accent-info); border-color: rgba(56,189,248,0.3); cursor: pointer; }
.link-tag:hover { background: rgba(56,189,248,0.1); }

/* ── Timeline ── */
.timeline { display: flex; flex-direction: column; gap: 24px; padding: 4px 0; }
.tl-item { display: grid; grid-template-columns: 100px 20px 1fr; gap: 0 16px; align-items: start; }
.tl-period { font-size: 12px; color: var(--text-secondary); text-align: right; padding-top: 3px; }
.tl-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-primary);
  margin-top: 5px;
  justify-self: center;
}
.tl-school { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.tl-meta { font-size: 13px; color: var(--text-secondary); }
.tl-note { font-size: 12px; color: var(--text-secondary); margin-top: 4px; opacity: 0.7; }
.badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid rgba(0,212,180,0.3);
  color: var(--accent-primary);
}

/* ── Projects ── */
.projects { display: flex; flex-direction: column; gap: 16px; }
.proj-card {
  display: flex;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.25s;
}
.proj-card:hover { border-color: rgba(0,212,180,0.3); }
.proj-icon { font-size: 20px; color: var(--accent-primary); flex-shrink: 0; padding-top: 2px; }
.proj-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; gap: 12px; }
.proj-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.proj-period { font-size: 12px; color: var(--text-secondary); white-space: nowrap; opacity: 0.7; }
.proj-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 10px; }
.proj-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* ── Papers ── */
.paper-section-title {
  font-size: 14px;
  color: var(--accent-primary);
  border-bottom: 1px solid rgba(0,212,180,0.2);
  padding-bottom: 8px;
  margin-bottom: 16px;
  letter-spacing: 2px;
}
.papers { display: flex; flex-direction: column; gap: 20px; }
.paper-item { display: grid; grid-template-columns: 72px 1fr; gap: 16px; align-items: start; }
.paper-year { font-size: 12px; color: var(--text-secondary); padding-top: 3px; }
.paper-body { display: flex; gap: 12px; }
.paper-icon { font-size: 16px; color: var(--text-secondary); flex-shrink: 0; padding-top: 1px; }
.paper-title { font-size: 14px; font-weight: 600; font-style: italic; color: var(--text-primary); margin-bottom: 6px; line-height: 1.5; }
.paper-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
.paper-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  opacity: 0.45;
}
.empty-icon { font-size: 32px; color: var(--text-secondary); }
.empty-text { font-size: 14px; color: var(--text-secondary); letter-spacing: 2px; }

/* ── Bottom actions ── */
.bottom-actions {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16px;
  margin-top: 20px;
}
.btn-primary {
  padding: 12px 36px;
  border-radius: 10px;
  background: var(--accent-primary);
  color: #050d1a;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-primary:hover { box-shadow: 0 0 24px rgba(0,212,180,0.5); }
.btn-ghost {
  padding: 12px 36px;
  border-radius: 10px;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: var(--text-primary); }
</style>
