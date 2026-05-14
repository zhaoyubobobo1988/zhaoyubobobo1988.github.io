<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import TechBackground from '@/components/TechBackground.vue'
import { useTypewriter } from '@/composables/useTypewriter'

const emit = defineEmits<{ (e: 'complete'): void }>()

const activeScene = ref(0)
const showSkip = ref(false)
const showEnter = ref(false)
const exiting = ref(false)

// ═══ SCENE 0: 战略启动 ═══
const tw = [
  useTypewriter('SKYVEO低空智能操作系统 v3.2.1', 45),
  useTypewriter('> 初始化核心算法引擎...', 28),
  useTypewriter('> 加载计算机视觉模块 YOLO / VLM...', 25),
  useTypewriter('> 建立多源数据融合通道 气象 / 地质 / DEM...', 25),
  useTypewriter('> 挂载感知与时序分析子系统...', 28),
  useTypewriter('> 校准无人机遥测链路...', 28),
  useTypewriter('> 同步实时视频推流服务...', 25),
  useTypewriter('> 加载行业应用与调度模板...', 28),
]
const bootProgress = ref(0)
const checks = ref([
  { label: '视觉算法 CV', ok: false },
  { label: '多源融合算法', ok: false },
  { label: '感知时序分析', ok: false },
  { label: '智能调度引擎', ok: false },
  { label: '无人机遥测', ok: false },
  { label: '实时视频推流', ok: false },
])

// ═══ SCENE 1: 算法深度解析 ═══
interface AlgoNode { name: string; role: string; why: string; contrast: string }
interface AlgoScenario { name: string; flow: string; detail: string }
interface AlgoDomain {
  id: string; title: string; icon: string; color: string
  thesis: string
  why: string
  pipeline: AlgoNode[]
  scenarios: AlgoScenario[]
  tags: string[]
}

const algoDomains: AlgoDomain[] = [
  {
    id: 'cv', title: 'CV 视觉算法', icon: '◆', color: 'var(--accent-primary)',
    thesis: '从"看见"到"看懂"的三级递进 — YOLO 检测 + UNet 分割 + VLM 理解',
    why: 'YOLO 负责"看见"：30fps 实时目标检测，<50ms 延迟，满足视频流实时性。对比 Faster R-CNN 精度更高但延迟 >200ms，无法用于实时推流场景。UNet 负责"看清"：像素级语义分割，YOLO 只能给出边界框，无法精确测量裂缝宽度或腐蚀面积。UNet 在医学影像小样本分割中已验证的泛化能力，适合缺陷样本稀缺场景。VLM 负责"看懂"：传统 CV 只能输出"这里有裂缝"，工程决策需要"是否需要立即封路"。VLM 结合视觉特征与自然语言推理，端到端生成合规报告。三者不是替代关系，是从感知→测量→认知的递进链路。',
    pipeline: [
      { name: 'YOLO', role: '实时目标检测', why: '单阶段检测器，30fps 视频流实时推理，<50ms 延迟。选型关键：无人机推流是实时视频，检测器必须在下一帧到达前完成推理，否则丢帧导致漏检。', contrast: 'Faster R-CNN：两阶段检测，精度高 3-5% 但延迟 >200ms，无法满足实时性。SSD：速度接近但小目标召回率低，无人机高空拍摄的裂缝目标通常 <32×32px。' },
      { name: 'UNet', role: '像素级语义分割', why: '输出像素级 mask，可精确计算裂缝宽度（mm）、腐蚀面积（cm²）。编码器-解码器结构 + 跳跃连接保留空间细节，在小样本（<100 张标注）下即可有效训练。', contrast: 'DeepLabV3+：分割精度略高但推理速度慢 3-5x。SAM（Segment Anything）：零样本能力强但无缺陷领域知识，对细微裂缝分割效果不稳定。' },
      { name: 'VLM', role: '多模态理解与报告生成', why: '将 YOLO 检测结果 + UNet 分割 mask + 原始图像联合输入，输出自然语言描述和工程评估。例："检测到桥墩竖向裂缝，宽度 2.3mm，位于承重区，建议 7 日内修复。"', contrast: '传统 CLIP 分类：只能做闭集分类，无法生成开放文本报告。GPT-4V API：能力强但数据隐私风险，且延迟不可控（>2s），不适合批量自动化。' },
    ],
    scenarios: [
      { name: '道桥检测', flow: 'YOLO → UNet → VLM', detail: 'YOLO 检测裂缝/剥落/钢筋外露 → UNet 精确测量裂缝宽度与剥落面积 → VLM 对照 JTG 5210 标准评估技术状况等级（1-5 类），自动生成桥检报告。' },
      { name: '电力巡检', flow: 'YOLO → UNet → VLM', detail: 'YOLO 检测绝缘子自爆/导线断股/线夹松动 → UNet 分割破损区域计算损坏比例 → VLM 对照 DL/T 741 标准生成缺陷等级（一般/严重/危急）及更换建议。' },
      { name: '厂区安防', flow: 'YOLO → VLM（跳过 UNet）', detail: 'YOLO 检测人员/车辆/火焰/烟雾 → 不需要像素级分割 → 直接送入 VLM 评估行为风险等级（合规/注意/警告/报警），触发对应联动预案。' },
    ],
    tags: ['YOLO', 'UNet', 'VLM', '目标检测', '语义分割', '多模态', '自动报告'],
  },
  {
    id: 'fusion', title: '多源融合算法', icon: '◈', color: 'var(--accent-success)',
    thesis: '无人机不是孤岛 — 它是天地一体化感知网络的末端执行器',
    why: '单一视觉传感器只能回答"看到了什么"，无法回答"为什么在这里看"和"看了之后意味着什么"。气象数据决定飞行窗口与载荷选择（风速 >15m/s 禁飞，能见度 <2km 切换红外）；地质数据预标记高风险区（滑坡易发区、断裂带优先巡检）；DEM/DSM 提供地形基准（航线跟随、正射校正）；遥感卫星实现大尺度变化检测（引导无人机精准复核）。四源融合 = 天（遥感） + 空（气象） + 地（地质） + 形（DEM），将无人机的"盲飞"变为"知飞"。',
    pipeline: [
      { name: '气象数据', role: '飞行窗口决策', why: '风速、降水、能见度、云层高度 — 决定能否安全飞行和选用何种载荷。实时接入国家气象局 API + 机场 METAR 报文，15 分钟刷新。', contrast: '单一风速仪：仅本地测量，无区域预报能力，无法提前规划航线窗口。' },
      { name: '地质数据', role: '风险先验标记', why: '滑坡易发性指数、断裂带缓冲区、岩性分类 — 预先标记高风险区，让有限的飞行资源优先覆盖最危险区域。数据来源：1:5 万地质图 + InSAR 地表形变。', contrast: '随机网格巡检：无先验引导，高风险区与低风险区均分飞行资源，漏检概率不可控。' },
      { name: 'DEM/DSM', role: '地形基准与航线规划', why: '30m DEM 用于大范围航线规划，5m DSM 用于近地飞行。保证无人机始终高于地表安全高度（AGL），同时为正射影像提供几何校正基准。', contrast: '固定高度飞行：不考虑地形起伏，山区可能导致撞山（AGL 过低）或 GSD 过大（AGL 过高）。' },
      { name: '遥感影像', role: '大尺度变化检测', why: 'Sentinel-2（10m，5 天重访）用于月度变化检测，Landsat（30m，16 天）用于季度趋势分析。发现变化 → 引导无人机定点核查，实现"星-机"协同。', contrast: '纯无人机覆盖：单架次覆盖面积有限（<5km²），大面积监测成本过高且时效差。' },
    ],
    scenarios: [
      { name: '地质灾害', flow: '遥感形变 → DEM坡度 → 地质图层 → 无人机核查', detail: 'InSAR 发现地表形变速率 >10mm/年 → DEM 分析坡度 >25°的潜在滑动面 → 地质断裂带 500m 缓冲区叠加 → 无人机双光（可见光+热红外）定点核查地表裂隙与渗水。' },
      { name: '水文监测', flow: '气象降雨 → DEM汇流 → 遥感水体 → 无人机堤防', detail: '气象预报未来 48h 降雨 >50mm → DEM 水文分析提取汇流路径与淹没区 → Sentinel-2 水体指数提取历史对比 → 无人机沿堤防/河道风险点低空巡检。' },
      { name: '山林防火', flow: '遥感热异常 → 气象风向 → DEM火势模拟 → 无人机跟踪', detail: 'MODIS/VIIRS 热异常点检测（1km 分辨率，每日 4 次）→ 气象预报风向风速 → DEM + Rothermel 火行为模型预测蔓延方向 → 无人机红外载荷盘旋跟踪火线。' },
    ],
    tags: ['气象融合', '地质分析', 'DEM/DSM', '遥感变化检测', 'InSAR', '星机协同', '空间分析'],
  },
  {
    id: 'temporal', title: '感知与时序算法', icon: '◉', color: 'var(--accent-warning)',
    thesis: '三个算法管三个时间尺度 — 毫秒级实时估计、秒级阶段识别、小时级异常发现',
    why: '卡尔曼滤波运行在毫秒级，处理 GPS 噪声和 IMU 漂移，直接嵌入飞控固件。选型关键是递归计算 + 极小内存占用，粒子滤波精度更高但计算量指数增长。HMM 运行在秒-分钟级，识别飞行阶段（起飞/巡航/巡检/降落），选型关键是可解释性强 + 小样本标注即可训练，RNN 需要大量标注序列数据。LSTM-AE 运行在分钟-小时级，做飞行后异常检测，选型关键是无需标注异常样本——只需历史正常数据训练，推理时对偏离"正常模式"的信号给出高重构误差，天然适合故障样本稀缺的航空场景。',
    pipeline: [
      { name: '卡尔曼滤波', role: '实时状态估计（毫秒级）', why: '递归贝叶斯滤波，仅需上一时刻状态 + 当前观测即可更新。用于 GPS/IMU 融合定位、速度估计、轨迹平滑。计算量 O(n²)，n 为状态维度（通常 6-9），可在飞控 MCU 上运行。', contrast: '粒子滤波：非线性非高斯场景精度更高，但计算量随粒子数（通常 1000+）指数增长，无法在嵌入式飞控上实时运行。互补滤波：更简单但无法处理多传感器协方差。' },
      { name: 'HMM', role: '飞行阶段识别（秒-分钟级）', why: '离散隐状态（起飞/巡航/巡检/降落）+ 连续观测（速度/高度/姿态角），用 Baum-Welch 算法无监督训练。可解释：状态转移矩阵直接对应飞行操作逻辑。', contrast: 'RNN/LSTM 分类器：需要大量逐帧标注的飞行阶段数据（通常 >10 万帧），标注成本高且模型可解释性差，黑盒难以调试。' },
      { name: 'LSTM-AE', role: '异常检测（分钟-小时级）', why: '自编码器结构，编码器将多变量时序（振动/温度/电流/转速）压缩为潜在表示，解码器重建。在正常数据上训练后，异常片段的重构误差显著偏高。无需标注异常样本，适合故障数据稀缺场景。', contrast: '孤立森林/One-Class SVM：不建模时序依赖，无法发现"振动频谱缓慢漂移"这类渐变异常。有监督分类器：需要标注各种故障类型，航空故障样本极少且不平衡。' },
    ],
    scenarios: [
      { name: '实时飞行监控', flow: '卡尔曼 → HMM → 分阶段阈值', detail: '卡尔曼滤波实时融合 GPS+IMU 数据 → 输出平滑位置/速度/姿态 → HMM 在线识别当前飞行阶段 → 根据阶段应用不同安全阈值（巡航阶段姿态角超 30° 即告警，起飞阶段不触发）。' },
      { name: '飞行后日志诊断', flow: 'LSTM-AE → 异常检测 → 人工复核', detail: '飞行结束后 LSTM-AE 扫描完整 tlog（振动频谱、电机温度、电池压降、GPS 信噪比）→ 标记重构误差 >3σ 的时段 → 生成异常摘要供飞手/地勤复核，确认后加入故障案例库。' },
      { name: '预测性维护', flow: 'LSTM-AE 长期追踪 → 趋势分析 → 提前预警', detail: 'LSTM-AE 持续追踪每架飞机的电机振动频谱、电池内阻、飞控指令延迟 → 检测缓慢趋势漂移（如电机振动功率谱密度逐月上升）→ 在功能失效前 2-4 周发出维护预警，避免飞行中故障。' },
    ],
    tags: ['卡尔曼滤波', 'HMM', 'LSTM-AE', '飞行日志诊断', '异常检测', '预测维护', '时序分析'],
  },
  {
    id: 'product', title: '产品化方案', icon: '◎', color: 'var(--accent-info)',
    thesis: '算法不卖钱 — 封装成可交付、可复制的标准化产品才卖钱',
    why: '前三个域（CV、融合、时序）是能力底座，产品化是价值出口。方案封装将每个算法模块定义为标准 API（REST + WebSocket），客户可按需组合；标准文档确保输出符合行业合规要求（电力 DL/T 741、交通 JTG 5210、水利 SL 288），客户可直接用于监管报备；行业对标将算法指标映射为客户 KPI（缺陷检出率 >95%、误报率 <5%、巡检效率提升 10x）；培训体系覆盖三级人员（操作员→分析员→管理员），每级配套视频、操作手册和实操考核；持续迭代通过模型版本管理 + 客户反馈闭环，确保产品随客户需求演进。',
    pipeline: [
      { name: '方案封装', role: 'API 标准化', why: '每个算法模块独立容器化部署，定义标准 REST + WebSocket 接口，支持按需编排。CV 模块可单独输出检测结果，也可与融合模块级联输出风险评估。', contrast: '单体应用交付：所有能力耦合在一个进程，客户只需目标检测也要部署整个系统，资源浪费且升级风险高。' },
      { name: '标准文档', role: '行业合规输出', why: '自动生成符合行业标准的报告模板：电力 DL/T 741（架空输电线路运行规程）、交通 JTG 5210（公路技术状况评定标准）、水利 SL 288（水利工程质量检测规程）。', contrast: '通用 PDF 报告：不符合行业格式要求，客户需人工转录到监管系统，效率低且易出错。' },
      { name: '行业对标', role: 'KPI 映射', why: '将算法指标翻译为客户语言：检出率 = 不漏检，误报率 = 不误报，处理延迟 = 实时性。每个行业定义独立的 KPI 基准和验收标准。', contrast: '纯技术指标报告：客户不理解 mAP/IOU/F1-score，无法与商务合同对照。' },
      { name: '培训与迭代', role: '持续交付闭环', why: '三级培训（操作员→分析员→管理员）+ 模型版本管理 + A/B 测试 + 客户反馈追踪。新模型上线前在历史数据上回测，确认指标不退化才推送。', contrast: '一次性交付：部署后无升级机制，模型随时间漂移（数据分布变化）导致性能持续下降。' },
    ],
    scenarios: [
      { name: '新客户交付', flow: '方案封装 → 标准文档 → 行业对标', detail: '确定客户行业（道桥/电力/水文/厂区）→ 从算法库选用对应模块 → 封装为 Docker Compose → 输出行业标准报告模板 → 与客户 KPI 逐项对标确认 → 部署上线。周期：2-4 周。' },
      { name: '模型升级', flow: '持续迭代 → A/B测试 → 灰度发布', detail: '积累客户标注数据 → 模型重训练 → 在历史数据上回测（检出率/误报率对比）→ A/B 测试（新旧模型并行，人工盲评）→ 确认指标不退化 → 灰度推送到 20% 客户 → 全量。' },
      { name: '客户培训', flow: '三级培训 + 考核 + 认证', detail: '操作员（1 天）：飞行操作 + 数据采集标准 → 分析员（2 天）：缺陷识别 + 报告解读 + 质量审核 → 管理员（3 天）：系统运维 + 模型监控 + 问题升级。每级实操考核合格发证。' },
    ],
    tags: ['方案封装', '标准文档', '行业对标', '交付输出', '培训体系', '持续迭代', 'A/B测试'],
  },
]

