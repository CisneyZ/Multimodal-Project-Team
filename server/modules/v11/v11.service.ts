import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DemoAssessmentV11Repository, type AssessmentV11Repository } from './v11.repository';
import { FeishuBitableAdapter } from './feishu-bitable.adapter';
import { v4 as uuidv4 } from 'uuid';
import type {
  V11Dimension,
  V11AssessmentConfig,
  V11BasicQuestion,
  V11TaskQuestion,
  V11InterestQuestion,
  V11DataSourceConfig,
  V11DataSourceStatus,
  V11SchemaGuide,
  V11EvaluationRecord,
  V11AssessmentReport,
  V11TrainingResource,
  V11SubmitRequest,
  V11SubmitResponse,
  V11BasicAnswer,
  V11TaskAnswer,
  V11InterestAnswer,
  V11ReviewDto,
  V11EvaluationDetail,
  V11BasicAnswerWithQuestion,
  V11TaskAnswerWithQuestion,
  V11InterestAnswerWithQuestion,
  V11ConnectionTestResult,
  FeishuAgentAvailableAction,
  FeishuAgentActionRequest,
  FeishuAgentActionResult,
  FeishuAgentStatus,
} from '@shared/api.interface';

const SCHEMA_GUIDE: V11SchemaGuide = {
  tables: [
    { name: 'dimensions', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'code', type: 'text', description: '方向编码' }, { name: 'name', type: 'text', description: '方向名称' }, { name: 'description', type: 'text', description: '说明' }, { name: 'sortOrder', type: 'number', description: '排序' }, { name: 'isEnabled', type: 'checkbox', description: '是否启用' }] },
    { name: 'assessment_configs', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'version', type: 'text', description: '版本号' }, { name: 'taskMode', type: 'single_select', description: 'five_select_three|all_five' }, { name: 'basicScoreTotal', type: 'number', description: '基础认知总分' }, { name: 'taskScoreTotal', type: 'number', description: '任务测评总分' }, { name: 'interestScoreTotal', type: 'number', description: '兴趣匹配总分' }, { name: 'isActive', type: 'checkbox', description: '是否激活' }, { name: 'notes', type: 'text', description: '备注' }, { name: 'updatedAt', type: 'datetime', description: '更新时间' }] },
    { name: 'basic_questions', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'dimensionCode', type: 'text', description: '方向编码' }, { name: 'questionType', type: 'single_select', description: 'single_choice|true_false|short_answer' }, { name: 'questionText', type: 'text', description: '题干' }, { name: 'optionsJson', type: 'text', description: '选项JSON' }, { name: 'correctAnswer', type: 'text', description: '正确答案' }, { name: 'referenceAnswer', type: 'text', description: '参考答案' }, { name: 'score', type: 'number', description: '分值' }, { name: 'rubric', type: 'text', description: '评分标准' }, { name: 'sortOrder', type: 'number', description: '排序' }, { name: 'isEnabled', type: 'checkbox', description: '是否启用' }] },
    { name: 'task_questions', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'dimensionCode', type: 'text', description: '方向编码' }, { name: 'title', type: 'text', description: '任务标题' }, { name: 'scenario', type: 'text', description: '场景描述' }, { name: 'mainTask', type: 'text', description: '主任务' }, { name: 'extensionQuestion', type: 'text', description: '延展问题' }, { name: 'scoreTotal', type: 'number', description: '总分' }, { name: 'rubricJson', type: 'text', description: '评分结构JSON' }, { name: 'sortOrder', type: 'number', description: '排序' }, { name: 'isEnabled', type: 'checkbox', description: '是否启用' }] },
    { name: 'interest_questions', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'questionText', type: 'text', description: '题目' }, { name: 'score', type: 'number', description: '分值' }, { name: 'rubric', type: 'text', description: '评分标准' }, { name: 'sortOrder', type: 'number', description: '排序' }, { name: 'isEnabled', type: 'checkbox', description: '是否启用' }] },
    { name: 'evaluation_records', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'newcomerName', type: 'text', description: '新人姓名' }, { name: 'candidateId', type: 'text', description: '候选人ID' }, { name: 'targetRole', type: 'text', description: '目标岗位' }, { name: 'evaluatorName', type: 'text', description: '评估人' }, { name: 'assessmentDate', type: 'datetime', description: '评估日期' }, { name: 'status', type: 'single_select', description: 'in_progress|submitted|pending_review|reviewed|report_ready' }, { name: 'taskMode', type: 'text', description: '任务模式' }, { name: 'selectedTaskDirectionsJson', type: 'text', description: '已选任务方向' }, { name: 'basicScore', type: 'number', description: '基础认知得分' }, { name: 'taskScore', type: 'number', description: '任务测评得分' }, { name: 'interestScore', type: 'number', description: '兴趣匹配得分' }, { name: 'totalScore', type: 'number', description: '总分' }, { name: 'mainDirection', type: 'text', description: '主方向' }, { name: 'secondaryDirection', type: 'text', description: '辅方向' }, { name: 'potentialDirection', type: 'text', description: '潜力方向' }, { name: 'notRecommendedDirection', type: 'text', description: '不建议方向' }, { name: 'talentProfile', type: 'text', description: '人才画像' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }, { name: 'updatedAt', type: 'datetime', description: '更新时间' }] },
    { name: 'basic_answers', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'recordId', type: 'text', description: '记录ID' }, { name: 'questionId', type: 'text', description: '题目ID' }, { name: 'dimensionCode', type: 'text', description: '方向编码' }, { name: 'answer', type: 'text', description: '答案' }, { name: 'autoScore', type: 'number', description: '自动得分' }, { name: 'manualScore', type: 'number', description: '人工得分' }, { name: 'finalScore', type: 'number', description: '最终得分' }, { name: 'isCorrect', type: 'checkbox', description: '是否正确' }, { name: 'reviewStatus', type: 'text', description: '复核状态' }, { name: 'comment', type: 'text', description: '评语' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }] },
    { name: 'task_answers', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'recordId', type: 'text', description: '记录ID' }, { name: 'taskId', type: 'text', description: '任务ID' }, { name: 'dimensionCode', type: 'text', description: '方向编码' }, { name: 'mainAnswer', type: 'text', description: '主任务答案' }, { name: 'extensionAnswer', type: 'text', description: '延展答案' }, { name: 'score_basicUnderstanding', type: 'number', description: '基础理解(4分)' }, { name: 'score_analysisQuality', type: 'number', description: '分析质量(6分)' }, { name: 'score_structureExpression', type: 'number', description: '结构化表达(4分)' }, { name: 'score_applicationLanding', type: 'number', description: '应用落地(4分)' }, { name: 'score_extensionThinking', type: 'number', description: '延展思考(2分)' }, { name: 'finalScore', type: 'number', description: '最终得分' }, { name: 'reviewStatus', type: 'text', description: '复核状态' }, { name: 'comment', type: 'text', description: '评语' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }] },
    { name: 'interest_answers', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'recordId', type: 'text', description: '记录ID' }, { name: 'questionId', type: 'text', description: '题目ID' }, { name: 'answer', type: 'text', description: '答案' }, { name: 'relatedDirectionCodesJson', type: 'text', description: '关联方向编码' }, { name: 'manualScore', type: 'number', description: '人工得分' }, { name: 'finalScore', type: 'number', description: '最终得分' }, { name: 'comment', type: 'text', description: '评语' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }] },
    { name: 'assessment_reports', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'recordId', type: 'text', description: '记录ID' }, { name: 'basicSummary', type: 'text', description: '基础认知总结' }, { name: 'taskSummary', type: 'text', description: '任务测评总结' }, { name: 'interestSummary', type: 'text', description: '兴趣匹配总结' }, { name: 'directionScoresJson', type: 'text', description: '五维得分JSON' }, { name: 'strengths', type: 'text', description: '优势' }, { name: 'weaknesses', type: 'text', description: '短板' }, { name: 'suitableTasks', type: 'text', description: '适合任务' }, { name: 'cultivationPlanJson', type: 'text', description: '培养计划JSON' }, { name: 'reportMarkdown', type: 'text', description: '报告Markdown' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }, { name: 'updatedAt', type: 'datetime', description: '更新时间' }] },
    { name: 'training_resources', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'dimensionCode', type: 'text', description: '方向编码' }, { name: 'title', type: 'text', description: '标题' }, { name: 'resourceType', type: 'single_select', description: '课程|实操任务|案例包' }, { name: 'url', type: 'url', description: '链接' }, { name: 'description', type: 'text', description: '说明' }, { name: 'monthStage', type: 'single_select', description: '1|2|3' }, { name: 'isEnabled', type: 'checkbox', description: '是否启用' }, { name: 'sortOrder', type: 'number', description: '排序' }] },
    { name: 'notifications', fields: [{ name: 'id', type: 'text', description: '主键' }, { name: 'recordId', type: 'text', description: '关联记录ID' }, { name: 'type', type: 'single_select', description: '通知类型' }, { name: 'title', type: 'text', description: '标题' }, { name: 'content', type: 'text', description: '内容' }, { name: 'targetRole', type: 'text', description: '目标角色' }, { name: 'status', type: 'single_select', description: '状态' }, { name: 'createdAt', type: 'datetime', description: '创建时间' }, { name: 'handledAt', type: 'datetime', description: '处理时间' }] },
  ],
};

type InitialScoringCriterion = {
  label: string;
  keywords: string[];
};

type ShortAnswerRubric = {
  criteria: InitialScoringCriterion[];
  fullScoreMin: number;
};

type TaskInitialRubric = {
  basic: InitialScoringCriterion[];
  analysis: InitialScoringCriterion[];
  application: InitialScoringCriterion[];
  extension: InitialScoringCriterion[];
};

type CriteriaScore = {
  score: number;
  covered: string[];
  missing: string[];
};

type ShortAnswerScore = {
  score: number;
  comment: string;
  source?: 'deepseek' | 'keyword-fallback';
};

type DeepSeekMessage = {
  role: 'system' | 'user';
  content: string;
};

type TaskInitialScore = {
  scoreBasicUnderstanding: number;
  scoreAnalysisQuality: number;
  scoreStructureExpression: number;
  scoreApplicationLanding: number;
  scoreExtensionThinking: number;
  finalScore: number;
  comment: string;
};

type InterestInitialScore = {
  score: number;
  comment: string;
  relatedDirectionCodes: string[];
};

const INITIAL_REVIEW_NOTE = '初审参考，仍建议人工复核。';
const DEEPSEEK_TIMEOUT_MS = 20000;

