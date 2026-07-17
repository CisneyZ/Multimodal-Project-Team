import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Clapperboard,
  FileText,
  Film,
  Headphones,
  User,
  type LucideIcon,
} from 'lucide-react';

interface V11InfoFormProps {
  onSubmit: (info: {
    name: string;
    candidateId: string;
    targetRole: string;
    evaluatorName: string;
  }) => void;
}

type Dimension = {
  code: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  points: string[];
  icon: LucideIcon;
};

const DIMENSIONS: Dimension[] = [
  {
    code: 'film_theory',
    title: '影视基础理论',
    shortTitle: '影视基础',
    summary: '理解作品类型、主题表达、受众定位与基础创作语言。',
    description:
      '这一维度关注新人能否用影视行业的基础语言理解作品：它属于什么类型，面向什么观众，核心主题是什么，以及创作者如何通过人物、场景、节奏和视听元素传递信息。它不是考记忆，而是看新人是否具备进入影视项目讨论的共同语境。',
    points: ['类型判断', '主题表达', '受众定位'],
    icon: Clapperboard,
  },
  {
    code: 'visual_language',
    title: '视听语言应用',
    shortTitle: '视听语言',
    summary: '评估镜头、构图、声音、剪辑节奏与画面表达。',
    description:
      '这一维度看新人是否能把镜头、构图、光线、色彩、声音和剪辑节奏转化为表达判断，而不是只停留在“好看”或“有感觉”。优秀回答通常能说明视听选择如何服务情绪、信息密度、人物关系和观看节奏。',
    points: ['镜头构图', '剪辑节奏', '声音情绪'],
    icon: Headphones,
  },
  {
    code: 'script_narrative',
    title: '剧本叙事拆解',
    shortTitle: '剧本叙事',
    summary: '拆解人物目标、冲突结构、情节推进和短内容钩子。',
    description:
      '这一维度观察新人能否抓住故事发动机：人物想要什么，阻碍来自哪里，关键转折如何推动观众继续观看，以及短内容场景下哪些信息要被前置。它直接关系到新人能否参与选题、脚本修改和内容复盘。',
    points: ['人物目标', '冲突升级', '结构转折'],
    icon: FileText,
  },
  {
    code: 'aigc_business',
    title: 'AIGC 业务认知',
    shortTitle: 'AIGC 认知',
    summary: '判断 AI 工具在内容生产流程中的应用边界与价值。',
    description:
      '这一维度评估新人是否理解 AIGC 在影视内容生产中的合理使用方式，包括资料整理、创意发散、初稿生成、风险识别、人工复核和交付边界。重点不是会不会使用某个工具，而是能否把 AI 放进真实业务流程里协同提效。',
    points: ['工具边界', '流程协作', '风险复核'],
    icon: Bot,
  },
  {
    code: 'analysis',
    title: '综合分析与项目反馈',
    shortTitle: '综合分析',
    summary: '综合评估分析、判断、反馈表达与问题解决能力。',
    description:
      '这一维度看新人是否能从项目目标、用户场景、交付质量和风险优先级出发，把观察转化为清晰、可执行的反馈建议。它尤其适合识别未来能参与复盘、评审和跨角色沟通的潜力。',
    points: ['问题判断', '沟通反馈', '复盘闭环'],
    icon: BarChart3,
  },
];

