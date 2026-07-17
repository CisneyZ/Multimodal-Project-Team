import { Logger } from '@nestjs/common';
import type { AssessmentV11Repository } from './v11.repository';
import type {
  V11Dimension,
  V11AssessmentConfig,
  V11BasicQuestion,
  V11TaskQuestion,
  V11InterestQuestion,
  V11DataSourceConfig,
  V11EvaluationRecord,
  V11AssessmentReport,
  V11TrainingResource,
  V11BasicAnswer,
  V11TaskAnswer,
  V11InterestAnswer,
  V11ConnectionTestResult,
} from '@shared/api.interface';

const TABLE_NAMES = [
  'dimensions', 'assessment_configs', 'basic_questions', 'task_questions',
  'interest_questions', 'evaluation_records', 'basic_answers', 'task_answers',
  'interest_answers', 'assessment_reports', 'training_resources', 'notifications',
] as const;

type TableName = typeof TABLE_NAMES[number];

const FEISHU_BASE = 'https://open.feishu.cn/open-apis';

type FeishuFieldMeta = {
  field_id: string;
  field_name: string;
  type: number;
  property?: unknown;
};

export class FeishuBitableAdapter implements AssessmentV11Repository {
  private readonly logger = new Logger(FeishuBitableAdapter.name);
  private appId: string;
  private appSecret: string;
  private appToken: string;
  private driveFolderToken: string;
  private tableIds: Record<string, string>;
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private fieldMetaCache: Partial<Record<TableName, Map<string, FeishuFieldMeta>>> = {};

  constructor(config?: Partial<V11DataSourceConfig>) {
    this.appId = process.env.FEISHU_APP_ID ?? '';
    this.appSecret = process.env.FEISHU_APP_SECRET ?? '';
    this.appToken = process.env.FEISHU_BITABLE_APP_TOKEN ?? '';
    this.driveFolderToken = process.env.FEISHU_DRIVE_FOLDER_TOKEN ?? '';
    this.tableIds = {};
    for (const name of TABLE_NAMES) {
      const envKey = `FEISHU_TABLE_ID_${name.toUpperCase()}`;
      this.tableIds[name] = process.env[envKey] ?? '';
    }
    this.configure(config);
  }

  configure(config?: Partial<V11DataSourceConfig>): void {
    if (!config) return;
    if (config.appId !== undefined) this.appId = String(config.appId ?? '').trim();
    if (config.appSecret !== undefined && String(config.appSecret).trim()) {
      this.appSecret = String(config.appSecret).trim();
    }
    if (config.appToken !== undefined) this.appToken = String(config.appToken ?? '').trim();
    if (config.driveFolderToken !== undefined) this.driveFolderToken = String(config.driveFolderToken ?? '').trim();
    if (config.tableIdMap) {
      for (const name of TABLE_NAMES) {
        if (config.tableIdMap[name] !== undefined) {
          this.tableIds[name] = String(config.tableIdMap[name] ?? '').trim();
        }
      }
    }
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
    this.fieldMetaCache = {};
  }

  private get tableIdMap(): Record<string, string> {
    return this.tableIds;
  }

  isConfigured(): boolean {
    return !!(this.appId && this.appSecret && this.appToken && this.hasAllTableIds());
  }

  private hasAllTableIds(): boolean {
    return TABLE_NAMES.every((name) => !!this.tableIds[name]);
  }

  getTableId(name: string): string {
    return this.tableIds[name] ?? '';
  }

