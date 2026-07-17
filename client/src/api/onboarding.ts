import { apiClient as axiosForBackend } from './http';
import type {
  OnboardingMaterial,
  OnboardingRuleQuestion,
  OnboardingProgressItem,
  StartOnboardingRequest,
  SubmitRuleTestRequest,
  SubmitRuleTestResponse,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateRuleQuestionRequest,
  UpdateRuleQuestionRequest,
  ChatBootstrapResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  RemindAdminRequest,
  ChatFlowNode,
  ChatPhrase,
} from '@shared/api.interface';

const BASE = '/api/onboarding';

export async function getMaterials(type?: string): Promise<OnboardingMaterial[]> {
  try {
    const res = await axiosForBackend({
      url: `${BASE}/materials`,
      method: 'GET',
      ...(type ? { params: { type } } : {}),
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getRuleQuestions(): Promise<OnboardingRuleQuestion[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/rule-questions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function startProgress(dto: StartOnboardingRequest): Promise<OnboardingProgressItem> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/progress/start`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function completeBackground(progressId: string): Promise<OnboardingProgressItem> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/progress/background-complete`, method: 'POST', data: { progressId } });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function completeRules(progressId: string): Promise<OnboardingProgressItem> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/progress/rules-complete`, method: 'POST', data: { progressId } });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function submitRuleTest(dto: SubmitRuleTestRequest): Promise<SubmitRuleTestResponse> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/rule-test/submit`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminMaterials(): Promise<OnboardingMaterial[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/materials`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function createMaterial(data: CreateMaterialRequest): Promise<OnboardingMaterial> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/materials`, method: 'POST', data });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateMaterial(id: string, data: UpdateMaterialRequest): Promise<OnboardingMaterial> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/materials/${id}`, method: 'PUT', data });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminRuleQuestions(): Promise<OnboardingRuleQuestion[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/rule-questions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function createRuleQuestion(data: CreateRuleQuestionRequest): Promise<OnboardingRuleQuestion> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/rule-questions`, method: 'POST', data });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateRuleQuestion(id: string, data: UpdateRuleQuestionRequest): Promise<OnboardingRuleQuestion> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/rule-questions/${id}`, method: 'PUT', data });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAdminProgress(): Promise<OnboardingProgressItem[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/progress`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function advanceToRules(progressId: string): Promise<OnboardingProgressItem> {
  try {
    const res = await axiosForBackend({
      url: `${BASE}/admin/progress/${progressId}/advance-rules`,
      method: 'POST',
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getProgressById(progressId: string): Promise<OnboardingProgressItem> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/progress/${progressId}`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getPendingProgress(): Promise<OnboardingProgressItem[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/progress/pending`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getChatBootstrap(progressId?: string): Promise<ChatBootstrapResponse> {
  try {
    const res = await axiosForBackend({
      url: `${BASE}/chat/bootstrap`,
      method: 'GET',
      ...(progressId ? { params: { progressId } } : {}),
    });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function sendChatMessage(dto: ChatMessageRequest): Promise<ChatMessageResponse> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/chat/message`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function remindAdmin(dto: RemindAdminRequest): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/chat/remind-admin`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getChatFlows(): Promise<ChatFlowNode[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/chat-flows`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getChatPhrases(): Promise<ChatPhrase[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/chat-phrases`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}
