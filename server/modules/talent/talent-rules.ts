/** Deterministic MPT v0.4 rules. AI may populate StructuredTalentProfile, never these decisions. */
export type TalentLevel = 'SENIOR' | 'INTERMEDIATE' | 'REJECT' | 'MANUAL_REVIEW';
export type MajorMatch = 'EXACT' | 'CONDITIONAL' | 'EXCLUDED' | 'UNKNOWN';
export type RequirementStatus = 'PASS' | 'FAIL' | 'MISSING' | 'MANUAL_REVIEW' | 'NOT_APPLICABLE';
export type MatchLevel = 'HIGH_MATCH' | 'MEDIUM_MATCH' | 'LOW_MATCH' | 'INSUFFICIENT_INFORMATION' | 'NOT_QUALIFIED';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';
export type FactType = 'FACT' | 'INFERENCE' | 'MISSING' | 'MANUAL';
export type ProjectCode = 'SFT_MULTIMODAL' | 'CAPTION_DIFF' | 'FILM_CREATIVE_INTENT';
import { MAJOR_RULES } from './major-rules.data';
import { normalizeSchoolName } from './school-rules.data';

export interface WorkEvidence { name?: string; type?: string; role?: string; responsibilities?: string; result?: string; }
export interface StructuredTalentProfile {
  name: string; education?: string; school?: string; academy?: string; major?: string; workYears?: number | null; currentRole?: string;
  filmAnalysisEvidence?: string[]; editingEvidence?: string[]; visualLanguageEvidence?: string[]; writingEvidence?: string[];
  annotationEvidence?: string[]; qualityReviewEvidence?: string[]; creativeExperience?: string[]; works?: WorkEvidence[];
  fullTimeStatus?: boolean | null; availableMonths?: number | null; availableDate?: string | null;
  sources: Record<string, string>; manuallyCorrected: boolean;
}
export type ExtractedTalentProfile = StructuredTalentProfile;
export interface ManualCorrection { fieldPath: 'fullTimeStatus' | 'availableMonths' | 'availableDate' | 'writingEvidence' | 'filmAnalysisEvidence' | 'editingEvidence' | 'visualLanguageEvidence' | 'manualSchoolApproval'; oldValue: string | number | boolean | null | string[]; newValue: string | number | boolean | null | string[]; operator: string; correctedAt: string; reason: string; }
export interface RuleEvidence { score: number; maxScore: number; evidenceText: string; evidenceGrade: EvidenceGrade; evidenceType: FactType; reason: string; sourceRef: string; }
export interface RequirementResult { code: string; name: string; status: RequirementStatus; reason: string; followUpQuestion?: string; }
export interface ProjectMatch { projectCode: ProjectCode; projectName: string; majorMatch: MajorMatch; totalScore: number; baseMatchLevel: MatchLevel; finalMatchLevel: MatchLevel; requirements: RequirementResult[]; evidence: RuleEvidence[]; blockingReasons: string[]; missingItems: string[]; riskItems: string[]; projectRank: number | null; }
export type ProjectMatchResult = ProjectMatch;
export interface TalentAnalysis { ruleVersion: 'MPT_RULES_v0.4'; talentLevel: TalentLevel; talentLevelReasons: string[]; normalizedSchool: string | null; candidateProfile: StructuredTalentProfile; projectMatches: ProjectMatch[]; rankedProjectMatches: ProjectMatch[]; report: { candidateSummary: string; talentLevel: TalentLevel; talentLevelReasons: string[]; candidateProfile: StructuredTalentProfile; rankedProjectMatches: ProjectMatch[]; matchEvidence: RuleEvidence[]; mismatchReasons: string[]; risks: string[]; missingInformation: string[]; followUpQuestions: string[]; nextAction: string; ruleVersion: string; analysisMode: 'RULE_FALLBACK' | 'MANUAL_CORRECTED'; generatedAt: string; }; }
export type TalentAnalysisResult = TalentAnalysis;
export type TalentAnalysisReport = TalentAnalysis['report'];

