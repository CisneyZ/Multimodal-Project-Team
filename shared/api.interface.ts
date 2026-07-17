export type DimensionCode = 'theory' | 'language' | 'script' | 'aigc' | 'analysis';
export type QuestionType = '单选' | '判断' | '主观';
export type Difficulty = '1' | '2' | '3' | '4' | '5';
export type GradeLevel = '入门补强' | '基础执行' | '岗位进阶' | '骨干培养';
export type ResourceType = '课程' | '实操任务' | '案例包' | '考核标准';
export type AssessmentStatus = '进行中' | '已完成' | '待复核' | '已复核';

export interface DimensionItem {
  id: string;
  dimensionCode: string;
  dimensionName: string;
  dimensionDescription: string | null;
  lowScoreSuggestion: string | null;
  midScoreSuggestion: string | null;
  highScoreSuggestion: string | null;
  sortOrder: number;
}

export interface QuestionItem {
  id: string;
  questionNumber: number;
  dimensionId: string;
  questionType: QuestionType;
  stem: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string | null;
  scoringKeywords: string | null;
  points: number;
  difficulty: Difficulty;
  isEnabled: boolean;
  dimensionCode: string;
  dimensionName: string;
}

export interface QuestionForExam {
  id: string;
  questionNumber: number;
  questionType: QuestionType;
  stem: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  points: number;
  difficulty: Difficulty;
  dimensionCode: string;
  dimensionName: string;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface SubmitAssessmentRequest {
  name: string;
  position: string;
  answers: AnswerSubmission[];
}

export interface AnswerDetail {
  questionId: string;
  questionNumber: number;
  stem: string;
  dimensionName: string;
  submittedAnswer: string;
  autoScore: number;
  maxScore: number;
  scoringReason: string | null;
  confidence: number | null;
  needsReview: boolean;
}

export interface DimensionScore {
  dimensionCode: string;
  dimensionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  suggestion: string | null;
}

export interface SubmitAssessmentResponse {
  assessmentId: string;
  totalScore: number;
  maxTotalScore: number;
  grade: GradeLevel;
  dimensions: DimensionScore[];
  weakDimensions: string[];
  answerDetails: AnswerDetail[];
  aiSummary: string | null;
}

export interface ScoringRuleItem {
  id: string;
  dimensionId: string;
  dimensionName: string;
  dimensionCode: string;
  questionType: QuestionType;
  scoringCriteria: string;
  highScoreExample: string | null;
  midScoreExample: string | null;
  lowScoreExample: string | null;
  reviewThreshold: number;
}

export interface TrainingResourceItem {
  id: string;
  dimensionId: string;
  dimensionName: string;
  dimensionCode: string;
  resourceName: string;
  resourceType: ResourceType;
  applicableGrade: GradeLevel;
  studyDurationDays: number;
  passCriteria: string | null;
  isEnabled: boolean;
}

export interface AssessmentRecord {
  id: string;
  name: string;
  position: string;
  status: AssessmentStatus;
  theoryScore: number | null;
  languageScore: number | null;
  scriptScore: number | null;
  aigcScore: number | null;
  analysisScore: number | null;
  totalScore: number | null;
  recommendedGrade: GradeLevel | null;
  weakDimension: Difficulty | null;
  aiSummary: string | null;
  submitTime: string | null;
  reviewer: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface AssessmentStats {
  totalAssessments: number;
  averageScore: number;
  gradeDistribution: { grade: GradeLevel; count: number }[];
  dimensionAverages: { dimensionName: string; averageScore: number; maxScore: number }[];
  recentAssessments: AssessmentRecord[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateQuestionRequest {
  questionNumber: number;
  dimensionId: string;
  questionType: QuestionType;
  stem: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  scoringKeywords?: string;
  points: number;
  difficulty: Difficulty;
}

export interface UpdateQuestionRequest {
  questionNumber?: number;
  dimensionId?: string;
  questionType?: QuestionType;
  stem?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  scoringKeywords?: string;
  points?: number;
  difficulty?: Difficulty;
  isEnabled?: boolean;
}

export type ScoringSource = 'objective' | 'keyword-fallback' | 'ai-agent';

export interface ReviewDetailItem {
  id: string;
  assessmentId: string;
  assessmentName: string;
  questionNumber: number;
  stem: string;
  submittedAnswer: string;
  autoScore: number;
  maxScore: number;
  scoringReason: string | null;
  confidence: number | null;
  dimensionName: string | null;
  createdAt: string;
}

export interface CompleteReviewRequest {
  detailId: string;
  reviewedScore: number;
  reviewedReason: string;
}

export interface CompleteReviewResponse {
  success: boolean;
  recordId: string;
  recordStatus: AssessmentStatus;
  totalScore?: number;
  grade?: GradeLevel;
}

export type NotificationType = 'submission_completed' | 'review_needed' | 'review_completed';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  targetRole: string;
  recordId: string | null;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export interface RecordDetail {
  record: AssessmentRecord;
  answerDetails: AnswerDetailItem[];
  notifications: NotificationItem[];
}

export interface AnswerDetailItem {
  id: string;
  questionId: string;
  questionNumber: number;
  stem: string;
  questionType: QuestionType;
  submittedAnswer: string;
  autoScore: number;
  maxScore: number;
  scoringReason: string | null;
  confidence: number | null;
  needsReview: boolean;
  dimensionName: string | null;
  scoringSource: ScoringSource;
}

export interface AiScoringStatus {
  connected: boolean;
  currentMode: ScoringSource;
  fallbackDescription: string;
  reviewThreshold: number;
  integrationGuide: string;
}

export type FeishuAgentActionType =
  | 'test_deepseek'
  | 'test_connection'
  | 'check_schema'
  | 'sync_seed_data'
  | 'list_pending_reviews'
  | 'create_review_notifications'
  | 'refresh_metrics';

export interface FeishuAgentAvailableAction {
  type: FeishuAgentActionType;
  label: string;
  description: string;
  writesData: boolean;
  enabled: boolean;
}

export interface FeishuAgentStatus {
  connected: boolean;
  configured: boolean;
  deepSeekConfigured: boolean;
  deepSeekModel: string;
  mode: 'demo' | 'bitable';
  baseUrl: string;
  tableCount: number;
  accessibleTableCount: number;
  tablesAccessible: Record<string, boolean>;
  pendingReviewCount: number;
  reportCount: number;
  trainingResourceCount: number;
  lastChecked: string;
  message: string;
  actions: FeishuAgentAvailableAction[];
}

export interface FeishuAgentActionRequest {
  action: FeishuAgentActionType;
  recordId?: string;
}

export interface FeishuAgentActionResult {
  success: boolean;
  action: FeishuAgentActionType;
  message: string;
  summary: Record<string, unknown>;
  operatedAt: string;
}

export type MaterialType = 'project_background' | 'rule_document';
export type RuleQuestionType = 'single_choice' | 'true_false';
export type OnboardingStatus = 'background_pending' | 'background_done' | 'rules_pending' | 'rules_done' | 'rule_test_done' | 'waiting_admin';

export interface OnboardingMaterial {
  id: string;
  title: string;
  materialType: MaterialType;
  feishuUrl: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface RuleQuestionOption {
  label: string;
  text: string;
}

export interface OnboardingRuleQuestion {
  id: string;
  questionText: string;
  questionType: RuleQuestionType;
  options: RuleQuestionOption[] | null;
  correctAnswer: string;
  explanation: string | null;
  score: number;
  sortOrder: number;
  isEnabled: boolean;
}

export interface OnboardingProgressItem {
  id: string;
  newcomerName: string;
  targetRole: string;
  assessmentRecordId: string | null;
  backgroundCompletedAt: string | null;
  rulesCompletedAt: string | null;
  ruleTestCompletedAt: string | null;
  ruleTestScore: number | null;
  status: OnboardingStatus;
}

export interface OnboardingRuleAnswerItem {
  progressId: string;
  questionId: string;
  answer: string;
  score: number;
  isCorrect: boolean;
  explanation: string | null;
}

export interface StartOnboardingRequest {
  newcomerName: string;
  targetRole: string;
  assessmentRecordId?: string;
}

export interface SubmitRuleTestRequest {
  progressId: string;
  answers: { questionId: string; answer: string }[];
}

export interface SubmitRuleTestResponse {
  totalScore: number;
  maxScore: number;
  details: OnboardingRuleAnswerItem[];
}

export interface CreateMaterialRequest {
  title: string;
  materialType: MaterialType;
  feishuUrl: string;
  description?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {}

export interface CreateRuleQuestionRequest {
  questionText: string;
  questionType: RuleQuestionType;
  options?: RuleQuestionOption[];
  correctAnswer: string;
  explanation?: string;
  score?: number;
  sortOrder?: number;
  isEnabled?: boolean;
}

export interface UpdateRuleQuestionRequest extends Partial<CreateRuleQuestionRequest> {}

export interface ChatFlowNode {
  id: string;
  stage: string;
  stageLabel: string;
  welcomeMessage: string;
  isEnabled: boolean;
}

export interface ChatPhrase {
  id: string;
  category: string;
  keywords: string[];
  quickButtonTitle: string | null;
  replyContent: string;
  isEnabled: boolean;
}

export interface ChatQuickButton {
  title: string;
  action: string;
}

export interface ChatBootstrapResponse {
  welcomeMessage: string;
  quickButtons: ChatQuickButton[];
}

export interface ChatMessageRequest {
  progressId?: string;
  message: string;
}

export interface ChatMessageResponse {
  reply: string;
  matchedPhrase: boolean;
}

export interface RemindAdminRequest {
  progressId: string;
}

export interface V11Dimension {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface V11AssessmentConfig {
  id: string;
  version: string;
  taskMode: 'five_select_three' | 'all_five';
  basicScoreTotal: number;
  taskScoreTotal: number;
  interestScoreTotal: number;
  isActive: boolean;
  notes: string;
  updatedAt: string;
}

export interface V11BasicQuestion {
  id: string;
  dimensionCode: string;
  questionType: 'single_choice' | 'true_false' | 'short_answer';
  questionText: string;
  optionsJson: string | null;
  correctAnswer: string;
  referenceAnswer: string | null;
  score: number;
  rubric: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface V11TaskQuestion {
  id: string;
  dimensionCode: string;
  title: string;
  scenario: string;
  mainTask: string;
  extensionQuestion: string;
  scoreTotal: number;
  rubricJson: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface V11InterestQuestion {
  id: string;
  questionText: string;
  score: number;
  rubric: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface V11EvaluationRecord {
  id: string;
  newcomerName: string;
  candidateId: string | null;
  targetRole: string;
  evaluatorName: string | null;
  assessmentDate: string;
  status: 'in_progress' | 'submitted' | 'pending_review' | 'reviewed' | 'report_ready';
  taskMode: string;
  selectedTaskDirectionsJson: string | null;
  basicScore: number | null;
  taskScore: number | null;
  interestScore: number | null;
  totalScore: number | null;
  mainDirection: string | null;
  secondaryDirection: string | null;
  potentialDirection: string | null;
  notRecommendedDirection: string | null;
  talentProfile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface V11BasicAnswer {
  id: string;
  recordId: string;
  questionId: string;
  dimensionCode: string;
  answer: string;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  isCorrect: boolean | null;
  reviewStatus: string;
  comment: string | null;
  createdAt: string;
}

export interface V11TaskAnswer {
  id: string;
  recordId: string;
  taskId: string;
  dimensionCode: string;
  mainAnswer: string;
  extensionAnswer: string;
  scoreBasicUnderstanding: number | null;
  scoreAnalysisQuality: number | null;
  scoreStructureExpression: number | null;
  scoreApplicationLanding: number | null;
  scoreExtensionThinking: number | null;
  finalScore: number | null;
  reviewStatus: string;
  comment: string | null;
  createdAt: string;
}

export interface V11InterestAnswer {
  id: string;
  recordId: string;
  questionId: string;
  answer: string;
  relatedDirectionCodesJson: string | null;
  manualScore: number | null;
  finalScore: number | null;
  comment: string | null;
  createdAt: string;
}

export interface V11AssessmentReport {
  id: string;
  recordId: string;
  basicSummary: string;
  taskSummary: string;
  interestSummary: string;
  directionScoresJson: string;
  strengths: string;
  weaknesses: string;
  suitableTasks: string;
  cultivationPlanJson: string;
  reportMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface V11TrainingResource {
  id: string;
  dimensionCode: string;
  title: string;
  resourceType: string;
  url: string | null;
  description: string;
  monthStage: 1 | 2 | 3;
  isEnabled: boolean;
  sortOrder: number;
}

export interface V11DataSourceConfig {
  cloudFolderUrl: string;
  baseUrl: string;
  appToken: string;
  baseToken: string;
  appId?: string;
  appSecret?: string;
  hasAppSecret?: boolean;
  driveFolderToken?: string;
  tableIdMap: Record<string, string>;
  status: string;
}

export interface V11DataSourceStatus {
  configured: boolean;
  mode: 'demo' | 'bitable';
  tableCount: number;
  lastChecked: string;
  envVarsPresent: Record<string, boolean>;
  tablesStatus: Record<string, boolean>;
  connectionMessage: string;
}

export interface V11ConnectionTestResult {
  success: boolean;
  message: string;
  tablesAccessible: Record<string, boolean>;
}

export interface V11SchemaTableField {
  name: string;
  type: string;
  description: string;
}

export interface V11SchemaTable {
  name: string;
  fields: V11SchemaTableField[];
}

export interface V11SchemaGuide {
  tables: V11SchemaTable[];
}

export interface V11BasicAnswerInput {
  questionId: string;
  answer: string;
}

export interface V11TaskAnswerInput {
  taskId: string;
  dimensionCode: string;
  mainAnswer: string;
  extensionAnswer: string;
}

export interface V11InterestAnswerInput {
  questionId: string;
  answer: string;
}

export interface V11SubmitRequest {
  newcomerName: string;
  candidateId?: string;
  targetRole: string;
  evaluatorName?: string;
  basicAnswers: V11BasicAnswerInput[];
  taskAnswers: V11TaskAnswerInput[];
  interestAnswers: V11InterestAnswerInput[];
}

export interface V11SubmitResponse {
  recordId: string;
  status: string;
  basicAutoScore: number;
  basicPendingReview: number;
  totalAutoScore: number;
  message: string;
}

export interface V11ReviewBasicAnswer {
  answerId: string;
  manualScore: number;
  comment: string;
}

export interface V11ReviewTaskAnswer {
  answerId: string;
  scoreBasicUnderstanding: number;
  scoreAnalysisQuality: number;
  scoreStructureExpression: number;
  scoreApplicationLanding: number;
  scoreExtensionThinking: number;
  comment: string;
}

export interface V11ReviewInterestAnswer {
  answerId: string;
  manualScore: number;
  comment: string;
}

export interface V11ReviewDto {
  basicAnswers: V11ReviewBasicAnswer[];
  taskAnswers: V11ReviewTaskAnswer[];
  interestAnswers: V11ReviewInterestAnswer[];
}

export interface V11BasicAnswerWithQuestion extends V11BasicAnswer {
  question: V11BasicQuestion;
}

export interface V11TaskAnswerWithQuestion extends V11TaskAnswer {
  task: V11TaskQuestion;
}

export interface V11InterestAnswerWithQuestion extends V11InterestAnswer {
  question: V11InterestQuestion;
}

export interface V11EvaluationDetail {
  record: V11EvaluationRecord;
  basicAnswers: V11BasicAnswerWithQuestion[];
  taskAnswers: V11TaskAnswerWithQuestion[];
  interestAnswers: V11InterestAnswerWithQuestion[];
  report: V11AssessmentReport | null;
}
