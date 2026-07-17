import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Library,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  talentApi,
  type TalentAssessmentDetail,
  type TalentCandidate,
  type TalentDashboard,
  type TalentProject,
  type TalentReport,
  type TalentRule,
} from '../../api/talent';

type WorkspaceTab = 'dashboard' | 'projects' | 'candidates' | 'assessment' | 'reports' | 'pool' | 'settings';

const TABS: Array<{ key: WorkspaceTab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: '数据看板', icon: <Database className="h-4 w-4" /> },
  { key: 'projects', label: '项目与规则', icon: <FileText className="h-4 w-4" /> },
  { key: 'candidates', label: '候选人', icon: <Users className="h-4 w-4" /> },
  { key: 'assessment', label: '测评复核', icon: <Bot className="h-4 w-4" /> },
  { key: 'reports', label: '评估报告', icon: <Sparkles className="h-4 w-4" /> },
  { key: 'pool', label: '人才库', icon: <Library className="h-4 w-4" /> },
  { key: 'settings', label: 'Agent 设置', icon: <Search className="h-4 w-4" /> },
];

const emptyProject = { name: '', code: '', description: '', recommendedRole: '', durationRequirement: '', confidentialityRequirement: '', referenceDailyPrice: 450, partTimeAllowed: false };
const demoResume = '候选人，本科，浙江传媒学院广播电视编导专业，3年影视剪辑和短片编导经验。作品：剧情短片《夜路》担任剪辑和分镜，广告片《城市光》负责粗剪。熟悉拉片、构图、影调、叙事节奏；参与过视频大模型 Caption 标注质检 4 个月。希望全职，可支持6个月以上，理解 L4 保密要求。';