const projectNames: Record<ProjectCode, string> = { SFT_MULTIMODAL: 'SFT 多模态', CAPTION_DIFF: 'Caption-Diff Caption', FILM_CREATIVE_INTENT: '影视剧创作意图' };
const text = (items?: string[]) => (items || []).join('；');
const has = (items: string[] | undefined, re: RegExp) => re.test(text(items));
const education = (value?: string) => value || '';
const degreeStatus = (p: StructuredTalentProfile): RequirementResult => /大专|高中|中专/.test(education(p.education)) ? req('DEGREE','学历达到本科及以上','FAIL','简历明确低于本科') : /本科|学士|硕士|博士/.test(education(p.education)) ? req('DEGREE','学历达到本科及以上','PASS','学历已明确') : req('DEGREE','学历达到本科及以上','MISSING','未说明学历','请补充最高学历。');
const req = (code: string, name: string, status: RequirementStatus, reason: string, followUpQuestion?: string): RequirementResult => ({ code, name, status, reason, followUpQuestion });

export function normalizeSchool(school?: string): string | null { return normalizeSchoolName(school)?.name || null; }
export function getMajorMatch(project: ProjectCode, major?: string, profile?: StructuredTalentProfile): MajorMatch { if (!major?.trim()) return 'UNKNOWN'; const rule = MAJOR_RULES.find((item) => item.project === project && item.pattern.test(major)); if (!rule) return 'UNKNOWN'; if (rule.match === 'EXCLUDED') return 'EXCLUDED'; if (!rule.requiresEvidence) return rule.match; const evidence = text([...(profile?.filmAnalysisEvidence || []), ...(profile?.editingEvidence || []), ...(profile?.visualLanguageEvidence || []), ...(profile?.writingEvidence || []), ...(profile?.creativeExperience || [])]); return rule.requiresEvidence.test(evidence) ? rule.match : 'CONDITIONAL'; }

