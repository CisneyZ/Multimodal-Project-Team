import React, { useEffect, useState } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type {
  V11DataSourceConfig,
  V11DataSourceStatus,
  V11SchemaGuide,
  V11ConnectionTestResult,
} from '@shared/api.interface';
import {
  getDataSourceConfig,
  getDataSourceStatus,
  getSchemaGuide,
  testV11Connection,
  checkV11Schema,
  syncV11SeedData,
  updateDataSourceConfig,
} from '../../api/v11';

const ENV_VAR_LABELS: Record<string, string> = {
  FEISHU_APP_ID: '飞书应用 ID',
  FEISHU_APP_SECRET: '飞书应用密钥',
  FEISHU_BITABLE_APP_TOKEN: '多维表格 Token',
  FEISHU_DRIVE_FOLDER_TOKEN: '云盘文件夹 Token',
  FEISHU_TABLE_ID_DIMENSIONS: '能力维度表',
  FEISHU_TABLE_ID_ASSESSMENT_CONFIGS: '测评配置表',
  FEISHU_TABLE_ID_BASIC_QUESTIONS: '基础题库表',
  FEISHU_TABLE_ID_TASK_QUESTIONS: '任务题库表',
  FEISHU_TABLE_ID_INTEREST_QUESTIONS: '兴趣问卷表',
  FEISHU_TABLE_ID_EVALUATION_RECORDS: '测评记录表',
  FEISHU_TABLE_ID_BASIC_ANSWERS: '基础答题表',
  FEISHU_TABLE_ID_TASK_ANSWERS: '任务答题表',
  FEISHU_TABLE_ID_INTEREST_ANSWERS: '兴趣答题表',
  FEISHU_TABLE_ID_ASSESSMENT_REPORTS: '评估报告表',
  FEISHU_TABLE_ID_TRAINING_RESOURCES: '培训材料表',
  FEISHU_TABLE_ID_NOTIFICATIONS: '通知记录表',
};

const TABLE_FIELDS = [
  { name: 'dimensions', envKey: 'FEISHU_TABLE_ID_DIMENSIONS' },
  { name: 'assessment_configs', envKey: 'FEISHU_TABLE_ID_ASSESSMENT_CONFIGS' },
  { name: 'basic_questions', envKey: 'FEISHU_TABLE_ID_BASIC_QUESTIONS' },
  { name: 'task_questions', envKey: 'FEISHU_TABLE_ID_TASK_QUESTIONS' },
  { name: 'interest_questions', envKey: 'FEISHU_TABLE_ID_INTEREST_QUESTIONS' },
  { name: 'evaluation_records', envKey: 'FEISHU_TABLE_ID_EVALUATION_RECORDS' },
  { name: 'basic_answers', envKey: 'FEISHU_TABLE_ID_BASIC_ANSWERS' },
  { name: 'task_answers', envKey: 'FEISHU_TABLE_ID_TASK_ANSWERS' },
  { name: 'interest_answers', envKey: 'FEISHU_TABLE_ID_INTEREST_ANSWERS' },
  { name: 'assessment_reports', envKey: 'FEISHU_TABLE_ID_ASSESSMENT_REPORTS' },
  { name: 'training_resources', envKey: 'FEISHU_TABLE_ID_TRAINING_RESOURCES' },
  { name: 'notifications', envKey: 'FEISHU_TABLE_ID_NOTIFICATIONS' },
];

const BASE_FIELDS = [
  { name: 'appId', label: '飞书应用 ID', placeholder: 'cli_xxx', type: 'text' },
  { name: 'appSecret', label: '飞书应用密钥', placeholder: '留空表示不修改已保存密钥', type: 'password' },
  { name: 'appToken', label: '多维表格 Token', placeholder: '多维表格 URL 中 /base/ 后面的 token', type: 'text' },
  { name: 'driveFolderToken', label: '云盘文件夹 Token', placeholder: '文件夹 URL 中 /folder/ 后面的 token', type: 'text' },
] as const;

type ConfigForm = {
  appId: string;
  appSecret: string;
  appToken: string;
  driveFolderToken: string;
  tableIdMap: Record<string, string>;
};

const emptyForm: ConfigForm = {
  appId: '',
  appSecret: '',
  appToken: '',
  driveFolderToken: '',
  tableIdMap: {},
};

function toForm(config?: V11DataSourceConfig | null): ConfigForm {
  if (!config) return { ...emptyForm, tableIdMap: {} };
  return {
    appId: config.appId ?? '',
    appSecret: '',
    appToken: config.appToken ?? '',
    driveFolderToken: config.driveFolderToken ?? '',
    tableIdMap: { ...(config.tableIdMap ?? {}) },
  };
}

