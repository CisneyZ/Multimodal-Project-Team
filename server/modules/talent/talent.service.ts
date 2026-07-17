import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type {
  TalentAbilityDimension,
  TalentAnswer,
  TalentAssessment,
  TalentCandidate,
  TalentCandidateProfile,
  TalentDataStore,
  TalentEvaluationReport,
  TalentProject,
  TalentProjectDocument,
  TalentProjectMatch,
  TalentProjectRule,
  TalentQuestion,
  TalentQuestionType,
} from './talent.types';

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`;

@Injectable()
export class TalentService {
  private readonly dataPath = path.join(process.cwd(), '.runtime', 'talent-mvp-data.json');
  private data: TalentDataStore | null = null;

  async dashboard() {
    const d = await this.getData();
    const firstMatches = d.matches.filter((m) => m.recommendationRank === 1);
    return {
      projectCount: d.projects.length,
      activeProjectCount: d.projects.filter((p) => p.status === 'active').length,
      candidateCount: d.candidates.length,
      pendingAssessment: d.candidates.filter((c) => ['pending_assessment', 'assessing'].includes(c.status)).length,
      pendingReview: d.candidates.filter((c) => c.status === 'pending_review').length,
      recommended: d.candidates.filter((c) => ['recommended', 'pooled'].includes(c.status)).length,
      eliminated: d.candidates.filter((c) => c.status === 'eliminated').length,
      distribution: d.projects.map((p) => ({ projectId: p.id, projectName: p.name, count: firstMatches.filter((m) => m.projectId === p.id).length })),
      recentActivities: d.activities.slice(0, 12),
    };
  }

  async listProjects() { const d = await this.getData(); return d.projects.map((p) => this.projectDetail(p, d)); }
  async listCandidates() { const d = await this.getData(); return d.candidates.map((c) => this.candidateDetail(c, d)); }
  async listReports() { const d = await this.getData(); return [...d.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async createProject(body: Partial<TalentProject>) {
    const d = await this.getData();
    const p: TalentProject = {
      id: uid('project'), name: body.name || '未命名项目', code: body.code || uid('code'), description: body.description || '待导入规则资料。',
      talentLevel: body.talentLevel || '中级影视人才', status: 'draft', durationRequirement: body.durationRequirement || '待确认',
      partTimeAllowed: body.partTimeAllowed ?? false, confidentialityRequirement: body.confidentialityRequirement || '待确认', referenceDailyPrice: body.referenceDailyPrice ?? null,
      recommendedRole: body.recommendedRole || '待配置岗位', questionRequirement: body.questionRequirement || '按项目规则生成 5-8 道针对性题目。', createdAt: now(), updatedAt: now(),
    };
    d.projects.unshift(p); this.activity(d, `新建项目：${p.name}`); await this.saveData(); return this.projectDetail(p, d);
  }

  async updateProject(projectId: string, body: Partial<TalentProject> & { rules?: TalentProjectRule[]; abilityDimensions?: TalentAbilityDimension[] }) {
    const d = await this.getData(); const idx = d.projects.findIndex((p) => p.id === projectId); if (idx < 0) throw new NotFoundException('项目不存在');
    d.projects[idx] = { ...d.projects[idx], ...body, id: projectId, updatedAt: now() };
    if (body.rules) d.projectRules = d.projectRules.filter((r) => r.projectId !== projectId).concat(body.rules.map((r) => ({ ...r, projectId })));
    if (body.abilityDimensions) d.abilityDimensions = d.abilityDimensions.filter((r) => r.projectId !== projectId).concat(body.abilityDimensions.map((r) => ({ ...r, projectId })));
    this.activity(d, `更新项目规则：${d.projects[idx].name}`); await this.saveData(); return this.projectDetail(d.projects[idx], d);
  }

  async importDocument(projectId: string, body: { fileName?: string; fileType?: string; content?: string }) {
    const d = await this.getData(); const p = this.project(d, projectId); const content = body.content || '';
    const extracted = this.parseProjectDoc(content);
    const doc: TalentProjectDocument = { id: uid('doc'), projectId, fileName: body.fileName || 'manual.txt', fileType: body.fileType || 'text/plain', fileUrl: null, extractedText: content, parseStatus: 'parsed', aiExtractedRules: extracted.rules, createdAt: now() };
    d.projectDocuments.unshift(doc); p.status = 'pending_confirm'; p.updatedAt = now(); this.activity(d, `导入项目资料：${p.name} / ${doc.fileName}`); await this.saveData();
    return { document: doc, extracted, project: this.projectDetail(p, d) };
  }

  async confirmProject(projectId: string) {
    const d = await this.getData(); const p = this.project(d, projectId); p.status = 'active'; p.updatedAt = now();
    d.projectDocuments.filter((x) => x.projectId === projectId).forEach((x) => { x.parseStatus = 'confirmed'; });
    d.projectRules.filter((x) => x.projectId === projectId).forEach((x) => { x.manualConfirmed = true; });
    this.activity(d, `人工确认项目知识：${p.name}`); await this.saveData(); return this.projectDetail(p, d);
  }

  async createCandidate(body: Partial<TalentCandidate>) {
    const d = await this.getData();
    const c: TalentCandidate = { id: uid('candidate'), name: body.name || '未命名候选人', phone: body.phone || '', email: body.email || '', location: body.location || '', status: 'pending_analysis', resumeText: body.resumeText || '', resumeFileUrl: null, targetRole: body.targetRole || '待判断', createdAt: now(), updatedAt: now() };
    d.candidates.unshift(c); this.activity(d, `新增候选人：${c.name}`); await this.saveData(); return this.candidateDetail(c, d);
  }

  async analyzeCandidate(candidateId: string) {
    const d = await this.getData(); const c = this.candidate(d, candidateId); const profile = this.parseResume(c.resumeText, c.id);
    d.profiles = d.profiles.filter((p) => p.candidateId !== candidateId).concat(profile); c.status = 'screened'; c.updatedAt = now();
    this.activity(d, `简历结构化分析：${c.name}`); await this.saveData(); return this.candidateDetail(c, d);
  }

  async matchCandidate(candidateId: string) {
    const d = await this.getData(); const c = this.candidate(d, candidateId); let profile = d.profiles.find((p) => p.candidateId === c.id);
    if (!profile) { profile = this.parseResume(c.resumeText, c.id); d.profiles.push(profile); }
    const matches = d.projects.filter((p) => p.status !== 'disabled').map((p) => this.matchOne(d, c, profile!, p)).sort((a, b) => b.score - a.score).map((m, i) => ({ ...m, recommendationRank: i + 1 }));
    d.matches = d.matches.filter((m) => m.candidateId !== c.id).concat(matches); c.status = matches[0]?.eliminationRules.length ? 'eliminated' : 'pending_assessment'; c.updatedAt = now();
    this.activity(d, `项目匹配排序：${c.name}`); await this.saveData(); return this.candidateDetail(c, d);
  }

  async createAssessment(candidateId: string, projectId?: string) {
    const d = await this.getData(); const c = this.candidate(d, candidateId);
    const best = projectId ? this.project(d, projectId) : this.bestProject(d, candidateId); if (!best) throw new NotFoundException('没有可测评项目');
    const assessment: TalentAssessment = { id: uid('assessment'), candidateId, projectId: best.id, status: 'answering', totalScore: null, aiScore: null, reviewerScore: null, createdAt: now(), updatedAt: now() };
    const profile = d.profiles.find((p) => p.candidateId === candidateId) ?? this.parseResume(c.resumeText, c.id);
    const match = d.matches.find((m) => m.candidateId === c.id && m.projectId === best.id);
    const questions = this.generateQuestions(d, assessment.id, best, profile, match);
    d.assessments.unshift(assessment); d.questions.push(...questions); c.status = 'assessing'; c.updatedAt = now();
    this.activity(d, `生成动态测评：${c.name} / ${best.name}`); await this.saveData(); return this.assessmentDetail(d, assessment);
  }

  async getAssessment(assessmentId: string) { const d = await this.getData(); return this.assessmentDetail(d, this.assessment(d, assessmentId)); }

  async submitAnswers(assessmentId: string, body: { answers: Array<{ questionId: string; content: string }> }) {
    const d = await this.getData(); const a = this.assessment(d, assessmentId); const c = this.candidate(d, a.candidateId);
    const qs = d.questions.filter((q) => q.assessmentId === a.id); const input = new Map((body.answers || []).map((x) => [x.questionId, x.content])); const qids = new Set(qs.map((q) => q.id));
    d.answers = d.answers.filter((ans) => !qids.has(ans.questionId));
    const answers: TalentAnswer[] = qs.map((q) => { const content = input.get(q.id) || ''; const s = this.scoreAnswer(content, q); return { id: uid('answer'), questionId: q.id, candidateId: c.id, content, aiScore: s.score, reviewerScore: null, finalScore: s.score, aiComment: s.comment, reviewerComment: '' }; });
    d.answers.push(...answers); const score = answers.reduce((sum, ans) => sum + (ans.aiScore || 0), 0); a.aiScore = score; a.totalScore = score; a.status = 'ai_scored'; a.updatedAt = now(); c.status = 'pending_review'; c.updatedAt = now();
    this.activity(d, `提交答案并 AI 初评：${c.name}`); await this.saveData(); return this.assessmentDetail(d, a);
  }

  async reviewAssessment(assessmentId: string, body: { answers: Array<{ answerId: string; reviewerScore: number; reviewerComment?: string }> }) {
    const d = await this.getData(); const a = this.assessment(d, assessmentId); const map = new Map((body.answers || []).map((x) => [x.answerId, x]));
    d.answers.forEach((ans) => { const u = map.get(ans.id); if (u) { ans.reviewerScore = Number(u.reviewerScore); ans.finalScore = Number(u.reviewerScore); ans.reviewerComment = u.reviewerComment || ''; } });
    const qids = new Set(d.questions.filter((q) => q.assessmentId === a.id).map((q) => q.id)); const score = d.answers.filter((ans) => qids.has(ans.questionId)).reduce((sum, ans) => sum + (ans.finalScore ?? ans.aiScore ?? 0), 0);
    a.reviewerScore = score; a.totalScore = score; a.status = 'reviewed'; a.updatedAt = now(); const c = this.candidate(d, a.candidateId); c.status = 'recommended'; c.updatedAt = now();
    this.activity(d, `人工复核测评：${c.name}`); await this.saveData(); return this.assessmentDetail(d, a);
  }

  async generateReport(assessmentId: string) {
    const d = await this.getData(); const a = this.assessment(d, assessmentId); const c = this.candidate(d, a.candidateId); const p = this.project(d, a.projectId);
    const profile = d.profiles.find((x) => x.candidateId === c.id) ?? this.parseResume(c.resumeText, c.id); const matches = d.matches.filter((m) => m.candidateId === c.id).sort((x, y) => x.recommendationRank - y.recommendationRank);
    const best = matches.find((m) => m.projectId === p.id) ?? matches[0]; const second = matches.find((m) => m.projectId !== p.id) ?? null;
    const max = d.questions.filter((q) => q.assessmentId === a.id).reduce((s, q) => s + q.score, 0) || 1; const assessmentScore = Math.round(((a.totalScore ?? a.aiScore ?? 0) / max) * 100);
    const resumeScore = best?.score ?? 0; const projectRuleFit = Math.round(((best?.matchedRules.length ?? 0) / Math.max(1, (best?.matchedRules.length ?? 0) + (best?.missingRules.length ?? 0))) * 100);
    const finalScore = Math.round(resumeScore * 0.45 + assessmentScore * 0.4 + projectRuleFit * 0.15); const recommendation = best?.eliminationRules.length ? 'eliminate' : finalScore >= 82 ? 'enter_project' : finalScore >= 70 ? 'second_interview' : finalScore >= 58 ? 'talent_pool' : 'backup';
    const report: TalentEvaluationReport = { id: uid('report'), candidateId: c.id, recommendedProjectId: p.id, secondProjectId: second?.projectId ?? null, recommendedRole: best?.recommendedRole || p.recommendedRole, finalScore, resumeMatchScore: resumeScore, assessmentScore, projectRuleFit, talentType: this.talentType(profile), talentLevel: p.talentLevel, strengths: [...profile.verifiedEvidence, ...(best?.matchedRules ?? []), ...(best?.bonusRules ?? [])].slice(0, 6), weaknesses: [...profile.missingInformation, ...(best?.missingRules ?? [])].slice(0, 6), risks: [...profile.riskFlags, ...(best?.risks ?? [])].slice(0, 6), eliminationCheck: best?.eliminationRules.length ? best.eliminationRules : ['未触发硬性淘汰项'], recommendation, reviewerComment: recommendation === 'eliminate' ? '建议淘汰或长期观察。' : '建议进入下一轮/人才库，最终结论以人工复核为准。', aiReasoning: [`简历匹配 ${resumeScore}/100，测评 ${assessmentScore}/100，规则符合 ${projectRuleFit}/100。`, best?.reasoning || 'Mock Agent 已完成综合判断。'], printableMarkdown: '', createdAt: now() };
    report.printableMarkdown = this.markdown(report, c, p, profile, second ? this.project(d, second.projectId) : null); d.reports = d.reports.filter((r) => !(r.candidateId === c.id && r.recommendedProjectId === p.id)).concat(report);
    a.status = 'reported'; c.status = recommendation === 'eliminate' ? 'eliminated' : 'recommended'; this.activity(d, `生成评估报告：${c.name}`); await this.saveData(); return report;
  }

  async addToPool(candidateId: string) { const d = await this.getData(); const c = this.candidate(d, candidateId); c.status = 'pooled'; c.updatedAt = now(); this.activity(d, `加入人才库：${c.name}`); await this.saveData(); return this.candidateDetail(c, d); }
  async resetDemo() { this.data = this.seed(); await this.saveData(); return this.dashboard(); }

  private async getData(): Promise<TalentDataStore> { if (this.data) return this.data; await fs.mkdir(path.dirname(this.dataPath), { recursive: true }); try { this.data = JSON.parse(await fs.readFile(this.dataPath, 'utf8')) as TalentDataStore; } catch { this.data = this.seed(); await this.saveData(); } return this.data!; }
  private async saveData() { if (this.data) await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8'); }

  private projectDetail(p: TalentProject, d: TalentDataStore) { return { ...p, documents: d.projectDocuments.filter((x) => x.projectId === p.id), rules: d.projectRules.filter((x) => x.projectId === p.id), abilityDimensions: d.abilityDimensions.filter((x) => x.projectId === p.id), candidateCount: d.matches.filter((m) => m.projectId === p.id && m.recommendationRank === 1).length }; }
  private candidateDetail(c: TalentCandidate, d: TalentDataStore) { return { ...c, profile: d.profiles.find((p) => p.candidateId === c.id) ?? null, matches: d.matches.filter((m) => m.candidateId === c.id).sort((a, b) => a.recommendationRank - b.recommendationRank), assessments: d.assessments.filter((a) => a.candidateId === c.id), reports: d.reports.filter((r) => r.candidateId === c.id) }; }
  private assessmentDetail(d: TalentDataStore, a: TalentAssessment) { return { ...a, project: d.projects.find((p) => p.id === a.projectId) ?? null, candidate: d.candidates.find((c) => c.id === a.candidateId) ?? null, questions: d.questions.filter((q) => q.assessmentId === a.id).map((q) => ({ ...q, answer: d.answers.find((ans) => ans.questionId === q.id) ?? null })) }; }
  private project(d: TalentDataStore, projectId: string) { const p = d.projects.find((x) => x.id === projectId); if (!p) throw new NotFoundException('项目不存在'); return p; }
  private candidate(d: TalentDataStore, candidateId: string) { const c = d.candidates.find((x) => x.id === candidateId); if (!c) throw new NotFoundException('候选人不存在'); return c; }
  private assessment(d: TalentDataStore, assessmentId: string) { const a = d.assessments.find((x) => x.id === assessmentId); if (!a) throw new NotFoundException('测评不存在'); return a; }
  private bestProject(d: TalentDataStore, candidateId: string) { const m = d.matches.filter((x) => x.candidateId === candidateId).sort((a, b) => a.recommendationRank - b.recommendationRank)[0]; return m ? d.projects.find((p) => p.id === m.projectId) ?? null : d.projects.find((p) => p.status === 'active') ?? null; }
  private parseResume(text: string, candidateId: string): TalentCandidateProfile {
    const school = this.first(text, ['北京电影学院', '中央戏剧学院', '南京艺术学院', '浙江传媒学院', '中国传媒大学', '上海戏剧学院', '985', '211']) || '未明确';
    const major = this.first(text, ['导演', '戏剧影视文学', '广播电视编导', '影视制作', '数字媒体艺术', '动画', '广告学', 'UI设计', '摄影', '后期制作', '视觉传达', '制片', '表演', '主持']) || '未明确';
    const education = this.first(text, ['硕士', '研究生', '本科', '学士', '大专']) || '未明确';
    const ym = text.match(/(\d+)\s*年/); const mm = text.match(/(\d+)\s*个月/);
    const skills = this.collect(text, ['剪辑', '粗剪', 'PR', 'Premiere', 'DaVinci', '分镜', '拉片', '剧本', '导演', '编剧', '标注', '质检', '评测', 'AIGC', '镜头语言', '影调', '构图', '叙事节奏', 'Diff Caption', 'Caption']);
    const works = this.sentences(text).filter((s) => /作品|项目|片名|短片|广告|网剧|电影/.test(s)).slice(0, 8);
    const verifiedEvidence = [school !== '未明确' ? `院校/背景：${school}` : '', major !== '未明确' ? `专业方向：${major}` : '', ...skills.slice(0, 5).map((s) => `简历能力证据：${s}`), ...works.slice(0, 3).map((w) => `项目/作品证据：${w}`)].filter(Boolean);
    const missingInformation = [works.length ? '' : '作品名称、项目类型、岗位职责不够明确', !/全职|兼职/.test(text) ? '是否接受全职/兼职未明确' : '', !/6个月|半年|\d+个月/.test(text) ? '可支持项目周期未明确' : '', !/保密|L4/.test(text) ? '保密场地或保密意识未明确' : ''].filter(Boolean);
    const riskFlags = [/兼职|远程|不坐班|只接/.test(text) ? '可能存在兼职或稳定投入风险' : '', /运营|主持|演员|制片|视觉传达/.test(text) ? '背景可能与影视叙事/文字标注弱相关' : ''].filter(Boolean);
    return { candidateId, education, school, major, workYears: ym ? Number(ym[1]) : null, projectExperience: works, skills, works, verifiedEvidence, selfReportedAbility: this.collect(text, ['学习能力强', '执行力强', '审美', '文字表达', '稳定', '阅片', '沟通']).map((x) => `候选人自述：${x}`), missingInformation, riskFlags, acceptsFullTime: text.includes('全职') ? true : /兼职|只接/.test(text) ? false : null, supportCycleMonths: text.includes('6个月') || text.includes('半年') ? 6 : mm ? Number(mm[1]) : null, confidentialityReady: /保密|L4/.test(text) ? true : null, abilityTags: [...new Set([...skills, school !== '未明确' ? '影视院校/名校背景' : '', major].filter(Boolean))], parsedAt: now() };
  }

  private matchOne(d: TalentDataStore, c: TalentCandidate, profile: TalentCandidateProfile, p: TalentProject): TalentProjectMatch {
    const text = `${c.resumeText} ${profile.skills.join(' ')} ${profile.verifiedEvidence.join(' ')}`; const rules = d.projectRules.filter((r) => r.projectId === p.id);
    const required = rules.filter((r) => r.ruleType === 'required'); const bonus = rules.filter((r) => r.ruleType === 'bonus'); const elimination = rules.filter((r) => r.ruleType === 'elimination');
    const matchedRules = required.filter((r) => this.hit(text, r.positiveKeywords)).map((r) => r.title); const missingRules = required.filter((r) => !this.hit(text, r.positiveKeywords)).map((r) => r.title);
    const bonusRules = bonus.filter((r) => this.hit(text, r.positiveKeywords)).map((r) => r.title); const eliminationRules = elimination.filter((r) => this.hit(text, r.negativeKeywords)).map((r) => r.title);
    if (profile.acceptsFullTime === false && !p.partTimeAllowed) eliminationRules.push('项目不接受兼职，候选人存在兼职/远程投入风险');
    if (p.durationRequirement.includes('6') && profile.supportCycleMonths !== null && profile.supportCycleMonths < 6) eliminationRules.push('可支持周期不足 6 个月');
    const reqWeight = required.reduce((s, r) => s + r.weight, 0) || 1; const matchedWeight = required.filter((r) => this.hit(text, r.positiveKeywords)).reduce((s, r) => s + r.weight, 0); const bonusWeight = bonus.filter((r) => this.hit(text, r.positiveKeywords)).reduce((s, r) => s + r.weight, 0);
    let score = Math.round((matchedWeight / reqWeight) * 72 + Math.min(18, bonusWeight) + (profile.verifiedEvidence.length > 3 ? 6 : 0)); if (eliminationRules.length) score = Math.min(score, 45);
    return { id: uid('match'), candidateId: c.id, projectId: p.id, score: Math.max(0, Math.min(100, score)), recommendationRank: 99, recommendedRole: p.recommendedRole, matchedRules, missingRules, bonusRules, eliminationRules: [...new Set(eliminationRules)], risks: [...new Set([...profile.riskFlags, ...eliminationRules])], questionsToVerify: [...missingRules.slice(0, 2).map((r) => `测评确认：${r}`), p.code.includes('caption') ? '必须完成试标任务，验证文字描述准确性' : '通过片段分析验证剪辑逻辑与视听语言'], reasoning: `基于 ${rules.length} 条可编辑规则，命中 ${matchedRules.length} 条必备项、${bonusRules.length} 条加分项，缺失 ${missingRules.length} 条，硬性风险 ${eliminationRules.length} 条。`, evidence: profile.verifiedEvidence, requiresManualReview: profile.missingInformation.length > 0 || eliminationRules.length > 0, createdAt: now() };
  }

  private generateQuestions(d: TalentDataStore, assessmentId: string, p: TalentProject, profile: TalentCandidateProfile, match?: TalentProjectMatch): TalentQuestion[] {
    const gap = match?.missingRules[0] || '简历真实性与项目适配度'; const dim = d.abilityDimensions.find((x) => x.projectId === p.id)?.name || '项目核心能力';
    const specific: Array<[TalentQuestionType, string, string]> = p.code.includes('caption') ? [
      ['case_judgment', '请将一个 8 秒镜头描述成可用于视频大模型训练的 Caption，包含主体、动作、环境、景别和差异信息。', '视频理解与文字表达'],
      ['text_description', '如果两段视频只有人物手部动作不同，你会如何写 Diff Caption，避免泛泛描述？', '差异识别'],
      ['scenario_decision', '发现素材涉及客户未公开设定时，如何处理标注、质检和保密记录？', '质检与保密意识'],
    ] : [
      ['film_professional_judgment', '选一部你熟悉的影片，说明一个剪辑点如何推动叙事节奏或人物情绪。', '剪辑逻辑'],
      ['reading_and_work_analysis', '说明一次拉片方法：如何记录构图、影调、镜头运动、声音和节奏，并转化为剪辑判断？', '阅片与视听语言'],
      ['case_judgment', '同一场戏需要在悬疑感和信息清晰度之间取舍，你会如何调整剪辑顺序和节奏？', '情境决策'],
    ];
    const rows: Array<[TalentQuestionType, string, string]> = [['resume_verification', `请补充「${profile.works[0] || profile.skills[0] || '影视项目经验'}」的作品名称、项目类型、本人岗位、具体职责和可验证产出。`, '简历真实性核验'], ['project_rule_understanding', `推荐项目是「${p.name}」。请说明你认为最关键的 3 条用人规则，以及你的匹配证据。`, '项目规则理解'], ['scenario_decision', `待验证问题：「${gap}」。请说明你会如何在 3 天内补充证据或完成试标/试剪任务。`, dim], ...specific, ['mini_practice', `给出一个 ${p.name} 小型实操方案：输入材料、分析步骤、产出格式、质检方式和风险记录。`, '实操落地']];
    return rows.slice(0, 6).map(([type, content, abilityDimension], i) => ({ id: uid('question'), assessmentId, type, content, projectId: p.id, abilityDimension, score: i === 0 ? 10 : 15, scoringCriteria: ['回答具体，有项目/作品/流程证据', '能对应项目规则和岗位要求', '表达结构清晰，可执行', '能识别风险或补充验证方式'], referenceAnswer: '参考答案应包含明确事实、项目规则对应关系、专业判断依据、执行步骤和风险控制。', eliminationErrors: ['无法说明具体职责', '明显与项目规则冲突', '拒绝完成试标/试剪或保密要求'], requiresManualReview: true }));
  }

  private scoreAnswer(content: string, q: TalentQuestion) { const kws = ['项目', '作品', '职责', '镜头', '叙事', '剪辑', '标注', '质检', '保密', '规则', '风险', '流程', '证据', '复核', '输出']; const hit = kws.filter((k) => content.includes(k)).length; const bonus = content.length > 80 ? 2 : content.length > 40 ? 1 : 0; const score = Math.max(0, Math.min(q.score, Math.round((hit / kws.length) * q.score + bonus))); return { score, comment: `Mock AI 初评：命中 ${hit} 个专业/流程关键词，长度补偿 ${bonus}，得分 ${score}/${q.score}。建议人工核验事实真实性。` }; }
  private parseProjectDoc(content: string) { const rules = this.sentences(content).slice(0, 8); return { parseMode: 'mock', rules: rules.length ? rules : ['未识别到明确规则，建议人工补充。'], required: rules.filter((x) => /必须|要求|具备|本科|全职|稳定/.test(x)), bonus: rules.filter((x) => /优先|加分|奖项|院线/.test(x)), elimination: rules.filter((x) => /不接受|淘汰|不推荐|缺少|兼职/.test(x)), pendingManualConfirm: true }; }
  private talentType(p: TalentCandidateProfile) { if (p.skills.some((s) => ['标注', '质检', '评测'].includes(s))) return '视频文字标注 / 质检评测型'; if (p.skills.some((s) => ['剪辑', '粗剪', '拉片'].includes(s))) return '叙事剪辑 / 视听分析型'; if (p.skills.some((s) => ['导演', '编剧'].includes(s))) return '影视创作 / 剧作导演型'; return '影视综合潜力型'; }
  private markdown(r: TalentEvaluationReport, c: TalentCandidate, p: TalentProject, profile: TalentCandidateProfile, second: TalentProject | null) { return `# ${c.name} 人才评估报告\n\n- 第一推荐项目：${p.name}\n- 第二推荐项目：${second?.name || '暂无'}\n- 推荐岗位：${r.recommendedRole}\n- 综合匹配度：${r.finalScore}/100\n- 人才类型：${r.talentType}\n- 学校/专业：${profile.school} / ${profile.major}\n\n## 核心优势\n${r.strengths.map((x) => `- ${x}`).join('\n')}\n\n## 短板与风险\n${[...r.weaknesses, ...r.risks].map((x) => `- ${x}`).join('\n')}\n`; }
  private first(text: string, list: string[]) { return list.find((x) => text.includes(x)) ?? null; }
  private collect(text: string, list: string[]) { return [...new Set(list.filter((x) => text.includes(x)))]; }
  private hit(text: string, list: string[]) { return list.some((x) => text.includes(x)); }
  private sentences(text: string) { return text.split(/[\n。；;]/).map((x) => x.replace(/^[-*\d.、\s]+/, '').trim()).filter((x) => x.length > 6); }
  private activity(d: TalentDataStore, message: string) { d.activities.unshift({ id: uid('act'), type: 'mvp', message, createdAt: now() }); }
  private seedRule(idValue: string, projectId: string, ruleType: 'required' | 'bonus' | 'elimination', title: string, description: string, weight: number, positiveKeywords: string[], negativeKeywords: string[]): TalentProjectRule { return { id: idValue, projectId, ruleType, title, description, priority: ruleType === 'required' ? 'high' : 'medium', isRequired: ruleType === 'required', isElimination: ruleType === 'elimination', weight, positiveKeywords, negativeKeywords, sourceDocumentId: null, manualConfirmed: true }; }
  private dim(idValue: string, projectId: string, name: string, description: string, weight: number): TalentAbilityDimension { return { id: idValue, projectId, name, description, weight }; }

  private seed(): TalentDataStore {
    const t = '2026-07-17T00:00:00.000Z';
    const rl: TalentProject = { id: 'project-rl', name: 'RL叙事剪辑', code: 'rl-narrative-editing', description: '面向中级影视人才，重点考察阅片积累、剪辑能力、视听语言、构图影调与叙事节奏判断。', talentLevel: '中级影视人才', status: 'active', durationRequirement: '至少 6 个月稳定支持', partTimeAllowed: false, confidentialityRequirement: '需遵守项目资料保密要求', referenceDailyPrice: 450, recommendedRole: '叙事剪辑分析师 / 影视内容分析师', questionRequirement: '围绕阅片量、剪辑逻辑、节奏判断、构图影调、风格识别生成 5-8 道题。', createdAt: t, updatedAt: t };
    const caption: TalentProject = { id: 'project-caption', name: 'Caption-Diff Caption', code: 'caption-diff-caption', description: '面向视频大模型文字标注与差异描述任务，要求影视创作理解、文字表达、标注/质检经验和保密意识。', talentLevel: '中级影视人才', status: 'active', durationRequirement: '根据试标排期稳定支持', partTimeAllowed: false, confidentialityRequirement: '商务和工作环境需符合 L4 保密场地要求', referenceDailyPrice: 450, recommendedRole: 'Diff Caption 标注质检 / 视频文本评测专员', questionRequirement: '候选人必须完成试标任务，重点验证视频理解、镜头语言转文字、差异识别、描述准确性。', createdAt: t, updatedAt: t };
    const rules: TalentProjectRule[] = [
      this.seedRule('rl-r1', rl.id, 'required', '影视院校或相关专业背景', '专业影视院校、985/211 影视艺术相关专业，或影视/美学/编导/动画/数字媒体艺术/广告学/UI设计/影视制作等相关专业。', 16, ['北京电影学院', '中央戏剧学院', '南京艺术学院', '浙江传媒学院', '985', '211', '影视', '美学', '编导', '动画', '数字媒体艺术', '广告学', 'UI设计'], []),
      this.seedRule('rl-r2', rl.id, 'required', '丰富阅片与视听语言基础', '具备丰富阅片积累，能识别构图、影调、影视风格、叙事节奏。', 22, ['阅片', '拉片', '视听语言', '构图', '影调', '风格', '叙事节奏'], []),
      this.seedRule('rl-r3', rl.id, 'required', '剪辑能力和剪辑逻辑', '具备剪辑能力，理解镜头顺序、节奏和情绪推进。', 20, ['剪辑', '粗剪', 'PR', 'Premiere', 'DaVinci', '节奏'], []),
      this.seedRule('rl-r4', rl.id, 'required', '稳定全职投入', '学习理解能力强、执行意愿强、稳定性好，不接受兼职，至少支持 6 个月。', 18, ['全职', '稳定', '6个月', '半年', '执行力', '学习能力'], ['兼职', '只接', '远程不坐班']),
      this.seedRule('rl-b1', rl.id, 'bonus', '文理交叉或奖项作品', '文理交叉背景、学生作品获奖、院线/网剧/广告制作经历可加分。', 8, ['复合背景', '获奖', '电影节', '院线', '网剧', '广告'], []),
      this.seedRule('rl-e1', rl.id, 'elimination', '兼职或周期不足', '不接受兼职，无法稳定支持至少 6 个月应淘汰或人工复核。', 0, [], ['兼职', '只接', '3个月', '远程不坐班']),
      this.seedRule('cap-r1', caption.id, 'required', '影视创作经历', '有编剧、导演、剪辑等影视创作相关经验，且不是单纯影视制作执行经验。', 22, ['编剧', '导演', '剪辑', '影视创作', '短片', '剧本'], []),
      this.seedRule('cap-r2', caption.id, 'required', '作品信息完整', '简历必须注明作品名称、项目类型、本人岗位和具体职责。', 18, ['作品', '项目类型', '岗位', '职责', '片名'], []),
      this.seedRule('cap-r3', caption.id, 'required', '视频文字标注/质检/评测经验', '有视频大模型文字标注经验，或 3 个月以上视频文字标注，或相关质检、评测经验。', 24, ['标注', 'Diff Caption', 'Caption', '质检', '评测', '视频文字', '大模型'], []),
      this.seedRule('cap-r4', caption.id, 'required', '本科及以上和文字表达能力', '本科及以上，导演、戏剧影视文学、广播电视编导等优先。', 14, ['本科', '硕士', '导演', '戏剧影视文学', '广播电视编导', '文字表达'], []),
      this.seedRule('cap-b1', caption.id, 'bonus', '拉片/粗剪/分镜经验', '有拉片、粗剪、分镜经验者优先。', 8, ['拉片', '粗剪', '分镜'], []),
      this.seedRule('cap-e1', caption.id, 'elimination', '弱相关背景原则不推荐', '运营、视觉传达、制片、演员、主持人等弱相关背景原则上不推荐。', 0, [], ['运营', '视觉传达', '制片', '演员', '主持人']),
      this.seedRule('cap-e2', caption.id, 'elimination', '兼职或不满足保密场地', '不接受兼职，工作环境需符合 L4 保密场地。', 0, [], ['兼职', '只接', '无法保密', '无保密']),
    ];
    const dims: TalentAbilityDimension[] = [this.dim('dim-rl-1', rl.id, '阅片与视听语言', '阅片量、拉片方法、构图影调和风格识别。', 28), this.dim('dim-rl-2', rl.id, '剪辑逻辑与叙事节奏', '镜头顺序、节奏控制、情绪推进和叙事清晰度。', 34), this.dim('dim-rl-3', rl.id, '执行稳定性', '全职投入、周期稳定和沟通复盘。', 20), this.dim('dim-cap-1', caption.id, '视频理解与文字表达', '把镜头语言准确转为可训练文本。', 30), this.dim('dim-cap-2', caption.id, '差异识别与标注规范', '识别视频差异、描述完整、遵守标注规范。', 36), this.dim('dim-cap-3', caption.id, '质检与保密意识', '记录问题、复核一致性、满足 L4 保密要求。', 20)];
    const candidates: TalentCandidate[] = [
      { id: 'candidate-normal', name: '陈知远', phone: 'demo-1001', email: 'chen.demo@example.com', location: '北京', status: 'pooled', targetRole: '叙事剪辑分析', resumeFileUrl: null, resumeText: '陈知远，本科，北京电影学院影视制作专业，4年剪辑与内容分析经验。长期阅片和拉片，熟悉构图、影调、视听语言和叙事节奏。作品：悬疑短片《回声》担任剪辑，广告片《城市夜行》担任粗剪。熟悉 PR、DaVinci，可全职坐班，能够稳定支持6个月以上，理解保密要求。', createdAt: t, updatedAt: t },
      { id: 'candidate-risk', name: '林若舟', phone: 'demo-1002', email: 'lin.demo@example.com', location: '杭州', status: 'pending_review', targetRole: 'Caption 标注质检', resumeFileUrl: null, resumeText: '林若舟，本科，浙江传媒学院广播电视编导专业，2年短视频编导和视频文字标注经验。参与项目《城市观察》担任编导助理，负责脚本、分镜和素材整理；有4个月视频大模型 Caption 与 Diff Caption 标注质检经验，能进行拉片和粗剪。希望全职，保密场地可配合，但作品链接和具体职责需要补充。', createdAt: t, updatedAt: t },
      { id: 'candidate-eliminate', name: '周明轩', phone: 'demo-1003', email: 'zhou.demo@example.com', location: '上海', status: 'eliminated', targetRole: '待判断', resumeFileUrl: null, resumeText: '周明轩，大专，视觉传达专业。主要经历为运营、主持人和演员，经常参与活动执行与直播，不具备影视创作、剪辑或标注经验。只接受兼职远程，不确定能否满足保密要求，可支持3个月。', createdAt: t, updatedAt: t },
    ];
    const d: TalentDataStore = { projects: [rl, caption], projectDocuments: [], projectRules: rules, abilityDimensions: dims, candidates, profiles: [], matches: [], assessments: [], questions: [], answers: [], reports: [], activities: [{ id: 'act-1', type: 'demo_seed', message: '已预置 2 个项目、3 份虚拟候选人简历、动态题目和报告演示数据。', createdAt: t }] };
    candidates.forEach((c) => { const profile = this.parseResume(c.resumeText, c.id); d.profiles.push(profile); const ms = d.projects.map((p) => this.matchOne(d, c, profile, p)).sort((a, b) => b.score - a.score).map((m, i) => ({ ...m, recommendationRank: i + 1 })); d.matches.push(...ms); });
    this.seedAssessment(d, candidates[0], rl); this.seedAssessment(d, candidates[1], caption);
    d.assessments.forEach((a) => { const c = d.candidates.find((x) => x.id === a.candidateId)!; const p = d.projects.find((x) => x.id === a.projectId)!; const profile = d.profiles.find((x) => x.candidateId === c.id)!; const match = d.matches.find((m) => m.candidateId === c.id && m.projectId === p.id)!; const report: TalentEvaluationReport = { id: uid('report'), candidateId: c.id, recommendedProjectId: p.id, secondProjectId: d.matches.find((m) => m.candidateId === c.id && m.projectId !== p.id)?.projectId ?? null, recommendedRole: p.recommendedRole, finalScore: Math.round(match.score * 0.55 + (a.totalScore || 0) * 0.45), resumeMatchScore: match.score, assessmentScore: a.totalScore || 0, projectRuleFit: Math.round((match.matchedRules.length / Math.max(1, match.matchedRules.length + match.missingRules.length)) * 100), talentType: this.talentType(profile), talentLevel: p.talentLevel, strengths: [...profile.verifiedEvidence.slice(0, 2), ...match.matchedRules.slice(0, 2)], weaknesses: [...profile.missingInformation.slice(0, 2), ...match.missingRules.slice(0, 2)], risks: match.risks.length ? match.risks : ['暂无明显硬性风险'], eliminationCheck: match.eliminationRules.length ? match.eliminationRules : ['未触发硬性淘汰项'], recommendation: match.eliminationRules.length ? 'eliminate' : 'enter_project', reviewerComment: '演示报告：可进入下一轮或项目试用。', aiReasoning: [match.reasoning, '演示报告由 Mock Agent 生成，可由人工复核。'], printableMarkdown: '', createdAt: now() }; report.printableMarkdown = this.markdown(report, c, p, profile, null); d.reports.push(report); });
    return d;
  }

  private seedAssessment(d: TalentDataStore, c: TalentCandidate, p: TalentProject) { const profile = d.profiles.find((x) => x.candidateId === c.id)!; const match = d.matches.find((m) => m.candidateId === c.id && m.projectId === p.id); const a: TalentAssessment = { id: uid('assessment'), candidateId: c.id, projectId: p.id, status: 'reviewed', totalScore: p.id === 'project-rl' ? 78 : 70, aiScore: p.id === 'project-rl' ? 76 : 68, reviewerScore: p.id === 'project-rl' ? 78 : 70, createdAt: now(), updatedAt: now() }; const qs = this.generateQuestions(d, a.id, p, profile, match).slice(0, 5); d.assessments.push(a); d.questions.push(...qs); d.answers.push(...qs.map((q, i) => ({ id: uid('answer'), questionId: q.id, candidateId: c.id, content: `${c.name} 的演示答案 ${i + 1}：结合具体项目、作品职责、镜头/叙事/标注流程说明，并补充风险和复核方式。`, aiScore: Math.max(0, q.score - 3), reviewerScore: Math.max(0, q.score - 2), finalScore: Math.max(0, q.score - 2), aiComment: 'Mock AI 演示评分，建议人工复核。', reviewerComment: '演示数据：人工确认基本符合。' }))); }
}