  private async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.cachedToken;
    }
    const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
    });
    const data = await res.json() as Record<string, unknown>;
    if (data.code !== 0) {
      throw new Error(`Failed to get Feishu token: ${data.msg}`);
    }
    this.cachedToken = data.tenant_access_token as string;
    this.tokenExpiresAt = Date.now() + ((data.expire as number) ?? 7200) * 1000;
    return this.cachedToken;
  }

  private async apiRequest<T = unknown>(method: string, path: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    const token = await this.getToken();
    let url = `${FEISHU_BASE}${path}`;
    if (params) {
      const sp = new URLSearchParams(params);
      url += `?${sp.toString()}`;
    }
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json() as Record<string, unknown>;
    if (data.code !== 0) {
      const fields = this.describeBodyFields(body);
      throw new Error(`Feishu API error [${data.code}]: ${data.msg}${fields ? ` (fields: ${fields})` : ''}`);
    }
    return data.data as T;
  }

  private describeBodyFields(body: unknown): string {
    if (!body || typeof body !== 'object') return '';
    const record = body as Record<string, unknown>;
    if (record.fields && typeof record.fields === 'object') {
      return Object.keys(record.fields as Record<string, unknown>).join(',');
    }
    if (Array.isArray(record.records)) {
      const names = new Set<string>();
      for (const item of record.records) {
        if (item && typeof item === 'object' && 'fields' in item) {
          for (const key of Object.keys((item as { fields?: Record<string, unknown> }).fields ?? {})) {
            names.add(key);
          }
        }
      }
      return Array.from(names).join(',');
    }
    return '';
  }

  private async getFieldMap(tableName: TableName): Promise<Map<string, FeishuFieldMeta>> {
    const cached = this.fieldMetaCache[tableName];
    if (cached) return cached;

    const tableId = this.tableIdMap[tableName];
    const map = new Map<string, FeishuFieldMeta>();
    let pageToken = '';
    let hasMore = true;
    while (hasMore) {
      const params: Record<string, string> = { page_size: '100' };
      if (pageToken) params.page_token = pageToken;
      const data = await this.apiRequest<{
        items?: FeishuFieldMeta[];
        has_more?: boolean;
        page_token?: string;
      }>('GET', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/fields`, undefined, params);
      for (const field of data.items ?? []) {
        map.set(field.field_name, field);
      }
      hasMore = !!data.has_more;
      pageToken = data.page_token ?? '';
    }

    this.fieldMetaCache[tableName] = map;
    return map;
  }

  private async hasField(tableName: TableName, fieldName: string): Promise<boolean> {
    const fields = await this.getFieldMap(tableName);
    return fields.has(fieldName);
  }

  private async getFieldType(tableName: TableName, fieldName: string): Promise<number | null> {
    const fields = await this.getFieldMap(tableName);
    return fields.get(fieldName)?.type ?? null;
  }

  private async searchAll(tableId: string, filter?: string): Promise<Record<string, unknown>[]> {
    const allItems: Record<string, unknown>[] = [];
    let pageToken = '';
    let hasMore = true;
    while (hasMore) {
      const params: Record<string, string> = { page_size: '500' };
      if (pageToken) params.page_token = pageToken;
      const reqBody: Record<string, unknown> = {};
      if (filter) {
        reqBody.filter = { conjunction: 'and', conditions: [{ field_name: filter, operator: 'isNotEmpty' }] };
      }
      const data = await this.apiRequest<{
        items?: Array<{ record_id: string; fields: Record<string, unknown> }>;
        has_more?: boolean;
        page_token?: string;
      }>('POST', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/records/search`, reqBody, params);
      if (data.items) {
        for (const item of data.items) {
          allItems.push({ _record_id: item.record_id, ...item.fields });
        }
      }
      hasMore = !!data.has_more;
      pageToken = data.page_token ?? '';
    }
    return allItems;
  }

  private async searchByField(tableName: TableName, fieldName: string, value: string): Promise<Record<string, unknown>[]> {
    if (!(await this.hasField(tableName, fieldName))) return [];
    const tableId = this.tableIdMap[tableName];
    const data = await this.apiRequest<{
      items?: Array<{ record_id: string; fields: Record<string, unknown> }>;
    }>('POST', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/records/search`, {
      filter: { conjunction: 'and', conditions: [{ field_name: fieldName, operator: 'is', value: [value] }] },
    }, { page_size: '500' });
    return (data.items ?? []).map((item) => ({ _record_id: item.record_id, ...item.fields }));
  }

  private async createRecord(tableName: TableName, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tableId = this.tableIdMap[tableName];
    const writableFields = await this.normalizeFields(tableName, fields);
    const data = await this.apiRequest<{ record: { record_id: string; fields: Record<string, unknown> } }>(
      'POST', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/records`, { fields: writableFields },
    );
    return { _record_id: data.record.record_id, ...data.record.fields };
  }

  private async batchCreate(tableName: TableName, recordsFields: Record<string, unknown>[]): Promise<void> {
    if (recordsFields.length === 0) return;
    const tableId = this.tableIdMap[tableName];
    const records: Array<{ fields: Record<string, unknown> }> = [];
    for (const fields of recordsFields) {
      records.push({ fields: await this.normalizeFields(tableName, fields) });
    }
    for (let i = 0; i < records.length; i += 500) {
      const batch = records.slice(i, i + 500);
      await this.apiRequest('POST', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/records/batch_create`, { records: batch });
    }
  }

  private async updateRecord(tableName: TableName, recordId: string, fields: Record<string, unknown>): Promise<void> {
    const tableId = this.tableIdMap[tableName];
    await this.apiRequest('PUT', `/bitable/v1/apps/${this.appToken}/tables/${tableId}/records/${recordId}`, { fields: await this.normalizeFields(tableName, fields) });
  }

  private msToIso(val: unknown): string {
    if (typeof val === 'number') return new Date(val).toISOString();
    if (typeof val === 'string') return val;
    return new Date().toISOString();
  }

  private safeJson(val: unknown, fallback: string): string {
    const text = this.asString(val, '');
    if (text) return text;
    if (val != null) return JSON.stringify(val);
    return fallback;
  }

  private parseJson<T>(val: unknown, fallback: T): T {
    const text = this.asString(val, '');
    if (text) {
      try { return JSON.parse(text) as T; } catch { return fallback; }
    }
    if (val != null && typeof val === 'object') return val as T;
    return fallback;
  }

  private fieldToPlain(val: unknown): unknown {
    if (val == null) return null;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    if (Array.isArray(val)) {
      return val
        .map((item) => this.fieldToPlain(item))
        .filter((item) => item != null && String(item) !== '')
        .join('');
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      for (const key of ['text', 'name', 'value', 'url', 'link']) {
        if (obj[key] != null) return this.fieldToPlain(obj[key]);
      }
      return JSON.stringify(obj);
    }
    return String(val);
  }

  private asString(val: unknown, fallback = ''): string {
    const plain = this.fieldToPlain(val);
    if (plain == null) return fallback;
    if (typeof plain === 'string') return plain;
    if (typeof plain === 'number' || typeof plain === 'boolean') return String(plain);
    return JSON.stringify(plain);
  }

  private asNumber(val: unknown, fallback = 0): number {
    if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
    const num = Number(this.asString(val, ''));
    return Number.isFinite(num) ? num : fallback;
  }

  private asBoolean(val: unknown, fallback = false): boolean {
    if (typeof val === 'boolean') return val;
    const text = this.asString(val, '').trim().toLowerCase();
    if (['true', '1', 'yes', '是', '启用'].includes(text)) return true;
    if (['false', '0', 'no', '否', '停用'].includes(text)) return false;
    return fallback;
  }

  private compactFields(fields: Record<string, unknown>): Record<string, unknown> {
    const compact: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value === null || value === undefined) continue;
      if (typeof value === 'number' && Number.isNaN(value)) continue;
      compact[key] = value;
    }
    return compact;
  }

  private isNativeRecordId(value: string): boolean {
    return /^rec[a-zA-Z0-9]+$/.test(value);
  }

  private rowId(row: Record<string, unknown>): string {
    return this.asString(row.id) || this.asString(row._record_id);
  }

  private nativeRowId(row: Record<string, unknown>): string {
    return this.asString(row._record_id) || this.asString(row.id);
  }

  private answerId(row: Record<string, unknown>): string {
    return this.nativeRowId(row);
  }

  private extractLinkedRecordIds(val: unknown): string[] {
    if (val == null) return [];
    if (typeof val === 'string') return val ? [val] : [];
    if (Array.isArray(val)) return val.flatMap((item) => this.extractLinkedRecordIds(item));
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (Array.isArray(obj.link_record_ids)) return obj.link_record_ids.flatMap((item) => this.extractLinkedRecordIds(item));
      if (Array.isArray(obj.record_ids)) return obj.record_ids.flatMap((item) => this.extractLinkedRecordIds(item));
      for (const key of ['record_id', 'recordId', 'id', 'text']) {
        if (typeof obj[key] === 'string') return [obj[key] as string];
      }
    }
    return [];
  }

  private linkedId(val: unknown): string {
    return this.extractLinkedRecordIds(val)[0] ?? this.asString(val);
  }

  private async resolveNativeRecordId(tableName: TableName, id: string): Promise<string> {
    if (!id) return '';
    if (this.isNativeRecordId(id)) return id;
    const rows = await this.searchByField(tableName, 'id', id);
    if (rows.length > 0) return this.asString(rows[0]._record_id);
    const allRows = await this.searchAll(this.tableIdMap[tableName]);
    const match = allRows.find((row) => this.asString(row.id) === id);
    return match ? this.asString(match._record_id) : '';
  }

  private async findRowsById(tableName: TableName, id: string): Promise<Record<string, unknown>[]> {
    if (this.isNativeRecordId(id)) {
      const rows = await this.searchAll(this.tableIdMap[tableName]);
      return rows.filter((row) => this.asString(row._record_id) === id);
    }
    return this.searchByField(tableName, 'id', id);
  }

  private async findRowsByRelationOrText(tableName: TableName, fieldName: string, value: string): Promise<Record<string, unknown>[]> {
    if (!value) return [];
    const fieldType = await this.getFieldType(tableName, fieldName);
    if (fieldType === 18) {
      const rows = await this.searchAll(this.tableIdMap[tableName]);
      return rows.filter((row) => this.extractLinkedRecordIds(row[fieldName]).includes(value));
    }
    return this.searchByField(tableName, fieldName, value);
  }

  private async relationFieldValue(tableName: TableName, fieldName: string, linkedTableName: TableName, value: string): Promise<unknown> {
    const fieldType = await this.getFieldType(tableName, fieldName);
    if (fieldType !== 18) return value;
    const nativeId = await this.resolveNativeRecordId(linkedTableName, value);
    return nativeId ? [nativeId] : undefined;
  }

  private fromFeishuBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') return value;
    const text = this.asString(value, '').trim().toLowerCase();
    if (['true', '1', 'yes', 'y', '是', '对', '正确', '启用'].includes(text)) return true;
    if (['false', '0', 'no', 'n', '否', '错', '错误', '停用'].includes(text)) return false;
    return fallback;
  }

  private toFeishuSingleSelect(fieldName: string, value: unknown): unknown {
    if (value == null) return value;
    if (fieldName === 'isCorrect') return this.fromFeishuBoolean(value) ? '是' : '否';
    if (fieldName === 'reviewStatus') {
      const status = this.asString(value);
      if (['auto_scored', 'initial_scored', 'ai_scored'].includes(status)) return 'ai_scored';
      if (['pending', 'pending_review'].includes(status)) return '待审核';
      if (status === 'reviewed') return '已通过';
      return status;
    }
    if (fieldName === 'status') {
      const status = this.asString(value);
      if (status === 'in_progress') return '评估中';
      if (status === 'submitted') return '已完成';
      if (status === 'reviewed' || status === 'report_ready') return '已完成';
      return status;
    }
    if (fieldName === 'isEnabled') return this.fromFeishuBoolean(value, true) ? '启用' : '停用';
    return typeof value === 'boolean' ? (value ? '是' : '否') : value;
  }

  private fromEvaluationStatus(value: unknown): V11EvaluationRecord['status'] {
    const status = this.asString(value, 'submitted');
    if (status === '待评估') return 'in_progress';
    if (status === '评估中') return 'in_progress';
    if (status === '已完成') return 'reviewed';
    if (status === '已取消') return 'submitted';
    return status as V11EvaluationRecord['status'];
  }

  private fromReviewStatus(value: unknown): string | null {
    if (value == null) return null;
    const status = this.asString(value);
    if (status === '待审核') return 'pending';
    if (status === '已通过') return 'reviewed';
    if (status === '已驳回') return 'rejected';
    if (status === 'ai_scored') return 'initial_scored';
    return status;
  }

  private async normalizeFields(tableName: TableName, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
    const fieldMap = await this.getFieldMap(tableName);
    const compact = this.compactFields(fields);
    const normalized: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(compact)) {
      const field = fieldMap.get(key);
      if (!field) continue;
      let value = rawValue;
      if (field.type === 3) value = this.toFeishuSingleSelect(key, value);
      if (field.type === 5 && typeof value === 'string') {
        const timestamp = Date.parse(value);
        if (Number.isFinite(timestamp)) value = timestamp;
      }
      if (field.type === 18) {
        const ids = this.extractLinkedRecordIds(value);
        if (ids.length === 0) continue;
        value = ids;
      }
      normalized[key] = value;
    }
    return normalized;
  }

  private rDim(r: Record<string, unknown>): V11Dimension {
    return {
      id: this.rowId(r), code: this.asString(r.code), name: this.asString(r.name),
      description: this.asString(r.description), sortOrder: this.asNumber(r.sortOrder),
      isEnabled: this.fromFeishuBoolean(r.isEnabled, true),
    };
  }

  private rConfig(r: Record<string, unknown>): V11AssessmentConfig {
    return {
      id: this.rowId(r), version: this.asString(r.version, 'V1.1'),
      taskMode: this.asString(r.taskMode, 'five_select_three') as V11AssessmentConfig['taskMode'],
      basicScoreTotal: this.asNumber(r.basicScoreTotal, 25),
      taskScoreTotal: this.asNumber(r.taskScoreTotal, 60),
      interestScoreTotal: this.asNumber(r.interestScoreTotal, 15),
      isActive: this.fromFeishuBoolean(r.isActive, true),
      notes: this.asString(r.notes), updatedAt: this.msToIso(r.updatedAt),
    };
  }

  private rBQ(r: Record<string, unknown>): V11BasicQuestion {
    return {
      id: this.nativeRowId(r), dimensionCode: this.asString(r.dimensionCode),
      questionType: this.asString(r.questionType) as V11BasicQuestion['questionType'],
      questionText: this.asString(r.questionText),
      optionsJson: r.optionsJson != null ? this.asString(r.optionsJson) : null,
      correctAnswer: r.correctAnswer != null ? this.asString(r.correctAnswer) : null,
      referenceAnswer: r.referenceAnswer != null ? this.asString(r.referenceAnswer) : null,
      score: this.asNumber(r.score), rubric: r.rubric != null ? this.asString(r.rubric) : null,
      sortOrder: this.asNumber(r.sortOrder), isEnabled: this.fromFeishuBoolean(r.isEnabled, true),
    };
  }

  private rTQ(r: Record<string, unknown>): V11TaskQuestion {
    return {
      id: this.nativeRowId(r), dimensionCode: this.asString(r.dimensionCode),
      title: this.asString(r.title), scenario: this.asString(r.scenario),
      mainTask: this.asString(r.mainTask), extensionQuestion: this.asString(r.extensionQuestion),
      scoreTotal: this.asNumber(r.scoreTotal, 20),
      rubricJson: r.rubricJson != null ? this.asString(r.rubricJson) : '{}',
      sortOrder: this.asNumber(r.sortOrder), isEnabled: this.fromFeishuBoolean(r.isEnabled, true),
    };
  }

  private rIQ(r: Record<string, unknown>): V11InterestQuestion {
    return {
      id: this.nativeRowId(r), questionText: this.asString(r.questionText),
      score: this.asNumber(r.score, 5), rubric: this.asString(r.rubric),
      sortOrder: this.asNumber(r.sortOrder), isEnabled: this.fromFeishuBoolean(r.isEnabled, true),
    };
  }

  private rRec(r: Record<string, unknown>): V11EvaluationRecord {
    return {
      id: this.rowId(r), newcomerName: this.asString(r.newcomerName),
      candidateId: r.candidateId != null ? this.asString(r.candidateId) : null,
      targetRole: this.asString(r.targetRole),
      evaluatorName: r.evaluatorName != null ? this.asString(r.evaluatorName) : null,
      assessmentDate: this.msToIso(r.assessmentDate),
      status: this.fromEvaluationStatus(r.status),
      taskMode: this.asString(r.taskMode),
      selectedTaskDirectionsJson: this.safeJson(r.selectedTaskDirectionsJson, '[]'),
      basicScore: this.asNumber(r.basicScore), taskScore: this.asNumber(r.taskScore),
      interestScore: this.asNumber(r.interestScore), totalScore: this.asNumber(r.totalScore),
      mainDirection: r.mainDirection != null ? this.asString(r.mainDirection) : null,
      secondaryDirection: r.secondaryDirection != null ? this.asString(r.secondaryDirection) : null,
      potentialDirection: r.potentialDirection != null ? this.asString(r.potentialDirection) : null,
      notRecommendedDirection: r.notRecommendedDirection != null ? this.asString(r.notRecommendedDirection) : null,
      talentProfile: r.talentProfile != null ? this.asString(r.talentProfile) : null,
      createdAt: this.msToIso(r.createdAt), updatedAt: this.msToIso(r.updatedAt),
    };
  }

  private rBA(r: Record<string, unknown>): V11BasicAnswer {
    return {
      id: this.answerId(r), recordId: this.linkedId(r.recordId),
      questionId: this.linkedId(r.questionId), dimensionCode: this.asString(r.dimensionCode),
      answer: this.asString(r.answer), autoScore: this.asNumber(r.autoScore),
      manualScore: r.manualScore != null ? this.asNumber(r.manualScore) : null,
      finalScore: this.asNumber(r.finalScore),
      isCorrect: r.isCorrect != null ? this.fromFeishuBoolean(r.isCorrect) : null,
      reviewStatus: this.fromReviewStatus(r.reviewStatus),
      comment: r.comment != null ? this.asString(r.comment) : null,
      createdAt: this.msToIso(r.createdAt),
    };
  }

  private rTA(r: Record<string, unknown>): V11TaskAnswer {
    return {
      id: this.answerId(r), recordId: this.linkedId(r.recordId),
      taskId: this.linkedId(r.taskId), dimensionCode: this.asString(r.dimensionCode),
      mainAnswer: this.asString(r.mainAnswer), extensionAnswer: this.asString(r.extensionAnswer),
      scoreBasicUnderstanding: this.asNumber(r.scoreBasicUnderstanding ?? r.score_basicUnderstanding),
      scoreAnalysisQuality: this.asNumber(r.scoreAnalysisQuality ?? r.score_analysisQuality),
      scoreStructureExpression: this.asNumber(r.scoreStructureExpression ?? r.score_structureExpression),
      scoreApplicationLanding: this.asNumber(r.scoreApplicationLanding ?? r.score_applicationLanding),
      scoreExtensionThinking: this.asNumber(r.scoreExtensionThinking ?? r.score_extensionThinking),
      finalScore: this.asNumber(r.finalScore),
      reviewStatus: this.fromReviewStatus(r.reviewStatus),
      comment: r.comment != null ? this.asString(r.comment) : null,
      createdAt: this.msToIso(r.createdAt),
    };
  }

  private rIA(r: Record<string, unknown>): V11InterestAnswer {
    return {
      id: this.answerId(r), recordId: this.linkedId(r.recordId),
      questionId: this.linkedId(r.questionId), answer: this.asString(r.answer),
      relatedDirectionCodesJson: this.safeJson(r.relatedDirectionCodesJson, '[]'),
      manualScore: r.manualScore != null ? this.asNumber(r.manualScore) : null,
      finalScore: this.asNumber(r.finalScore),
      comment: r.comment != null ? this.asString(r.comment) : null,
      createdAt: this.msToIso(r.createdAt),
    };
  }

  private rReport(r: Record<string, unknown>): V11AssessmentReport {
    return {
      id: this.rowId(r), recordId: this.linkedId(r.recordId),
      basicSummary: this.asString(r.basicSummary), taskSummary: this.asString(r.taskSummary),
      interestSummary: this.asString(r.interestSummary),
      directionScoresJson: this.safeJson(r.directionScoresJson, '{}'),
      strengths: this.asString(r.strengths), weaknesses: this.asString(r.weaknesses),
      suitableTasks: this.asString(r.suitableTasks),
      cultivationPlanJson: this.safeJson(r.cultivationPlanJson, '{}'),
      reportMarkdown: this.asString(r.reportMarkdown),
      createdAt: this.msToIso(r.createdAt), updatedAt: this.msToIso(r.updatedAt),
    };
  }

  private rResource(r: Record<string, unknown>): V11TrainingResource {
    return {
      id: this.rowId(r), dimensionCode: this.asString(r.dimensionCode),
      title: this.asString(r.title), resourceType: this.asString(r.resourceType),
      url: r.url != null ? this.asString(r.url) : null,
      description: this.asString(r.description),
      monthStage: (this.asNumber(r.monthStage, 1) || 1) as 1 | 2 | 3,
      isEnabled: this.fromFeishuBoolean(r.isEnabled, true), sortOrder: this.asNumber(r.sortOrder),
    };
  }

  async getDimensions(): Promise<V11Dimension[]> {
    const rows = await this.searchAll(this.tableIdMap.dimensions);
    return rows.map((r) => this.rDim(r));
  }

  async getConfig(): Promise<V11AssessmentConfig> {
    const rows = await this.searchAll(this.tableIdMap.assessment_configs);
    if (rows.length === 0) throw new Error('No assessment config found in bitable');
    return this.rConfig(rows[0]);
  }

  async getBasicQuestions(): Promise<V11BasicQuestion[]> {
    const rows = await this.searchAll(this.tableIdMap.basic_questions);
    return rows.map((r) => this.rBQ(r)).sort((a: V11BasicQuestion, b: V11BasicQuestion) => a.sortOrder - b.sortOrder);
  }

  async getTaskQuestions(): Promise<V11TaskQuestion[]> {
    const rows = await this.searchAll(this.tableIdMap.task_questions);
    return rows.map((r) => this.rTQ(r)).sort((a: V11TaskQuestion, b: V11TaskQuestion) => a.sortOrder - b.sortOrder);
  }

  async getInterestQuestions(): Promise<V11InterestQuestion[]> {
    const rows = await this.searchAll(this.tableIdMap.interest_questions);
    return rows.map((r) => this.rIQ(r)).sort((a: V11InterestQuestion, b: V11InterestQuestion) => a.sortOrder - b.sortOrder);
  }

  async getDataSourceConfig(): Promise<V11DataSourceConfig> {
    return {
      cloudFolderUrl: this.driveFolderToken ? `https://feishu.cn/drive/folder/${this.driveFolderToken}` : '',
      baseUrl: this.appToken ? `https://feishu.cn/base/${this.appToken}` : '',
      appId: this.appId,
      appSecret: '',
      hasAppSecret: !!this.appSecret,
      driveFolderToken: this.driveFolderToken,
      appToken: this.appToken,
      baseToken: '',
      tableIdMap: { ...this.tableIdMap },
      status: this.isConfigured() ? 'configured' : 'demo',
    };
  }

  async updateDataSourceConfig(update: Partial<V11DataSourceConfig>): Promise<V11DataSourceConfig> {
    this.configure(update);
    return this.getDataSourceConfig();
  }

  async getEvaluationRecords(): Promise<V11EvaluationRecord[]> {
    const rows = await this.searchAll(this.tableIdMap.evaluation_records);
    return rows.map((r) => this.rRec(r));
  }

  async getEvaluationRecordById(id: string): Promise<V11EvaluationRecord | null> {
    const rows = this.isNativeRecordId(id)
      ? (await this.searchAll(this.tableIdMap.evaluation_records)).filter((row) => this.asString(row._record_id) === id)
      : await this.searchByField('evaluation_records', 'id', id);
    return rows.length > 0 ? this.rRec(rows[0]) : null;
  }

  async getBasicAnswersByRecordId(recordId: string): Promise<V11BasicAnswer[]> {
    const nativeRecordId = await this.resolveNativeRecordId('evaluation_records', recordId);
    const rows = await this.findRowsByRelationOrText('basic_answers', 'recordId', nativeRecordId || recordId);
    return rows.map((r) => this.rBA(r));
  }

  async getTaskAnswersByRecordId(recordId: string): Promise<V11TaskAnswer[]> {
    const nativeRecordId = await this.resolveNativeRecordId('evaluation_records', recordId);
    const rows = await this.findRowsByRelationOrText('task_answers', 'recordId', nativeRecordId || recordId);
    return rows.map((r) => this.rTA(r));
  }

  async getInterestAnswersByRecordId(recordId: string): Promise<V11InterestAnswer[]> {
    const nativeRecordId = await this.resolveNativeRecordId('evaluation_records', recordId);
    const rows = await this.findRowsByRelationOrText('interest_answers', 'recordId', nativeRecordId || recordId);
    return rows.map((r) => this.rIA(r));
  }

  async createEvaluationRecord(record: V11EvaluationRecord): Promise<V11EvaluationRecord> {
    const created = await this.createRecord('evaluation_records', {
      ...record,
      assessmentDate: new Date(record.assessmentDate).getTime(),
      createdAt: new Date(record.createdAt).getTime(),
      updatedAt: new Date(record.updatedAt).getTime(),
    });
    if (await this.hasField('evaluation_records', 'id')) return record;
    return { ...record, id: this.asString(created._record_id, record.id) };
  }

  async saveBasicAnswers(answers: V11BasicAnswer[]): Promise<void> {
    const rows: Record<string, unknown>[] = [];
    for (const a of answers) {
      rows.push({
        ...a,
        recordId: await this.relationFieldValue('basic_answers', 'recordId', 'evaluation_records', a.recordId),
        questionId: await this.relationFieldValue('basic_answers', 'questionId', 'basic_questions', a.questionId),
        isCorrect: a.isCorrect === null ? undefined : !!a.isCorrect,
        createdAt: new Date(a.createdAt).getTime(),
      });
    }
    await this.batchCreate('basic_answers', rows);
  }

  async saveTaskAnswers(answers: V11TaskAnswer[]): Promise<void> {
    const rows: Record<string, unknown>[] = [];
    for (const a of answers) {
      rows.push({
        ...a,
        recordId: await this.relationFieldValue('task_answers', 'recordId', 'evaluation_records', a.recordId),
        taskId: await this.relationFieldValue('task_answers', 'taskId', 'task_questions', a.taskId),
        score_basicUnderstanding: a.scoreBasicUnderstanding,
        score_analysisQuality: a.scoreAnalysisQuality,
        score_structureExpression: a.scoreStructureExpression,
        score_applicationLanding: a.scoreApplicationLanding,
        score_extensionThinking: a.scoreExtensionThinking,
        createdAt: new Date(a.createdAt).getTime(),
      });
    }
    await this.batchCreate('task_answers', rows);
  }

  async saveInterestAnswers(answers: V11InterestAnswer[]): Promise<void> {
    const rows: Record<string, unknown>[] = [];
    for (const a of answers) {
      rows.push({
        ...a,
        recordId: await this.relationFieldValue('interest_answers', 'recordId', 'evaluation_records', a.recordId),
        questionId: await this.relationFieldValue('interest_answers', 'questionId', 'interest_questions', a.questionId),
        createdAt: new Date(a.createdAt).getTime(),
      });
    }
    await this.batchCreate('interest_answers', rows);
  }

  async updateBasicAnswer(id: string, update: Partial<V11BasicAnswer>): Promise<void> {
    const rows = await this.findRowsById('basic_answers', id);
    if (rows.length > 0) {
      const fields: Record<string, unknown> = { ...update };
      if (update.isCorrect !== undefined) fields.isCorrect = !!update.isCorrect;
      await this.updateRecord('basic_answers', String(rows[0]._record_id), fields);
    }
  }

  async updateTaskAnswer(id: string, update: Partial<V11TaskAnswer>): Promise<void> {
    const rows = await this.findRowsById('task_answers', id);
    if (rows.length > 0) {
      await this.updateRecord('task_answers', String(rows[0]._record_id), {
        ...update,
        score_basicUnderstanding: update.scoreBasicUnderstanding,
        score_analysisQuality: update.scoreAnalysisQuality,
        score_structureExpression: update.scoreStructureExpression,
        score_applicationLanding: update.scoreApplicationLanding,
        score_extensionThinking: update.scoreExtensionThinking,
      });
    }
  }

  async updateInterestAnswer(id: string, update: Partial<V11InterestAnswer>): Promise<void> {
    const rows = await this.findRowsById('interest_answers', id);
    if (rows.length > 0) {
      await this.updateRecord('interest_answers', String(rows[0]._record_id), { ...update });
    }
  }

  async updateEvaluationRecord(id: string, update: Partial<V11EvaluationRecord>): Promise<V11EvaluationRecord> {
    const rows = await this.findRowsById('evaluation_records', id);
    if (rows.length === 0) throw new Error(`Record ${id} not found`);
    const fields: Record<string, unknown> = { ...update };
    if (update.updatedAt) fields.updatedAt = new Date(update.updatedAt).getTime();
    if (update.assessmentDate) fields.assessmentDate = new Date(update.assessmentDate).getTime();
    await this.updateRecord('evaluation_records', String(rows[0]._record_id), fields);
    const updated = await this.getEvaluationRecordById(id);
    if (!updated) throw new Error(`Failed to read back record ${id}`);
    return updated;
  }

  async createReport(report: V11AssessmentReport): Promise<V11AssessmentReport> {
    const recordId = await this.relationFieldValue('assessment_reports', 'recordId', 'evaluation_records', report.recordId);
    const created = await this.createRecord('assessment_reports', {
      ...report,
      recordId,
      createdAt: new Date(report.createdAt).getTime(),
      updatedAt: new Date(report.updatedAt).getTime(),
    });
    if (await this.hasField('assessment_reports', 'id')) return report;
    return { ...report, id: this.asString(created._record_id, report.id) };
  }

  async updateReport(id: string, update: Partial<V11AssessmentReport>): Promise<V11AssessmentReport> {
    const rows = await this.findRowsById('assessment_reports', id);
    if (rows.length === 0) throw new Error(`Report ${id} not found`);
    const fields: Record<string, unknown> = { ...update };
    if (update.updatedAt) fields.updatedAt = new Date(update.updatedAt).getTime();
    await this.updateRecord('assessment_reports', String(rows[0]._record_id), fields);
    const all = await this.getReports();
    const updated = all.find((r: V11AssessmentReport) => r.id === id);
    if (!updated) throw new Error(`Failed to read back report ${id}`);
    return updated;
  }

  async getReports(): Promise<V11AssessmentReport[]> {
    const rows = await this.searchAll(this.tableIdMap.assessment_reports);
    return rows.map((r) => this.rReport(r));
  }

  async getReportByRecordId(recordId: string): Promise<V11AssessmentReport | null> {
    const nativeRecordId = await this.resolveNativeRecordId('evaluation_records', recordId);
    const rows = await this.findRowsByRelationOrText('assessment_reports', 'recordId', nativeRecordId || recordId);
    return rows.length > 0 ? this.rReport(rows[0]) : null;
  }

  async getTrainingResources(): Promise<V11TrainingResource[]> {
    const rows = await this.searchAll(this.tableIdMap.training_resources);
    return rows.map((r) => this.rResource(r));
  }

  async createTrainingResource(resource: V11TrainingResource): Promise<V11TrainingResource> {
    await this.createRecord('training_resources', { ...resource });
    return resource;
  }

  async updateTrainingResource(id: string, update: Partial<V11TrainingResource>): Promise<V11TrainingResource> {
    const rows = await this.findRowsById('training_resources', id);
    if (rows.length === 0) throw new Error(`Resource ${id} not found`);
    await this.updateRecord('training_resources', String(rows[0]._record_id), { ...update });
    const all = await this.getTrainingResources();
    const updated = all.find((r: V11TrainingResource) => r.id === id);
    if (!updated) throw new Error(`Failed to read back resource ${id}`);
    return updated;
  }

  async deleteTrainingResource(id: string): Promise<void> {
    const rows = await this.findRowsById('training_resources', id);
    if (rows.length > 0) {
      await this.apiRequest(
        'DELETE',
        `/bitable/v1/apps/${this.appToken}/tables/${this.tableIdMap.training_resources}/records/${rows[0]._record_id}`,
      );
    }
  }

  async createReviewNotificationIfMissing(record: V11EvaluationRecord): Promise<'created' | 'skipped'> {
    const nativeRecordId = await this.resolveNativeRecordId('evaluation_records', record.id);
    const rows = await this.findRowsByRelationOrText('notifications', 'recordId', nativeRecordId || record.id);
    const exists = rows.some((row) => this.asString(row.type) === 'review_needed');
    if (exists) return 'skipped';

    const now = new Date().toISOString();
    const recordId = await this.relationFieldValue('notifications', 'recordId', 'evaluation_records', record.id);
    await this.createRecord('notifications', {
      id: `notice-${record.id}-review-needed`,
      recordId,
      type: 'review_needed',
      title: 'V1.1 测评待人工评分',
      content: `${record.newcomerName || '未命名候选人'} 的测评已提交，请进入人工评分完成复核。`,
      targetRole: 'reviewer',
      status: 'pending',
      createdAt: new Date(now).getTime(),
    });
    return 'created';
  }

  async seedTable(tableName: string, records: Record<string, unknown>[]): Promise<number> {
    const tableId = this.tableIds[tableName];
    if (!tableId) throw new Error(`Table ID not configured for: ${tableName}`);
    if (!TABLE_NAMES.includes(tableName as TableName)) throw new Error(`Unknown table: ${tableName}`);
    await this.batchCreate(tableName as TableName, records);
    return records.length;
  }

  getEnvStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    status.FEISHU_APP_ID = !!this.appId;
    status.FEISHU_APP_SECRET = !!this.appSecret;
    status.FEISHU_BITABLE_APP_TOKEN = !!this.appToken;
    status.FEISHU_DRIVE_FOLDER_TOKEN = !!this.driveFolderToken;
    for (const name of TABLE_NAMES) {
      status[`FEISHU_TABLE_ID_${name.toUpperCase()}`] = !!this.tableIds[name];
    }
    return status;
  }

  async testConnection(): Promise<V11ConnectionTestResult> {
    if (!this.appId || !this.appSecret) {
      return { success: false, message: '飞书应用 ID 或应用密钥未配置，请先在后台数据源设置中保存', tablesAccessible: {} };
    }
    if (!this.appToken) {
      return { success: false, message: '多维表格 Token 未配置，请先在后台数据源设置中保存', tablesAccessible: {} };
    }
    try {
      const tokenRes = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
      });
      const tokenData = await tokenRes.json() as Record<string, unknown>;
      if (tokenData.code !== 0) {
        return { success: false, message: `获取 token 失败: ${tokenData.msg} (code: ${tokenData.code})`, tablesAccessible: {} };
      }
      const token = tokenData.tenant_access_token as string;
      this.cachedToken = token;
      this.tokenExpiresAt = Date.now() + ((tokenData.expire as number) ?? 7200) * 1000;
      const tablesAccessible: Record<string, boolean> = {};
      for (const name of TABLE_NAMES) {
        const tid = this.tableIds[name];
        if (!tid) { tablesAccessible[name] = false; continue; }
        try {
          await this.apiRequest('POST', `/bitable/v1/apps/${this.appToken}/tables/${tid}/records/search`, {}, { page_size: '1' });
          tablesAccessible[name] = true;
        } catch {
          tablesAccessible[name] = false;
        }
      }
      const allOk = Object.values(tablesAccessible).every(Boolean);
      return {
        success: allOk,
        message: allOk ? '连接成功，所有数据表均可访问' : `部分数据表不可访问，请检查 tableId 配置和应用权限`,
        tablesAccessible,
      };
    } catch (err) {
      return { success: false, message: `连接失败: ${err instanceof Error ? err.message : String(err)}`, tablesAccessible: {} };
    }
  }

  getMissingTables(tablesStatus: Record<string, boolean>): string[] {
    return TABLE_NAMES.filter((name) => !tablesStatus[name]);
  }
}