export function analyzeTalentProfile(profile: StructuredTalentProfile): TalentAnalysis {
  const schoolRule = normalizeSchoolName(profile.school); const normalizedSchool = schoolRule?.name || null; const majorMatches = (Object.keys(projectNames) as ProjectCode[]).map((project) => getMajorMatch(project, profile.major, profile));
  const exactMajor = majorMatches.includes('EXACT'); const schoolKnown = Boolean(schoolRule && (schoolRule.filmMedia || schoolRule.independentArt || schoolRule.is985 || schoolRule.is211 || schoolRule.referenceArt));
  const missingGate = !normalizedSchool || !profile.major;
  const commercialWork = (profile.works || []).some((w) => /商业|电影|电视剧|网剧|短剧|叙事/.test(w.type || '') && Boolean(w.role) && Boolean(w.responsibilities));
  const seniorCandidateNeedsWorkReview = Boolean(schoolRule?.seniorCandidate && exactMajor && (profile.works || []).length && !commercialWork);
  const senior = Boolean(schoolRule?.seniorCandidate && exactMajor && commercialWork);
  const manualSchoolApproval = Boolean(profile.sources.manualSchoolApproval === 'MANUAL_CONFIRMED');
  const strategyBlocksAuto = schoolRule?.strategy === 'MANUAL_REVIEW_WITH_EXACT_MAJOR' || schoolRule?.strategy === 'NO_AUTO';
  const talentLevel: TalentLevel = missingGate || seniorCandidateNeedsWorkReview || (schoolKnown && !exactMajor && majorMatches.includes('CONDITIONAL')) || (strategyBlocksAuto && !manualSchoolApproval && !senior) ? 'MANUAL_REVIEW' : senior ? 'SENIOR' : schoolKnown && exactMajor ? 'INTERMEDIATE' : 'REJECT';
  const talentLevelReasons = senior ? ['高级候选院校、项目精准专业、可确认的叙事商业作品与本人职责均成立。'] : talentLevel === 'INTERMEDIATE' ? ['院校满足中级候选范围，且至少一个项目专业为精准匹配。'] : talentLevel === 'MANUAL_REVIEW' ? [seniorCandidateNeedsWorkReview ? '高级候选院校的商业作品岗位或职责不清，需人工复核，不自动降级。' : '院校或专业信息不足，不能按缺失直接淘汰。'] : ['未同时满足中级院校范围与目标项目精准专业要求。'];
  const projectMatches = (Object.keys(projectNames) as ProjectCode[]).map((project) => matchProject(project, profile, talentLevel, getMajorMatch(project, profile.major, profile)));
  const rankedProjectMatches = talentLevel === 'REJECT' ? [] : projectMatches.filter((x) => x.finalMatchLevel !== 'NOT_QUALIFIED').sort((a,b) => b.totalScore-a.totalScore).map((x,i) => ({ ...x, projectRank: i + 1 }));
  const rankedIds = new Map(rankedProjectMatches.map((x) => [x.projectCode, x.projectRank])); projectMatches.forEach((x) => x.projectRank = rankedIds.get(x.projectCode) ?? null);
  const all = projectMatches.flatMap((x) => x.evidence); const missing = projectMatches.flatMap((x) => x.missingItems); const followUps = projectMatches.flatMap((x) => x.requirements.map((r) => r.followUpQuestion).filter(Boolean) as string[]);
  return { ruleVersion: 'MPT_RULES_v0.4', talentLevel, talentLevelReasons, normalizedSchool, candidateProfile: profile, projectMatches, rankedProjectMatches,
    report: { candidateSummary: `${profile.name}：${normalizedSchool || '院校待补充'} / ${profile.major || '专业待补充'}`, talentLevel, talentLevelReasons, candidateProfile: profile, rankedProjectMatches, matchEvidence: all, mismatchReasons: projectMatches.flatMap((x) => x.blockingReasons), risks: projectMatches.flatMap((x) => x.riskItems), missingInformation: [...new Set(missing)], followUpQuestions: [...new Set(followUps)], nextAction: talentLevel === 'REJECT' ? '不进入正式项目排序。' : missing.length ? '补充缺失信息后创建新的分析记录。' : '进入人工业务复核。', ruleVersion: 'MPT_RULES_v0.4', analysisMode: profile.manuallyCorrected ? 'MANUAL_CORRECTED' : 'RULE_FALLBACK', generatedAt: new Date().toISOString() } };
}