const activeDomain = ref(0)
const expandedNode = ref<number | null>(null)
const expandedScenario = ref<number | null>(null)

function switchDomain(idx: number) {
  activeDomain.value = idx
  expandedNode.value = null
  expandedScenario.value = null
}
function toggleNode(idx: number) {
  expandedNode.value = expandedNode.value === idx ? null : idx
}
function toggleScenario(idx: number) {
  expandedScenario.value = expandedScenario.value === idx ? null : idx
}

// ═══ SCENE 3: 星图星座 ═══
interface StarNode {
  id: string; title: string; icon: string; color: string
  x: number; y: number; z: number
  pain: string; algoConfig: string; standard: string; metrics: string
}
interface StarConnection { from: number; to: number }
interface ProjectedPoint { sx: number; sy: number; scale: number }

const starNodes: StarNode[] = [
  { id: 'bridge', title: '道桥巡检', icon: '🌉', color: 'var(--accent-primary)', x: 0.55, y: -0.15, z: 0.3, pain: '全国公路桥梁超 100 万座，桥龄 >20 年的占 40%，传统人工检测效率低（1 座/天），高空作业风险高', algoConfig: 'YOLO 检测裂缝/剥落 → UNet 测量宽度/面积 → VLM 对照 JTG 5210 评定技术等级', standard: 'JTG 5210《公路技术状况评定标准》、JTG 5120《公路桥涵养护规范》', metrics: '裂缝检出率 >98%、宽度测量精度 ±0.1mm、等级评定准确率 >95%' },
  { id: 'forest', title: '山林巡检', icon: '🌲', color: 'var(--accent-success)', x: 0.25, y: -0.55, z: -0.1, pain: '森林火灾每年损失超百亿，传统瞭望塔覆盖率不足 30%，病虫害早期发现率 <20%', algoConfig: 'YOLO 检测火点/烟雾 → 多光谱 NDVI 分析植被健康 → 遥感卫星变化检测引导无人机复勘', standard: 'LY/T 2181《森林火险预警》、LY/T 3097《林业有害生物监测》', metrics: '火点检测最远 5km、植被健康分级精度 >90%、病虫害早期预警提前 14 天' },
  { id: 'hydro', title: '水文智能监测', icon: '🌊', color: 'var(--accent-info)', x: 0.05, y: -0.05, z: 0.8, pain: '全国堤防超 40 万公里，险工险段数量大，传统人工巡堤效率低、夜间/暴雨天不可达', algoConfig: '气象降雨预报 → DEM 汇流分析 → Sentinel-2 水体提取 → 无人机堤防隐患巡检', standard: 'SL 288《水利工程质量检测规程》、SL 622《堤防工程养护修理规程》', metrics: '堤防隐患检出率 >95%、水动力模拟精度 <5% 误差、水质反演 R² >0.85' },
  { id: 'factory', title: '厂区安防', icon: '🏭', color: 'var(--accent-warning)', x: 0.55, y: 0.45, z: -0.2, pain: '大型工业园区周界超 10km，夜间安防依赖人工巡逻，入侵漏报率 >30%', algoConfig: 'YOLO 检测人员/车辆 → 热红外夜间增强 → VLM 行为风险评估 → 自动联动报警', standard: 'GB 50348《安全防范工程技术标准》、GA/T 1215《视频安防监控系统》', metrics: '入侵检出率 >99%、误报率 <3%、从检测到告警 <2s' },
  { id: 'geohazard', title: '地质灾害', icon: '⛰️', color: 'var(--accent-danger)', x: -0.35, y: 0.6, z: -0.1, pain: '全国地质灾害隐患点超 30 万处，降雨+地震后往往集中爆发，人工排查无法覆盖', algoConfig: 'InSAR 地表形变（mm 级）→ DEM 坡度/坡向分析 → 地质图层叠加 → 无人机双光定点核查', standard: 'DZ/T 0286《地质灾害危险性评估规范》、T/CAGHP 048《地质灾害无人机巡查》', metrics: '形变检测精度 ±5mm/年、滑坡预警提前 7 天、隐患识别准确率 >90%' },
  { id: 'power', title: '电力巡检', icon: '⚡', color: 'var(--accent-primary)', x: -0.55, y: -0.1, z: 0.2, pain: '全国输电线路超 230 万公里，传统人工走线效率极低（10km/人/天），直升机成本高', algoConfig: 'YOLO 检测绝缘子自爆/导线断股/线夹松动 → UNet 分割损坏区域 → VLM 对照 DL/T 741 生成缺陷定级', standard: 'DL/T 741《架空输电线路运行规程》、DL/T 1578《架空输电线路无人机巡检》', metrics: '缺陷检出率 >97%、缺陷定级准确率 >95%、单塔巡检 <5 分钟' },
  { id: 'fishery', title: '智慧渔业', icon: '🐟', color: 'var(--accent-info)', x: -0.1, y: -0.65, z: -0.3, pain: '鲟鱼种质资源保护需求迫切，养殖水域环境监测手段落后，传统水质采样效率低、覆盖不足', algoConfig: '多光谱水质反演 → 热红外水温监测 → YOLO 鱼群密度估算 → VLM 识别养殖异常行为', standard: 'SC/T 0004《水产养殖质量安全管理规范》、GB 11607《渔业水质标准》', metrics: '水质异常检出 >95%、鱼群密度估算误差 <10%、藻华预警提前 3 天' },
  { id: 'coastal', title: '海岸带监测', icon: '🌊', color: 'var(--accent-primary)', x: 0.65, y: -0.5, z: -0.4, pain: '全国海岸线超 3.2 万公里，蚀退/围填海/湿地退化需要持续监测，传统手段覆盖慢、频次低', algoConfig: 'Sentinel-1 SAR 海岸线提取 → 多期影像变化检测 → DEM 潮间带地形建模 → 无人机定点巡查', standard: 'HY/T 123《海洋监测规范》、GB/T 18190《海洋学术语·海洋地质学》', metrics: '岸线变化检测精度 ±2m、湿地分类精度 >90%、月度变化监测周期' },
  { id: 'agriculture', title: '精准农业', icon: '🌾', color: 'var(--accent-success)', x: 0.7, y: -0.35, z: -0.5, pain: '传统农情监测依赖人工踏勘，覆盖慢、主观性强，灾害定损缺乏客观依据', algoConfig: '多光谱 NDVI/LAI 作物长势 → 热红外冠层温度胁迫检测 → YOLO 病虫害/杂草识别 → 灾害定损面积测算', standard: 'NY/T 3921《农业遥感监测技术规范》、GB/T 36395《农作物病害遥感监测》', metrics: '长势分级精度 >90%、病虫害识别准确率 >92%、亩均定损误差 <8%' },
  { id: 'water-eng', title: '水利工程', icon: '🏗️', color: 'var(--accent-warning)', x: -0.25, y: 0.3, z: 0.5, pain: '全国水库超 9.8 万座，病险水库比例高，传统巡检周期长、水下结构不可达', algoConfig: 'DEM 汇流分析 → 无人机倾斜摄影三维建模 → 坝体裂缝/渗漏检测 → 库容曲线复核', standard: 'SL 258《水库大坝安全评价导则》、SL 551《土石坝安全监测技术规范》', metrics: '坝体裂缝检出率 >97%、库容测算精度 >95%、三维模型分辨率 <5cm' },
  { id: 'carbon', title: '碳汇监测', icon: '🌍', color: 'var(--accent-success)', x: -0.6, y: -0.5, z: -0.7, pain: '碳汇测算依赖地面样地，空间外推误差大，林业/蓝碳/农田碳汇缺乏统一空间化监测体系', algoConfig: '多光谱/激光雷达生物量反演 → 土地利用变化碳排放核算 → 蓝碳生态系统碳储量评估 → 无人机-卫星协同碳通量监测', standard: 'IPCC《国家温室气体清单指南》、GB/T 41197《林业碳汇项目审定和核证指南》', metrics: '生物量反演精度 >85%、碳汇变化监测分辨率 10m、年度碳通量评估误差 <15%' },
  { id: 'digital-twin', title: '城市数字孪生', icon: '🏙️', color: 'var(--accent-info)', x: -0.65, y: 0.25, z: -0.35, pain: '实景三维中国建设要求城市级 LOD3 模型，传统航测周期长、成本高，更新频率跟不上城市变化', algoConfig: '倾斜摄影三维重建 → YOLO 建筑物/道路/绿地要素提取 → UNet 变化检测（违建/拆迁/施工）→ BIM+GIS 融合', standard: 'CH/T 9015《三维地理信息模型数据产品规范》、CJJ/T 157《城市三维建模技术规范》', metrics: '模型分辨率 <3cm、变化检测准确率 >95%、单平方公里重建 <2 小时' },
]

