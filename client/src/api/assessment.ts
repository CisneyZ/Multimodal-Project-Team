import { apiClient as axiosForBackend } from './http';
import type {
  QuestionForExam,
  QuestionItem,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  ScoringRuleItem,
  TrainingResourceItem,
  AssessmentRecord,
  AssessmentStats,
  PaginatedResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ReviewDetailItem,
  CompleteReviewRequest,
  CompleteReviewResponse,
  NotificationItem,
  RecordDetail,
  AiScoringStatus,
} from '@shared/api.interface';

export async function getExamQuestions(): Promise<QuestionForExam[]> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/questions',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function submitAssessment(
  data: SubmitAssessmentRequest,
): Promise<SubmitAssessmentResponse> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/submit',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminQuestions(
  page = 1,
  pageSize = 50,
): Promise<PaginatedResponse<QuestionItem>> {
  try {
    const res = await axiosForBackend({
      url: `/api/assessment/admin/questions?page=${page}&pageSize=${pageSize}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function createAdminQuestion(
  data: CreateQuestionRequest,
): Promise<QuestionItem> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/questions',
      method: 'POST',
      data,
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateAdminQuestion(
  id: string,
  data: UpdateQuestionRequest,
): Promise<QuestionItem> {
  try {
    const res = await axiosForBackend({
      url: `/api/assessment/admin/questions/${id}`,
      method: 'PUT',
      data,
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminScoringRules(): Promise<ScoringRuleItem[]> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/scoring-rules',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminTrainingResources(): Promise<TrainingResourceItem[]> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/training-resources',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminRecords(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<AssessmentRecord>> {
  try {
    const res = await axiosForBackend({
      url: `/api/assessment/admin/records?page=${page}&pageSize=${pageSize}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminStats(): Promise<AssessmentStats> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/stats',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getReviewDetails(): Promise<ReviewDetailItem[]> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/review-details',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function completeReview(data: CompleteReviewRequest): Promise<CompleteReviewResponse> {
  try {
    const res = await axiosForBackend({
      url: `/api/assessment/admin/review/${data.detailId}`,
      method: 'PATCH',
      data: { reviewedScore: data.reviewedScore, reviewedReason: data.reviewedReason },
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getRecordDetail(id: string): Promise<RecordDetail> {
  try {
    const res = await axiosForBackend({
      url: `/api/assessment/admin/records/${id}`,
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/notifications',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAiScoringStatus(): Promise<AiScoringStatus> {
  try {
    const res = await axiosForBackend({
      url: '/api/assessment/admin/ai-status',
      method: 'GET',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}