function matchProject(project: ProjectCode, p: StructuredTalentProfile, level: TalentLevel, major: MajorMatch): ProjectMatch {
  const requirements: RequirementResult[] = [req('GLOBAL_ADMISSION','达到中级或高级任意一档', level === 'REJECT' ? 'FAIL' : level === 'MANUAL_REVIEW' ? 'MANUAL_REVIEW' : 'PASS', level === 'REJECT' ? '未达到全局人才准入。' : level === 'MANUAL_REVIEW' ? '人才准入信息不足。' : '满足全局人才准入。'), degreeStatus(p)];
  const fullTime = p.fullTimeStatus === false ? req('FULL_TIME','接受全职','FAIL','明确只能兼职') : p.fullTimeStatus === true ? req('FULL_TIME','接受全职','PASS','明确接受全职') : req('FULL_TIME','接受全职','MISSING','未说明全职状态','请确认是否接受全职。');
  if (project === 'SFT_MULTIMODAL') requirements.push(
    req('FILM_ANALYSIS','具备阅片积累及影视分析基础', has(p.filmAnalysisEvidence, /.+/) || has(p.visualLanguageEvidence, /.+/) ? 'PASS' : 'MISSING','缺少具体阅片、拉片或影视分析证据','请补充阅片、拉片或影视分析案例。'),
    req('EDITING','具备剪辑或影视制作能力', has(p.editingEvidence, /.+/) ? 'PASS' : 'MISSING','缺少可核验剪辑或影视制作证据','请补充剪辑/影视制作项目与本人职责。'), fullTime,
    p.availableMonths == null ? req('AVAILABLE_MONTHS','可稳定支持至少6个月','MISSING','未说明支持周期','请确认可支持月份。') : p.availableMonths >= 6 ? req('AVAILABLE_MONTHS','可稳定支持至少6个月','PASS','支持周期不少于6个月') : req('AVAILABLE_MONTHS','可稳定支持至少6个月','FAIL','明确少于6个月'));
  if (project === 'CAPTION_DIFF') { const creative = (p.works || []).some((w) => Boolean(w.name && w.role)) || has(p.creativeExperience, /.+/); const annotation = has(p.annotationEvidence, /3个月|四个月|[4-9]个月|[1-9]\d个月/) || has(p.qualityReviewEvidence, /.+/); requirements.push(req('CORE_PATH','至少满足一条核心路径', creative || annotation ? 'PASS' : 'MISSING','创作作品岗位或视频文字标注/质检路径不足','请补充影视创作作品岗位，或视频文字标注时长与质检职责。'), req('MAJOR','专业不在明确排除范围', major === 'EXCLUDED' ? 'FAIL' : major === 'UNKNOWN' ? 'MISSING' : major === 'CONDITIONAL' && !has(p.writingEvidence, /.+/) ? 'MISSING' : 'PASS', major === 'EXCLUDED' ? '专业在项目明确排除范围。' : '专业判断需要补充。','请补充专业及文字表达证据。'), fullTime); }
  if (project === 'FILM_CREATIVE_INTENT') { const creation = has(p.creativeExperience, /导演|编剧|摄影|美术|电影|电视剧|网剧|短剧/) || (p.works || []).some((w) => /导演|编剧|摄影|美术/.test(w.role || '') && /电影|电视剧|网剧|短剧/.test(w.type || '')); requirements.push(req('CORE_PATH','至少满足一条核心路径', creation || major === 'EXACT' ? 'PASS' : 'MISSING','影视剧创作经历或精准专业背景不足','请补充影视剧项目类型、本人岗位与职责。'), req('MAJOR','专业不在明确排除范围', major === 'EXCLUDED' ? 'FAIL' : major === 'UNKNOWN' ? 'MISSING' : 'PASS', major === 'EXCLUDED' ? '专业在项目明确排除范围。' : '专业判断需要补充。','请补充准确专业名称。'), req('ANALYSIS_WRITING','具备影视分析、拉片和文字表达基础', has(p.filmAnalysisEvidence, /.+/) && has(p.writingEvidence, /.+/) ? 'PASS' : 'MISSING','影视分析或文字表达证据不足','请补充拉片/影视分析与文字表达案例。')); }
  const evidence = score(project, p, level, major); const totalScore = evidence.reduce((s,x) => s + x.score, 0); const fail = requirements.filter((r) => r.status === 'FAIL'); const incomplete = requirements.filter((r) => r.status === 'MISSING' || r.status === 'MANUAL_REVIEW');
  const baseMatchLevel: MatchLevel = totalScore >= 85 ? 'HIGH_MATCH' : totalScore >= 70 ? 'MEDIUM_MATCH' : 'LOW_MATCH'; const finalMatchLevel: MatchLevel = level === 'REJECT' || fail.length ? 'NOT_QUALIFIED' : incomplete.length ? 'INSUFFICIENT_INFORMATION' : baseMatchLevel;
  return { projectCode: project, projectName: projectNames[project], majorMatch: major, totalScore, baseMatchLevel, finalMatchLevel, requirements, evidence, blockingReasons: fail.map((r) => r.reason), missingItems: incomplete.map((r) => r.name), riskItems: major === 'CONDITIONAL' ? ['条件专业需要人工核验附加能力证据。'] : [], projectRank: null };
}

