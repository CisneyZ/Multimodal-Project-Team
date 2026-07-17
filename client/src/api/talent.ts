import { apiClient as axiosForBackend } from './http';

export type TalentProjectStatus = 'draft' | 'pending_confirm' | 'active' | 'disabled';
export type TalentCandidateStatus = 'pending_analysis' | 'screened' | 'pending_assessment' | 'assessing' | 'pending_review' | 'recommended' | 'backup' | 'eliminated' | 'pooled';

export interface TalentRule {
  id: string;
  projectId: string;
  ruleType: 'required' | 'bonus' | 'elimination';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isRequired: boolean;
  isElimination: boolean;
  weight: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
  manualConfirmed: boolean;
}

export interface TalentDimension { id: string; projectId: string; name: string; description: string; weight: number; }
export interface TalentDocument { id: string; projectId: string; fileName: string; fileType: string; extractedText: string; parseStatus: string; aiExtractedRules: string[]; createdAt: string; }
export interface TalentProject { id: string; name: string; code: string; description: string; talentLevel: string; status: TalentProjectStatus; durationRequirement: string; partTimeAllowed: boolean; confidentialityRequirement: string; referenceDailyPrice: number | null; recommendedRole: string; questionRequirement: string; createdAt: string; updatedAt: string; documents: TalentDocument[]; rules: TalentRule[]; abilityDimensions: TalentDimension[]; candidateCount: number; }
export interface TalentProfile { candidateId: string; education: string; school: string; major: string; workYears: number | null; projectExperience: string[]; skills: string[]; works: string[]; verifiedEvidence: string[]; selfReportedAbility: string[]; missingInformation: string[]; riskFlags: string[]; acceptsFullTime: boolean | null; supportCycleMonths: number | null; confidentialityReady: boolean | null; abilityTags: string[]; parsedAt: string; }
export interface TalentMatch { id: string; candidateId: string; projectId: string; score: number; recommendationRank: number; recommendedRole: string; matchedRules: string[]; missingRules: string[]; bonusRules: string[]; eliminationRules: string[]; risks: string[]; questionsToVerify: string[]; reasoning: string; evidence: string[]; requiresManualReview: boolean; createdAt: string; }
export interface TalentAssessment { id: string; candidateId: string; projectId: string; status: string; totalScore: number | null; aiScore: number | null; reviewerScore: number | null; createdAt: string; updatedAt: string; }
export interface TalentCandidate { id: string; name: string; phone: string; email: string; location: string; status: TalentCandidateStatus; resumeText: string; targetRole: string; createdAt: string; updatedAt: string; profile: TalentProfile | null; matches: TalentMatch[]; assessments: TalentAssessment[]; reports: TalentReport[]; }
export interface TalentQuestion { id: string; assessmentId: string; type: string; content: string; projectId: string; abilityDimension: string; score: number; scoringCriteria: string[]; referenceAnswer: string; eliminationErrors: string[]; requiresManualReview: boolean; answer: TalentAnswer | null; }
export interface TalentAnswer { id: string; questionId: string; candidateId: string; content: string; aiScore: number | null; reviewerScore: number | null; finalScore: number | null; aiComment: string; reviewerComment: string; }
export interface TalentAssessmentDetail extends TalentAssessment { project: TalentProject | null; candidate: TalentCandidate | null; questions: TalentQuestion[]; }
export interface TalentReport { id: string; candidateId: string; recommendedProjectId: string; secondProjectId: string | null; recommendedRole: string; finalScore: number; resumeMatchScore: number; assessmentScore: number; projectRuleFit: number; talentType: string; talentLevel: string; strengths: string[]; weaknesses: string[]; risks: string[]; eliminationCheck: string[]; recommendation: string; reviewerComment: string; aiReasoning: string[]; printableMarkdown: string; createdAt: string; }
export interface TalentDashboard { projectCount: number; activeProjectCount: number; candidateCount: number; pendingAssessment: number; pendingReview: number; recommended: number; eliminated: number; distribution: Array<{ projectId: string; projectName: string; count: number }>; recentActivities: Array<{ id: string; type: string; message: string; createdAt: string }>; }

const BASE = '/api/talent';
const req = async <T>(url: string, method = 'GET', data?: unknown): Promise<T> => (await axiosForBackend({ url: `${BASE}${url}`, method, data })).data;

export const talentApi = {
  dashboard: () => req<TalentDashboard>('/dashboard'),
  projects: () => req<TalentProject[]>('/projects'),
  createProject: (data: Partial<TalentProject>) => req<TalentProject>('/projects', 'POST', data),
  updateProject: (id: string, data: Partial<TalentProject>) => req<TalentProject>(`/projects/${id}`, 'PUT', data),
  importDocument: (id: string, data: { fileName: string; fileType: string; content: string }) => req<{ document: TalentDocument; extracted: any; project: TalentProject }>(`/projects/${id}/import-document`, 'POST', data),
  confirmProject: (id: string) => req<TalentProject>(`/projects/${id}/confirm`, 'POST'),
  candidates: () => req<TalentCandidate[]>('/candidates'),
  createCandidate: (data: Partial<TalentCandidate>) => req<TalentCandidate>('/candidates', 'POST', data),
  analyzeCandidate: (id: string) => req<TalentCandidate>(`/candidates/${id}/analyze`, 'POST'),
  matchCandidate: (id: string) => req<TalentCandidate>(`/candidates/${id}/match`, 'POST'),
  createAssessment: (candidateId: string, projectId?: string) => req<TalentAssessmentDetail>(`/candidates/${candidateId}/assessments`, 'POST', { projectId }),
  addToPool: (candidateId: string) => req<TalentCandidate>(`/candidates/${candidateId}/add-to-pool`, 'POST'),
  getAssessment: (id: string) => req<TalentAssessmentDetail>(`/assessments/${id}`),
  submitAnswers: (id: string, answers: Array<{ questionId: string; content: string }>) => req<TalentAssessmentDetail>(`/assessments/${id}/answers`, 'POST', { answers }),
  reviewAssessment: (id: string, answers: Array<{ answerId: string; reviewerScore: number; reviewerComment?: string }>) => req<TalentAssessmentDetail>(`/assessments/${id}/review`, 'PUT', { answers }),
  generateReport: (assessmentId: string) => req<TalentReport>(`/assessments/${assessmentId}/report`, 'POST'),
  reports: () => req<TalentReport[]>('/reports'),
  resetDemo: () => req<TalentDashboard>('/reset-demo', 'POST'),
};
