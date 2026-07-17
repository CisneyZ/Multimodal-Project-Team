import { apiClient as axiosForBackend } from './http';
import type {
  V11Dimension,
  V11AssessmentConfig,
  V11BasicQuestion,
  V11TaskQuestion,
  V11InterestQuestion,
  V11DataSourceConfig,
  V11DataSourceStatus,
  V11SchemaGuide,
  V11SubmitRequest,
  V11SubmitResponse,
  V11EvaluationRecord,
  V11EvaluationDetail,
  V11ReviewDto,
  V11AssessmentReport,
  V11ConnectionTestResult,
  V11TrainingResource,
  FeishuAgentStatus,
  FeishuAgentActionRequest,
  FeishuAgentActionResult,
} from '@shared/api.interface';

const BASE = '/api/v11';

export async function getDataSourceStatus(): Promise<V11DataSourceStatus> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/status`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getDataSourceConfig(): Promise<V11DataSourceConfig> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/config`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateDataSourceConfig(dto: Partial<V11DataSourceConfig>): Promise<V11DataSourceConfig> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/config`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getSchemaGuide(): Promise<V11SchemaGuide> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/schema-guide`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getAssessmentConfig(): Promise<V11AssessmentConfig> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/config`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateAssessmentConfig(dto: Partial<V11AssessmentConfig>): Promise<V11AssessmentConfig> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/config`, method: 'PUT', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getDimensions(): Promise<V11Dimension[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/dimensions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getBasicQuestions(): Promise<V11BasicQuestion[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/basic-questions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getTaskQuestions(): Promise<V11TaskQuestion[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/task-questions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getInterestQuestions(): Promise<V11InterestQuestion[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/interest-questions`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function submitEvaluation(dto: V11SubmitRequest): Promise<V11SubmitResponse> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/evaluations/submit`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getV11Evaluations(status?: string): Promise<V11EvaluationRecord[]> {
  try {
    const params = status ? { status } : {};
    const res = await axiosForBackend({ url: `${BASE}/admin/evaluations`, method: 'GET', params });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getV11EvaluationDetail(recordId: string): Promise<V11EvaluationDetail> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/evaluations/${recordId}`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function saveV11Review(recordId: string, dto: V11ReviewDto): Promise<V11EvaluationRecord> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/evaluations/${recordId}/review`, method: 'PUT', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function generateV11Report(recordId: string): Promise<V11AssessmentReport> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/evaluations/${recordId}/generate-report`, method: 'POST' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getV11Reports(): Promise<V11AssessmentReport[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/reports`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getFeishuAgentStatus(): Promise<FeishuAgentStatus> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/feishu-agent/status`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function runFeishuAgentAction(data: FeishuAgentActionRequest): Promise<FeishuAgentActionResult> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/feishu-agent/actions`, method: 'POST', data });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function testV11Connection(): Promise<V11ConnectionTestResult> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/test-connection`, method: 'POST' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function checkV11Schema(): Promise<{ missingTables: string[]; allTables: string[]; message: string }> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/check-schema`, method: 'POST' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function syncV11SeedData(): Promise<{ synced: string[]; skipped: string[]; message: string }> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/data-source/sync-seed`, method: 'POST' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function getV11TrainingResources(): Promise<V11TrainingResource[]> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/training-resources`, method: 'GET' });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function createV11TrainingResource(dto: Omit<V11TrainingResource, 'id'>): Promise<V11TrainingResource> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/training-resources`, method: 'POST', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function updateV11TrainingResource(id: string, dto: Partial<V11TrainingResource>): Promise<V11TrainingResource> {
  try {
    const res = await axiosForBackend({ url: `${BASE}/admin/training-resources/${id}`, method: 'PUT', data: dto });
    return res.data;
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}

export async function deleteV11TrainingResource(id: string): Promise<void> {
  try {
    await axiosForBackend({ url: `${BASE}/admin/training-resources/${id}`, method: 'DELETE' });
  } catch (error) {
    console.error('API request failed', error);
    throw error;
  }
}