function score(project: ProjectCode, p: StructuredTalentProfile, level: TalentLevel, major: MajorMatch): RuleEvidence[] {
  const sourceText = (source: string) => ({ education: `${p.school || ''} ${p.academy || ''} ${p.major || ''}`.trim(), filmAnalysis: text(p.filmAnalysisEvidence), editing: text(p.editingEvidence), visualLanguage: text(p.visualLanguageEvidence), works: (p.works || []).map((w) => [w.name,w.type,w.role,w.responsibilities,w.result].filter(Boolean).join(' / ')).join('；'), availability: `${p.fullTimeStatus === true ? '接受全职' : p.fullTimeStatus === false ? '仅兼职' : ''} ${p.availableMonths ? `支持${p.availableMonths}个月` : ''}`.trim(), workYears: p.workYears ? `${p.workYears}年工作经验` : '', creativeExperience: text(p.creativeExperience), annotation: text(p.annotationEvidence), qualityReview: text(p.qualityReviewEvidence), writing: text(p.writingEvidence) } as Record<string, string>)[source] || '';
  const item=(maxScore:number, present:boolean, reason:string, source:string):RuleEvidence=>{ const content = sourceText(source); const grade: EvidenceGrade = !present ? 'D' : p.manuallyCorrected ? 'A' : /熟悉|参与|了解|喜欢/.test(content) ? 'C' : /独立|主导|负责|长期|商业|拉片|可验证|结构化/.test(content) ? 'A' : 'B'; const coefficient = grade === 'A' ? 1 : grade === 'B' ? .85 : grade === 'C' ? .6 : 0; return {score:Math.round(maxScore * coefficient),maxScore,evidenceText:content || '未提供证据',evidenceGrade:grade,evidenceType:!present?'MISSING':p.manuallyCorrected?'MANUAL':grade==='C'?'INFERENCE':'FACT',reason,sourceRef:p.sources[source] || `profile.${source}`}; }; const school = level === 'SENIOR' || level === 'INTERMEDIATE' ? major === 'EXACT' : false;
  if(project==='SFT_MULTIMODAL') return [item(15,school,'院校与项目专业匹配','education'),item(20,has(p.filmAnalysisEvidence,/.+/),'阅片与影视分析','filmAnalysis'),item(20,has(p.editingEvidence,/.+/),'剪辑与影视制作','editing'),item(20,has(p.visualLanguageEvidence,/.+/),'影视审美与视听语言','visualLanguage'),item(15,(p.works||[]).some(w=>Boolean(w.name&&w.role&&w.responsibilities)),'作品与岗位可信度','works'),item(5,Boolean(p.fullTimeStatus&&((p.availableMonths||0)>=6)),'全职与稳定周期','availability'),item(5,Boolean(p.workYears && p.workYears>=2),'学习理解与迁移潜力','workYears')];
  if(project==='CAPTION_DIFF') return [item(15,school,'院校与项目专业匹配','education'),item(20,has(p.creativeExperience,/.+/)||(p.works||[]).length>0,'影视创作能力','creativeExperience'),item(20,has(p.annotationEvidence,/.+/),'视频大模型文字描述标注','annotation'),item(15,has(p.qualityReviewEvidence,/.+/),'视频质检与复核','qualityReview'),item(20,has(p.writingEvidence,/.+/),'文字表达与结构化描述','writing'),item(10,Boolean(p.fullTimeStatus),'全职与稳定性','availability')];
  return [item(20,school,'院校与项目专业匹配','education'),item(20,has(p.creativeExperience,/.+/)||(p.works||[]).length>0,'真实影视剧创作经历','creativeExperience'),item(20,has(p.filmAnalysisEvidence,/.+/),'拉片与影视分析','filmAnalysis'),item(15,has(p.writingEvidence,/.+/),'文字表达与创作阐述','writing'),item(15,(p.works||[]).some(w=>Boolean(w.name&&w.role&&w.responsibilities)),'作品与岗位可信度','works'),item(10,(p.works||[]).some(w=>/电影|电视剧|网剧|短剧/.test(w.type||'')),'院线/中长剧集相关积累','works')];
}
