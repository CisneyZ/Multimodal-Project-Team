import type { ProjectCode } from './talent-rules';
export interface ScoreDimension { code: string; name: string; maxScore: number; }
export const PROJECT_SCORE_CONFIG: Record<ProjectCode, ScoreDimension[]> = {
  SFT_MULTIMODAL: [{code:'SCHOOL_MAJOR',name:'院校与项目专业匹配',maxScore:15},{code:'FILM_ANALYSIS',name:'阅片与影视分析',maxScore:20},{code:'EDITING',name:'剪辑与影视制作',maxScore:20},{code:'VISUAL_LANGUAGE',name:'影视审美与视听语言',maxScore:20},{code:'WORK_CREDIBILITY',name:'作品与岗位可信度',maxScore:15},{code:'LEARNING',name:'学习理解与迁移潜力',maxScore:5},{code:'STABILITY',name:'全职与稳定周期',maxScore:5}],
  CAPTION_DIFF: [{code:'SCHOOL_MAJOR',name:'院校与项目专业匹配',maxScore:15},{code:'CREATIVE',name:'影视创作能力',maxScore:20},{code:'VIDEO_TEXT_ANNOTATION',name:'视频大模型文字描述标注',maxScore:20},{code:'QUALITY_REVIEW',name:'视频质检与复核',maxScore:15},{code:'WRITING',name:'文字表达与结构化描述',maxScore:20},{code:'WORK_CREDIBILITY',name:'作品与岗位可信度',maxScore:5},{code:'STABILITY',name:'全职与稳定性',maxScore:5}],
  FILM_CREATIVE_INTENT: [{code:'SCHOOL_MAJOR',name:'院校与项目专业匹配',maxScore:20},{code:'NARRATIVE_CREATION',name:'真实影视剧创作经历',maxScore:20},{code:'FILM_ANALYSIS',name:'拉片与影视分析',maxScore:20},{code:'WRITING',name:'文字表达与创作阐述',maxScore:15},{code:'WORK_CREDIBILITY',name:'作品与岗位可信度',maxScore:15},{code:'LONG_FORM',name:'院线/中长剧集相关积累',maxScore:10}],
};
export const evidenceCoefficient = { A: 1, B: .85, C: .6, D: 0 } as const;
