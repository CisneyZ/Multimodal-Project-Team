import type { ManualCorrection, StructuredTalentProfile, TalentAnalysis } from './talent-rules';

export type TalentProjectStatus = 'draft' | 'pending_confirm' | 'active' | 'disabled';
export type TalentRuleType = 'required' | 'bonus' | 'elimination';
export type TalentCandidateStatus =
  | 'pending_analysis'
  | 'screened'
  | 'pending_assessment'
  | 'assessing'
  | 'pending_review'
  | 'recommended'
  | 'backup'
  | 'eliminated'
  | 'pooled';
export type TalentAssessmentStatus = 'draft' | 'answering' | 'submitted' | 'ai_scored' | 'reviewed' | 'reported';
export type TalentQuestionType =
  | 'resume_verification'
  | 'project_rule_understanding'
  | 'film_professional_judgment'
  | 'reading_and_work_analysis'
  | 'case_judgment'
  | 'text_description'
  | 'scenario_decision'
  | 'mini_practice';

export interface TalentProject {
  id: string;
  name: string;
  code: string;
  description: string;
  talentLevel: string;
  status: TalentProjectStatus;
  durationRequirement: string;
  partTimeAllowed: boolean;
  confidentialityRequirement: string;
  referenceDailyPrice: number | null;
  recommendedRole: string;
  questionRequirement: string;
  createdAt: string;
  updatedAt: string;
}

export interface TalentProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null;
  extractedText: string;
  parseStatus: 'pending' | 'parsed' | 'confirmed';
  aiExtractedRules: string[];
  createdAt: string;
}

export interface TalentProjectRule {
  id: string;
  projectId: string;
  ruleType: TalentRuleType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isRequired: boolean;
  isElimination: boolean;
  weight: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
  sourceDocumentId?: string | null;
  manualConfirmed: boolean;
}

export interface TalentAbilityDimension {
  id: string;
  projectId: string;
  name: string;
  description: string;
  weight: number;
}

export interface TalentCandidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: TalentCandidateStatus;
  resumeText: string;
  resumeFileUrl: string | null;
  targetRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface TalentCandidateProfile {
  candidateId: string;
  education: string;
  school: string;
  major: string;
  workYears: number | null;
  projectExperience: string[];
  skills: string[];
  works: string[];
  verifiedEvidence: string[];
  selfReportedAbility: string[];
  missingInformation: string[];
  riskFlags: string[];
  acceptsFullTime: boolean | null;
  supportCycleMonths: number | null;
  confidentialityReady: boolean | null;
  abilityTags: string[];
  parsedAt: string;
}

export interface TalentProjectMatch {
  id: string;
  candidateId: string;
  projectId: string;
  score: number;
  recommendationRank: number;
  recommendedRole: string;
  matchedRules: string[];
  missingRules: string[];
  bonusRules: string[];
  eliminationRules: string[];
  risks: string[];
  questionsToVerify: string[];
  reasoning: string;
  evidence: string[];
  requiresManualReview: boolean;
  createdAt: string;
}

export interface TalentAssessment {
  id: string;
  candidateId: string;
  projectId: string;
  status: TalentAssessmentStatus;
  totalScore: number | null;
  aiScore: number | null;
  reviewerScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TalentQuestion {
  id: string;
  assessmentId: string;
  type: TalentQuestionType;
  content: string;
  projectId: string;
  abilityDimension: string;
  score: number;
  scoringCriteria: string[];
  referenceAnswer: string;
  eliminationErrors: string[];
  requiresManualReview: boolean;
}

export interface TalentAnswer {
  id: string;
  questionId: string;
  candidateId: string;
  content: string;
  aiScore: number | null;
  reviewerScore: number | null;
  finalScore: number | null;
  aiComment: string;
  reviewerComment: string;
}

export interface TalentEvaluationReport {
  id: string;
  candidateId: string;
  recommendedProjectId: string;
  secondProjectId: string | null;
  recommendedRole: string;
  finalScore: number;
  resumeMatchScore: number;
  assessmentScore: number;
  projectRuleFit: number;
  talentType: string;
  talentLevel: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  eliminationCheck: string[];
  recommendation: 'enter_project' | 'second_interview' | 'talent_pool' | 'backup' | 'eliminate';
  reviewerComment: string;
  aiReasoning: string[];
  printableMarkdown: string;
  createdAt: string;
}

export interface TalentActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface TalentPhase1AnalysisRecord {
  id: string;
  candidateId: string;
  analysisMode: 'AI_ASSISTED' | 'RULE_FALLBACK' | 'MANUAL_CORRECTED';
  ruleVersion: 'MPT_RULES_v0.4';
  extractedProfile: StructuredTalentProfile;
  appliedCorrections: ManualCorrection[];
  result: TalentAnalysis;
  createdAt: string;
  generatedAt: string;
}

export interface TalentDataStore {
  projects: TalentProject[];
  projectDocuments: TalentProjectDocument[];
  projectRules: TalentProjectRule[];
  abilityDimensions: TalentAbilityDimension[];
  candidates: TalentCandidate[];
  profiles: TalentCandidateProfile[];
  matches: TalentProjectMatch[];
  assessments: TalentAssessment[];
  questions: TalentQuestion[];
  answers: TalentAnswer[];
  reports: TalentEvaluationReport[];
  activities: TalentActivity[];
  phase1Analyses?: TalentPhase1AnalysisRecord[];
}

export interface TalentProjectDetail extends TalentProject {
  documents: TalentProjectDocument[];
  rules: TalentProjectRule[];
  abilityDimensions: TalentAbilityDimension[];
  candidateCount: number;
}

export interface TalentCandidateDetail extends TalentCandidate {
  profile: TalentCandidateProfile | null;
  matches: TalentProjectMatch[];
  assessments: TalentAssessment[];
  reports: TalentEvaluationReport[];
  phase1Analyses?: TalentPhase1AnalysisRecord[];
}

export interface TalentAssessmentDetail extends TalentAssessment {
  project: TalentProject | null;
  candidate: TalentCandidate | null;
  questions: Array<TalentQuestion & { answer: TalentAnswer | null }>;
}