const primaryAction = 'inline-flex items-center justify-center gap-1.5 rounded-full bg-[#007aff] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(0,122,255,0.20)] transition hover:bg-[#006ee6] disabled:cursor-not-allowed disabled:opacity-45';
const secondaryAction = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition hover:border-[#007aff]/35 hover:text-[#007aff] disabled:cursor-not-allowed disabled:opacity-45';
const subtleAction = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-[#3a3a3c] transition hover:bg-white hover:text-[#007aff]';
const textareaClass = 'w-full rounded-[18px] border border-[#d2d2d7] bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none transition placeholder:text-[#a1a1a6] focus:border-[#007aff]/55 focus:ring-4 focus:ring-[#007aff]/10';

const TalentAgentMvp: React.FC = () => {
  const [tab, setTab] = useState<WorkspaceTab>('dashboard');
  const [dashboard, setDashboard] = useState<TalentDashboard | null>(null);
  const [projects, setProjects] = useState<TalentProject[]>([]);
  const [candidates, setCandidates] = useState<TalentCandidate[]>([]);
  const [reports, setReports] = useState<TalentReport[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [assessment, setAssessment] = useState<TalentAssessmentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const [projectDraft, setProjectDraft] = useState<any>(emptyProject);
  const [newProject, setNewProject] = useState<any>(emptyProject);
  const [newCandidate, setNewCandidate] = useState({ name: '', phone: '', email: '', location: '', targetRole: '', resumeText: demoResume });
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId) ?? projects[0], [projects, selectedProjectId]);
  const selectedCandidate = useMemo(() => candidates.find((c) => c.id === selectedCandidateId) ?? candidates[0], [candidates, selectedCandidateId]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [dash, ps, cs, rs] = await Promise.all([talentApi.dashboard(), talentApi.projects(), talentApi.candidates(), talentApi.reports()]);
      setDashboard(dash); setProjects(ps); setCandidates(cs); setReports(rs);
      setSelectedProjectId((prev) => prev || ps[0]?.id || '');
      setSelectedCandidateId((prev) => prev || cs[0]?.id || '');
    } catch (err) {
      logger.error('Failed to load talent agent data', err);
      setNotice('加载人才 Agent 数据失败，请检查服务端。');
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selectedProject) setProjectDraft(JSON.parse(JSON.stringify(selectedProject))); }, [selectedProject?.id]);
  useEffect(() => {
    if (!assessment) return;
    const next: Record<string, string> = {}; const scores: Record<string, number> = {};
    assessment.questions.forEach((q) => { next[q.id] = q.answer?.content || ''; if (q.answer) scores[q.answer.id] = q.answer.finalScore ?? q.answer.aiScore ?? 0; });
    setAnswers(next); setReviewScores(scores);
  }, [assessment?.id]);

  const run = async (message: string, fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(true); setNotice('');
    try { await fn(); setNotice(message); after?.(); await load(); }
    catch (err) { logger.error(message, err); setNotice(`${message}失败：${err instanceof Error ? err.message : '未知错误'}`); }
    finally { setBusy(false); }
  };

  const createAssessment = async (candidate: TalentCandidate, projectId?: string) => {
    setBusy(true);
    try {
      const detail = await talentApi.createAssessment(candidate.id, projectId || candidate.matches[0]?.projectId);
      setAssessment(detail); setSelectedCandidateId(candidate.id); setTab('assessment'); setNotice('已生成动态测评题，可直接演示在线答题。'); await load();
    } finally { setBusy(false); }
  };

  const openAssessment = async (id: string) => {
    const detail = await talentApi.getAssessment(id);
    setAssessment(detail); setTab('assessment');
  };

  const selectedReport = reports.find((r) => r.candidateId === selectedCandidate?.id) ?? reports[0];

  return (
    <div className="space-y-6 text-[#1d1d1f]">
      <section className="overflow-hidden rounded-[34px] border border-[#e5e5ea] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#007aff]">Talent Agent MVP</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#1d1d1f] md:text-[42px] md:leading-[1.05]">
              高阶影视人才智能评测与项目匹配 Agent
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#6e6e73]">
              将项目资料、简历信息、动态题目、AI 初评、人工复核和报告中心合并成一个清爽的工作台，适合高阶影视项目的人才招揽与入库管理。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['资料导入', '规则确认', '简历结构化', '项目匹配', '动态出题', '报告入库'].map((item) => (
                <span key={item} className="rounded-full bg-[#f5f5f7] px-3 py-1 text-xs font-semibold text-[#3a3a3c]">{item}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button onClick={() => run('已重置演示数据', () => talentApi.resetDemo())} className={secondaryAction}><RefreshCw className="h-3.5 w-3.5" />重置演示数据</button>
            <button onClick={load} className={primaryAction}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}刷新</button>
          </div>
        </div>
      </section>

      {notice && <div className="rounded-[22px] border border-[#b9dcff] bg-[#eef6ff] px-4 py-3 text-sm font-medium text-[#0057b8]">{notice}</div>}

      <div className="rounded-full border border-[#e5e5ea] bg-white/88 p-1.5 shadow-[0_16px_45px_rgba(0,0,0,0.045)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-1">
          {TABS.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${tab === item.key ? 'bg-[#007aff] text-white shadow-[0_10px_24px_rgba(0,122,255,0.22)]' : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'}`}>{item.icon}{item.label}</button>)}
        </div>
      </div>

      {tab === 'dashboard' && <Dashboard dashboard={dashboard} projects={projects} candidates={candidates} reports={reports} onJump={setTab} />}
      {tab === 'projects' && (
        <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
          <Panel title="项目列表" desc="规则可编辑，资料可导入">
            <div className="space-y-2">
              {projects.map((p) => <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className={`w-full rounded-[22px] border px-4 py-4 text-left text-sm transition ${selectedProject?.id === p.id ? 'border-[#b9dcff] bg-[#eef6ff]' : 'border-[#e5e5ea] bg-white hover:bg-[#f5f5f7]'}`}>
                <div className="flex items-center justify-between gap-3"><b className="text-[#1d1d1f]">{p.name}</b><Badge>{statusText(p.status)}</Badge></div>
                <p className="mt-1 text-xs text-[#6e6e73]">{p.recommendedRole}</p>
                <p className="mt-2 text-xs font-semibold text-[#007aff]">规则 {p.rules.length} 条 · 维度 {p.abilityDimensions.length} 个</p>
              </button>)}
            </div>
            <div className="mt-5 rounded-[24px] border border-[#e5e5ea] bg-[#f5f5f7] p-4">
              <p className="mb-3 text-xs font-semibold text-[#3a3a3c]">新建项目</p>
              <Input value={newProject.name} onChange={(v) => setNewProject({ ...newProject, name: v })} placeholder="项目名称" />
              <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="项目简介" className={`${textareaClass} mt-2 h-24 text-xs`} />
              <button disabled={!newProject.name} onClick={() => run('项目已创建', () => talentApi.createProject(newProject), () => setNewProject(emptyProject))} className={`${primaryAction} mt-3`}><Plus className="h-3 w-3" />创建</button>
            </div>
          </Panel>

          {selectedProject && <Panel title="项目详情与规则配置" desc="所有规则均来自后端配置，可保存为项目知识">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="项目名称"><Input value={projectDraft.name || ''} onChange={(v) => setProjectDraft({ ...projectDraft, name: v })} /></Field>
              <Field label="推荐岗位"><Input value={projectDraft.recommendedRole || ''} onChange={(v) => setProjectDraft({ ...projectDraft, recommendedRole: v })} /></Field>
              <Field label="项目周期"><Input value={projectDraft.durationRequirement || ''} onChange={(v) => setProjectDraft({ ...projectDraft, durationRequirement: v })} /></Field>
              <Field label="保密要求"><Input value={projectDraft.confidentialityRequirement || ''} onChange={(v) => setProjectDraft({ ...projectDraft, confidentialityRequirement: v })} /></Field>
            </div>
            <Field label="项目简介"><textarea value={projectDraft.description || ''} onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })} className={`${textareaClass} h-28`} /></Field>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => run('项目配置已保存', () => talentApi.updateProject(selectedProject.id, projectDraft))} className={primaryAction}><Save className="h-3.5 w-3.5" />保存项目配置</button>
              <button onClick={() => run('项目知识已确认并启用', () => talentApi.confirmProject(selectedProject.id))} className={secondaryAction}><CheckCircle2 className="h-3.5 w-3.5" />人工确认知识</button>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#1d1d1f]">项目资料导入 / Mock AI 解析</h3>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="粘贴 PDF/DOCX/TXT/XLSX/CSV 提取出的项目规则文本，或手动输入项目要求..." className={`${textareaClass} h-40 text-xs`} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="file" className="text-xs text-[#6e6e73]" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setImportText(await file.text()); }} />
                  <button disabled={!importText.trim()} onClick={() => run('资料已导入并完成 Mock AI 解析', () => talentApi.importDocument(selectedProject.id, { fileName: 'manual-import.txt', fileType: 'text/plain', content: importText }), () => setImportText(''))} className={primaryAction}>导入资料</button>
                </div>
                <div className="mt-3 space-y-2">{selectedProject.documents.slice(0, 3).map((doc) => <div key={doc.id} className="rounded-[18px] border border-[#e5e5ea] bg-[#f5f5f7] p-3 text-xs"><b>{doc.fileName}</b><span className="ml-2 font-semibold text-[#007aff]">{doc.parseStatus}</span><ul className="mt-2 list-disc pl-4 text-[#6e6e73]">{doc.aiExtractedRules.slice(0, 4).map((r) => <li key={r}>{r}</li>)}</ul></div>)}</div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#1d1d1f]">能力维度</h3>
                <div className="space-y-2">{selectedProject.abilityDimensions.map((d) => <div key={d.id} className="rounded-[18px] border border-[#e5e5ea] bg-white p-3"><div className="flex justify-between text-sm"><b>{d.name}</b><span className="font-semibold text-[#007aff]">{d.weight}%</span></div><p className="mt-1 text-xs text-[#6e6e73]">{d.description}</p></div>)}</div>
              </div>
            </div>

            <h3 className="mt-7 text-sm font-semibold text-[#1d1d1f]">规则库：必备 / 加分 / 淘汰</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{selectedProject.rules.map((r) => <RuleCard key={r.id} rule={r} />)}</div>
          </Panel>}
        </div>
      )}

      {tab === 'candidates' && (
        <div className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
          <Panel title="候选人列表" desc="支持简历粘贴、结构化分析与匹配排序">
            <div className="space-y-2">{candidates.map((c) => <button key={c.id} onClick={() => setSelectedCandidateId(c.id)} className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${selectedCandidate?.id === c.id ? 'border-[#b9dcff] bg-[#eef6ff]' : 'border-[#e5e5ea] bg-white hover:bg-[#f5f5f7]'}`}><div className="flex justify-between gap-3 text-sm"><b>{c.name}</b><Badge>{candidateStatus(c.status)}</Badge></div><p className="mt-1 text-xs text-[#6e6e73]">{c.location || '-'} · {c.targetRole}</p><p className="mt-2 text-xs font-semibold text-[#007aff]">{c.matches[0] ? `Top1 ${projectName(projects, c.matches[0].projectId)} ${c.matches[0].score}/100` : '未匹配'}</p></button>)}</div>
            <div className="mt-5 rounded-[24px] border border-[#e5e5ea] bg-[#f5f5f7] p-4">
              <p className="mb-3 text-xs font-semibold text-[#3a3a3c]">新增候选人</p>
              <Input value={newCandidate.name} onChange={(v) => setNewCandidate({ ...newCandidate, name: v })} placeholder="姓名" />
              <div className="mt-2 grid grid-cols-2 gap-2"><Input value={newCandidate.location} onChange={(v) => setNewCandidate({ ...newCandidate, location: v })} placeholder="所在地" /><Input value={newCandidate.targetRole} onChange={(v) => setNewCandidate({ ...newCandidate, targetRole: v })} placeholder="意向岗位" /></div>
              <textarea value={newCandidate.resumeText} onChange={(e) => setNewCandidate({ ...newCandidate, resumeText: e.target.value })} className={`${textareaClass} mt-2 h-36 text-xs`} />
              <button disabled={!newCandidate.name || !newCandidate.resumeText} onClick={() => run('候选人已创建', () => talentApi.createCandidate(newCandidate), () => setNewCandidate({ name: '', phone: '', email: '', location: '', targetRole: '', resumeText: demoResume }))} className={`${primaryAction} mt-3`}><UserPlus className="h-3 w-3" />创建候选人</button>
            </div>
          </Panel>

          {selectedCandidate && <CandidateDetail candidate={selectedCandidate} projects={projects} onAnalyze={() => run('简历分析完成', () => talentApi.analyzeCandidate(selectedCandidate.id))} onMatch={() => run('项目匹配完成', () => talentApi.matchCandidate(selectedCandidate.id))} onAssessment={() => createAssessment(selectedCandidate)} onOpenAssessment={openAssessment} onPool={() => run('已加入人才库', () => talentApi.addToPool(selectedCandidate.id))} />}
        </div>
      )}
      {tab === 'assessment' && (
        <Panel title="动态测评与 AI 初评 / 人工复核" desc="先生成题目，再填写答案、提交 AI 初评，最后人工调整分数并出报告">
          {!assessment && <Empty text="请先在候选人详情中点击“生成测评”，或打开已有测评。" />}
          {assessment && <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#e5e5ea] bg-[#f5f5f7] p-4">
              <div><b>{assessment.candidate?.name}</b><span className="mx-2 text-[#a1a1a6]">/</span><span className="font-semibold text-[#007aff]">{assessment.project?.name}</span><p className="mt-1 text-xs text-[#6e6e73]">状态：{assessment.status} · AI {assessment.aiScore ?? '-'} · 人工/最终 {assessment.totalScore ?? '-'}</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => talentApi.submitAnswers(assessment.id, Object.entries(answers).map(([questionId, content]) => ({ questionId, content }))).then(setAssessment).then(() => load())} className={primaryAction}><Send className="h-3 w-3" />提交答案并 AI 初评</button><button onClick={() => talentApi.reviewAssessment(assessment.id, assessment.questions.filter((q) => q.answer).map((q) => ({ answerId: q.answer!.id, reviewerScore: reviewScores[q.answer!.id] ?? q.answer!.finalScore ?? 0, reviewerComment: q.answer!.reviewerComment || '人工复核确认' }))).then(setAssessment).then(() => load())} className={secondaryAction}>保存人工复核</button><button onClick={() => run('评估报告已生成', () => talentApi.generateReport(assessment.id), () => setTab('reports'))} className={primaryAction}>生成报告</button></div>
            </div>
            {assessment.questions.map((q, idx) => <div key={q.id} className="rounded-[24px] border border-[#e5e5ea] bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-[#1d1d1f]">{idx + 1}. {q.abilityDimension}</h3><Badge>{q.type} · {q.score}分</Badge></div><p className="mt-3 text-sm leading-6 text-[#3a3a3c]">{q.content}</p><div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]"><textarea value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="在线填写答案..." className={`${textareaClass} h-32`} /><div className="rounded-[20px] border border-[#e5e5ea] bg-[#f5f5f7] p-3 text-xs text-[#6e6e73]"><p className="font-semibold text-[#1d1d1f]">评分点</p><ul className="mt-1 list-disc pl-4">{q.scoringCriteria.map((c) => <li key={c}>{c}</li>)}</ul>{q.answer && <><p className="mt-3 font-semibold text-[#007aff]">AI：{q.answer.aiScore}/{q.score}</p><p className="mt-1">{q.answer.aiComment}</p><label className="mt-2 block font-semibold text-[#3a3a3c]">人工分</label><input type="number" min="0" max={q.score} value={q.answer ? reviewScores[q.answer.id] ?? 0 : 0} onChange={(e) => q.answer && setReviewScores({ ...reviewScores, [q.answer.id]: Number(e.target.value) })} className="mt-1 w-full rounded-[14px] border border-[#d2d2d7] bg-white px-3 py-2 outline-none focus:border-[#007aff]/55 focus:ring-4 focus:ring-[#007aff]/10" /></>}</div></div></div>)}
          </div>}
        </Panel>
      )}

      {tab === 'reports' && (
        <Panel title="人才评估报告" desc="报告支持打印友好页面，所有 AI 判断保留依据">
          <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]"><div className="space-y-2">{reports.map((r) => <button key={r.id} onClick={() => setSelectedCandidateId(r.candidateId)} className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${selectedReport?.id === r.id ? 'border-[#b9dcff] bg-[#eef6ff]' : 'border-[#e5e5ea] bg-white hover:bg-[#f5f5f7]'}`}><b>{candidateName(candidates, r.candidateId)}</b><p className="mt-1 text-xs text-[#6e6e73]">{projectName(projects, r.recommendedProjectId)} · {r.finalScore}/100</p><div className="mt-2"><Badge>{recommendationText(r.recommendation)}</Badge></div></button>)}</div>{selectedReport && <div className="rounded-[28px] border border-[#e5e5ea] bg-white p-6 print:bg-white print:text-black"><div className="flex justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007aff]">Evaluation Report</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{candidateName(candidates, selectedReport.candidateId)} 人才评估报告</h2></div><button onClick={() => window.print()} className={`${secondaryAction} h-9 print:hidden`}><Printer className="h-3 w-3" /> 打印</button></div><div className="mt-5 grid gap-3 md:grid-cols-4"><Stat label="综合匹配" value={`${selectedReport.finalScore}`} /><Stat label="简历匹配" value={`${selectedReport.resumeMatchScore}`} /><Stat label="测评" value={`${selectedReport.assessmentScore}`} /><Stat label="规则符合" value={`${selectedReport.projectRuleFit}%`} /></div><Section title="推荐结论"><p>第一推荐项目：{projectName(projects, selectedReport.recommendedProjectId)}；第二推荐项目：{projectName(projects, selectedReport.secondProjectId || '') || '暂无'}；推荐岗位：{selectedReport.recommendedRole}。</p><p className="mt-2">建议：{recommendationText(selectedReport.recommendation)}。{selectedReport.reviewerComment}</p></Section><Section title="核心优势"><List items={selectedReport.strengths} /></Section><Section title="短板与风险"><List items={[...selectedReport.weaknesses, ...selectedReport.risks]} /></Section><Section title="淘汰条件检查"><List items={selectedReport.eliminationCheck} /></Section><Section title="AI 判断依据"><List items={selectedReport.aiReasoning} /></Section><pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[20px] border border-[#e5e5ea] bg-[#f5f5f7] p-4 text-xs leading-6 text-[#3a3a3c] print:text-black">{selectedReport.printableMarkdown}</pre></div>}</div>
        </Panel>
      )}

      {tab === 'pool' && <Panel title="人才库" desc="按推荐项目、岗位、标签、状态筛选的第一版人才池"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{candidates.filter((c) => ['pooled', 'recommended', 'backup', 'pending_review'].includes(c.status)).map((c) => <div key={c.id} className="rounded-[24px] border border-[#e5e5ea] bg-white p-4"><div className="flex justify-between gap-3"><b>{c.name}</b><Badge>{candidateStatus(c.status)}</Badge></div><p className="mt-1 text-xs text-[#6e6e73]">{c.profile?.school || '-'} / {c.profile?.major || '-'} / {c.location || '-'}</p><p className="mt-3 text-sm font-semibold text-[#007aff]">{c.matches[0] ? `${projectName(projects, c.matches[0].projectId)} · ${c.matches[0].recommendedRole}` : '未推荐'}</p><div className="mt-3 flex flex-wrap gap-1">{c.profile?.abilityTags.slice(0, 5).map((t) => <span key={t} className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6e6e73]">{t}</span>)}</div></div>)}</div></Panel>}

      {tab === 'settings' && <Panel title="Agent 设置" desc="第一版使用 Mock AI，已预留真实 LLM Provider 接口"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-[24px] border border-[#e5e5ea] bg-white p-5"><h3 className="font-semibold">当前模式：Mock AI</h3><p className="mt-2 text-sm leading-6 text-[#6e6e73]">未配置 API Key 时自动使用 Mock 模式，完整支持项目解析、简历解析、匹配、出题、评分和报告演示。</p></div><div className="rounded-[24px] border border-[#e5e5ea] bg-white p-5"><h3 className="font-semibold">预留 Provider 方法</h3><List items={['parseProjectDocuments()', 'parseResume()', 'matchProjects()', 'generateQuestions()', 'scoreAnswers()', 'generateEvaluationReport()']} /></div></div></Panel>}
    </div>
  );
};

const Dashboard: React.FC<{ dashboard: TalentDashboard | null; projects: TalentProject[]; candidates: TalentCandidate[]; reports: TalentReport[]; onJump: (tab: WorkspaceTab) => void }> = ({ dashboard, reports, onJump }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><Stat label="项目" value={String(dashboard?.projectCount ?? 0)} /><Stat label="候选人" value={String(dashboard?.candidateCount ?? 0)} /><Stat label="待测评" value={String(dashboard?.pendingAssessment ?? 0)} /><Stat label="待复核" value={String(dashboard?.pendingReview ?? 0)} /><Stat label="推荐/入库" value={String(dashboard?.recommended ?? 0)} /><Stat label="淘汰" value={String(dashboard?.eliminated ?? 0)} /></div>
    <div className="grid gap-5 lg:grid-cols-2"><Panel title="项目候选人分布"><div className="space-y-4">{dashboard?.distribution.map((d) => <div key={d.projectId}><div className="flex justify-between text-sm"><span className="font-medium text-[#1d1d1f]">{d.projectName}</span><span className="text-[#6e6e73]">{d.count}人</span></div><div className="mt-2 h-2 rounded-full bg-[#f2f2f7]"><div className="h-2 rounded-full bg-[#007aff]" style={{ width: `${Math.max(8, d.count * 28)}%` }} /></div></div>)}</div></Panel><Panel title="最近处理记录"><div className="space-y-2">{dashboard?.recentActivities.map((a) => <div key={a.id} className="rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm text-[#3a3a3c]">{a.message}<span className="ml-2 text-xs text-[#86868b]">{new Date(a.createdAt).toLocaleString('zh-CN')}</span></div>)}</div></Panel></div>
    <div className="grid gap-3 md:grid-cols-4"><Quick label="编辑项目规则" onClick={() => onJump('projects')} /><Quick label="新增候选人" onClick={() => onJump('candidates')} /><Quick label="进入测评复核" onClick={() => onJump('assessment')} /><Quick label={`查看 ${reports.length} 份报告`} onClick={() => onJump('reports')} /></div>
  </div>
);

const CandidateDetail: React.FC<{ candidate: TalentCandidate; projects: TalentProject[]; onAnalyze: () => void; onMatch: () => void; onAssessment: () => void; onOpenAssessment: (id: string) => void; onPool: () => void }> = ({ candidate, projects, onAnalyze, onMatch, onAssessment, onOpenAssessment, onPool }) => (
  <Panel title={`候选人详情：${candidate.name}`} desc="左侧为原始简历，右侧为结构化画像、项目匹配和可验证问题">
    <div className="mb-5 flex flex-wrap gap-2"><button onClick={onAnalyze} className={primaryAction}>结构化分析简历</button><button onClick={onMatch} className={primaryAction}>匹配全部项目</button><button onClick={onAssessment} className={secondaryAction}>生成动态测评</button><button onClick={onPool} className={secondaryAction}>加入人才库</button>{candidate.assessments.map((a) => <button key={a.id} onClick={() => onOpenAssessment(a.id)} className={subtleAction}>打开测评 {a.totalScore ?? '-'}</button>)}</div>
    <div className="grid gap-5 xl:grid-cols-2"><div><h3 className="mb-2 text-sm font-semibold">原始简历</h3><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-[#e5e5ea] bg-[#f5f5f7] p-4 text-sm leading-6 text-[#3a3a3c]">{candidate.resumeText}</pre></div><div className="space-y-4"><h3 className="text-sm font-semibold">AI 结构化画像</h3>{candidate.profile ? <div className="space-y-3"><div className="grid grid-cols-2 gap-2 text-sm"><Info label="学历" value={candidate.profile.education} /><Info label="院校" value={candidate.profile.school} /><Info label="专业" value={candidate.profile.major} /><Info label="年限" value={candidate.profile.workYears ? `${candidate.profile.workYears}年` : '未明确'} /></div><TagBlock title="能力标签" items={candidate.profile.abilityTags} /><TagBlock title="可证据能力" items={candidate.profile.verifiedEvidence} /><TagBlock title="缺失信息" items={candidate.profile.missingInformation} danger /><TagBlock title="风险提示" items={candidate.profile.riskFlags} danger /></div> : <Empty text="尚未分析简历" />}
      <h3 className="text-sm font-semibold">项目匹配排序</h3><div className="space-y-2">{candidate.matches.map((m) => <div key={m.id} className="rounded-[24px] border border-[#e5e5ea] bg-white p-4"><div className="flex justify-between gap-3"><b>{m.recommendationRank}. {projectName(projects, m.projectId)}</b><span className="text-2xl font-semibold tracking-[-0.04em] text-[#007aff]">{m.score}</span></div><p className="text-xs leading-5 text-[#6e6e73]">{m.reasoning}</p><div className="mt-3 grid gap-2 md:grid-cols-2"><MiniList title="满足" items={m.matchedRules} /><MiniList title="缺失/待验证" items={m.missingRules} /><MiniList title="加分" items={m.bonusRules} /><MiniList title="淘汰/风险" items={[...m.eliminationRules, ...m.risks]} danger /></div></div>)}</div></div></div>
  </Panel>
);

const Panel: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => <div className="rounded-[30px] border border-[#e5e5ea] bg-white p-5 shadow-[0_20px_55px_rgba(0,0,0,0.045)] md:p-6"><div className="mb-5"><h2 className="text-base font-semibold tracking-[-0.02em] text-[#1d1d1f]">{title}</h2>{desc && <p className="mt-1 text-xs leading-5 text-[#6e6e73]">{desc}</p>}</div>{children}</div>;
const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-[24px] border border-[#e5e5ea] bg-white p-4 shadow-[0_14px_36px_rgba(0,0,0,0.035)]"><p className="text-xs font-medium text-[#6e6e73]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.05em] tabular-nums text-[#007aff]">{value}</p></div>;
const Quick: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => <button onClick={onClick} className="rounded-[24px] border border-[#e5e5ea] bg-white px-5 py-5 text-left text-sm font-semibold text-[#1d1d1f] shadow-[0_14px_36px_rgba(0,0,0,0.035)] transition hover:-translate-y-0.5 hover:border-[#b9dcff] hover:text-[#007aff]">{label}</button>;
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block text-xs font-semibold text-[#6e6e73]"><span className="mb-1.5 block">{label}</span>{children}</label>;
const Input: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-[16px] border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] outline-none transition placeholder:text-[#a1a1a6] focus:border-[#007aff]/55 focus:ring-4 focus:ring-[#007aff]/10" />;
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="inline-flex items-center rounded-full border border-[#b9dcff] bg-[#eef6ff] px-2.5 py-1 text-[10px] font-semibold text-[#0057b8]">{children}</span>;
const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-[18px] bg-[#f5f5f7] p-3"><p className="text-[10px] font-semibold text-[#86868b]">{label}</p><p className="mt-1 text-xs font-medium text-[#1d1d1f]">{value}</p></div>;
const Empty: React.FC<{ text: string }> = ({ text }) => <div className="rounded-[24px] border border-dashed border-[#d2d2d7] bg-[#f5f5f7] p-8 text-center text-sm text-[#6e6e73]">{text}</div>;
const List: React.FC<{ items: string[] }> = ({ items }) => <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[#3a3a3c] print:text-black">{items.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}</ul>;
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <section className="mt-5"><h3 className="mb-2 text-sm font-semibold text-[#007aff] print:text-black">{title}</h3><div className="text-sm leading-6 text-[#3a3a3c] print:text-black">{children}</div></section>;
const TagBlock: React.FC<{ title: string; items: string[]; danger?: boolean }> = ({ title, items, danger }) => <div><p className="mb-1.5 text-xs font-semibold text-[#3a3a3c]">{title}</p>{items.length ? <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${danger ? 'bg-[#f2f2f7] text-[#6e6e73]' : 'bg-[#eef6ff] text-[#0057b8]'}`}>{i}</span>)}</div> : <span className="text-xs text-[#a1a1a6]">暂无</span>}</div>;
const MiniList: React.FC<{ title: string; items: string[]; danger?: boolean }> = ({ title, items, danger }) => <div className="rounded-[18px] bg-[#f5f5f7] p-3"><p className={`text-xs font-semibold ${danger ? 'text-[#6e6e73]' : 'text-[#007aff]'}`}>{title}</p><ul className="mt-1 list-disc pl-4 text-xs leading-5 text-[#6e6e73]">{(items.length ? items : ['无']).map((x) => <li key={x}>{x}</li>)}</ul></div>;
const RuleCard: React.FC<{ rule: TalentRule }> = ({ rule }) => <div className="rounded-[22px] border border-[#e5e5ea] bg-white p-4"><div className="flex items-start justify-between gap-2"><b className="text-sm text-[#1d1d1f]">{rule.title}</b><Badge>{rule.ruleType}</Badge></div><p className="mt-2 text-xs leading-5 text-[#6e6e73]">{rule.description}</p><p className="mt-2 text-xs font-semibold text-[#007aff]">权重 {rule.weight}</p></div>;

function projectName(projects: TalentProject[], id: string) { return projects.find((p) => p.id === id)?.name || ''; }
function candidateName(candidates: TalentCandidate[], id: string) { return candidates.find((c) => c.id === id)?.name || id; }
function statusText(status: string) { return ({ draft: '草稿', pending_confirm: '待确认', active: '已启用', disabled: '已停用' } as Record<string, string>)[status] || status; }
function candidateStatus(status: string) { return ({ pending_analysis: '待分析', screened: '已初筛', pending_assessment: '待测评', assessing: '测评中', pending_review: '待复核', recommended: '推荐', backup: '备选', eliminated: '淘汰', pooled: '已入库' } as Record<string, string>)[status] || status; }
function recommendationText(status: string) { return ({ enter_project: '建议进项目', second_interview: '建议复试', talent_pool: '进入人才库', backup: '备选观察', eliminate: '建议淘汰' } as Record<string, string>)[status] || status; }

export default TalentAgentMvp;