const connections: StarConnection[] = [
  { from: 2, to: 9 },  // 水文 — 水利
  { from: 2, to: 6 },  // 水文 — 渔业
  { from: 2, to: 7 },  // 水文 — 海岸带
  { from: 2, to: 10 }, // 水文 — 碳汇
  { from: 9, to: 4 },  // 水利 — 地质灾害
  { from: 9, to: 8 },  // 水利 — 农业
  { from: 0, to: 5 },  // 道桥 — 电力
  { from: 0, to: 11 }, // 道桥 — 城市数字孪生
  { from: 5, to: 3 },  // 电力 — 厂区
  { from: 5, to: 11 }, // 电力 — 城市数字孪生
  { from: 1, to: 10 }, // 山林 — 碳汇
  { from: 1, to: 8 },  // 山林 — 农业
  { from: 1, to: 4 },  // 山林 — 地质灾害
  { from: 8, to: 10 }, // 农业 — 碳汇
  { from: 8, to: 6 },  // 农业 — 渔业
  { from: 6, to: 7 },  // 渔业 — 海岸带
  { from: 7, to: 10 }, // 海岸带 — 碳汇
  { from: 10, to: 11 },// 碳汇 — 城市数字孪生
  { from: 4, to: 7 },  // 地质灾害 — 海岸带
  { from: 3, to: 11 }, // 厂区 — 城市数字孪生
]

const activeIndustry = ref<number | null>(null)
function selectIndustry(idx: number) {
  activeIndustry.value = activeIndustry.value === idx ? null : idx
}

// ═══ 3D 星图引擎 ═══
let rotY = 1.2
let rotX = 0.15
let velY = 0
let velX = 0
const isDragging = ref(false)
let dragPrev = { x: 0, y: 0 }

const starCanvas = ref<HTMLCanvasElement | null>(null)
const starStage = ref<HTMLElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let stars: { x: number; y: number; r: number; a: number; phase: number }[] = []
let rafId: number | null = null
let stageW = 0
let stageH = 0
let time = 0

const projectedNodes = ref<ProjectedPoint[]>(starNodes.map(() => ({ sx: 0, sy: 0, scale: 1 })))
const projectedHub = ref<ProjectedPoint>({ sx: 0, sy: 0, scale: 1 })

function project3D(x: number, y: number, z: number, ry: number, rx: number): ProjectedPoint {
  const cosY = Math.cos(ry), sinY = Math.sin(ry)
  const x1 = x * cosY - z * sinY
  const z1 = x * sinY + z * cosY

  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  const y1 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX

  const d = 2.0
  const sc = d / (d + z2)
  return { sx: x1 * sc, sy: y1 * sc, scale: Math.max(0.35, Math.min(1.6, sc)) }
}

function initStarCanvas() {
  const canvas = starCanvas.value
  const stage = starStage.value
  if (!canvas || !stage) return
  const rect = stage.getBoundingClientRect()
  stageW = rect.width; stageH = rect.height
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
  stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    r: Math.random() * 1.8 + 0.3,
    a: Math.random() * 0.35 + 0.06,
    phase: Math.random() * Math.PI * 2,
  }))
}