const DataSourceSettings: React.FC = () => {
  const [status, setStatus] = useState<V11DataSourceStatus | null>(null);
  const [schema, setSchema] = useState<V11SchemaGuide | null>(null);
  const [config, setConfig] = useState<V11DataSourceConfig | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<V11ConnectionTestResult | null>(null);
  const [checkingSchema, setCheckingSchema] = useState(false);
  const [schemaResult, setSchemaResult] = useState<{
    missingTables: string[];
    allTables: string[];
    message: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: string[];
    skipped: string[];
    message: string;
  } | null>(null);
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);
  const [expandedTutorial, setExpandedTutorial] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, g, c] = await Promise.all([
        getDataSourceStatus(),
        getSchemaGuide(),
        getDataSourceConfig(),
      ]);
      setStatus(s);
      setSchema(g);
      setConfig(c);
      setForm(toForm(c));
    } catch (err: unknown) {
      logger.error('加载数据源信息失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleBaseFieldChange = (name: keyof Omit<ConfigForm, 'tableIdMap'>, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableFieldChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      tableIdMap: { ...prev.tableIdMap, [name]: value },
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const cleanedTables = Object.fromEntries(
        TABLE_FIELDS.map((field) => [field.name, (form.tableIdMap[field.name] ?? '').trim()]),
      );
      const payload: Partial<V11DataSourceConfig> = {
        appId: form.appId.trim(),
        appSecret: form.appSecret.trim() || undefined,
        appToken: form.appToken.trim(),
        driveFolderToken: form.driveFolderToken.trim(),
        tableIdMap: cleanedTables,
      };
      const saved = await updateDataSourceConfig(payload);
      setConfig(saved);
      setForm(toForm(saved));
      const refreshed = await getDataSourceStatus();
      setStatus(refreshed);
      setSaveMessage('配置已保存。密钥不会回显，后续可直接点击连接检测。');
    } catch (err) {
      setSaveMessage('保存失败，请检查当前账号权限或稍后重试。');
      logger.error('保存飞书连接配置失败', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testV11Connection();
      setTestResult(result);
      const refreshed = await getDataSourceStatus();
      setStatus(refreshed);
    } catch (err) {
      setTestResult({ success: false, message: '请求失败，请检查网络', tablesAccessible: {} });
      logger.error('连接检测失败', err);
    } finally {
      setTesting(false);
    }
  };

  const handleCheckSchema = async () => {
    setCheckingSchema(true);
    setSchemaResult(null);
    try {
      const result = await checkV11Schema();
      setSchemaResult(result);
    } catch (err) {
      setSchemaResult({ missingTables: [], allTables: [], message: '请求失败，请检查网络' });
      logger.error('结构检查失败', err);
    } finally {
      setCheckingSchema(false);
    }
  };

  const handleSyncSeed = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncV11SeedData();
      setSyncResult(result);
    } catch (err) {
      setSyncResult({ synced: [], skipped: [], message: '请求失败，请检查网络' });
      logger.error('同步种子数据失败', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
      </div>
    );
  }

  const isDemo = status?.mode === 'demo';
  const hasSavedSecret = !!config?.hasAppSecret || !!status?.envVarsPresent?.FEISHU_APP_SECRET;
  const configuredCount = status?.envVarsPresent
    ? Object.values(status.envVarsPresent).filter(Boolean).length
    : 0;
  const requiredCount = status?.envVarsPresent ? Object.keys(status.envVarsPresent).length : 0;

  return (
    <div className="space-y-6">
      <div
        className={
          'rounded-sm border px-4 py-3 text-sm ' +
          (isDemo
            ? 'border-[hsl(33_85%_60%)] bg-[hsl(33_85%_96%)] text-[hsl(33_85%_35%)]'
            : 'border-[hsl(152_55%_50%)] bg-[hsl(152_55%_96%)] text-[hsl(152_55%_30%)]')
        }
      >
        <div className="flex items-center gap-2">
          {isDemo ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span className="font-medium">
            {isDemo
              ? '当前为演示数据模式 - 请在下方保存飞书连接配置后启用多维表格数据源'
              : '已具备飞书多维表格连接配置'}
          </span>
        </div>
        {status?.connectionMessage && <p className="mt-1 text-xs opacity-80">{status.connectionMessage}</p>}
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">飞书连接配置</h2>
          <span className="ml-auto rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
            密钥状态：{hasSavedSecret ? '已保存' : '未保存'}
          </span>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {BASE_FIELDS.map((field) => (
              <label key={field.name} className="space-y-1.5 text-xs font-medium text-foreground">
                <span>{field.label}</span>
                <input
                  type={field.type ?? 'text'}
                  value={form[field.name]}
                  placeholder={field.name === 'appSecret' && hasSavedSecret ? '已保存，留空表示不修改' : field.placeholder}
                  onChange={(event) => handleBaseFieldChange(field.name, event.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary"
                />
              </label>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">12 张多维表格 Table ID</h3>
              <span className="text-xs text-muted-foreground">从每张表 URL 的 table= 后复制</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TABLE_FIELDS.map((field) => (
                <label key={field.name} className="space-y-1.5 text-xs font-medium text-foreground">
                  <span>{ENV_VAR_LABELS[field.envKey]}</span>
                  <input
                    value={form.tableIdMap[field.name] ?? ''}
                    placeholder="tblxxxxxxxxxxxxxxxx"
                    onChange={(event) => handleTableFieldChange(field.name, event.target.value)}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              保存连接配置
            </button>
            <span className="text-xs text-muted-foreground">
              应用密钥只会保存到后端，不会在页面回显。
            </span>
            {saveMessage && <span className="text-xs text-muted-foreground">{saveMessage}</span>}
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">配置完整度</h2>
          <span className="ml-auto text-xs text-muted-foreground">已配置：{configuredCount}/{requiredCount}</span>
        </div>
        <div className="p-6">
          <p className="mb-4 text-xs text-muted-foreground">
            这里显示后端当前可用的连接项。配置可能来自上方保存内容或服务端环境变量。
          </p>
          {status?.envVarsPresent && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(status.envVarsPresent).map(([key, present]) => (
                <div key={key} className="flex items-center gap-2 rounded-sm border border-border/50 px-3 py-2 text-xs">
                  {present ? (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[hsl(152_55%_45%)]" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[hsl(0_65%_48%)]" />
                  )}
                  <span className="font-mono text-muted-foreground">{key}</span>
                  <span className="ml-auto text-muted-foreground/70">{ENV_VAR_LABELS[key] ?? key}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">连接与数据操作</h2>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              连接检测
            </button>
            <button
              type="button"
              onClick={handleCheckSchema}
              disabled={checkingSchema}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {checkingSchema ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              检查表结构
            </button>
            <button
              type="button"
              onClick={handleSyncSeed}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              同步初始题库
            </button>
          </div>

          {testResult && (
            <div
              className={
                'rounded-sm border px-4 py-3 text-sm ' +
                (testResult.success
                  ? 'border-[hsl(152_55%_50%)] bg-[hsl(152_55%_96%)]'
                  : 'border-[hsl(0_65%_55%)] bg-[hsl(0_65%_96%)]')
              }
            >
              <p className="font-medium">{testResult.message}</p>
              {Object.keys(testResult.tablesAccessible).length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {Object.entries(testResult.tablesAccessible).map(([name, ok]) => (
                    <span key={name} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {ok ? <CheckCircle className="h-3 w-3 text-[hsl(152_55%_45%)]" /> : <AlertCircle className="h-3 w-3 text-[hsl(0_65%_48%)]" />}
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {schemaResult && (
            <div className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{schemaResult.message}</p>
              {schemaResult.missingTables.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">缺失或不可访问：{schemaResult.missingTables.join('、')}</p>
              )}
            </div>
          )}

          {syncResult && (
            <div className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{syncResult.message}</p>
              {syncResult.skipped.length > 0 && <p className="mt-1 text-xs text-muted-foreground">跳过：{syncResult.skipped.join('、')}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedTutorial((prev) => !prev)}
          className="flex w-full items-center gap-2 border-b border-border px-6 py-4 text-left"
        >
          {expandedTutorial ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <h2 className="text-sm font-semibold text-foreground">获取 Token 的位置</h2>
        </button>
        {expandedTutorial && (
          <div className="space-y-3 p-6 text-sm text-muted-foreground">
            <p>应用 ID 和密钥在飞书开放平台的自建应用凭证页获取，应用需要开通多维表格读写权限。</p>
            <p>多维表格 Token 在表格链接的 /base/ 后面；每张表的 Table ID 在链接参数 table= 后面。</p>
            <p>云盘文件夹 Token 在文件夹链接的 /folder/ 后面，用于后续管理上传项目背景材料和规范文档。</p>
          </div>
        )}
      </div>

      <div className="rounded-sm border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">多维表格字段模板</h2>
          <span className="ml-auto text-xs text-muted-foreground">共 {schema?.tables.length ?? 0} 张表</span>
        </div>
        <div className="divide-y divide-border">
          {schema?.tables.map((table) => (
            <div key={table.name}>
              <button
                type="button"
                onClick={() => setExpandedSchema(expandedSchema === table.name ? null : table.name)}
                className="flex w-full items-center gap-2 px-6 py-3 text-left text-sm hover:bg-muted/50"
              >
                {expandedSchema === table.name ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-mono font-medium text-foreground">{table.name}</span>
                <span className="text-xs text-muted-foreground">{table.fields.length} 个字段</span>
              </button>
              {expandedSchema === table.name && (
                <div className="px-6 pb-4">
                  <div className="overflow-hidden rounded-sm border border-border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">字段名</th>
                          <th className="px-3 py-2 text-left font-medium">类型</th>
                          <th className="px-3 py-2 text-left font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {table.fields.map((field) => (
                          <tr key={field.name}>
                            <td className="px-3 py-2 font-mono text-foreground">{field.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{field.type}</td>
                            <td className="px-3 py-2 text-muted-foreground">{field.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSourceSettings;