const SHORT_ANSWER_GENERAL_RUBRIC = [
  '基础简答题共 5 道，每题 2 分，总分 10 分。',
  '评分时不要求新人答案与参考答案完全一致，但需要判断其是否覆盖核心要点。',
  '优先判断概念是否准确，其次判断是否能说明作用、意义或应用场景。',
  '如果能结合具体例子、影视作品、业务场景说明，可给满分。',
  '如果只答出关键词，但解释不完整，只给 1 分。',
  '如果回答偏题、概念错误、空泛无效，给 0 分。',
  '每题满分 2 分，只允许给 0 分、1 分或 2 分，不允许给 0.5 分或 1.5 分。',
].join('\n');

const SHORT_ANSWER_RUBRICS: Record<string, ShortAnswerRubric> = {
  film_theory: {
    fullScoreMin: 3,
    criteria: [
      { label: '类型片有相对固定规则', keywords: ['类型片', '类型', '固定', '规则', '题材', '叙事模式', '人物关系', '套路'] },
      { label: '帮助观众理解并建立期待', keywords: ['观众', '理解', '期待', '预期', '快速', '方向', '帮助'] },
      { label: '给出合理例子', keywords: ['例如', '比如', '举例', '悬疑', '爱情', '喜剧', '动作', '科幻', '犯罪', '电影', '剧'] },
      { label: '能把例子和观众期待连接', keywords: ['线索', '真相', '爽点', '反差', '情绪', '代入', '观看', '吸引', '期待'] },
    ],
  },
  visual_language: {
    fullScoreMin: 3,
    criteria: [
      { label: '明确选择镜头/剪辑/声音元素', keywords: ['镜头', '角度', '景别', '构图', '剪辑', '节奏', '声音', '音乐', '音效', '对白'] },
      { label: '说明情绪效果', keywords: ['情绪', '紧张', '压抑', '兴奋', '沉浸', '恐惧', '温暖', '孤独', '急迫', '思考'] },
      { label: '解释作用机制', keywords: ['通过', '因为', '制造', '营造', '强化', '推动', '传递', '影响', '信息', '心理'] },
      { label: '避免只写主观感受', keywords: ['作用', '机制', '服务', '人物', '叙事', '主题', '氛围', '信息'] },
    ],
  },
  script_narrative: {
    fullScoreMin: 3,
    criteria: [
      { label: '人物目标决定行动', keywords: ['目标', '想要', '动机', '行动', '主角', '人物'] },
      { label: '障碍制造冲突', keywords: ['障碍', '阻碍', '冲突', '矛盾', '困难', '对立'] },
      { label: '目标和障碍推动情节', keywords: ['推动', '推进', '发展', '剧情', '情节', '故事'] },
      { label: '联系主线/冲突/推进目的', keywords: ['主线', '结构', '判断', '成立', '清晰', '戏剧性', '分析'] },
    ],
  },
  aigc_business: {
    fullScoreMin: 3,
    criteria: [
      { label: '至少说明一个具体优势', keywords: ['优势', '效率', '提效', '资料整理', '初稿', '生成', '创意', '发散', '辅助'] },
      { label: '至少说明一个具体风险', keywords: ['风险', '错误', '幻觉', '版权', '同质化', '逻辑', '事实', '合规', '泄露'] },
      { label: '理解 AI 是辅助工具', keywords: ['辅助', '工具', '不能替代', '不替代', '不是最终', '负责', '把关'] },
      { label: '具备人工审核和风险意识', keywords: ['人工', '审核', '复核', '校对', '检查', '合规', '判断'] },
    ],
  },
  analysis: {
    fullScoreMin: 4,
    criteria: [
      { label: '先确认问题事实', keywords: ['确认', '核实', '事实', '检查', '验证', '定位'] },
      { label: '判断影响范围和严重程度', keywords: ['影响', '范围', '严重', '优先级', '风险', '交付', '质量', '节点'] },
      { label: '及时沟通而非隐瞒', keywords: ['沟通', '同步', '汇报', '负责人', '客户', '团队', '及时', '不隐瞒'] },
      { label: '提出解决方案', keywords: ['方案', '解决', '处理', '补救', '调整', '资源', '计划'] },
      { label: '有跟进复盘意识', keywords: ['跟进', '复盘', '记录', '总结', '避免', '闭环', '检查'] },
    ],
  },
};

const TASK_INITIAL_RUBRICS: Record<string, TaskInitialRubric> = {
  film_theory: {
    basic: [
      { label: '作品类型判断', keywords: ['类型', '题材', '悬疑', '爱情', '喜剧', '动作', '科幻', '犯罪', '复合类型'] },
      { label: '主题/卖点/吸引力', keywords: ['主题', '卖点', '情绪', '吸引', '受众', '目标用户', '观看理由'] },
      { label: '人物目标与冲突', keywords: ['人物', '主角', '目标', '障碍', '冲突', '关系'] },
      { label: '类型规则或观众期待', keywords: ['规则', '期待', '线索', '反转', '爽点', '误导', '真相'] },
    ],
    analysis: [
      { label: '类型规则解释', keywords: ['规则', '模式', '叙事', '观众期待', '类型片'] },
      { label: '主题卖点判断', keywords: ['为什么', '吸引', '价值', '传播', '情绪'] },
      { label: '冲突推动剧情', keywords: ['推动', '推进', '冲突', '情节', '主线'] },
      { label: '优缺点或学习点', keywords: ['优点', '问题', '不足', '学习', '值得'] },
      { label: '有依据的分析', keywords: ['因为', '通过', '体现', '说明', '基于'] },
    ],
    application: [
      { label: '具体作品或片段支撑', keywords: ['电影', '剧', '短剧', '片段', '作品', '例如', '比如'] },
      { label: '目标用户/业务场景', keywords: ['目标用户', '用户', '受众', '推荐', '传播', '业务', '平台'] },
      { label: '明确判断或建议', keywords: ['判断', '建议', '可以', '应该', '适合', '核心吸引力'] },
    ],
    extension: [
      { label: '一句话概括核心吸引力', keywords: ['一句话', '核心', '吸引力', '卖点', '推荐'] },
      { label: '说明推荐理由', keywords: ['因为', '适合', '目标用户', '受众', '观看', '期待'] },
    ],
  },
  visual_language: {
    basic: [
      { label: '片段来源/场景描述', keywords: ['片段', '场景', '人物', '情节', '背景', '来源'] },
      { label: '镜头或构图', keywords: ['镜头', '景别', '构图', '角度', '运动', '画面'] },
      { label: '色彩/光线/美术', keywords: ['色彩', '光线', '灯光', '美术', '氛围', '风格'] },
      { label: '声音/音乐/剪辑节奏', keywords: ['声音', '音乐', '音效', '对白', '剪辑', '节奏'] },
    ],
    analysis: [
      { label: '视听元素作用机制', keywords: ['如何', '通过', '营造', '强化', '制造', '影响'] },
      { label: '服务情绪', keywords: ['情绪', '紧张', '压抑', '兴奋', '沉浸', '氛围'] },
      { label: '服务人物/叙事/主题', keywords: ['人物', '状态', '叙事', '主题', '信息', '关系'] },
      { label: '综合多元素分析', keywords: ['共同', '综合', '配合', '同时', '整体'] },
      { label: '有具体依据', keywords: ['例如', '比如', '片段中', '因为', '体现'] },
    ],
    application: [
      { label: '具体片段支撑', keywords: ['片段', '场景', '镜头', '画面', '例如', '比如'] },
      { label: '预算/素材受限取舍', keywords: ['预算', '素材', '受限', '优先', '保留', '取舍'] },
      { label: '表达目标明确', keywords: ['保证', '情绪表达', '叙事', '人物', '效果'] },
    ],
    extension: [
      { label: '优先保留两个视听设计', keywords: ['两个', '优先', '保留', '镜头', '声音', '剪辑', '色彩'] },
      { label: '说明取舍理由', keywords: ['因为', '预算', '受限', '保证', '情绪', '表达'] },
    ],
  },
  script_narrative: {
    basic: [
      { label: '故事主线概括', keywords: ['主线', '概括', '故事', '主角', '结果'] },
      { label: '人物目标', keywords: ['人物', '目标', '动机', '想要', '需求'] },
      { label: '核心冲突', keywords: ['冲突', '矛盾', '障碍', '对立', '阻碍'] },
      { label: '情节点/优缺点', keywords: ['情节点', '节点', '转折', '反转', '钩子', '优点', '问题'] },
    ],
    analysis: [
      { label: '目标与动机分析', keywords: ['目标', '动机', '内在', '外部', '需求'] },
      { label: '冲突推动剧情', keywords: ['冲突', '推动', '推进', '剧情', '故事方向'] },
      { label: '至少三个关键情节点', keywords: ['三个', '3个', '第一', '第二', '第三', '节点'] },
      { label: '优缺点有依据', keywords: ['优点', '问题', '依据', '节奏', '爽点', '反转'] },
      { label: '结构判断清晰', keywords: ['结构', '主线', '清晰', '判断', '成立'] },
    ],
    application: [
      { label: '具体作品或短剧支撑', keywords: ['电影', '剧', '短剧', '作品', '例如', '比如'] },
      { label: '压缩/改编取舍', keywords: ['压缩', '1分钟', '一分钟', '保留', '关键情节'] },
      { label: '给出理由或建议', keywords: ['因为', '建议', '应该', '保留', '删减'] },
    ],
    extension: [
      { label: '保留关键情节点', keywords: ['保留', '关键', '情节点', '节点', '高潮', '反转'] },
      { label: '说明压缩理由', keywords: ['因为', '1分钟', '一分钟', '主线', '冲突', '吸引'] },
    ],
  },
  aigc_business: {
    basic: [
      { label: '流程覆盖关键环节', keywords: ['流程', '资料', '框架', '初稿', '生成', '审核', '修改', '输出', '归档'] },
      { label: 'AI 辅助任务明确', keywords: ['AI', 'AIGC', '辅助', '工具', '整理', '标题', '脚本', '梗概'] },
      { label: '人工审核意识', keywords: ['人工', '审核', '把关', '校对', '最终判断'] },
      { label: '风险与控制', keywords: ['风险', '错误', '版权', '合规', '核验', '记录'] },
    ],
    analysis: [
      { label: '流程完整闭环', keywords: ['资料整理', '分析框架', '初稿', '审核', '优化', '最终输出', '归档'] },
      { label: 'AI 使用边界', keywords: ['辅助', '不能替代', '不直接交付', '人负责', '边界'] },
      { label: '人工审核内容', keywords: ['事实', '逻辑', '版权', '风格', '平台规则', '客户需求'] },
      { label: '具体风险识别', keywords: ['事实错误', '幻觉', '版权', '同质化', '偏差', '泄露', '合规'] },
      { label: '风险控制可执行', keywords: ['来源', '原片核验', '复审清单', '敏感内容', '权限', '版本记录'] },
    ],
    application: [
      { label: '影视内容生产场景', keywords: ['影视', '内容生产', '脚本', '分集', '评论', '标题', '素材'] },
      { label: '可执行控制动作', keywords: ['核验', '修正', '记录', '清单', '复审', '权限', '版本'] },
      { label: '交付质量/合规意识', keywords: ['交付', '质量', '合规', '客户', '最终'] },
    ],
    extension: [
      { label: '发现并修正风险', keywords: ['发现', '核验', '修正', '校对', '原片', '来源'] },
      { label: '记录处理过程', keywords: ['记录', '版本', '清单', '复审', '归档'] },
    ],
  },
  analysis: {
    basic: [
      { label: '判断问题严重程度', keywords: ['严重', '影响', '质量', '交付', '延期', '风险'] },
      { label: '内部沟通', keywords: ['负责人', '导师', '团队', '内部', '对齐', '优先级'] },
      { label: '客户沟通', keywords: ['客户', '说明', '同步', '预期', '时间安排'] },
      { label: '解决方案与复盘', keywords: ['方案', '解决', '补充', '调整', '跟进', '复盘'] },
    ],
    analysis: [
      { label: '识别多类风险', keywords: ['事实核验', '传播点', '竞品', '范围变化', '延期', '交付风险'] },
      { label: '内部沟通内容完整', keywords: ['事实', '影响范围', '优先级', '资源', '建议方案'] },
      { label: '客户沟通专业', keywords: ['客观', '专业', '方案导向', '不甩锅', '不隐瞒', '预期管理'] },
      { label: '方案兼顾质量与交付', keywords: ['基础版', '补充版', '延期半天', '完整版', '优先级', '范围'] },
      { label: '跟进复盘闭环', keywords: ['持续同步', '确认结果', '复盘', '记录', '流程改进'] },
    ],
    application: [
      { label: '围绕项目交付场景', keywords: ['项目', '报告', '交付', '客户', '周五', '竞品'] },
      { label: '有可执行方案', keywords: ['基础版', '补充版', '调整范围', '风险提示', '时间安排', '优先级'] },
      { label: '质量和风险意识', keywords: ['质量', '风险', '核验', '范围', '延期', '客户'] },
    ],
    extension: [
      { label: '客户不延期时调整范围', keywords: ['不延期', '坚持', '范围', '基础版', '先交付', '补充'] },
      { label: '明确风险提示', keywords: ['风险提示', '说明', '客户', '未核验', '质量', '后续'] },
    ],
  },
};