const V11InfoForm: React.FC<V11InfoFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [activeDimensionCode, setActiveDimensionCode] = useState(DIMENSIONS[0].code);

  const activeDimension = useMemo(
    () => DIMENSIONS.find((dimension) => dimension.code === activeDimensionCode) ?? DIMENSIONS[0],
    [activeDimensionCode],
  );

  const canStart = name.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canStart) return;

    onSubmit({
      name: name.trim(),
      candidateId: candidateId.trim(),
      targetRole: activeDimension.title,
      evaluatorName: evaluatorName.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="muchen-shell relative isolate mx-auto min-h-[calc(100vh-80px)] max-w-[1500px] overflow-hidden px-6 pb-16 pt-8 lg:px-10"
    >
      <div className="pointer-events-none absolute right-[-34%] top-[-32%] -z-10 h-[1040px] w-[1040px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.28),rgba(47,128,255,0.13)_36%,rgba(139,77,255,0.08)_52%,rgba(2,2,4,0)_72%)] opacity-80 blur-[92px]" />
      <div className="pointer-events-none absolute left-[-8%] top-[14%] -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,77,255,0.2),rgba(2,2,4,0)_70%)] blur-[76px]" />

      <section
        id="assessment-intro"
        className="grid min-h-[590px] items-center gap-12 lg:grid-cols-[1.06fr_440px]"
      >
        <div className="max-w-4xl lg:-translate-y-10">
          <div className="mb-8 inline-flex items-center gap-3 text-sm font-semibold text-[#a56cff]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#9857ff] shadow-[0_0_18px_rgba(152,87,255,0.95)]" />
            影视人才五维测评
          </div>

          <h1 className="max-w-5xl text-[clamp(52px,6vw,88px)] font-black leading-[1.08] tracking-normal text-white">
            用五维测评
            <span className="mt-2 block bg-gradient-to-r from-[#9a4dff] via-[#4f73ff] to-[#00c8ff] bg-clip-text text-transparent">
              定位影视人才能力
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-white/52">
            面向影视内容、AIGC 创作与项目协作场景的专业测评系统，帮助新人理解能力结构，也帮助管理者形成更清晰的培养判断。
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => document.getElementById('start-assessment')?.scrollIntoView({ behavior: 'smooth' })}
              className="muchen-primary-btn group inline-flex h-14 min-w-44 items-center justify-center gap-3 rounded-lg px-7 text-base font-bold"
            >
              开始测评
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('dimension-guide')?.scrollIntoView({ behavior: 'smooth' })}
              className="muchen-secondary-btn inline-flex h-14 min-w-44 items-center justify-center rounded-lg px-7 text-base font-semibold"
            >
              查看测评维度
            </button>
          </div>
        </div>

        <div
          id="start-assessment"
          className="muchen-glass relative overflow-hidden rounded-2xl p-7"
        >
          <div className="pointer-events-none absolute -right-52 -top-52 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.22),rgba(139,77,255,0.1)_42%,rgba(2,2,4,0)_72%)] opacity-85 blur-[110px]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/38 to-transparent" />
          <div className="relative mb-7 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#65c7ff]">Assessment Entry</p>
              <h2 className="mt-2 text-2xl font-bold text-white">进入测评</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-[#65c7ff]">
              <User className="h-6 w-6" />
            </div>
          </div>

          <div className="relative space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/66">
                姓名 <span className="text-[#77ceff]">*</span>
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="请输入姓名"
                className="muchen-input h-12 w-full rounded-lg px-4 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/66">候选人编号</span>
              <input
                value={candidateId}
                onChange={(event) => setCandidateId(event.target.value)}
                placeholder="选填"
                className="muchen-input h-12 w-full rounded-lg px-4 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/66">评估人</span>
              <input
                value={evaluatorName}
                onChange={(event) => setEvaluatorName(event.target.value)}
                placeholder="选填"
                className="muchen-input h-12 w-full rounded-lg px-4 text-sm"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canStart}
            className="muchen-primary-btn relative mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
          >
            进入测评
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="relative mt-7 rounded-xl border border-white/10 bg-black/22 p-4">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/36">
              Capability Signal
            </div>
            {[72, 56, 84, 64, 78].map((value, index) => (
              <div key={index} className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-white/8 last:mb-0">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b4dff] to-[#00c8ff]"
                  style={{ width: `${value}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dimension-guide" className="pt-7">
        <div className="grid gap-4 xl:grid-cols-5">
          {DIMENSIONS.map((dimension) => {
            const Icon = dimension.icon;
            const isActive = activeDimension.code === dimension.code;
            return (
              <button
                key={dimension.code}
                type="button"
                onClick={() => setActiveDimensionCode(dimension.code)}
                className={`muchen-border-flow group min-h-[230px] rounded-2xl p-6 text-left transition duration-300 hover:-translate-y-1 ${
                  isActive ? 'muchen-border-flow-active bg-white/[0.075]' : 'bg-white/[0.038]'
                }`}
              >
                <span className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#227dff]/16 blur-3xl transition duration-500 group-hover:bg-[#8b4dff]/22" />

                <span className="flex items-center justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                      isActive
                        ? 'border-[#7b4dff]/45 bg-[#7b4dff]/16 text-[#8fdcff]'
                        : 'border-white/12 bg-black/24 text-[#8fdcff]'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowRight className="h-5 w-5 text-white/30 transition duration-300 group-hover:translate-x-1 group-hover:text-white/70" />
                </span>

                <span className="mt-8 block text-xl font-semibold text-white">{dimension.shortTitle}</span>
                <span className="mt-4 block text-sm leading-6 text-white/48">{dimension.summary}</span>
              </button>
            );
          })}
        </div>

        <div className="muchen-border-flow muchen-border-flow-active mt-5 grid gap-5 rounded-2xl p-6 backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex gap-5">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-black/24 text-[#65c7ff] sm:flex">
              <Film className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#8b8fff]">当前查看维度</p>
              <h2 className="mt-2 text-3xl font-bold text-white">{activeDimension.title}</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-white/56">{activeDimension.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap content-start gap-3">
            {activeDimension.points.map((point) => (
              <span
                key={point}
                className="rounded-full border border-white/12 bg-black/24 px-4 py-2 text-sm font-medium text-white/70"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>
    </form>
  );
};

export default V11InfoForm;
