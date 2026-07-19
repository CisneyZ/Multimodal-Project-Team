import { z } from 'zod';
import type { StructuredTalentProfile } from './talent-rules';

const work = z.object({ name: z.string().optional(), type: z.string().optional(), role: z.string().optional(), responsibilities: z.string().optional(), result: z.string().optional() }).strict();
export const extractedProfileSchema = z.object({ name: z.string().min(1), education: z.string().optional(), school: z.string().optional(), academy: z.string().optional(), major: z.string().optional(), workYears: z.number().nullable().optional(), currentRole: z.string().optional(), filmAnalysisEvidence: z.array(z.string()).optional(), editingEvidence: z.array(z.string()).optional(), visualLanguageEvidence: z.array(z.string()).optional(), writingEvidence: z.array(z.string()).optional(), annotationEvidence: z.array(z.string()).optional(), qualityReviewEvidence: z.array(z.string()).optional(), creativeExperience: z.array(z.string()).optional(), works: z.array(work).optional(), fullTimeStatus: z.boolean().nullable().optional(), availableMonths: z.number().nullable().optional(), availableDate: z.string().nullable().optional(), sources: z.record(z.string()).default({}), manuallyCorrected: z.boolean().default(false) }).strict();
export type ExtractedProfileDto = z.infer<typeof extractedProfileSchema>;
export const manualCorrectionSchema = z.object({ fieldPath: z.enum(['fullTimeStatus','availableMonths','availableDate','writingEvidence','filmAnalysisEvidence','editingEvidence','visualLanguageEvidence']), oldValue: z.unknown(), newValue: z.unknown(), operator: z.string().min(1), correctedAt: z.string().datetime(), reason: z.string().min(1) }).strict();
export type ManualCorrectionDto = z.infer<typeof manualCorrectionSchema>;
export const phase1AnalysisRequestSchema = z.object({ candidateId: z.string().min(1), extractedProfile: extractedProfileSchema, manualCorrections: z.array(manualCorrectionSchema).default([]), analysisMode: z.enum(['AI_ASSISTED','RULE_FALLBACK','MANUAL_CORRECTED']).default('RULE_FALLBACK') }).strict();
export type Phase1AnalysisRequestDto = z.infer<typeof phase1AnalysisRequestSchema>;
export type Phase1Profile = StructuredTalentProfile;