const DIRECTION_KEYWORDS: Record<string, string[]> = {
  film_theory: ['影视基础', '理论', '类型', '主题', '人物', '冲突', '卖点', '电影', '剧'],
  visual_language: ['视听', '镜头', '构图', '色彩', '光线', '声音', '音乐', '剪辑'],
  script_narrative: ['剧本', '叙事', '故事', '主线', '情节', '人物目标', '冲突', '短剧'],
  aigc_business: ['AIGC', 'AI', '人工智能', '生成', '工具', '提示词', '版权', '审核'],
  analysis: ['综合分析', '项目反馈', '沟通', '客户', '交付', '风险', '复盘', '项目'],
};

@Injectable()
export class V11Service {
  private demoRepo: DemoAssessmentV11Repository;
  private bitableAdapter: FeishuBitableAdapter;
  private useBitable = false;
  private readonly runtimeConfigPath = path.join(process.cwd(), '.runtime', 'feishu-v11-config.json');

  constructor() {
    this.demoRepo = new DemoAssessmentV11Repository();
    this.bitableAdapter = new FeishuBitableAdapter();
    this.bitableAdapter.configure(this.readRuntimeConfig());
    this.useBitable = this.bitableAdapter.isConfigured();
  }

  private readRuntimeConfig(): Partial<V11DataSourceConfig> {
    try {
      if (!fs.existsSync(this.runtimeConfigPath)) return {};
      return JSON.parse(fs.readFileSync(this.runtimeConfigPath, 'utf-8')) as Partial<V11DataSourceConfig>;
    } catch {
      return {};
    }
  }