function drawStarMap() {
  if (!ctx || !starStage.value) return
  ctx.clearRect(0, 0, stageW, stageH)

  // Star particles with subtle twinkle
  time += 0.008
  for (const s of stars) {
    const alpha = s.a + Math.sin(time * 1.5 + s.phase) * 0.12
    ctx!.beginPath()
    ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(230,240,255,${Math.max(0.04, alpha)})`
    ctx!.fill()
  }

  // Project all nodes
  const pts = starNodes.map(n => project3D(n.x, n.y, n.z, rotY, rotX))
  const hp = project3D(0, 0, 1.0, rotY, rotX)

  const toScreen = (p: ProjectedPoint) => ({
    sx: stageW / 2 + p.sx * stageW * 0.4,
    sy: stageH / 2 + p.sy * stageH * 0.4,
    scale: p.scale,
  })
  const sp = pts.map(toScreen)
  const shp = toScreen(hp)

  // Constellation lines
  const sel = activeIndustry.value
  for (const conn of connections) {
    const a = sp[conn.from]; const b = sp[conn.to]
    const highlight = sel !== null && (conn.from === sel || conn.to === sel)
    ctx!.beginPath()
    ctx!.moveTo(a.sx, a.sy)
    ctx!.lineTo(b.sx, b.sy)
    ctx!.strokeStyle = highlight
      ? `rgba(255,255,255,0.6)`
      : `rgba(200,225,255,0.2)`
    ctx!.lineWidth = highlight ? 1.2 : 0.65
    ctx!.stroke()
  }

  // Hub halo
  const hg = ctx!.createRadialGradient(shp.sx, shp.sy, 0, shp.sx, shp.sy, 55 * shp.scale)
  hg.addColorStop(0, 'rgba(200,220,255,0.25)')
  hg.addColorStop(1, 'rgba(200,220,255,0)')
  ctx!.beginPath(); ctx!.arc(shp.sx, shp.sy, 55 * shp.scale, 0, Math.PI * 2); ctx!.fillStyle = hg; ctx!.fill()

  // Node halos
  for (const p of sp) {
    const g = ctx!.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 26 * p.scale)
    g.addColorStop(0, 'rgba(200,225,255,0.18)')
    g.addColorStop(1, 'rgba(200,225,255,0)')
    ctx!.beginPath(); ctx!.arc(p.sx, p.sy, 26 * p.scale, 0, Math.PI * 2); ctx!.fillStyle = g; ctx!.fill()
  }

  projectedNodes.value = pts
  projectedHub.value = hp
}

function tick() {
  if (!isDragging.value) {
    if (Math.abs(velY) > 0.0004 || Math.abs(velX) > 0.0004) {
      rotY += velY; rotX += velX
      velY *= 0.94; velX *= 0.94
    } else {
      velY = 0; velX = 0
      drawStarMap()
      rafId = null
      return
    }
  }
  rotX = Math.max(-0.7, Math.min(0.7, rotX))
  drawStarMap()
  rafId = requestAnimationFrame(tick)
}

function startStarRAF() {
  if (rafId) return
  initStarCanvas()
  drawStarMap()
  rafId = requestAnimationFrame(tick)
}

function stopStarRAF() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
}

function onStarDown(e: MouseEvent) {
  isDragging.value = true
  dragPrev = { x: e.clientX, y: e.clientY }
  startStarRAF()
}

function onStarMove(e: MouseEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - dragPrev.x
  const dy = e.clientY - dragPrev.y
  velY = dx * 0.005; velX = -dy * 0.005
  rotY += velY; rotX += velX
  dragPrev = { x: e.clientX, y: e.clientY }
}

function onStarUp() { isDragging.value = false }

function onStarResize() {
  if (activeScene.value !== 3) return
  initStarCanvas()
  drawStarMap()
}

watch(activeScene, (val) => {
  if (val === 3) {
    nextTick(() => { initStarCanvas(); startStarRAF() })
  } else {
    stopStarRAF()
  }
})

// ═══ SCENE 5: 品牌 ═══
interface Particle { x: number; y: number; px: number; py: number; delay: number }
const particles = ref<Particle[]>([])
const badgesVisible = ref([false, false, false, false])

function spawnParticles() {
  const list: Particle[] = []
  for (let i = 0; i < 50; i++) {
    const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.4
    const dist = 80 + Math.random() * 160
    list.push({ x: 50, y: 50, px: Math.cos(angle) * dist, py: Math.sin(angle) * dist, delay: Math.random() * 0.3 })
  }
  particles.value = list
}

// ═══ TIMERS ═══
let mounted = true
const timers: ReturnType<typeof setTimeout>[] = []
function st(fn: () => void, ms: number) {
  timers.push(setTimeout(() => { if (mounted) fn() }, ms))
}

function scheduleBoot() {
  tw[0].start()
  st(() => { bootProgress.value = 6 }, 0)
  st(() => { tw[0].finish(); tw[1].start(); bootProgress.value = 18 }, 1500)
  st(() => { checks.value[0].ok = true; bootProgress.value = 28 }, 2000)
  st(() => { tw[1].finish(); tw[2].start(); bootProgress.value = 38 }, 2300)
  st(() => { checks.value[1].ok = true; bootProgress.value = 48 }, 2600)
  st(() => { tw[2].finish(); tw[3].start(); bootProgress.value = 56 }, 2900)
  st(() => { checks.value[2].ok = true; bootProgress.value = 64 }, 3200)
  st(() => { tw[3].finish(); tw[4].start(); bootProgress.value = 72 }, 3500)
  st(() => { checks.value[3].ok = true; bootProgress.value = 80 }, 3800)
  st(() => { tw[4].finish(); tw[5].start(); bootProgress.value = 86 }, 4100)
  st(() => { checks.value[4].ok = true; bootProgress.value = 92 }, 4400)
  st(() => { tw[5].finish(); tw[6].start(); bootProgress.value = 96 }, 4700)
  st(() => { checks.value[5].ok = true; tw[6].finish(); tw[7].start(); bootProgress.value = 100 }, 5000)
}

// ═══ NAVIGATION ═══
function clearAllTimers() { timers.forEach(clearTimeout); timers.length = 0 }

function goNext() {
  clearAllTimers()
  const next = activeScene.value + 1
  if (next === 1) {
    tw.forEach(t => t.finish())
    checks.value.forEach(c => { c.ok = true })
    bootProgress.value = 100
  }
  if (next === 5) {
    activeScene.value = 5
    st(() => { spawnParticles() }, 500)
    st(() => { badgesVisible.value.forEach((_, idx) => { setTimeout(() => { badgesVisible.value[idx] = true }, idx * 160) }) }, 1000)
    st(() => { showEnter.value = true; showSkip.value = false }, 1800)
  } else {
    activeScene.value = next
  }
}

function goPrev() {
  clearAllTimers()
  if (activeScene.value > 0) activeScene.value = activeScene.value - 1
}

function handleSkip() {
  clearAllTimers()
  tw.forEach(t => t.finish())
  checks.value.forEach(c => { c.ok = true })
  bootProgress.value = 100
  activeScene.value = 5
  spawnParticles()
  badgesVisible.value = [true, true, true, true]
  showEnter.value = true
  showSkip.value = false
}

function handleEnter() {
  exiting.value = true
  setTimeout(() => { emit('complete') }, 600)
}

onMounted(() => {
  st(() => { showSkip.value = true }, 3000)
  scheduleBoot()
  window.addEventListener('resize', onStarResize)
})

onBeforeUnmount(() => { mounted = false; clearAllTimers(); stopStarRAF(); window.removeEventListener('resize', onStarResize) })
</script>

<template>
  <div class="splash-overlay" :class="{ exiting }">
    <TechBackground v-if="activeScene === 0" effect="grid" :density="35" :opacity="0.5" :full-screen="true" class="splash-bg" />
    <TechBackground v-if="activeScene === 1" effect="radar" :density="45" :opacity="0.55" :full-screen="true" class="splash-bg" />
    <TechBackground v-if="activeScene === 2" effect="connections" :density="50" :opacity="0.5" :full-screen="true" class="splash-bg" />
    <TechBackground v-if="activeScene === 3" effect="grid" :density="40" :opacity="0.45" :full-screen="true" class="splash-bg" />
    <TechBackground v-if="activeScene === 4" effect="radar" :density="40" :opacity="0.45" :full-screen="true" class="splash-bg" />
    <TechBackground v-if="activeScene === 5" effect="stars" :density="35" :opacity="0.4" :full-screen="true" class="splash-bg" />

    <!-- ═══════════ SCENE 0: 系统初始化 ═══════════ -->
    <div v-if="activeScene === 0" class="scene">
      <div class="scene-inner boot-layout">
        <div class="boot-hero">
          <div class="boot-tagline">以算法为矛 · 深耕低空智能</div>
          <div class="boot-subtitle">算法驱动的低空智能操作系统</div>
        </div>
        <div class="boot-terminal">
          <div class="term-hd">
            <span class="tdot" style="background:var(--accent-danger)" /><span class="tdot" style="background:var(--accent-warning)" /><span class="tdot" style="background:var(--accent-success)" />
            <span class="tlabel">SKYVEO OS · 核心算法引擎初始化</span>
          </div>
          <div class="term-bd">
            <p class="tline" v-if="tw[0].display.value"><span class="grn">{{ tw[0].display.value }}</span><span v-if="!tw[0].done.value" class="cur" /></p>
            <p class="tline dim" v-for="(t, i) in tw.slice(1)" :key="i" v-show="t.display.value">
              <span>{{ t.display.value }}</span><span v-if="!t.done.value" class="cur" />
            </p>
          </div>
        </div>
        <div class="boot-bar-wrap">
          <div class="boot-bar"><div class="boot-bar-fill" :style="{ width: bootProgress + '%' }" /></div>
          <span class="boot-pct">{{ bootProgress }}%</span>
        </div>
        <div class="boot-checks">
          <div v-for="c in checks" :key="c.label" class="chk" :class="{ ok: c.ok }">
            <span class="chk-dot"><span v-if="c.ok" class="chk-on" /><span v-else class="chk-off" /></span>
            <span class="chk-label">{{ c.label }}</span>
            <span class="chk-st">{{ c.ok ? '✓' : '···' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ SCENE 1: 算法深度解析 ═══════════ -->
    <div v-if="activeScene === 1" class="scene">
      <div class="scene-inner algo-layout">
        <div class="algo-header">
          <div class="algo-title">核心算法体系深度解析</div>
          <div class="algo-subtitle">每个算法选择都有技术理由 · 每个组合都有工程逻辑</div>
        </div>

        <!-- Domain tabs -->
        <div class="algo-tabs">
          <button v-for="(d, idx) in algoDomains" :key="d.id"
            class="algo-tab" :class="{ active: activeDomain === idx }"
            :style="{ '--tab-color': d.color }"
            @click="switchDomain(idx)">
            <span class="at-icon">{{ d.icon }}</span>
            <span class="at-label">{{ d.title }}</span>
          </button>
        </div>

        <!-- Active domain content -->
        <div class="algo-stage" :key="activeDomain">
          <!-- Hero line -->
          <div class="domain-hero">
            <span class="dh-icon" :style="{ color: algoDomains[activeDomain].color }">{{ algoDomains[activeDomain].icon }}</span>
            <span class="dh-title">{{ algoDomains[activeDomain].title }}</span>
            <span class="dh-thesis">{{ algoDomains[activeDomain].thesis }}</span>
          </div>

          <!-- Why card -->
          <div class="domain-why" :style="{ '--domain-color': algoDomains[activeDomain].color }">
            <div class="dw-label">为什么是这个组合？</div>
            <div class="dw-text">{{ algoDomains[activeDomain].why }}</div>
          </div>

          <!-- Algorithm pipeline -->
          <div class="domain-pipeline">
            <div class="dp-label">算法数据流</div>
            <div class="dp-chain">
              <template v-for="(node, idx) in algoDomains[activeDomain].pipeline" :key="node.name">
                <div class="dp-node" :class="{ expanded: expandedNode === idx }"
                  :style="{ '--domain-color': algoDomains[activeDomain].color, animationDelay: (0.15 + idx * 0.1) + 's' }"
                  @click="toggleNode(idx)">
                  <div class="dpn-badge">{{ idx + 1 }}</div>
                  <div class="dpn-name">{{ node.name }}</div>
                  <div class="dpn-role">{{ node.role }}</div>
                  <div v-if="expandedNode === idx" class="dpn-detail">
                    <div class="dpnd-section"><strong>选择理由</strong><br/>{{ node.why }}</div>
                    <div class="dpnd-section"><strong>对比方案</strong><br/>{{ node.contrast }}</div>
                  </div>
                </div>
                <div v-if="idx < algoDomains[activeDomain].pipeline.length - 1" class="dp-arrow"
                  :style="{ animationDelay: (0.2 + idx * 0.1) + 's' }">
                  <span class="dpa-line" />
                  <span class="dpa-head" />
                </div>
              </template>
            </div>
          </div>

          <!-- Scenario cards -->
          <div class="domain-scenarios">
            <div class="ds-label">应用场景</div>
            <div class="ds-grid">
              <div v-for="(sc, idx) in algoDomains[activeDomain].scenarios" :key="sc.name"
                class="ds-card" :class="{ expanded: expandedScenario === idx }"
                :style="{ '--domain-color': algoDomains[activeDomain].color, animationDelay: (0.35 + idx * 0.1) + 's' }"
                @click="toggleScenario(idx)">
                <div class="dsc-header">
                  <span class="dsc-name">{{ sc.name }}</span>
                  <span class="dsc-flow">{{ sc.flow }}</span>
                </div>
                <div v-if="expandedScenario === idx" class="dsc-detail">{{ sc.detail }}</div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="domain-tags">
            <span v-for="t in algoDomains[activeDomain].tags" :key="t" class="dt-tag"
              :style="{ '--domain-color': algoDomains[activeDomain].color }">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ SCENE 2: 体系架构 ═══════════ -->
    <div v-if="activeScene === 2" class="scene">
      <div class="scene-inner org-layout">
        <div class="org-header">
          <div class="org-title">顶层架构与核心决策体系</div>
          <div class="org-subtitle">三权分立 · 算法驱动 · 全链路闭环</div>
        </div>

        <!-- Top-level decision layer -->
        <div class="org-top">
          <div class="org-node root">核心决策层</div>
          <div class="org-connector-top">
            <span class="oc-line" />
          </div>
          <div class="org-triad">
            <div class="org-node chief">
              <div class="on-role">产品 & 顶层技术决策</div>
            </div>
            <div class="org-node tech">
              <div class="on-role">底层专项技术执行</div>
            </div>
            <div class="org-node biz">
              <div class="on-role">经营 & 风控 & 市场管控</div>
            </div>
          </div>
        </div>

        <!-- Bridge divider -->
        <div class="org-bridge">
          <span class="ob-line" />
          <span class="ob-diamond">◆</span>
          <span class="ob-line" />
        </div>

        <!-- Algorithm center (core profit) -->
        <div class="org-section">
          <div class="org-section-title profit">算法与软件中心 · 核心利润中心</div>
          <div class="org-grid profit">
            <div class="org-card" style="--card-color: var(--accent-primary)">
              <div class="oc-title">CV 视觉算法组</div>
              <div class="oc-items">YOLO / UNet / VLM<br>智能识别 · 自动报告生成</div>
            </div>
            <div class="org-card" style="--card-color: var(--accent-success)">
              <div class="oc-title">多源融合算法组</div>
              <div class="oc-items">地质灾害 · 土壤墒情<br>气象 · DEM/DSM 模型</div>
            </div>
            <div class="org-card" style="--card-color: var(--accent-warning)">
              <div class="oc-title">感知与时序算法组</div>
              <div class="oc-items">卡尔曼滤波 · HMM<br>LSTM-AE 日志诊断</div>
            </div>
            <div class="org-card" style="--card-color: var(--accent-info)">
              <div class="oc-title">产品化组</div>
              <div class="oc-items">方案封装 · 标准文档<br>行业对标 · 交付输出</div>
            </div>
          </div>
        </div>

        <!-- Hardware center (cost center) -->
        <div class="org-section">
          <div class="org-section-title cost">硬件交付中心 · 成本中心（执行层）</div>
          <div class="org-grid cost">
            <div class="org-card small">
              <div class="oc-title">硬件组装与维修</div>
              <div class="oc-items">标准化组装 · 设备维保</div>
            </div>
            <div class="org-card small">
              <div class="oc-title">野外飞行采集</div>
              <div class="oc-items">SOP 试飞 · 双光采集 · tlog 留存</div>
            </div>
            <div class="org-card small">
              <div class="oc-title">载荷标定</div>
              <div class="oc-items">可见光/热红外 · PPS · NUC</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════ SCENE 3: 全行业解决方案 · 星图星座 ═══════════ -->
    <div v-if="activeScene === 3" class="scene">
      <div class="scene-inner star-layout">
        <div class="industry-header">
          <div class="industry-title">全行业低空智能解决方案</div>
          <div class="industry-subtitle">十二大行业 · 星座互联 · 统一能力输出</div>
        </div>
        <div
          ref="starStage"
          class="star-stage"
          :class="{ grabbing: isDragging }"
          @mousedown="onStarDown"
          @mousemove="onStarMove"
          @mouseup="onStarUp"
          @mouseleave="onStarUp"
        >
          <canvas ref="starCanvas" class="star-canvas" />
          <!-- Hub -->
          <!-- Star nodes -->
          <div
            v-for="(node, idx) in starNodes"
            :key="node.id"
            class="star-node"
            :class="{ active: activeIndustry === idx }"
            :style="{
              '--sn-color': node.color,
              left: (50 + (projectedNodes[idx] || {sx:0}).sx * 42) + '%',
              top: (50 + (projectedNodes[idx] || {sy:0}).sy * 42) + '%',
              transform: 'translate(-50%, -50%) scale(' + (0.7 + (projectedNodes[idx] || {scale:0.5}).scale * 0.7) + ')',
              zIndex: Math.round((projectedNodes[idx] || {scale:0.5}).scale * 100),
              animationDelay: (0.06 * idx) + 's',
            }"
            @click.stop="selectIndustry(idx)"
          >
            <span class="sn-icon">{{ node.icon }}</span>
            <span class="sn-title">{{ node.title }}</span>
          </div>
        </div>
        <div class="detail-anchor">
          <transition name="detail-slide">
            <div v-if="activeIndustry !== null" :key="activeIndustry" class="industry-detail">
              <div class="detail-header">
                <span class="detail-industry-title">{{ starNodes[activeIndustry].icon }} {{ starNodes[activeIndustry].title }} · 深度解析</span>
              </div>
              <div class="detail-grid">
                <div class="detail-card">
                  <div class="dc-label">行业痛点</div>
                  <div class="dc-text">{{ starNodes[activeIndustry].pain }}</div>
                </div>
                <div class="detail-card">
                  <div class="dc-label">算法配置</div>
                  <div class="dc-text">{{ starNodes[activeIndustry].algoConfig }}</div>
                </div>
                <div class="detail-card">
                  <div class="dc-label">行业标准</div>
                  <div class="dc-text">{{ starNodes[activeIndustry].standard }}</div>
                </div>
                <div class="detail-card">
                  <div class="dc-label">核心指标</div>
                  <div class="dc-text">{{ starNodes[activeIndustry].metrics }}</div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- ═══════════ SCENE 4: 技术数据链路 ═══════════ -->
    <div v-if="activeScene === 4" class="scene">
      <div class="scene-inner pipeline-layout">
        <div class="pipeline-header">
          <div class="pipeline-title">端到端低空智能数据链路</div>
          <div class="pipeline-subtitle">从数据采集到决策输出的全流程闭环体系</div>
        </div>
        <div class="pipeline-chain">
          <template v-for="(node, idx) in [
            { no: '01', title: '无人机采集', items: ['双光吊舱载荷', 'RTK 厘米级定位', '飞行日志 tlog 留存'], color: 'var(--accent-primary)' },
            { no: '02', title: '实时视频推流', items: ['HLS / RTMP 双协议', '端到端低延迟传输', '断点续传容错机制'], color: 'var(--accent-info)' },
            { no: '03', title: 'CV 视觉识别', items: ['YOLO 目标检测', 'UNet 语义分割', 'VLM 视觉语言理解'], color: 'var(--accent-success)' },
            { no: '04', title: '多源数据融合', items: ['气象 & 地质数据接入', 'DEM/DSM 地形模型', '多模态时空对齐'], color: 'var(--accent-warning)' },
            { no: '05', title: '智能分析诊断', items: ['LSTM-AE 异常检测', '卡尔曼滤波轨迹修正', '风险等级自动评估'], color: 'var(--accent-danger)' },
            { no: '06', title: '报告自动输出', items: ['一键生成分析报告', '行业标准合规对标', '可视化决策支撑'], color: 'var(--accent-primary)' },
          ]" :key="node.title">
            <div class="pipe-node" :style="{ animationDelay: (0.1 + idx * 0.12) + 's', '--pipe-color': node.color }">
              <div class="pn-badge">{{ node.no }}</div>
              <div class="pn-title">{{ node.title }}</div>
              <div class="pn-items">
                <span v-for="it in node.items" :key="it" class="pn-item">{{ it }}</span>
              </div>
            </div>
            <div v-if="idx < 5" class="pipe-arrow" :style="{ animationDelay: (0.3 + idx * 0.12) + 's' }">
              <span class="pa-line" />
              <span class="pa-head" />
            </div>
          </template>
        </div>
        <div class="pipeline-summary">
          <div class="ps-card">
            <div class="ps-val">＜500ms</div>
            <div class="ps-label">端到端处理延迟</div>
          </div>
          <div class="ps-card">
            <div class="ps-val">＞95%</div>
            <div class="ps-label">算法识别准确率</div>
          </div>
          <div class="ps-card">
            <div class="ps-val">全流程</div>
            <div class="ps-label">数据可追溯审计</div>
          </div>
          <div class="ps-card">
            <div class="ps-val">6 层</div>
            <div class="ps-label">自动化流水线</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ SCENE 5: 品牌 ═══════════ -->
    <div v-if="activeScene === 5" class="scene">
      <div class="scene-inner brand-layout">
        <div class="brand-logo-wrap">
          <img src="/logo-icon.svg" alt="Skyveo" class="brand-logo" />
          <span v-for="(p, idx) in particles" :key="idx" class="bp" :style="{ left: p.x + '%', top: p.y + '%', '--px': p.px + 'px', '--py': p.py + 'px', animationDelay: p.delay + 's' }" />
        </div>
        <div class="brand-name">Skyveo</div>
        <div class="brand-sub">AI驱动的低空智能操作系统</div>
        <div class="brand-badges">
          <span v-for="(b, idx) in ['视频结构化', 'AI 识别', '实时推流', '数据可追溯']" :key="b" class="bb" :class="{ show: badgesVisible[idx] }">{{ b }}</span>
        </div>
        <button v-if="showEnter" class="enter-btn" @click="handleEnter">进入系统</button>
      </div>
    </div>

    <!-- Overlays -->
    <div v-if="activeScene < 6" class="pdots">
      <span v-for="i in 6" :key="i" class="pd" :class="{ on: activeScene === i - 1, past: activeScene > i - 1 }" />
    </div>
    <button v-if="showSkip" class="skip-btn" @click="handleSkip">跳过 ›</button>

    <!-- Global nav arrows -->
    <button v-if="activeScene > 0" class="nav-arrow prev" @click="goPrev">‹</button>
    <button v-if="activeScene < 5" class="nav-arrow next" @click="goNext">›</button>
  </div>
</template>

<style scoped>
/* ═══ OVERLAY ═══ */
.splash-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: #000;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.6s ease;
  overflow: hidden;
}
.splash-overlay.exiting { opacity: 0; pointer-events: none; }
.splash-bg { transition: opacity 0.3s ease; }

.scene { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; animation: sceneIn 0.4s ease-out; }
@keyframes sceneIn { from { opacity: 0; transform: translateY(32px); } }
@keyframes cardPop { to { opacity: 1; } }
.scene-inner { width: 100%; max-width: 2500px; padding: 0 100px; }

/* ═══════════ SCENE 0: 战略启动 ═══════════ */
.boot-layout { display: flex; flex-direction: column; align-items: center; gap: 40px; }
.boot-hero { text-align: center; margin-bottom: 16px; }
.boot-tagline {
  font-size: 52px; font-weight: 700; letter-spacing: 10px;
  background: linear-gradient(135deg, var(--accent-primary), #fff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 16px;
}
.boot-subtitle { font-size: 26px; color: var(--text-secondary); letter-spacing: 6px; }

.boot-terminal { width: 100%; max-width: 1600px; background: #0a0f0a; border: 1px solid rgba(0,255,0,0.2); border-radius: 14px; overflow: hidden; box-shadow: 0 0 120px rgba(0,255,0,0.08); }
.term-hd { display: flex; align-items: center; gap: 12px; padding: 16px 28px; background: #0d140d; border-bottom: 1px solid rgba(0,255,0,0.1); }
.tdot { width: 14px; height: 14px; border-radius: 50%; }
.tlabel { margin-left: 12px; font-family: var(--font-mono); font-size: 20px; color: rgba(0,255,0,0.4); letter-spacing: 2px; }
.term-bd { padding: 40px 48px; min-height: 320px; }
.tline { font-family: var(--font-mono); font-size: 24px; line-height: 2.3; color: rgba(0,255,0,0.35); margin: 0; }
.tline.dim { font-size: 22px; }
.grn { color: #0f0; }
.cur { display: inline-block; width: 12px; height: 26px; background: #0f0; vertical-align: middle; margin-left: 2px; animation: blinker 0.7s step-end infinite; }
@keyframes blinker { 0%,100%{opacity:1} 50%{opacity:0} }

.boot-bar-wrap { width: 100%; max-width: 1600px; display: flex; align-items: center; gap: 24px; }
.boot-bar { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
.boot-bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #0f0, var(--accent-primary)); transition: width 0.5s ease; }
.boot-pct { font-family: var(--font-mono); font-size: 20px; color: rgba(255,255,255,0.3); letter-spacing: 2px; min-width: 48px; }

.boot-checks { display: flex; gap: 36px; flex-wrap: wrap; justify-content: center; }
.chk { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 20px; color: rgba(255,255,255,0.2); transition: color 0.3s; }
.chk.ok { color: #0f0; }
.chk-dot { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
.chk-off { width: 8px; height: 8px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); }
.chk-on { width: 14px; height: 14px; border-radius: 50%; background: #0f0; box-shadow: 0 0 10px #0f0; }
.chk-st { font-weight: 600; min-width: 28px; text-align: right; }

/* ═══════════ SCENE 1: 算法深度解析 ═══════════ */
.algo-layout { display: flex; flex-direction: column; align-items: center; gap: 28px; }
.algo-header { text-align: center; }
.algo-title { font-size: 42px; font-weight: 700; color: var(--text-primary); letter-spacing: 6px; margin-bottom: 8px; }
.algo-subtitle { font-size: 17px; color: var(--text-secondary); letter-spacing: 2px; }

/* ---- Domain tabs ---- */
.algo-tabs { display: flex; gap: 12px; justify-content: center; }
.algo-tab {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 32px; border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.35);
  font-size: 19px; letter-spacing: 2px;
  cursor: pointer; transition: all 0.25s ease;
}
.algo-tab:hover {
  color: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.06);
}
.algo-tab.active {
  color: var(--tab-color, var(--accent-primary));
  border-color: color-mix(in oklab, var(--tab-color, var(--accent-primary)) 50%, transparent);
  background: color-mix(in oklab, var(--tab-color, var(--accent-primary)) 12%, transparent);
  box-shadow: 0 0 28px color-mix(in oklab, var(--tab-color, var(--accent-primary)) 15%, transparent);
}
.at-icon { font-size: 22px; }
.at-label { font-weight: 600; }

/* ---- Stage (animated domain content) ---- */
.algo-stage {
  width: 100%; max-width: 2200px;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
  perspective: 1200px;
  animation: heavyDrop 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
@keyframes heavyDrop {
  0%   { opacity: 0; transform: translateY(-320px) scale(0.92) rotateX(12deg); }
  50%  { opacity: 1; transform: translateY(14px) scale(1.015) rotateX(-2deg); }
  68%  { transform: translateY(-8px) scale(0.992) rotateX(1deg); }
  84%  { transform: translateY(3px) scale(1.003); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
}

/* ---- Domain hero ---- */
.domain-hero { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; justify-content: center; }
.dh-icon { font-size: 32px; }
.dh-title { font-size: 36px; font-weight: 700; color: var(--text-primary); letter-spacing: 3px; }
.dh-thesis { font-size: 17px; color: var(--text-secondary); letter-spacing: 1px; }

/* ---- Why card ---- */
.domain-why {
  width: 100%; max-width: 2000px;
  background: color-mix(in oklab, var(--bg-card) 18%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in oklab, var(--border-default) 25%, transparent);
  border-left: 4px solid var(--domain-color, var(--accent-primary));
  border-radius: 12px; padding: 24px 32px;
  animation: stageItemIn 0.5s ease-out 0.08s both;
}
.dw-label { font-size: 15px; font-weight: 700; color: var(--domain-color, var(--accent-primary)); letter-spacing: 3px; margin-bottom: 10px; }
.dw-text { font-size: 17px; color: var(--text-secondary); line-height: 1.85; }

/* ---- Pipeline ---- */
.domain-pipeline { width: 100%; max-width: 2200px; }
.dp-label { font-size: 15px; font-weight: 700; color: var(--text-muted); letter-spacing: 3px; margin-bottom: 16px; text-align: center; }
.dp-chain { display: flex; align-items: flex-start; justify-content: center; }
.dp-node {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: color-mix(in oklab, var(--bg-card) 16%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid color-mix(in oklab, var(--border-default) 20%, transparent);
  border-top: 3px solid var(--domain-color, var(--accent-primary));
  border-radius: 12px; padding: 20px 18px;
  width: 250px; text-align: center;
  cursor: pointer;
  opacity: 0; animation: stageItemIn 0.5s ease-out forwards;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.dp-node:hover {
  border-color: var(--domain-color, var(--accent-primary));
  box-shadow: 0 0 32px color-mix(in oklab, var(--domain-color, var(--accent-primary)) 18%, transparent);
  transform: translateY(-4px);
}
.dp-node.expanded {
  border-color: var(--domain-color, var(--accent-primary));
  box-shadow: 0 0 36px color-mix(in oklab, var(--domain-color, var(--accent-primary)) 20%, transparent);
}
.dpn-badge {
  width: 36px; height: 36px; border-radius: 50%;
  background: color-mix(in oklab, var(--domain-color, var(--accent-primary)) 18%, transparent);
  border: 1px solid var(--domain-color, var(--accent-primary));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 16px; font-weight: 700;
  color: var(--domain-color, var(--accent-primary));
}
.dpn-name { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 2px; }
.dpn-role { font-size: 14px; color: var(--text-secondary); letter-spacing: 1px; }
.dpn-detail {
  margin-top: 10px; padding-top: 14px;
  border-top: 1px solid color-mix(in oklab, var(--border-default) 20%, transparent);
  text-align: left; width: 100%;
  animation: detailIn 0.3s ease-out;
}
@keyframes detailIn { from { opacity: 0; transform: translateY(-8px); } }
.dpnd-section { font-size: 14px; color: var(--text-secondary); line-height: 1.65; margin-bottom: 10px; }
.dpnd-section strong { color: var(--domain-color, var(--accent-primary)); font-size: 13px; letter-spacing: 1px; }

/* Pipeline arrows */
.dp-arrow {
  display: flex; align-items: center; flex-shrink: 0;
  padding: 0 8px; margin-top: 32px;
  opacity: 0; animation: stageItemIn 0.5s ease-out forwards;
}
.dpa-line { display: block; width: 26px; height: 2px; background: color-mix(in oklab, var(--domain-color, var(--accent-primary)) 40%, transparent); }
.dpa-head {
  display: block; width: 0; height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 9px solid color-mix(in oklab, var(--domain-color, var(--accent-primary)) 50%, transparent);
}

/* ---- Scenario cards ---- */
.domain-scenarios { width: 100%; max-width: 2200px; }
.ds-label { font-size: 15px; font-weight: 700; color: var(--text-muted); letter-spacing: 3px; margin-bottom: 14px; text-align: center; }
.ds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ds-card {
  background: color-mix(in oklab, var(--bg-card) 16%, transparent);
  backdrop-filter: blur(4px);
  border: 1px solid color-mix(in oklab, var(--border-default) 20%, transparent);
  border-radius: 10px; padding: 20px 24px; text-align: center;
  cursor: pointer;
  opacity: 0; animation: stageItemIn 0.5s ease-out forwards;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.ds-card:hover {
  border-color: var(--domain-color, var(--accent-primary));
  box-shadow: 0 0 24px color-mix(in oklab, var(--domain-color, var(--accent-primary)) 14%, transparent);
  transform: translateY(-3px);
}
.ds-card.expanded {
  border-color: var(--domain-color, var(--accent-primary));
  box-shadow: 0 0 28px color-mix(in oklab, var(--domain-color, var(--accent-primary)) 16%, transparent);
}
.dsc-header { display: flex; flex-direction: column; gap: 6px; }
.dsc-name { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 2px; }
.dsc-flow {
  font-family: var(--font-mono); font-size: 14px;
  color: var(--domain-color, var(--accent-primary));
  letter-spacing: 1px; opacity: 0.8;
}
.dsc-detail {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid color-mix(in oklab, var(--border-default) 15%, transparent);
  font-size: 15px; color: var(--text-secondary); line-height: 1.7;
  animation: detailIn 0.3s ease-out;
}

/* ---- Tags ---- */
.domain-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.dt-tag {
  padding: 6px 14px; border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--domain-color, var(--accent-primary)) 25%, transparent);
  font-size: 14px; color: var(--domain-color, var(--accent-primary));
  letter-spacing: 1px;
  opacity: 0; animation: stageItemIn 0.5s ease-out forwards;
}

/* Shared stage-item entrance */
@keyframes stageItemIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* ═══════════ SCENE 2: 体系架构 ═══════════ */
.org-layout { display: flex; flex-direction: column; align-items: center; gap: 32px; animation: sceneIn 0.4s ease-out 0.05s both; }
.org-header { text-align: center; margin-bottom: 6px; }
.org-title { font-size: 42px; font-weight: 700; color: var(--text-primary); letter-spacing: 5px; margin-bottom: 10px; }
.org-subtitle { font-size: 18px; color: var(--text-secondary); letter-spacing: 3px; }

/* Top decision layer */
.org-top { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.org-node { text-align: center; border-radius: 12px; padding: 18px 42px; }
.org-node.root {
  background: color-mix(in oklab, var(--accent-primary) 18%, transparent);
  border: 2px solid var(--accent-primary);
  font-size: 26px; font-weight: 700; color: var(--accent-primary);
  letter-spacing: 8px;
  box-shadow: 0 0 36px color-mix(in oklab, var(--accent-primary) 20%, transparent);
}
.org-connector-top { display: flex; justify-content: center; }
.oc-line { width: 3px; height: 32px; background: linear-gradient(180deg, var(--accent-primary), color-mix(in oklab, var(--accent-primary) 30%, transparent)); }

.org-triad { display: flex; gap: 36px; flex-wrap: wrap; justify-content: center; }
.org-node.chief {
  background: color-mix(in oklab, var(--accent-primary) 12%, transparent);
  border: 2px solid color-mix(in oklab, var(--accent-primary) 50%, transparent);
  box-shadow: 0 0 25px color-mix(in oklab, var(--accent-primary) 12%, transparent);
}
.org-node.tech {
  background: color-mix(in oklab, var(--accent-success) 12%, transparent);
  border: 2px solid color-mix(in oklab, var(--accent-success) 50%, transparent);
  box-shadow: 0 0 20px color-mix(in oklab, var(--accent-success) 10%, transparent);
}
.org-node.biz {
  background: color-mix(in oklab, var(--accent-warning) 12%, transparent);
  border: 2px solid color-mix(in oklab, var(--accent-warning) 50%, transparent);
  box-shadow: 0 0 20px color-mix(in oklab, var(--accent-warning) 10%, transparent);
}
.on-role { font-size: 16px; color: var(--text-secondary); letter-spacing: 2px; margin-bottom: 4px; }
.on-name { font-size: 18px; font-weight: 600; color: var(--text-primary); letter-spacing: 2px; }

/* Bridge divider */
.org-bridge { display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%; max-width: 1800px; }
.ob-line { flex: 1; height: 2px; background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent-primary) 40%, transparent), transparent); }
.ob-diamond { font-size: 20px; color: var(--accent-primary); opacity: 0.6; }

/* Section */
.org-section { width: 100%; max-width: 2000px; }
.org-section-title {
  text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 4px;
  padding: 12px 32px; border-radius: 999px; margin-bottom: 22px;
}
.org-section-title.profit {
  color: var(--accent-primary);
  border: 1px solid color-mix(in oklab, var(--accent-primary) 30%, transparent);
  background: color-mix(in oklab, var(--accent-primary) 10%, transparent);
  box-shadow: 0 0 32px color-mix(in oklab, var(--accent-primary) 15%, transparent);
}
.org-section-title.cost {
  color: var(--text-muted);
  border: 1px solid color-mix(in oklab, var(--border-default) 30%, transparent);
  background: color-mix(in oklab, var(--bg-card) 18%, transparent);
}

.org-grid { display: grid; gap: 18px; }
.org-grid.profit { grid-template-columns: repeat(4, 1fr); }
.org-grid.cost { grid-template-columns: repeat(3, 1fr); }
.org-card {
  background: color-mix(in oklab, var(--bg-card) 22%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid color-mix(in oklab, var(--border-default) 30%, transparent);
  border-top: 3px solid var(--card-color, var(--border-default));
  border-radius: 12px; padding: 22px 20px; text-align: center;
  opacity: 0; animation: cardPop 0.4s ease-out forwards;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.org-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.org-card.small { border-top-color: var(--border-default); opacity: 0.7; }
.oc-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; letter-spacing: 1px; }
.oc-items { font-size: 16px; color: var(--text-secondary); line-height: 1.8; }

/* ═══════════ SCENE 3: 全行业解决方案 · 星图星座 ═══════════ */
.star-layout { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.industry-header { text-align: center; }
.industry-title { font-size: 42px; font-weight: 700; color: var(--text-primary); letter-spacing: 6px; margin-bottom: 6px; }
.industry-subtitle { font-size: 18px; color: var(--text-secondary); letter-spacing: 2px; }

/* ---- Star Stage ---- */
.star-stage {
  position: relative;
  width: 100%; height: 680px;
  cursor: grab; user-select: none;
  overflow: hidden;
}
.star-stage.grabbing { cursor: grabbing; }
.star-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

/* ---- Hub ---- */
.star-hub {
  position: absolute;
  padding: 20px 34px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in oklab, var(--bg-card) 38%, transparent) 0%, color-mix(in oklab, var(--bg-card) 15%, transparent) 100%);
  backdrop-filter: blur(14px);
  border: 2px solid color-mix(in oklab, var(--accent-primary) 50%, transparent);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  pointer-events: none;
  animation: hubGlow 3s ease-in-out infinite;
}
@keyframes hubGlow {
  0%, 100% { box-shadow: 0 0 60px color-mix(in oklab, var(--accent-primary) 25%, transparent), 0 0 120px color-mix(in oklab, var(--accent-primary) 10%, transparent); }
  50% { box-shadow: 0 0 90px color-mix(in oklab, var(--accent-primary) 38%, transparent), 0 0 180px color-mix(in oklab, var(--accent-primary) 18%, transparent); }
}
.sh-icon { font-size: 48px; line-height: 1; }
.sh-label { font-size: 16px; font-weight: 600; color: var(--text-primary); text-align: center; line-height: 1.5; letter-spacing: 3px; white-space: nowrap; }

/* ---- Star Nodes ---- */
.star-node {
  position: absolute;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 24px;
  border-radius: 16px;
  background: color-mix(in oklab, var(--bg-card) 20%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in oklab, var(--border-default) 25%, transparent);
  cursor: pointer;
  animation: stardustIn 0.6s ease-out both;
  transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
}
@keyframes stardustIn {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.15); filter: blur(8px); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: blur(0); }
  75% { transform: translate(-50%, -50%) scale(0.96); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
.star-node:hover {
  border-color: var(--sn-color, var(--accent-primary));
  box-shadow: 0 0 48px color-mix(in oklab, var(--sn-color, var(--accent-primary)) 28%, transparent);
  background: color-mix(in oklab, var(--bg-card) 32%, transparent);
  z-index: 999 !important;
}
.star-node.active {
  border-color: var(--sn-color, var(--accent-primary));
  box-shadow: 0 0 72px color-mix(in oklab, var(--sn-color, var(--accent-primary)) 40%, transparent), 0 0 140px color-mix(in oklab, var(--sn-color, var(--accent-primary)) 15%, transparent);
  background: color-mix(in oklab, var(--bg-card) 40%, transparent);
}

.star-node::after {
  content: '';
  position: absolute;
  inset: -8px; border-radius: 22px;
  pointer-events: none; opacity: 0;
  transition: opacity 0.4s;
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--sn-color) 6%, transparent);
}
.star-node.active::after {
  opacity: 1;
  animation: starPulse 1.2s ease-out infinite;
}
@keyframes starPulse {
  0% { box-shadow: 0 0 0 1px color-mix(in oklab, var(--sn-color) 30%, transparent); }
  100% { box-shadow: 0 0 0 20px transparent; }
}

.sn-icon { font-size: 34px; line-height: 1; pointer-events: none; }
.sn-title { font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: 3px; white-space: nowrap; pointer-events: none; }

/* ---- Detail Panel (preserved) ---- */
.detail-anchor { width: 100%; max-width: 2000px; min-height: 120px; }
.industry-detail {
  display: flex; flex-direction: column; gap: 18px;
  padding: 24px 28px;
  background: color-mix(in oklab, var(--bg-card) 16%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in oklab, var(--border-default) 20%, transparent);
  border-radius: 16px;
}
.detail-header { text-align: center; margin-bottom: 4px; }
.detail-industry-title { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: 4px; }
.detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.detail-card {
  background: color-mix(in oklab, var(--bg-card) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--border-default) 15%, transparent);
  border-radius: 12px; padding: 18px 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.detail-card:hover {
  border-color: color-mix(in oklab, var(--accent-primary) 30%, transparent);
  box-shadow: 0 0 24px color-mix(in oklab, var(--accent-primary) 8%, transparent);
}
.dc-label {
  font-size: 15px; font-weight: 700; color: var(--accent-primary);
  letter-spacing: 3px; margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in oklab, var(--accent-primary) 20%, transparent);
}
.dc-text { font-size: 15px; color: var(--text-secondary); line-height: 1.9; }

.detail-slide-enter-active { animation: detailIn 0.35s ease-out; }
.detail-slide-leave-active { animation: detailIn 0.25s ease-in reverse; }
@keyframes detailIn { from { opacity: 0; transform: translateY(24px); } }

/* ═══════════ SCENE 4: 技术数据链路 ═══════════ */
.pipeline-layout { display: flex; flex-direction: column; align-items: center; gap: 36px; }
.pipeline-header { text-align: center; }
.pipeline-title { font-size: 42px; font-weight: 700; color: var(--text-primary); letter-spacing: 6px; margin-bottom: 10px; }
.pipeline-subtitle { font-size: 18px; color: var(--text-secondary); letter-spacing: 2px; }

.pipeline-chain { display: flex; align-items: flex-start; justify-content: center; gap: 0; width: 100%; max-width: 2200px; }

.pipe-node {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  background: color-mix(in oklab, var(--bg-card) 20%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in oklab, var(--border-default) 25%, transparent);
  border-top: 3px solid var(--pipe-color, var(--accent-primary));
  border-radius: 14px; padding: 22px 16px; width: 260px; text-align: center;
  opacity: 0; animation: pipePop 0.5s ease-out forwards;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.pipe-node:hover {
  border-color: var(--pipe-color, var(--accent-primary));
  box-shadow: 0 0 40px color-mix(in oklab, var(--pipe-color, var(--accent-primary)) 22%, transparent);
  transform: translateY(-5px);
}
@keyframes pipePop { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.pn-badge {
  width: 44px; height: 44px; border-radius: 50%;
  background: color-mix(in oklab, var(--pipe-color, var(--accent-primary)) 22%, transparent);
  border: 2px solid var(--pipe-color, var(--accent-primary));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 18px; font-weight: 700;
  color: var(--pipe-color, var(--accent-primary));
  letter-spacing: 1px;
}
.pn-title { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 2px; }
.pn-items { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.pn-item {
  font-size: 15px; color: var(--text-secondary); line-height: 1.7;
  padding: 4px 0; border-bottom: 1px solid color-mix(in oklab, var(--border-default) 12%, transparent);
}

.pipe-arrow {
  display: flex; align-items: center; flex-shrink: 0;
  padding: 0 4px; margin-top: 38px;
  opacity: 0; animation: arrowShow 0.4s ease-out forwards;
}
@keyframes arrowShow { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
.pa-line { display: block; width: 28px; height: 2px; background: color-mix(in oklab, var(--accent-primary) 50%, transparent); }
.pa-head {
  display: block; width: 0; height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid color-mix(in oklab, var(--accent-primary) 60%, transparent);
}

/* Pipeline summary cards */
.pipeline-summary { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; }
.ps-card {
  text-align: center;
  background: color-mix(in oklab, var(--bg-card) 18%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid color-mix(in oklab, var(--border-default) 25%, transparent);
  border-radius: 14px; padding: 22px 44px;
  opacity: 0; animation: cardPop 0.5s ease-out 0.8s forwards;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.ps-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 32px color-mix(in oklab, var(--accent-primary) 18%, transparent);
}
.ps-val {
  font-family: var(--font-mono); font-size: 30px; font-weight: 700;
  color: var(--accent-primary); letter-spacing: 2px; margin-bottom: 6px;
}
.ps-label { font-size: 16px; color: var(--text-muted); letter-spacing: 2px; }

/* ═══════════ SCENE 5: 品牌 ═══════════ */
.brand-layout { text-align: center; animation: sceneIn 0.6s ease-out 0.1s both; }
.brand-logo-wrap { position: relative; display: inline-block; margin-bottom: 40px; }
.brand-logo { width: 180px; height: 180px; object-fit: contain; filter: drop-shadow(0 0 48px color-mix(in oklab, var(--accent-primary) 55%, transparent)); position: relative; z-index: 1; animation: logoPulse 2s ease-in-out infinite; }
@keyframes logoPulse { 0%,100%{filter:drop-shadow(0 0 40px color-mix(in oklab, var(--accent-primary) 40%, transparent))} 50%{filter:drop-shadow(0 0 80px color-mix(in oklab, var(--accent-primary) 70%, transparent))} }
.bp { position: absolute; z-index: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); animation: pOut 1.2s ease-out both; }
@keyframes pOut { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--px),var(--py)) scale(0)} }
.brand-name { font-size: 100px; font-weight: 800; letter-spacing: 14px; background: linear-gradient(135deg, var(--accent-primary), #fff, var(--accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; margin-bottom: 24px; }
@keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
.brand-slogan { font-size: 48px; font-weight: 700; color: var(--text-primary); letter-spacing: 12px; margin-bottom: 12px; }
.brand-sub { font-size: 30px; color: var(--text-secondary); letter-spacing: 8px; margin-bottom: 52px; }
.brand-badges { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 44px; }
.bb { padding: 14px 36px; border-radius: 999px; border: 1px solid var(--border-default); font-size: 24px; color: var(--text-secondary); opacity: 0; transform: translateY(12px); transition: all 0.5s ease; }
.bb.show { opacity: 1; transform: translateY(0); }

/* ═══ OVERLAYS ═══ */
.pdots { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; gap: 20px; z-index: 10; }
.pd { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.4s ease; }
.pd.on { background: var(--accent-primary); box-shadow: 0 0 16px var(--accent-primary); transform: scale(1.4); }
.pd.past { background: var(--accent-success); }

.skip-btn { position: fixed; bottom: 56px; right: 72px; z-index: 20; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.4); padding: 16px 40px; border-radius: 12px; font-size: 24px; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
.skip-btn:hover { color: #fff; border-color: rgba(255,255,255,0.5); }

.nav-arrow {
  position: fixed; top: 50%; transform: translateY(-50%);
  z-index: 30;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.35);
  font-size: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  line-height: 1;
  padding: 0;
}
.nav-arrow:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.08);
}
.nav-arrow.prev { left: 40px; }
.nav-arrow.next { right: 40px; }

.enter-btn { display: inline-block; margin-top: 52px; padding: 24px 100px; border: 2px solid var(--accent-primary); border-radius: 16px; background: color-mix(in oklab, var(--accent-primary) 15%, transparent); color: var(--accent-primary); font-size: 32px; letter-spacing: 10px; cursor: pointer; transition: all 0.3s ease; animation: enterPulse 2s ease-in-out infinite; }
.enter-btn:hover { background: var(--accent-primary); color: #000; box-shadow: 0 0 60px color-mix(in oklab, var(--accent-primary) 55%, transparent); }
@keyframes enterPulse { 0%,100%{box-shadow:0 0 14px color-mix(in oklab, var(--accent-primary) 30%, transparent)} 50%{box-shadow:0 0 48px color-mix(in oklab, var(--accent-primary) 55%, transparent)} }
</style>