  private saveRuntimeConfig(config: Partial<V11DataSourceConfig>): void {
    fs.mkdirSync(path.dirname(this.runtimeConfigPath), { recursive: true });
    fs.writeFileSync(this.runtimeConfigPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  private normalizeRuntimeConfig(update: Partial<V11DataSourceConfig>): Partial<V11DataSourceConfig> {
    const current = this.readRuntimeConfig();
    const tableIdMap = { ...(current.tableIdMap ?? {}), ...(update.tableIdMap ?? {}) };
    const next: Partial<V11DataSourceConfig> = { ...current, ...update, tableIdMap };
    if (update.appSecret === undefined || String(update.appSecret ?? '').trim() === '') {
      next.appSecret = current.appSecret ?? '';
    }
    if (next.appId !== undefined) next.appId = String(next.appId ?? '').trim();
    if (next.appSecret !== undefined) next.appSecret = String(next.appSecret ?? '').trim();
    if (next.appToken !== undefined) next.appToken = String(next.appToken ?? '').trim();
    if (next.driveFolderToken !== undefined) next.driveFolderToken = String(next.driveFolderToken ?? '').trim();
    next.baseToken = '';
    next.cloudFolderUrl = next.driveFolderToken ? `https://feishu.cn/drive/folder/${next.driveFolderToken}` : '';
    next.baseUrl = next.appToken ? `https://feishu.cn/base/${next.appToken}` : '';
    return next;
  }

  private getRepo(): AssessmentV11Repository {
    return this.useBitable && this.bitableAdapter.isConfigured()
      ? this.bitableAdapter
      : this.demoRepo;
  }

  private async readWithDemoFallback<T>(
    label: string,
    read: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    try {
      const result = await read();
      if (Array.isArray(result) && result.length === 0) {
        console.warn('[V11] ' + label + ' 返回空数据，已回退演示数据');
        return fallback();
      }
      return result;
    } catch (err) {
      console.warn('[V11] ' + label + ' 读取失败，已回退演示数据', err);
      return fallback();
    }
  }

  async getDataSourceStatus(): Promise<V11DataSourceStatus> {
    const configured = this.bitableAdapter.isConfigured();
    const envVarsPresent = this.bitableAdapter.getEnvStatus();
    return {
      configured,
      mode: configured ? 'bitable' : 'demo',
      tableCount: SCHEMA_GUIDE.tables.length,
      lastChecked: new Date().toISOString(),
      envVarsPresent,
      tablesStatus: {},
      connectionMessage: configured ? '飞书连接配置已具备，请点击「连接检测」验证权限' : '演示数据模式：请在下方保存飞书应用凭证、多维表格 Token 和表 ID',
    };
  }

  getSchemaGuide(): V11SchemaGuide {
    return SCHEMA_GUIDE;
  }

  async getDataSourceConfig(): Promise<V11DataSourceConfig> {
    return this.bitableAdapter.getDataSourceConfig();
  }

  async updateDataSourceConfig(update: Partial<V11DataSourceConfig>): Promise<V11DataSourceConfig> {
    const next = this.normalizeRuntimeConfig(update);
    this.bitableAdapter.configure(next);
    next.status = this.bitableAdapter.isConfigured() ? 'configured' : 'demo';
    this.saveRuntimeConfig(next);
    this.useBitable = this.bitableAdapter.isConfigured();
    return this.bitableAdapter.getDataSourceConfig();
  }

  async getConfig(): Promise<V11AssessmentConfig> {
    return this.getRepo().getConfig();
  }

  async updateConfig(update: Partial<V11AssessmentConfig>): Promise<V11AssessmentConfig> {
    const current = await this.getRepo().getConfig();
    return { ...current, ...update, updatedAt: new Date().toISOString() };
  }

    async getDimensions(): Promise<V11Dimension[]> {
    const dimensions = await this.getRepo().getDimensions();
    return this.hasUpdatedDimensions(dimensions)
      ? dimensions
      : this.demoRepo.getDimensions();
  }

  async getBasicQuestions(): Promise<V11BasicQuestion[]> {
    const questions = await this.getEffectiveBasicQuestions();
    return this.buildBasicQuestionPaper(questions);
  }

  async getTaskQuestions(): Promise<V11TaskQuestion[]> {
    return this.getEffectiveTaskQuestions();
  }

  async getInterestQuestions(): Promise<V11InterestQuestion[]> {
    return this.getEffectiveInterestQuestions();
  }

  private async getEffectiveBasicQuestions(): Promise<V11BasicQuestion[]> {
    const questions = await this.readWithDemoFallback(
      '基础认知题库',
      () => this.getRepo().getBasicQuestions(),
      () => this.demoRepo.getBasicQuestions(),
    );
    return this.hasUpdatedBasicQuestionBank(questions)
      ? questions
      : this.demoRepo.getBasicQuestions();
  }

  private async getEffectiveTaskQuestions(): Promise<V11TaskQuestion[]> {
    const questions = await this.readWithDemoFallback(
      '任务型测评题库',
      () => this.getRepo().getTaskQuestions(),
      () => this.demoRepo.getTaskQuestions(),
    );
    return this.hasUpdatedTaskQuestionBank(questions)
      ? questions
      : this.demoRepo.getTaskQuestions();
  }

  private async getEffectiveInterestQuestions(): Promise<V11InterestQuestion[]> {
    const questions = await this.readWithDemoFallback(
      '兴趣匹配问卷',
      () => this.getRepo().getInterestQuestions(),
      () => this.demoRepo.getInterestQuestions(),
    );
    return this.hasUpdatedInterestQuestionBank(questions)
      ? questions
      : this.demoRepo.getInterestQuestions();
  }

  private hasUpdatedDimensions(dimensions: V11Dimension[]): boolean {
    return dimensions.some((dimension) => dimension.name === '综合分析与项目反馈能力');
  }

  private hasUpdatedBasicQuestionBank(questions: V11BasicQuestion[]): boolean {
    const enabled = questions.filter((question) => question.isEnabled !== false);
    const choiceCount = enabled.filter((question) => question.questionType === 'single_choice').length;
    const shortAnswerCount = enabled.filter((question) => question.questionType === 'short_answer').length;
    const dimensionCodes = ['film_theory', 'visual_language', 'script_narrative', 'aigc_business', 'analysis'];
    return choiceCount >= 200
      && shortAnswerCount >= 5
      && dimensionCodes.every((code) => enabled.filter((question) => question.dimensionCode === code && question.questionType === 'single_choice').length >= 40);
  }

  private hasUpdatedTaskQuestionBank(questions: V11TaskQuestion[]): boolean {
    const enabled = questions.filter((question) => question.isEnabled !== false);
    const dimensionCodes = ['film_theory', 'visual_language', 'script_narrative', 'aigc_business', 'analysis'];
    if (enabled.length >= 5 && dimensionCodes.every((code) => enabled.some((question) => question.dimensionCode === code))) {
      return true;
    }
    return questions.some((question) => question.title.includes('项目问题反馈'));
  }

  private hasUpdatedInterestQuestionBank(questions: V11InterestQuestion[]): boolean {
    return questions.some((question) => question.questionText.includes('7 天') || question.questionText.includes('7天'));
  }

  private sampleQuestions<T>(items: T[], count: number): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  private buildBasicQuestionPaper(questions: V11BasicQuestion[]): V11BasicQuestion[] {
    const orderBySort = (a: V11BasicQuestion, b: V11BasicQuestion) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0);
    const enabled = questions.filter((question) => question.isEnabled !== false);
    const dimensionCodes = ['film_theory', 'visual_language', 'script_narrative', 'aigc_business', 'analysis'];
    const selectedChoices = dimensionCodes.flatMap((code) => {
      const pool = enabled
        .filter((question) => question.dimensionCode === code && question.questionType === 'single_choice');
      return this.sampleQuestions(pool, 3).sort(orderBySort);
    });
    const shortAnswers = enabled
      .filter((question) => question.questionType === 'short_answer')
      .sort(orderBySort)
      .slice(0, 5);
    return [...selectedChoices, ...shortAnswers];
  }


  async getEvaluationRecords(): Promise<V11EvaluationRecord[]> {
    const records = await this.readWithDemoFallback(
      '测评记录',
      () => this.getRepo().getEvaluationRecords(),
      () => this.demoRepo.getEvaluationRecords(),
    );

    try {
      const reports = await this.readWithDemoFallback(
        '评估报告',
        () => this.getRepo().getReports(),
        () => this.demoRepo.getReports(),
      );
      const reportedRecordIds = new Set(reports.map((report: V11AssessmentReport) => report.recordId));
      return records.map((record: V11EvaluationRecord) => (
        reportedRecordIds.has(record.id)
          ? { ...record, status: 'report_ready' }
          : record
      ));
    } catch {
      return records;
    }
  }

  async getReports(): Promise<V11AssessmentReport[]> {
    return this.readWithDemoFallback(
      '评估报告',
      () => this.getRepo().getReports(),
      () => this.demoRepo.getReports(),
    );
  }

  async getTrainingResources(): Promise<V11TrainingResource[]> {
    return this.readWithDemoFallback(
      '培训资源',
      () => this.getRepo().getTrainingResources(),
      () => this.demoRepo.getTrainingResources(),
    );
  }

  async createTrainingResource(dto: Omit<V11TrainingResource, 'id'>): Promise<V11TrainingResource> {
    const resource: V11TrainingResource = { ...dto, id: uuidv4() };
    return this.getRepo().createTrainingResource(resource);
  }

  async updateTrainingResource(id: string, update: Partial<V11TrainingResource>): Promise<V11TrainingResource> {
    return this.getRepo().updateTrainingResource(id, update);
  }

  async deleteTrainingResource(id: string): Promise<void> {
    return this.getRepo().deleteTrainingResource(id);
  }

  async testConnection(): Promise<V11ConnectionTestResult> {
    return this.bitableAdapter.testConnection();
  }

  async checkSchema(): Promise<{ missingTables: string[]; allTables: string[]; message: string }> {
    if (!this.bitableAdapter.isConfigured()) {
      return {
        missingTables: SCHEMA_GUIDE.tables.map((t) => t.name),
        allTables: SCHEMA_GUIDE.tables.map((t) => t.name),
        message: '飞书连接配置未完整，无法检测多维表格结构。请先在后台保存飞书应用凭证、多维表格 Token 和 12 个表 ID。',
      };
    }
    try {
      const testResult = await this.bitableAdapter.testConnection();
      const missingTables = Object.entries(testResult.tablesAccessible)
        .filter(([, ok]) => !ok)
        .map(([name]) => name);
      return {
        missingTables,
        allTables: SCHEMA_GUIDE.tables.map((t) => t.name),
        message: missingTables.length === 0
          ? '所有 12 张数据表均可访问'
          : `以下数据表不可访问或 tableId 未配置：${missingTables.join('、')}`,
      };
    } catch (err) {
      return {
        missingTables: SCHEMA_GUIDE.tables.map((t) => t.name),
        allTables: SCHEMA_GUIDE.tables.map((t) => t.name),
        message: `检测失败: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async syncSeedData(): Promise<{ synced: string[]; skipped: string[]; message: string }> {
    if (!this.bitableAdapter.isConfigured()) {
      return { synced: [], skipped: [], message: '飞书连接配置未完整，无法同步种子数据' };
    }
    const synced: string[] = [];
    const skipped: string[] = [];
    const demo = this.demoRepo;
    const seedTables: { name: string; check: () => Promise<unknown[]>; getData: () => Promise<Record<string, unknown>[]> }[] = [
      { name: 'dimensions', check: () => this.bitableAdapter.getDimensions(), getData: async () => (await demo.getDimensions()).map((d) => ({ ...d })) },
      { name: 'basic_questions', check: () => this.bitableAdapter.getBasicQuestions(), getData: async () => (await demo.getBasicQuestions()).map((q) => ({ ...q })) },
      { name: 'task_questions', check: () => this.bitableAdapter.getTaskQuestions(), getData: async () => (await demo.getTaskQuestions()).map((q) => ({ ...q })) },
      { name: 'interest_questions', check: () => this.bitableAdapter.getInterestQuestions(), getData: async () => (await demo.getInterestQuestions()).map((q) => ({ ...q })) },
    ];
    try {
      for (const table of seedTables) {
        try {
          const existing = await table.check();
          if (existing.length > 0) {
            skipped.push(`${table.name} (已存在 ${existing.length} 条)`);
            continue;
          }
        } catch {
          skipped.push(`${table.name} (查询失败)`);
          continue;
        }
        const records = await table.getData();
        if (records.length > 0) {
          await this.bitableAdapter.seedTable(table.name, records);
          synced.push(table.name);
        }
      }
      return { synced, skipped, message: synced.length > 0 ? `已同步: ${synced.join('、')}` : '所有表已有数据，跳过同步' };
    } catch (err) {
      return { synced, skipped, message: `同步失败: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  private getDeepSeekConfig(): { apiKey: string; baseUrl: string; model: string } {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').trim().replace(/\/+$/, '');
    return {
      apiKey: (process.env.DEEPSEEK_API_KEY ?? '').trim(),
      baseUrl,
      model: (process.env.DEEPSEEK_MODEL ?? 'deepseek-chat').trim() || 'deepseek-chat',
    };
  }

  private async callDeepSeekChat(messages: DeepSeekMessage[], maxTokens: number): Promise<string> {
    const config = this.getDeepSeekConfig();
    if (!config.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);
    try {
      const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0,
          max_tokens: maxTokens,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 300)}`);
      }
      const data = JSON.parse(text) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek returned empty content');
      }
      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractJsonObject(text: string): Record<string, unknown> | null {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start < 0 || end <= start) return null;
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }

  private normalizeRubricText(text?: string | null): string {
    return String(text ?? '')
      .replace(/；\s*\?/g, '；\n')
      .replace(/\?\s*(是否|如果|每题|不允许|不要求|只要|答案|根据|改进|主要)/g, '\n$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private stringifyList(value: unknown, fallback: string): string {
    if (Array.isArray(value)) {
      const items = value.map((item) => String(item ?? '').trim()).filter(Boolean);
      return items.length > 0 ? items.slice(0, 4).join('、') : fallback;
    }
    const text = String(value ?? '').trim();
    return text || fallback;
  }

  private buildShortAnswerRubricText(question: V11BasicQuestion): string {
    const questionRubric = this.normalizeRubricText(question.rubric);
    if (questionRubric) return questionRubric;

    const fallback = SHORT_ANSWER_RUBRICS[question.dimensionCode];
    if (!fallback) return '';
    return fallback.criteria.map((criterion, index) => `${index + 1}. ${criterion.label}`).join('\n');
  }

  private async scoreShortAnswerWithDeepSeek(question: V11BasicQuestion, answer: string): Promise<ShortAnswerScore | null> {
    const config = this.getDeepSeekConfig();
    if (!config.apiKey || this.isWeakAnswer(answer)) return null;

    const maxScore = this.clampScore(question.score || 2, 2);
    const rubric = this.buildShortAnswerRubricText(question);
    const rubricItems = rubric
      .split(/\n|；|;/)
      .map((item) => item.trim())
      .filter(Boolean);
    const payload = {
      question: question.questionText,
      referenceAnswer: question.referenceAnswer || '',
      generalRubric: SHORT_ANSWER_GENERAL_RUBRIC,
      rubricItems,
      studentAnswer: answer,
    };
    const content = await this.callDeepSeekChat([
      {
        role: 'system',
        content: '你是一名阅卷老师。请批改 studentAnswer。不要评价本提示词、JSON格式、题目、参考答案或rubric。只返回合法JSON对象。',
      },
      {
        role: 'user',
        content: [
          '请批改下面 JSON 中的 studentAnswer。',
          '计分规则：满分2分，只能给0、1、2。覆盖核心概念、作用说明和合理例子可给2分；只覆盖部分要点或只有关键词给1分；偏题、概念错误、空泛无效给0分。',
          JSON.stringify(payload, null, 2),
          '返回合法 JSON 对象，字段为：score(number), covered(array), missing(array), reason(string), suggestion(string)。',
        ].join('\n'),
      },
    ], 600);

    const parsed = this.extractJsonObject(content);
    if (!parsed) return null;
    const score = this.clampScore(Number(parsed.score), maxScore);
    if (!Number.isFinite(score)) return null;

    const coveredText = this.stringifyList(parsed.covered, '暂未明确覆盖核心要点');
    const missingText = this.stringifyList(parsed.missing, '核心要点基本覆盖');
    const reason = String(parsed.reason ?? '').trim();
    const suggestion = String(parsed.suggestion ?? '').trim();
    const detail = [
      `DeepSeek 初审 ${score}/${maxScore}：覆盖 ${coveredText}；缺少 ${missingText}。`,
      reason ? `评分依据：${reason}。` : '',
      suggestion ? `改进建议：${suggestion}。` : '',
      INITIAL_REVIEW_NOTE,
    ].filter(Boolean).join('');

    return { score, comment: detail, source: 'deepseek' };
  }

  private getFeishuAgentActions(configured: boolean, deepSeekConfigured: boolean): FeishuAgentAvailableAction[] {
    return [
      {
        type: 'test_deepseek',
        label: '检测 DeepSeek',
        description: '验证 DeepSeek API Key、模型名和服务端网络是否可用，不发送业务数据。',
        writesData: false,
        enabled: deepSeekConfigured,
      },
      {
        type: 'test_connection',
        label: '检测飞书连接',
        description: '验证飞书应用凭证和 12 张多维表格访问权限。',
        writesData: false,
        enabled: configured,
      },
      {
        type: 'check_schema',
        label: '检查表结构',
        description: '检查多维表格 ID 与表访问状态，帮助定位配置缺口。',
        writesData: false,
        enabled: configured,
      },
      {
        type: 'list_pending_reviews',
        label: '读取待评分',
        description: '读取当前待人工评分的测评记录摘要。',
        writesData: false,
        enabled: configured,
      },
      {
        type: 'create_review_notifications',
        label: '写入复核提醒',
        description: '为待评分记录写入飞书 notifications 表，已存在的提醒会自动跳过。',
        writesData: true,
        enabled: configured,
      },
      {
        type: 'sync_seed_data',
        label: '同步初始题库',
        description: '仅在目标题库表为空时写入演示种子数据。',
        writesData: true,
        enabled: configured,
      },
      {
        type: 'refresh_metrics',
        label: '刷新状态',
        description: '重新读取智能体、飞书连接和业务数据统计。',
        writesData: false,
        enabled: true,
      },
    ];
  }

  async getFeishuAgentStatus(): Promise<FeishuAgentStatus> {
    const configured = this.bitableAdapter.isConfigured();
    const deepSeek = this.getDeepSeekConfig();
    let connection: V11ConnectionTestResult = { success: false, message: '飞书连接未配置', tablesAccessible: {} };
    if (configured) {
      try {
        connection = await this.bitableAdapter.testConnection();
      } catch (err) {
        connection = {
          success: false,
          message: `飞书连接检测失败: ${err instanceof Error ? err.message : String(err)}`,
          tablesAccessible: {},
        };
      }
    }

    const repo = configured ? this.bitableAdapter : this.demoRepo;
    const [records, reports, resources, config] = await Promise.all([
      repo.getEvaluationRecords().catch(() => [] as V11EvaluationRecord[]),
      repo.getReports().catch(() => [] as V11AssessmentReport[]),
      repo.getTrainingResources().catch(() => [] as V11TrainingResource[]),
      this.bitableAdapter.getDataSourceConfig(),
    ]);
    const accessibleTableCount = Object.values(connection.tablesAccessible).filter(Boolean).length;
    const pendingReviewCount = records.filter((record) => record.status === 'pending_review').length;
    const deepSeekConfigured = !!deepSeek.apiKey;
    return {
      connected: configured && connection.success,
      configured,
      deepSeekConfigured,
      deepSeekModel: deepSeek.model,
      mode: configured ? 'bitable' : 'demo',
      baseUrl: config.baseUrl,
      tableCount: SCHEMA_GUIDE.tables.length,
      accessibleTableCount,
      tablesAccessible: connection.tablesAccessible,
      pendingReviewCount,
      reportCount: reports.length,
      trainingResourceCount: resources.length,
      lastChecked: new Date().toISOString(),
      message: deepSeekConfigured
        ? connection.message
        : 'DeepSeek API Key 未配置。请在 .env 中添加 DEEPSEEK_API_KEY 后重启服务。',
      actions: this.getFeishuAgentActions(configured, deepSeekConfigured),
    };
  }

  async runFeishuAgentAction(dto: FeishuAgentActionRequest): Promise<FeishuAgentActionResult> {
    const operatedAt = new Date().toISOString();
    const action = dto.action;
    try {
      if (action === 'test_deepseek') {
        return await this.testDeepSeekAction(operatedAt);
      }
      if (action === 'test_connection') {
        const result = await this.testConnection();
        return { success: result.success, action, message: result.message, summary: result as unknown as Record<string, unknown>, operatedAt };
      }
      if (action === 'check_schema') {
        const result = await this.checkSchema();
        return { success: result.missingTables.length === 0, action, message: result.message, summary: result, operatedAt };
      }
      if (action === 'sync_seed_data') {
        const result = await this.syncSeedData();
        return { success: !result.message.includes('失败'), action, message: result.message, summary: result, operatedAt };
      }
      if (action === 'list_pending_reviews') {
        const records = await this.listEvaluations('pending_review');
        return {
          success: true,
          action,
          message: `当前有 ${records.length} 条待人工评分记录`,
          summary: {
            count: records.length,
            records: records.slice(0, 20).map((record) => ({
              id: record.id,
              newcomerName: record.newcomerName,
              targetRole: record.targetRole,
              assessmentDate: record.assessmentDate,
              selectedTaskDirectionsJson: record.selectedTaskDirectionsJson,
            })),
          },
          operatedAt,
        };
      }
      if (action === 'create_review_notifications') {
        if (!this.bitableAdapter.isConfigured()) {
          return { success: false, action, message: '飞书连接未配置，无法写入通知表', summary: {}, operatedAt };
        }
        const source = dto.recordId
          ? [await this.bitableAdapter.getEvaluationRecordById(dto.recordId)].filter(Boolean) as V11EvaluationRecord[]
          : (await this.bitableAdapter.getEvaluationRecords()).filter((record) => record.status === 'pending_review');
        let created = 0;
        let skipped = 0;
        for (const record of source) {
          const result = await this.bitableAdapter.createReviewNotificationIfMissing(record);
          if (result === 'created') created += 1;
          else skipped += 1;
        }
        return {
          success: true,
          action,
          message: `复核提醒处理完成：新增 ${created} 条，跳过 ${skipped} 条`,
          summary: { created, skipped, total: source.length },
          operatedAt,
        };
      }
      if (action === 'refresh_metrics') {
        const status = await this.getFeishuAgentStatus();
        return { success: true, action, message: '状态已刷新', summary: status as unknown as Record<string, unknown>, operatedAt };
      }
      return { success: false, action, message: '不支持的智能体动作', summary: {}, operatedAt };
    } catch (err) {
      return {
        success: false,
        action,
        message: err instanceof Error ? err.message : String(err),
        summary: {},
        operatedAt,
      };
    }
  }

  private async testDeepSeekAction(operatedAt: string): Promise<FeishuAgentActionResult> {
    const action = 'test_deepseek' as const;
    const config = this.getDeepSeekConfig();
    if (!config.apiKey) {
      return {
        success: false,
        action,
        message: 'DeepSeek API Key 未配置。请在 .env 中添加 DEEPSEEK_API_KEY 后重启服务。',
        summary: { model: config.model, baseUrl: config.baseUrl },
        operatedAt,
      };
    }
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个接口连通性检测助手。' },
          { role: 'user', content: '请只回复 OK。' },
        ],
        temperature: 0,
        max_tokens: 8,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        success: false,
        action,
        message: `DeepSeek 检测失败: HTTP ${res.status}`,
        summary: { model: config.model, baseUrl: config.baseUrl, response: text.slice(0, 300) },
        operatedAt,
      };
    }
    return {
      success: true,
      action,
      message: 'DeepSeek API 可用',
      summary: { model: config.model, baseUrl: config.baseUrl },
      operatedAt,
    };
  }

  async listEvaluations(status?: string): Promise<V11EvaluationRecord[]> {
    const records = await this.getEvaluationRecords();
    if (!status) return records;
    return records.filter((r: V11EvaluationRecord) => r.status === status);
  }

  async getEvaluationDetail(recordId: string): Promise<V11EvaluationDetail> {
    const repo = this.getRepo();
    const record = await repo.getEvaluationRecordById(recordId);
    if (!record) {
      throw new Error(`Evaluation record ${recordId} not found`);
    }

    const [basicAnswers, taskAnswers, interestAnswers, basicQuestions, taskQuestions, interestQuestions, report] = await Promise.all([
      repo.getBasicAnswersByRecordId(recordId),
      repo.getTaskAnswersByRecordId(recordId),
      repo.getInterestAnswersByRecordId(recordId),
      this.getEffectiveBasicQuestions(),
      this.getEffectiveTaskQuestions(),
      this.getEffectiveInterestQuestions(),
      repo.getReportByRecordId(recordId),
    ]);

    const bqMap = new Map(basicQuestions.map((q: V11BasicQuestion) => [q.id, q]));
    const tqMap = new Map(taskQuestions.map((q: V11TaskQuestion) => [q.id, q]));
    const iqMap = new Map(interestQuestions.map((q: V11InterestQuestion) => [q.id, q]));

    const basicAnswersWithQ: V11BasicAnswerWithQuestion[] = basicAnswers.map((a: V11BasicAnswer) => ({
      ...a,
      question: bqMap.get(a.questionId)!,
    }));

    const taskAnswersWithQ: V11TaskAnswerWithQuestion[] = taskAnswers.map((a: V11TaskAnswer) => ({
      ...a,
      task: tqMap.get(a.taskId)!,
    }));

    const interestAnswersWithQ: V11InterestAnswerWithQuestion[] = interestAnswers.map((a: V11InterestAnswer) => ({
      ...a,
      question: iqMap.get(a.questionId)!,
    }));

    return {
      record: report ? { ...record, status: 'report_ready' } : record,
      basicAnswers: basicAnswersWithQ,
      taskAnswers: taskAnswersWithQ,
      interestAnswers: interestAnswersWithQ,
      report,
    };
  }

  async saveReview(recordId: string, dto: V11ReviewDto): Promise<V11EvaluationRecord> {
    const repo = this.getRepo();
    const record = await repo.getEvaluationRecordById(recordId);
    if (!record) {
      throw new Error(`Evaluation record ${recordId} not found`);
    }

    for (const ba of dto.basicAnswers) {
      await repo.updateBasicAnswer(ba.answerId, {
        manualScore: ba.manualScore,
        finalScore: ba.manualScore,
        comment: ba.comment || null,
        reviewStatus: 'reviewed',
      });
    }

    for (const ta of dto.taskAnswers) {
      const finalScore = ta.scoreBasicUnderstanding + ta.scoreAnalysisQuality + ta.scoreStructureExpression + ta.scoreApplicationLanding + ta.scoreExtensionThinking;
      await repo.updateTaskAnswer(ta.answerId, {
        scoreBasicUnderstanding: ta.scoreBasicUnderstanding,
        scoreAnalysisQuality: ta.scoreAnalysisQuality,
        scoreStructureExpression: ta.scoreStructureExpression,
        scoreApplicationLanding: ta.scoreApplicationLanding,
        scoreExtensionThinking: ta.scoreExtensionThinking,
        finalScore,
        comment: ta.comment || null,
        reviewStatus: 'reviewed',
      });
    }

    for (const ia of dto.interestAnswers) {
      await repo.updateInterestAnswer(ia.answerId, {
        manualScore: ia.manualScore,
        finalScore: ia.manualScore,
        comment: ia.comment || null,
      });
    }

    const updatedBasicAnswers = await repo.getBasicAnswersByRecordId(recordId);
    const updatedTaskAnswers = await repo.getTaskAnswersByRecordId(recordId);
    const updatedInterestAnswers = await repo.getInterestAnswersByRecordId(recordId);

    const basicScore = updatedBasicAnswers.reduce((sum: number, a: V11BasicAnswer) => sum + (a.finalScore ?? 0), 0);
    const taskScore = updatedTaskAnswers.reduce((sum: number, a: V11TaskAnswer) => sum + (a.finalScore ?? 0), 0);
    const interestScore = updatedInterestAnswers.reduce((sum: number, a: V11InterestAnswer) => sum + (a.finalScore ?? 0), 0);
    const totalScore = basicScore + taskScore + interestScore;

    const reviewedRecord = await repo.updateEvaluationRecord(recordId, {
      basicScore,
      taskScore,
      interestScore,
      totalScore,
      status: 'reviewed',
    });

    await this.generateReport(recordId);

    const finalRecord = (await repo.getEvaluationRecordById(recordId)) ?? reviewedRecord;
    return { ...finalRecord, status: 'report_ready' };
  }

  async generateReport(recordId: string): Promise<V11AssessmentReport> {
    const repo = this.getRepo();
    const [record, basicAnswers, taskAnswers, interestAnswers] = await Promise.all([
      repo.getEvaluationRecordById(recordId),
      repo.getBasicAnswersByRecordId(recordId),
      repo.getTaskAnswersByRecordId(recordId),
      repo.getInterestAnswersByRecordId(recordId),
    ]);

    if (!record) {
      throw new Error(`Evaluation record ${recordId} not found`);
    }

    const DIMENSION_NAMES: Record<string, string> = {
      film_theory: '影视基础理论',
      visual_language: '视听语言应用',
      script_narrative: '剧本叙事拆解',
      aigc_business: 'AIGC 业务认知',
      analysis: '综合分析与项目反馈能力',
    };
    const ALL_DIMENSIONS = ['film_theory', 'visual_language', 'script_narrative', 'aigc_business', 'analysis'];

    const dimBasicScores: Record<string, number> = {};
    for (const code of ALL_DIMENSIONS) dimBasicScores[code] = 0;
    for (const a of basicAnswers) {
      dimBasicScores[a.dimensionCode] = (dimBasicScores[a.dimensionCode] ?? 0) + (a.finalScore ?? 0);
    }

    const dimTaskScores: Record<string, number> = {};
    const completedDimensions = new Set<string>();
    for (const a of taskAnswers) {
      dimTaskScores[a.dimensionCode] = (dimTaskScores[a.dimensionCode] ?? 0) + (a.finalScore ?? 0);
      completedDimensions.add(a.dimensionCode);
    }

    const selectedDirections: string[] = record.selectedTaskDirectionsJson ? JSON.parse(record.selectedTaskDirectionsJson) : [];
    const unselectedDimensions = ALL_DIMENSIONS.filter((d: string) => !selectedDirections.includes(d));

    const interestTotal = interestAnswers.reduce((sum: number, a: V11InterestAnswer) => sum + (a.finalScore ?? 0), 0);
    const interestPerDim = interestTotal / ALL_DIMENSIONS.length;

    const directionScores: Record<string, number> = {};
    for (const code of ALL_DIMENSIONS) {
      directionScores[code] = (dimBasicScores[code] ?? 0) + (dimTaskScores[code] ?? 0) + interestPerDim;
    }

    const sortedDirections = ALL_DIMENSIONS
      .filter((d: string) => completedDimensions.has(d))
      .sort((a: string, b: string) => (directionScores[b] ?? 0) - (directionScores[a] ?? 0));

    const mainDirection = sortedDirections[0] ?? null;
    const secondaryDirection = sortedDirections[1] ?? null;

    let isCompound = false;
    if (mainDirection && secondaryDirection) {
      const diff = (directionScores[mainDirection] ?? 0) - (directionScores[secondaryDirection] ?? 0);
      if (diff < 3) isCompound = true;
    }

    let potentialDirection: string | null = null;
    if (interestTotal >= 10 && mainDirection) {
      const topInterestDim = ALL_DIMENSIONS.reduce((best: string, code: string) => {
        const score = (dimBasicScores[code] ?? 0) + interestPerDim;
        const bestScore = (dimBasicScores[best] ?? 0) + interestPerDim;
        return score > bestScore ? code : best;
      }, ALL_DIMENSIONS[0]);
      if (topInterestDim !== mainDirection && (dimTaskScores[topInterestDim] ?? 0) < (dimTaskScores[mainDirection] ?? 0)) {
        potentialDirection = topInterestDim;
      }
    }

    let notRecommendedDirection: string | null = null;
    for (const d of unselectedDimensions) {
      const basicDimScore = dimBasicScores[d] ?? 0;
      if (basicDimScore <= 1 && interestTotal < 8) {
        notRecommendedDirection = d;
        break;
      }
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    for (const code of ALL_DIMENSIONS) {
      const score = directionScores[code] ?? 0;
      const name = DIMENSION_NAMES[code];
      if (score >= 15) strengths.push(name);
      else if (score <= 5) weaknesses.push(name);
    }

    const suitableTasks: string[] = [];
    if (mainDirection) suitableTasks.push(`${DIMENSION_NAMES[mainDirection]}方向的深度任务`);
    if (secondaryDirection) suitableTasks.push(`${DIMENSION_NAMES[secondaryDirection]}方向的辅助任务`);
    if (isCompound) suitableTasks.push('跨方向综合性任务');

    const cultivationPlan = {
      day1: '第1天：阅读项目背景材料，整理项目目标、受众和交付标准。',
      day2: '第2天：补齐影视基础与视听语言概念，完成 1 个作品拆解。',
      day3: '第3天：完成剧本结构与人物冲突拆解，输出问题清单。',
      day4: '第4天：学习 AIGC 内容生产流程，梳理工具链、风格统一和审核风险。',
      day5: '第5天：完成项目反馈演练，按事实、影响、建议三段式提交反馈。',
      day6: mainDirection
        ? '第6天：围绕' + DIMENSION_NAMES[mainDirection] + '完成一次小任务复盘，根据管理反馈修改。'
        : '第6天：完成一次小任务复盘，根据管理反馈修改。',
      day7: '第7天：汇总个人优势、短板和下一步训练重点，由管理判断是否进入项目实战。',
    };

    const objectiveScored = basicAnswers.filter((a: V11BasicAnswer) => a.isCorrect !== null);
    const basicCorrect = objectiveScored.filter((a: V11BasicAnswer) => a.isCorrect).length;
    const shortAnswerScored = basicAnswers.filter((a: V11BasicAnswer) => a.isCorrect === null && a.finalScore !== null).length;
    const basicSummary = `基础认知测试共 ${basicAnswers.length} 题，其中客观题 ${objectiveScored.length} 题答对 ${basicCorrect} 题，简答题 ${shortAnswerScored} 题已完成初审/复核。基础认知总得分：${record.basicScore ?? 0}/25。`;

    const taskSummary = `任务型测评共选择 ${taskAnswers.length} 个方向（${selectedDirections.map((d: string) => DIMENSION_NAMES[d] ?? d).join('、')}），任务测评总得分：${record.taskScore ?? 0}/60。`;

    const interestSummary = `兴趣问卷共 ${interestAnswers.length} 题，兴趣匹配总得分：${record.interestScore ?? 0}/15。`;

    const mainDirName = mainDirection ? DIMENSION_NAMES[mainDirection] : '未确定';
    const secDirName = secondaryDirection ? DIMENSION_NAMES[secondaryDirection] : '未确定';
    const potDirName = potentialDirection ? DIMENSION_NAMES[potentialDirection] : '无';
    const notRecDirName = notRecommendedDirection ? DIMENSION_NAMES[notRecommendedDirection] : '无';
    const talentProfile = isCompound
      ? `${record.newcomerName}在${mainDirName}和${secDirName}方向表现接近，属于复合型人才。`
      : `${record.newcomerName}在${mainDirName}方向表现突出，属于专精型人才。`;

    const dimScoreTable = ALL_DIMENSIONS.map((code: string) => {
      const name = DIMENSION_NAMES[code];
      const score = (directionScores[code] ?? 0).toFixed(1);
      const completed = completedDimensions.has(code) ? '是' : '否';
      return `| ${name} | ${completed} | ${score} |`;
    }).join('\n');

    const reportMarkdown = `# 新人内容能力五维评估报告

## 基本信息
- 姓名：${record.newcomerName}
- 候选人编号：${record.candidateId || '未填写'}
- 目标岗位：${record.targetRole}
- 评估日期：${record.assessmentDate}

## 评分汇总
- 基础认知得分：${record.basicScore ?? 0} / 25
- 任务型测评得分：${record.taskScore ?? 0} / 60
- 兴趣匹配得分：${record.interestScore ?? 0} / 15
- **总分：${record.totalScore ?? 0} / 100**

## 五维得分明细
| 方向 | 是否完成 | 得分 |
|------|----------|------|
${dimScoreTable}

## 方向判定
- 主方向：${mainDirName}
- 辅方向：${secDirName}
- 人才画像：${talentProfile}
- 潜力方向：${potDirName}
- 不建议优先方向：${notRecDirName}

## 主要优势
${strengths.length > 0 ? strengths.map((s: string) => `- ${s}`).join('\n') : '- 暂无明显优势维度'}

## 主要短板
${weaknesses.length > 0 ? weaknesses.map((w: string) => `- ${w}`).join('\n') : '- 暂无明显短板'}

## 适合承担任务
${suitableTasks.map((t: string) => `- ${t}`).join('\n')}

## 培养建议（7 天）
${Object.values(cultivationPlan).map((item: string) => '- ' + item).join('\n')}
`;

    const now = new Date().toISOString();
    const report: V11AssessmentReport = {
      id: uuidv4(),
      recordId,
      basicSummary,
      taskSummary,
      interestSummary,
      directionScoresJson: JSON.stringify(directionScores),
      strengths: strengths.join('、') || '暂无',
      weaknesses: weaknesses.join('、') || '暂无',
      suitableTasks: suitableTasks.join('、') || '暂无',
      cultivationPlanJson: JSON.stringify(cultivationPlan),
      reportMarkdown,
      createdAt: now,
      updatedAt: now,
    };

    const savedReport = await repo.createReport(report);

    await repo.updateEvaluationRecord(recordId, {
      status: 'report_ready',
      mainDirection,
      secondaryDirection,
      potentialDirection,
      notRecommendedDirection,
      talentProfile,
    });

    return savedReport;
  }

  private normalizeAnswerText(answer?: string | null): string {
    return String(answer ?? '')
      .toLowerCase()
      .replace(/[，。！？、；：,.!?;:（）()【】《》“”"'\s]/g, '');
  }

  private answerLength(answer?: string | null): number {
    return this.normalizeAnswerText(answer).length;
  }

  private isWeakAnswer(answer?: string | null): boolean {
    const text = this.normalizeAnswerText(answer);
    if (text.length < 4) return true;
    const weakPhrases = ['不知道', '不会', '不了解', '没想法', '没有想法', '无', '无内容', '随便', '看情况'];
    return text.length <= 10 && weakPhrases.some((phrase) => text.includes(this.normalizeAnswerText(phrase)));
  }

  private hasAnyKeyword(answer: string, keywords: string[]): boolean {
    const text = this.normalizeAnswerText(answer);
    return keywords.some((keyword) => text.includes(this.normalizeAnswerText(keyword)));
  }

  private getCoveredCriteria(answer: string, criteria: InitialScoringCriterion[]): string[] {
    return criteria
      .filter((criterion) => this.hasAnyKeyword(answer, criterion.keywords))
      .map((criterion) => criterion.label);
  }

  private hasExplanation(answer: string): boolean {
    if (this.answerLength(answer) >= 60) return true;
    return this.hasAnyKeyword(answer, ['因为', '所以', '通过', '能够', '可以', '导致', '影响', '体现', '说明', '为了', '从而', '帮助', '需要', '用于', '先', '再', '并']);
  }

  private hasConcreteSupport(answer: string): boolean {
    return this.hasAnyKeyword(answer, [
      '例如', '比如', '举例', '案例', '项目', '业务', '场景', '作品', '电影', '电视剧', '短剧', '片段', '客户', '平台', '实际', '曾经', '之前', '做过', '看过',
    ]);
  }

  private clampScore(score: number, max: number): number {
    return Math.max(0, Math.min(max, Math.round(score)));
  }

  private summarizeLabels(labels: string[], fallback: string): string {
    if (labels.length === 0) return fallback;
    return labels.slice(0, 4).join('、');
  }

  private scoreCriteria(answer: string, criteria: InitialScoringCriterion[], max: number): CriteriaScore {
    const covered = this.getCoveredCriteria(answer, criteria);
    const missing = criteria.filter((criterion) => !covered.includes(criterion.label)).map((criterion) => criterion.label);
    if (this.isWeakAnswer(answer) || covered.length === 0) {
      return { score: 0, covered, missing };
    }

    const ratio = covered.length / criteria.length;
    let score = Math.round(ratio * max);
    if (score === 0) score = 1;

    if (this.hasExplanation(answer) && ratio >= 0.65) score += 1;
    if (this.hasConcreteSupport(answer) && max >= 4 && ratio >= 0.5) score += 1;
    if (!this.hasExplanation(answer)) score = Math.min(score, Math.ceil(max * 0.55));
    if (this.answerLength(answer) < 24) score = Math.min(score, Math.max(1, Math.floor(max / 2)));

    return { score: this.clampScore(score, max), covered, missing };
  }

  private scoreShortAnswer(question: V11BasicQuestion, answer: string): ShortAnswerScore {
    const rubric = SHORT_ANSWER_RUBRICS[question.dimensionCode];
    if (!rubric || this.isWeakAnswer(answer)) {
      return { score: 0, comment: `规则初审 0/2：回答无有效内容或未命中本题核心概念。${INITIAL_REVIEW_NOTE}`, source: 'keyword-fallback' };
    }

    const covered = this.getCoveredCriteria(answer, rubric.criteria);
    const missing = rubric.criteria.filter((criterion) => !covered.includes(criterion.label)).map((criterion) => criterion.label);
    let score = 0;

    if (covered.length >= rubric.fullScoreMin && this.hasExplanation(answer)) {
      score = 2;
    } else if (covered.length >= 1) {
      score = 1;
    }

    if (score === 2 && this.answerLength(answer) < 24 && !this.hasConcreteSupport(answer)) {
      score = 1;
    }

    const coveredText = this.summarizeLabels(covered, '暂无明确覆盖项');
    const missingText = this.summarizeLabels(missing, '核心要点基本覆盖');
    return {
      score,
      comment: `规则初审 ${score}/2：覆盖${coveredText}；需加强${missingText}。${INITIAL_REVIEW_NOTE}`,
      source: 'keyword-fallback',
    };
  }

  private async scoreShortAnswerInitial(question: V11BasicQuestion, answer: string): Promise<ShortAnswerScore> {
    const fallback = this.scoreShortAnswer(question, answer);
    try {
      return await this.scoreShortAnswerWithDeepSeek(question, answer) ?? fallback;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return {
        ...fallback,
        comment: `${fallback.comment} DeepSeek 初审暂不可用，已使用规则兜底。原因：${reason.slice(0, 120)}`,
      };
    }
  }

  private scoreTaskStructure(answer: string): CriteriaScore {
    if (this.isWeakAnswer(answer)) {
      return { score: 0, covered: [], missing: ['结构化表达'] };
    }

    const length = this.answerLength(answer);
    const markerCount = (answer.match(/(^|[\n\s。；;])(\d+[.、．]|[一二三四五六七][、.．]|首先|其次|然后|最后|第一|第二|第三|第四|第五)/g) ?? []).length;
    const covered: string[] = [];
    if (length >= 60) covered.push('内容达到基础展开');
    if (length >= 140) covered.push('分析篇幅较充分');
    if (markerCount >= 2) covered.push('有分点结构');
    if (this.hasExplanation(answer)) covered.push('表达包含因果/作用说明');

    let score = 0;
    if (length >= 40) score += 1;
    if (length >= 120) score += 1;
    if (markerCount >= 2) score += 1;
    if (markerCount >= 4 || this.hasExplanation(answer)) score += 1;
    if (length < 30) score = Math.min(score, 1);

    const missing = ['内容达到基础展开', '分析篇幅较充分', '有分点结构', '表达包含因果/作用说明']
      .filter((label) => !covered.includes(label));
    return { score: this.clampScore(score, 4), covered, missing };
  }

  private scoreTaskExtension(answer: string, criteria: InitialScoringCriterion[]): CriteriaScore {
    const covered = this.getCoveredCriteria(answer, criteria);
    const missing = criteria.filter((criterion) => !covered.includes(criterion.label)).map((criterion) => criterion.label);
    if (this.isWeakAnswer(answer) || covered.length === 0) {
      return { score: 0, covered, missing };
    }
    const score = covered.length >= 2 && this.hasExplanation(answer) ? 2 : 1;
    return { score, covered, missing };
  }

  private scoreTaskAnswer(dimensionCode: string, mainAnswer: string, extensionAnswer: string): TaskInitialScore {
    const rubric = TASK_INITIAL_RUBRICS[dimensionCode] ?? TASK_INITIAL_RUBRICS.analysis;
    const fullAnswer = `${mainAnswer}\n${extensionAnswer}`;
    const basic = this.scoreCriteria(mainAnswer, rubric.basic, 4);
    const analysis = this.scoreCriteria(fullAnswer, rubric.analysis, 6);
    const structure = this.scoreTaskStructure(mainAnswer);
    const application = this.scoreCriteria(fullAnswer, rubric.application, 4);
    const extension = this.scoreTaskExtension(extensionAnswer, rubric.extension);
    const finalScore = basic.score + analysis.score + structure.score + application.score + extension.score;

    const allCovered = [...basic.covered, ...analysis.covered, ...structure.covered, ...application.covered, ...extension.covered];
    const allMissing = [...basic.missing, ...analysis.missing, ...structure.missing, ...application.missing, ...extension.missing];
    const level = finalScore >= 17 ? 'A' : finalScore >= 14 ? 'B' : finalScore >= 10 ? 'C' : finalScore >= 6 ? 'D' : 'E';

    return {
      scoreBasicUnderstanding: basic.score,
      scoreAnalysisQuality: analysis.score,
      scoreStructureExpression: structure.score,
      scoreApplicationLanding: application.score,
      scoreExtensionThinking: extension.score,
      finalScore,
      comment: `初审任务题 ${level}档 ${finalScore}/20：覆盖${this.summarizeLabels(allCovered, '暂无明确覆盖项')}；需加强${this.summarizeLabels(allMissing, '主要要求基本覆盖')}。${INITIAL_REVIEW_NOTE}`,
    };
  }

  private inferRelatedDirections(answer: string): string[] {
    return Object.entries(DIRECTION_KEYWORDS)
      .filter(([, keywords]) => this.hasAnyKeyword(answer, keywords))
      .map(([code]) => code);
  }

  private countPlanDays(answer: string): number {
    const normalized = answer.replace(/\s+/g, '');
    const days = new Set<string>();
    const matches = normalized.match(/第?[1-7一二三四五六七]天/g) ?? [];
    for (const item of matches) days.add(item.replace(/[第天]/g, ''));
    const numericMarkers = normalized.match(/(^|[\n；;。])([1-7一二三四五六七])[、.．]/g) ?? [];
    for (const item of numericMarkers) days.add(item.replace(/[^1-7一二三四五六七]/g, ''));
    return days.size;
  }

  private scoreInterestAnswer(question: V11InterestQuestion | undefined, answer: string): InterestInitialScore {
    const relatedDirectionCodes = this.inferRelatedDirections(answer);
    if (this.isWeakAnswer(answer)) {
      return {
        score: 0,
        comment: `初审 0/5：回答无有效信息或没有回应题目要求。${INITIAL_REVIEW_NOTE}`,
        relatedDirectionCodes,
      };
    }

    const sortOrder = Number(question?.sortOrder ?? 0);
    let score = 0;
    const covered: string[] = [];
    const missing: string[] = [];

    if (sortOrder === 1 || question?.id === 'iq-1') {
      if (relatedDirectionCodes.length >= 2) { score += 2; covered.push('明确选择两个兴趣方向'); }
      else if (relatedDirectionCodes.length >= 1) { score += 1; covered.push('提到兴趣方向'); }
      else missing.push('明确选择两个方向');
      if (this.hasAnyKeyword(answer, ['因为', '原因', '喜欢', '兴趣', '擅长', '想', '希望'])) { score += 1; covered.push('说明兴趣理由'); } else missing.push('具体理由');
      if (this.hasConcreteSupport(answer) || this.hasAnyKeyword(answer, ['经历', '经验', '学习', '创作', '实践'])) { score += 1; covered.push('有经历或案例支撑'); } else missing.push('经历/案例支撑');
      if (this.answerLength(answer) >= 70 && this.hasExplanation(answer)) { score += 1; covered.push('表达较具体'); } else missing.push('更具体的发展意愿');
    } else if (sortOrder === 2 || question?.id === 'iq-2') {
      if (this.hasAnyKeyword(answer, ['擅长', '优势', '强项', '比较好', '能力', '会', '能'])) { score += 1; covered.push('说明优势'); } else missing.push('清晰优势');
      if (this.hasAnyKeyword(answer, ['不足', '短板', '弱', '欠缺', '不擅长', '需要补', '提升'])) { score += 1; covered.push('说明短板'); } else missing.push('清晰短板');
      if (this.hasConcreteSupport(answer) || this.hasAnyKeyword(answer, ['经历', '项目', '反馈', '作品', '任务'])) { score += 1; covered.push('有依据或案例'); } else missing.push('具体依据');
      if (this.hasAnyKeyword(answer, ['改进', '提升', '训练', '补强', '计划', '下一步', '练习'])) { score += 1; covered.push('有改进方向'); } else missing.push('改进方向');
      if (this.answerLength(answer) >= 70 && this.hasExplanation(answer)) { score += 1; covered.push('自我认知较具体'); } else missing.push('更具体的能力状态');
    } else if (sortOrder === 3 || question?.id === 'iq-3') {
      const dayCount = this.countPlanDays(answer);
      if (relatedDirectionCodes.length >= 1 || this.hasAnyKeyword(answer, ['方向', '训练重点', '优先训练'])) { score += 1; covered.push('明确训练方向'); } else missing.push('训练方向');
      if (dayCount >= 7) { score += 2; covered.push('完整 7 天安排'); }
      else if (dayCount >= 3) { score += 1; covered.push('有多日安排'); missing.push('完整 7 天节奏'); }
      else missing.push('完整 7 天节奏');
      if (this.hasAnyKeyword(answer, ['任务', '训练', '学习', '拆解', '分析', '练习', '完成'])) { score += 1; covered.push('每天任务或训练动作'); } else missing.push('每日任务');
      if (this.hasAnyKeyword(answer, ['产出', '报告', '清单', '表', '稿', '记录', '作品'])) { score += 1; covered.push('有产出标准'); } else missing.push('产出标准');
      if (this.hasAnyKeyword(answer, ['复盘', '反馈', '检查', '验收', '修正', '总结'])) { score += 1; covered.push('有复盘方式'); } else missing.push('复盘方式');
    } else {
      if (relatedDirectionCodes.length >= 1) { score += 1; covered.push('回应能力方向'); } else missing.push('能力方向');
      if (this.hasExplanation(answer)) { score += 1; covered.push('有解释说明'); } else missing.push('解释说明');
      if (this.hasConcreteSupport(answer)) { score += 1; covered.push('有具体支撑'); } else missing.push('具体支撑');
      if (this.answerLength(answer) >= 80) { score += 1; covered.push('回答较完整'); } else missing.push('回答完整度');
      if (this.hasAnyKeyword(answer, ['计划', '改进', '训练', '建议', '下一步'])) { score += 1; covered.push('有后续行动'); } else missing.push('后续行动');
    }

    if (this.answerLength(answer) < 24) score = Math.min(score, 2);
    const finalScore = this.clampScore(score, 5);
    return {
      score: finalScore,
      comment: `初审 ${finalScore}/5：覆盖${this.summarizeLabels(covered, '暂无明确覆盖项')}；需加强${this.summarizeLabels(missing, '主要要求基本覆盖')}。${INITIAL_REVIEW_NOTE}`,
      relatedDirectionCodes,
    };
  }

  async submitEvaluation(dto: V11SubmitRequest): Promise<V11SubmitResponse> {
    const repo = this.getRepo();
    const [questions, taskQuestions, interestQuestions] = await Promise.all([
      this.getEffectiveBasicQuestions(),
      this.getEffectiveTaskQuestions(),
      this.getEffectiveInterestQuestions(),
    ]);
    const questionMap = new Map(questions.map((q: V11BasicQuestion) => [q.id, q]));
    const taskQuestionMap = new Map(taskQuestions.map((q: V11TaskQuestion) => [q.id, q]));
    const interestQuestionMap = new Map(interestQuestions.map((q: V11InterestQuestion) => [q.id, q]));
    const now = new Date().toISOString();
    const recordId = uuidv4();

    const basicAnswers: V11BasicAnswer[] = await Promise.all(dto.basicAnswers.map(async (a) => {
      const question = questionMap.get(a.questionId);
      let autoScore: number | null = null;
      let isCorrect: boolean | null = null;
      let reviewStatus = 'pending';
      let comment: string | null = null;

      if (question && (question.questionType === 'single_choice' || question.questionType === 'true_false')) {
        isCorrect = a.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        autoScore = isCorrect ? question.score : 0;
        reviewStatus = 'auto_scored';
      }

      if (question && question.questionType === 'short_answer') {
        const initialScore = await this.scoreShortAnswerInitial(question, a.answer);
        autoScore = initialScore.score;
        reviewStatus = initialScore.source === 'deepseek' ? 'ai_scored' : 'initial_scored';
        comment = initialScore.comment;
      }

      return {
        id: uuidv4(),
        recordId,
        questionId: a.questionId,
        dimensionCode: question?.dimensionCode ?? '',
        answer: a.answer,
        autoScore,
        manualScore: null,
        finalScore: autoScore,
        isCorrect,
        reviewStatus,
        comment,
        createdAt: now,
      };
    }));

    const basicAutoScore = basicAnswers.reduce((sum: number, a: V11BasicAnswer) => sum + (a.autoScore ?? 0), 0);
    const basicPendingReview = basicAnswers.filter((a: V11BasicAnswer) => a.reviewStatus !== 'auto_scored').length;

    const taskAnswers: V11TaskAnswer[] = dto.taskAnswers.map((a) => {
      const taskQuestion = taskQuestionMap.get(a.taskId);
      const initialScore = this.scoreTaskAnswer(taskQuestion?.dimensionCode ?? a.dimensionCode, a.mainAnswer, a.extensionAnswer);
      return {
        id: uuidv4(),
        recordId,
        taskId: a.taskId,
        dimensionCode: taskQuestion?.dimensionCode ?? a.dimensionCode,
        mainAnswer: a.mainAnswer,
        extensionAnswer: a.extensionAnswer,
        scoreBasicUnderstanding: initialScore.scoreBasicUnderstanding,
        scoreAnalysisQuality: initialScore.scoreAnalysisQuality,
        scoreStructureExpression: initialScore.scoreStructureExpression,
        scoreApplicationLanding: initialScore.scoreApplicationLanding,
        scoreExtensionThinking: initialScore.scoreExtensionThinking,
        finalScore: initialScore.finalScore,
        reviewStatus: 'initial_scored',
        comment: initialScore.comment,
        createdAt: now,
      };
    });

    const interestAnswers: V11InterestAnswer[] = dto.interestAnswers.map((a) => {
      const question = interestQuestionMap.get(a.questionId);
      const initialScore = this.scoreInterestAnswer(question, a.answer);
      return {
        id: uuidv4(),
        recordId,
        questionId: a.questionId,
        answer: a.answer,
        relatedDirectionCodesJson: JSON.stringify(initialScore.relatedDirectionCodes),
        manualScore: null,
        finalScore: initialScore.score,
        comment: initialScore.comment,
        createdAt: now,
      };
    });

    const basicScore = basicAnswers.reduce((sum: number, a: V11BasicAnswer) => sum + (a.finalScore ?? 0), 0);
    const taskScore = taskAnswers.reduce((sum: number, a: V11TaskAnswer) => sum + (a.finalScore ?? 0), 0);
    const interestScore = interestAnswers.reduce((sum: number, a: V11InterestAnswer) => sum + (a.finalScore ?? 0), 0);
    const totalScore = basicScore + taskScore + interestScore;

    const selectedDirections = dto.taskAnswers.map((a) => a.dimensionCode);

    const record: V11EvaluationRecord = {
      id: recordId,
      newcomerName: dto.newcomerName,
      candidateId: dto.candidateId ?? null,
      targetRole: dto.targetRole,
      evaluatorName: dto.evaluatorName ?? null,
      assessmentDate: now,
      status: 'pending_review',
      taskMode: 'five_select_three',
      selectedTaskDirectionsJson: JSON.stringify(selectedDirections),
      basicScore,
      taskScore,
      interestScore,
      totalScore,
      mainDirection: null,
      secondaryDirection: null,
      potentialDirection: null,
      notRecommendedDirection: null,
      talentProfile: null,
      createdAt: now,
      updatedAt: now,
    };

    const savedRecord = await repo.createEvaluationRecord(record);
    const persistedRecordId = savedRecord.id || recordId;
    if (persistedRecordId !== recordId) {
      record.id = persistedRecordId;
      for (const answer of basicAnswers) answer.recordId = persistedRecordId;
      for (const answer of taskAnswers) answer.recordId = persistedRecordId;
      for (const answer of interestAnswers) answer.recordId = persistedRecordId;
    }
    await repo.saveBasicAnswers(basicAnswers);
    await repo.saveTaskAnswers(taskAnswers);
    await repo.saveInterestAnswers(interestAnswers);

    return {
      recordId: persistedRecordId,
      status: 'pending_review',
      basicAutoScore,
      basicPendingReview,
      totalAutoScore: totalScore,
      message: '测评已提交，已完成简答题和主观题初审，等待人工复核与报告生成',
    };
  }
}
