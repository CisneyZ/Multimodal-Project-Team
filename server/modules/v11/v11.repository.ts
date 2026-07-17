
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
} from '@shared/api.interface';
import {
  DOCUMENT_BASIC_QUESTIONS,
  DOCUMENT_TASK_QUESTIONS,
  DOCUMENT_INTEREST_QUESTIONS,
} from './document-question-bank';

export interface AssessmentV11Repository {
  getDimensions(): Promise<V11Dimension[]>;
  getConfig(): Promise<V11AssessmentConfig>;
  getBasicQuestions(): Promise<V11BasicQuestion[]>;
  getTaskQuestions(): Promise<V11TaskQuestion[]>;
  getInterestQuestions(): Promise<V11InterestQuestion[]>;
  getDataSourceConfig(): Promise<V11DataSourceConfig>;
  updateDataSourceConfig(config: Partial<V11DataSourceConfig>): Promise<V11DataSourceConfig>;
  getEvaluationRecords(): Promise<V11EvaluationRecord[]>;
  getReports(): Promise<V11AssessmentReport[]>;
  getTrainingResources(): Promise<V11TrainingResource[]>;
  createEvaluationRecord(record: V11EvaluationRecord): Promise<V11EvaluationRecord>;
  saveBasicAnswers(answers: V11BasicAnswer[]): Promise<void>;
  saveTaskAnswers(answers: V11TaskAnswer[]): Promise<void>;
  saveInterestAnswers(answers: V11InterestAnswer[]): Promise<void>;
  getEvaluationRecordById(id: string): Promise<V11EvaluationRecord | null>;
  getBasicAnswersByRecordId(recordId: string): Promise<V11BasicAnswer[]>;
  getTaskAnswersByRecordId(recordId: string): Promise<V11TaskAnswer[]>;
  getInterestAnswersByRecordId(recordId: string): Promise<V11InterestAnswer[]>;
  updateBasicAnswer(id: string, update: Partial<V11BasicAnswer>): Promise<void>;
  updateTaskAnswer(id: string, update: Partial<V11TaskAnswer>): Promise<void>;
  updateInterestAnswer(id: string, update: Partial<V11InterestAnswer>): Promise<void>;
  updateEvaluationRecord(id: string, update: Partial<V11EvaluationRecord>): Promise<V11EvaluationRecord>;
  createReport(report: V11AssessmentReport): Promise<V11AssessmentReport>;
  updateReport(id: string, update: Partial<V11AssessmentReport>): Promise<V11AssessmentReport>;
  getReportByRecordId(recordId: string): Promise<V11AssessmentReport | null>;
  createTrainingResource(resource: V11TrainingResource): Promise<V11TrainingResource>;
  updateTrainingResource(id: string, update: Partial<V11TrainingResource>): Promise<V11TrainingResource>;
  deleteTrainingResource(id: string): Promise<void>;
}

const DIMENSIONS: V11Dimension[] = [
  {
    "id": "d-1",
    "code": "film_theory",
    "name": "影视基础理论",
    "description": "理解类型、主题、人物、冲突、卖点等影视基础概念。",
    "sortOrder": 1,
    "isEnabled": true
  },
  {
    "id": "d-2",
    "code": "visual_language",
    "name": "视听语言应用",
    "description": "分析镜头、构图、色彩、声音、剪辑如何服务表达。",
    "sortOrder": 2,
    "isEnabled": true
  },
  {
    "id": "d-3",
    "code": "script_narrative",
    "name": "剧本叙事拆解",
    "description": "拆解故事主线、人物目标、核心冲突、情节点和爽点。",
    "sortOrder": 3,
    "isEnabled": true
  },
  {
    "id": "d-4",
    "code": "aigc_business",
    "name": "AIGC 业务认知",
    "description": "理解 AI 在内容生产中的使用边界、风险和工作流。",
    "sortOrder": 4,
    "isEnabled": true
  },
  {
    "id": "d-5",
    "code": "analysis",
    "name": "综合分析与项目反馈能力",
    "description": "具备项目判断、问题汇报、客户沟通、风险处理和复盘意识。",
    "sortOrder": 5,
    "isEnabled": true
  }
];

const CONFIG: V11AssessmentConfig = {
  id: 'cfg-1',
  version: 'V1.1',
  taskMode: 'five_select_three',
  basicScoreTotal: 25,
  taskScoreTotal: 60,
  interestScoreTotal: 15,
  isActive: true,
  notes: '五维评估模型 V1.1，总分 100 分',
  updatedAt: '2026-06-23T00:00:00.000Z',
};

const TASK_RUBRIC = JSON.stringify({ basicUnderstanding: 4, analysisQuality: 6, structureExpression: 4, applicationLanding: 4, extensionThinking: 2 });

const BASIC_QUESTIONS: V11BasicQuestion[] = [
  {
    "id": "bq-film_theory-01",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪一项最接近“类型片”的含义？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只由同一位导演拍摄的影片\"},{\"key\":\"B\",\"text\":\"在题材、叙事模式、人物关系和观众期待上具有相对固定规则的影片类型\"},{\"key\":\"C\",\"text\":\"只在电影院上映的影片\"},{\"key\":\"D\",\"text\":\"只使用真实事件改编的影片\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 1,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-02",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "在影视叙事中，“冲突”的主要作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"增加画面色彩\"},{\"key\":\"B\",\"text\":\"推动人物行动和情节发展\"},{\"key\":\"C\",\"text\":\"降低观众理解成本\"},{\"key\":\"D\",\"text\":\"保证故事一定有反转\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 2,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-03",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列关于“主题”的说法，较准确的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主题等同于故事发生的地点\"},{\"key\":\"B\",\"text\":\"主题是作品想表达的核心观点、情感或价值判断\"},{\"key\":\"C\",\"text\":\"主题只存在于文艺片中\"},{\"key\":\"D\",\"text\":\"主题就是主角的名字\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 3,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-04",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "影视作品中的“人物动机”主要指什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物为什么采取某种行动\"},{\"key\":\"B\",\"text\":\"人物穿什么衣服\"},{\"key\":\"C\",\"text\":\"人物出现在哪一集\"},{\"key\":\"D\",\"text\":\"人物的台词字数\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 4,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-05",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项更符合“商业类型片”的基本特点？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"完全不考虑观众接受度\"},{\"key\":\"B\",\"text\":\"通常具有较明确的类型规则、情绪体验和目标观众\"},{\"key\":\"C\",\"text\":\"一定不能有艺术表达\"},{\"key\":\"D\",\"text\":\"只允许使用固定演员\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 5,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-06",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "影视作品中的“戏剧张力”通常来自哪里？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物目标、阻碍、冲突、悬念或情绪对抗\"},{\"key\":\"B\",\"text\":\"片尾字幕长度\"},{\"key\":\"C\",\"text\":\"拍摄设备品牌\"},{\"key\":\"D\",\"text\":\"海报颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 6,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-07",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项更适合用来判断作品核心卖点？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"片名有几个字\"},{\"key\":\"B\",\"text\":\"作品最能吸引观众的情绪、题材、人物或冲突点\"},{\"key\":\"C\",\"text\":\"演职员名单长度\"},{\"key\":\"D\",\"text\":\"拍摄地天气\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 7,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-08",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“主线剧情”通常指的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"与主角核心目标和主要冲突相关的主要故事线\"},{\"key\":\"B\",\"text\":\"所有无关细节集合\"},{\"key\":\"C\",\"text\":\"背景音乐\"},{\"key\":\"D\",\"text\":\"出现最多的场景\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 8,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-09",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项属于常见影视类型？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"悬疑、爱情、喜剧、犯罪、科幻\"},{\"key\":\"B\",\"text\":\"红色、蓝色、黄色、绿色\"},{\"key\":\"C\",\"text\":\"上午、下午、晚上\"},{\"key\":\"D\",\"text\":\"长句、短句、感叹句\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 9,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-10",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "分析影视作品时，为什么不能只复述剧情？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"因为剧情完全不重要\"},{\"key\":\"B\",\"text\":\"因为分析需要进一步说明人物、冲突、主题、视听表达和作品价值\"},{\"key\":\"C\",\"text\":\"因为所有剧情都不能被描述\"},{\"key\":\"D\",\"text\":\"因为复述剧情一定违法\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 10,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-11",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“人物设定”通常不包括以下哪项？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物身份、性格、目标和关系\"},{\"key\":\"B\",\"text\":\"人物在故事中的功能\"},{\"key\":\"C\",\"text\":\"人物动机和弱点\"},{\"key\":\"D\",\"text\":\"作品文件保存路径\"}]",
    "correctAnswer": "D",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 11,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-12",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“高概念”影视项目的特点是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"核心设定清晰、容易一句话概括，并具有吸引力\"},{\"key\":\"B\",\"text\":\"故事完全没有设定\"},{\"key\":\"C\",\"text\":\"只依靠片尾字幕吸引观众\"},{\"key\":\"D\",\"text\":\"所有角色都没有目标\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 12,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-13",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“叙事视角”主要指什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"故事从谁的角度被讲述，观众跟随谁获取信息\"},{\"key\":\"B\",\"text\":\"摄影机品牌\"},{\"key\":\"C\",\"text\":\"片名字体大小\"},{\"key\":\"D\",\"text\":\"演员是否看向镜头\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 13,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-14",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“悬念”的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"让观众对后续信息产生期待和疑问\"},{\"key\":\"B\",\"text\":\"让观众完全知道所有答案\"},{\"key\":\"C\",\"text\":\"让故事没有推进\"},{\"key\":\"D\",\"text\":\"删除所有冲突\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 14,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-15",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "反派在故事中的常见功能是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"制造阻碍，强化主角目标和冲突\"},{\"key\":\"B\",\"text\":\"只负责解释片名\"},{\"key\":\"C\",\"text\":\"与剧情无关\"},{\"key\":\"D\",\"text\":\"只能出现在喜剧中\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 15,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-16",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "作品的“情绪基调”主要指什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"作品整体带给观众的主要情绪感受\"},{\"key\":\"B\",\"text\":\"演员身高\"},{\"key\":\"C\",\"text\":\"拍摄地点海拔\"},{\"key\":\"D\",\"text\":\"字幕颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 16,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-17",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "现实主义题材通常关注什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"现实生活处境、社会关系或真实情感困境\"},{\"key\":\"B\",\"text\":\"必须完全没有虚构\"},{\"key\":\"C\",\"text\":\"只能用纪录片形式\"},{\"key\":\"D\",\"text\":\"不能有戏剧冲突\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 17,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-18",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“IP 改编”中的 IP 通常强调什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"已有内容、角色、世界观或粉丝基础的开发价值\"},{\"key\":\"B\",\"text\":\"一串技术代码\"},{\"key\":\"C\",\"text\":\"只能指电影票房\"},{\"key\":\"D\",\"text\":\"与版权无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 18,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-19",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "判断作品是否有系列化潜力时，较重要的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"世界观、人物关系、核心设定是否能持续展开\"},{\"key\":\"B\",\"text\":\"片名字数是否固定\"},{\"key\":\"C\",\"text\":\"海报是否使用蓝色\"},{\"key\":\"D\",\"text\":\"第一句台词是什么\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 19,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-20",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "哪种分析更专业？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"这部剧挺好看的\"},{\"key\":\"B\",\"text\":\"这部剧以家庭冲突切入，通过母女关系变化表达代际沟通主题\"},{\"key\":\"C\",\"text\":\"我不喜欢这个演员\"},{\"key\":\"D\",\"text\":\"这个片名一般\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 20,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-21",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“人物功能”通常指什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物在故事中承担的叙事作用\"},{\"key\":\"B\",\"text\":\"人物手机型号\"},{\"key\":\"C\",\"text\":\"人物服装价格\"},{\"key\":\"D\",\"text\":\"人物现实年龄\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 21,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-22",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "影视作品中的“世界观”主要指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"故事发生的规则、环境、社会结构和基本设定\"},{\"key\":\"B\",\"text\":\"拍摄城市的地图\"},{\"key\":\"C\",\"text\":\"观众的个人世界观\"},{\"key\":\"D\",\"text\":\"片尾字幕设计\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 22,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-23",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项更能体现作品的“观看门槛”？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"观众理解作品所需的背景知识、人物关系和信息复杂度\"},{\"key\":\"B\",\"text\":\"电影院门票价格\"},{\"key\":\"C\",\"text\":\"片名颜色\"},{\"key\":\"D\",\"text\":\"演员数量越少门槛越高\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 23,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-24",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项属于“情绪卖点”？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"复仇爽感、治愈感、悬疑紧张感、爱情甜蜜感\"},{\"key\":\"B\",\"text\":\"文件大小\"},{\"key\":\"C\",\"text\":\"字幕位置\"},{\"key\":\"D\",\"text\":\"拍摄设备参数\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 24,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-25",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“人物成长”通常指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物在经历事件后认知、情感或行为发生变化\"},{\"key\":\"B\",\"text\":\"演员长高\"},{\"key\":\"C\",\"text\":\"人物换衣服\"},{\"key\":\"D\",\"text\":\"场景变大\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 25,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-26",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "判断作品是否有传播价值，不能只看什么？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"内容卖点和受众匹配\"},{\"key\":\"B\",\"text\":\"冲突与话题度\"},{\"key\":\"C\",\"text\":\"个人喜好\"},{\"key\":\"D\",\"text\":\"情绪抓手\"}]",
    "correctAnswer": "C",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 26,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-27",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“人物关系张力”通常来自？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"利益、情感、秘密、误解、权力或目标冲突\"},{\"key\":\"B\",\"text\":\"人物名字长度\"},{\"key\":\"C\",\"text\":\"场景亮度\"},{\"key\":\"D\",\"text\":\"服装颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 27,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-28",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项更适合描述“作品定位”？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"这是一部面向年轻女性用户的都市情感成长剧\"},{\"key\":\"B\",\"text\":\"这个视频挺长\"},{\"key\":\"C\",\"text\":\"我昨天看了它\"},{\"key\":\"D\",\"text\":\"它有很多演员\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 28,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-29",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“开端—发展—高潮—结局”属于哪类分析？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"叙事结构分析\"},{\"key\":\"B\",\"text\":\"服装分析\"},{\"key\":\"C\",\"text\":\"字幕分析\"},{\"key\":\"D\",\"text\":\"档期分析\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 29,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-30",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "判断类型片是否成立，关键看？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否满足该类型的基本规则和观众情绪期待\"},{\"key\":\"B\",\"text\":\"是否所有演员出名\"},{\"key\":\"C\",\"text\":\"是否只有一个场景\"},{\"key\":\"D\",\"text\":\"是否没有台词\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 30,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-31",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "作品中的“价值判断”指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"作品对人物行为、社会问题或情感关系的态度表达\"},{\"key\":\"B\",\"text\":\"票价高低\"},{\"key\":\"C\",\"text\":\"拍摄成本\"},{\"key\":\"D\",\"text\":\"文件价值\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 31,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-32",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项更适合作为影视分析结论？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"该片通过父子冲突呈现代际沟通困境，但后半段转折铺垫不足\"},{\"key\":\"B\",\"text\":\"还行\"},{\"key\":\"C\",\"text\":\"挺火的\"},{\"key\":\"D\",\"text\":\"我喜欢\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 32,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-33",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“观众期待”通常由什么形成？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"类型规则、题材设定、宣传信息和前期剧情\"},{\"key\":\"B\",\"text\":\"播放器尺寸\"},{\"key\":\"C\",\"text\":\"文件格式\"},{\"key\":\"D\",\"text\":\"字幕语言\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 33,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-34",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "下列哪项属于“内容差异化”？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"在同类题材中有独特设定、人物关系或表达角度\"},{\"key\":\"B\",\"text\":\"完全重复同类作品\"},{\"key\":\"C\",\"text\":\"没有任何特点\"},{\"key\":\"D\",\"text\":\"只换片名\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 34,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-35",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "“主角光环”可能带来的问题是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主角行动过于便利，削弱冲突可信度\"},{\"key\":\"B\",\"text\":\"主角一定更真实\"},{\"key\":\"C\",\"text\":\"主角不能成功\"},{\"key\":\"D\",\"text\":\"主角没有台词\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 35,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-36",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "影视作品中的“信息差”常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"制造悬念、误会、反转或喜剧效果\"},{\"key\":\"B\",\"text\":\"降低画质\"},{\"key\":\"C\",\"text\":\"减少剧情\"},{\"key\":\"D\",\"text\":\"替代剪辑\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 36,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-37",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "哪项更能体现成熟的影视基础判断？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"能说明类型、受众、卖点、冲突和问题\"},{\"key\":\"B\",\"text\":\"只说好不好看\"},{\"key\":\"C\",\"text\":\"只看演员\"},{\"key\":\"D\",\"text\":\"只看热搜\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 37,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-38",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "作品“节奏感”不只取决于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"剧情推进、信息释放、冲突密度和剪辑\"},{\"key\":\"B\",\"text\":\"片名长度\"},{\"key\":\"C\",\"text\":\"情节点安排\"},{\"key\":\"D\",\"text\":\"情绪变化\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 38,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-39",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "哪种情况说明主题表达较弱？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"故事事件很多，但无法看出核心观点或情感指向\"},{\"key\":\"B\",\"text\":\"人物目标明确\"},{\"key\":\"C\",\"text\":\"冲突集中\"},{\"key\":\"D\",\"text\":\"情绪统一\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 39,
    "isEnabled": true
  },
  {
    "id": "bq-film_theory-40",
    "dimensionCode": "film_theory",
    "questionType": "single_choice",
    "questionText": "分析影视作品的第一步通常是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"明确作品基本信息、类型、主线和分析目标\"},{\"key\":\"B\",\"text\":\"直接写结论\"},{\"key\":\"C\",\"text\":\"只评价演员\"},{\"key\":\"D\",\"text\":\"只查票房\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 40,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-01",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "低角度仰拍人物时，通常更容易形成哪种视觉效果？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物弱小\"},{\"key\":\"B\",\"text\":\"人物高大、有压迫感或权威感\"},{\"key\":\"C\",\"text\":\"画面失去空间关系\"},{\"key\":\"D\",\"text\":\"无法识别表情\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 101,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-02",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "剪辑节奏明显加快，通常可能带来的效果是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"增强紧张感、行动感或情绪推动\"},{\"key\":\"B\",\"text\":\"让画面失去意义\"},{\"key\":\"C\",\"text\":\"让所有场景变幽默\"},{\"key\":\"D\",\"text\":\"必然降低注意力\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 102,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-03",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "环境音的作用不包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"建立空间真实感\"},{\"key\":\"B\",\"text\":\"营造氛围\"},{\"key\":\"C\",\"text\":\"传递场景信息\"},{\"key\":\"D\",\"text\":\"永远替代对白\"}]",
    "correctAnswer": "D",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 103,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-04",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "特写镜头通常适合表现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物细微表情、情绪变化或重要物件\"},{\"key\":\"B\",\"text\":\"城市地理结构\"},{\"key\":\"C\",\"text\":\"所有角色全貌\"},{\"key\":\"D\",\"text\":\"大规模战争全景\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 104,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-05",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "冷色调画面通常容易营造？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"疏离、压抑、冷静、悬疑或孤独感\"},{\"key\":\"B\",\"text\":\"必然喜剧\"},{\"key\":\"C\",\"text\":\"必然甜蜜\"},{\"key\":\"D\",\"text\":\"与情绪无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 105,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-06",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "背景音乐突然停止，可能产生？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化沉默、紧张或情绪断裂\"},{\"key\":\"B\",\"text\":\"一定搞笑\"},{\"key\":\"C\",\"text\":\"消除戏剧效果\"},{\"key\":\"D\",\"text\":\"说明没有声音设计\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 106,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-07",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "长镜头常见作用不包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"保持动作和空间连续性\"},{\"key\":\"B\",\"text\":\"增强沉浸感\"},{\"key\":\"C\",\"text\":\"展示场面调度\"},{\"key\":\"D\",\"text\":\"必然让故事没有节奏\"}]",
    "correctAnswer": "D",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 107,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-08",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "主观镜头通常指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"模拟某个角色视角的镜头\"},{\"key\":\"B\",\"text\":\"无表达功能镜头\"},{\"key\":\"C\",\"text\":\"只拍天空\"},{\"key\":\"D\",\"text\":\"所有远景\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 108,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-09",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "人物处于画面边缘可能表现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"压迫、孤立、不稳定或被环境挤压\"},{\"key\":\"B\",\"text\":\"必然拍坏了\"},{\"key\":\"C\",\"text\":\"人物不重要\"},{\"key\":\"D\",\"text\":\"与情绪无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 109,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-10",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "哪项更适合作为视听分析？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"片段很好看\"},{\"key\":\"B\",\"text\":\"昏暗光线、低饱和色彩和缓慢剪辑强化人物压抑感\"},{\"key\":\"C\",\"text\":\"我觉得还行\"},{\"key\":\"D\",\"text\":\"导演很厉害\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 110,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-11",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "远景镜头通常适合表现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物与环境关系或宏观空间信息\"},{\"key\":\"B\",\"text\":\"眼神细节\"},{\"key\":\"C\",\"text\":\"手机小字\"},{\"key\":\"D\",\"text\":\"只能表现台词\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 111,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-12",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "暖色调画面通常带来？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"温暖、亲密、怀旧或轻松\"},{\"key\":\"B\",\"text\":\"必然恐怖\"},{\"key\":\"C\",\"text\":\"必然悬疑\"},{\"key\":\"D\",\"text\":\"与情绪无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 112,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-13",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "景深较浅通常会？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"突出主体，让背景虚化\"},{\"key\":\"B\",\"text\":\"所有物体同样清晰\"},{\"key\":\"C\",\"text\":\"删除主体\"},{\"key\":\"D\",\"text\":\"声音变大\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 113,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-14",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "对称构图常带来？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"秩序感、仪式感、压迫感或稳定感\"},{\"key\":\"B\",\"text\":\"必然混乱\"},{\"key\":\"C\",\"text\":\"必然搞笑\"},{\"key\":\"D\",\"text\":\"没意义\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 114,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-15",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "手持摄影常见效果是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"现场感、不稳定感、紧张感或纪实感\"},{\"key\":\"B\",\"text\":\"永远静止\"},{\"key\":\"C\",\"text\":\"人物消失\"},{\"key\":\"D\",\"text\":\"只能动画用\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 115,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-16",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "交叉剪辑通常用于表现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"多条行动线同时推进、对照或紧张关系\"},{\"key\":\"B\",\"text\":\"一个静止画面\"},{\"key\":\"C\",\"text\":\"删除叙事关系\"},{\"key\":\"D\",\"text\":\"片尾字幕\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 116,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-17",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "画外音作用不包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"补充心理或背景信息\"},{\"key\":\"B\",\"text\":\"建立叙述者声音\"},{\"key\":\"C\",\"text\":\"永远证明画面是假的\"},{\"key\":\"D\",\"text\":\"连接画面与内心\"}]",
    "correctAnswer": "C",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 117,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-18",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "紧张场景中放大呼吸和脚步声是为了？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化人物心理和空间压迫感\"},{\"key\":\"B\",\"text\":\"证明没录音\"},{\"key\":\"C\",\"text\":\"忽略情节\"},{\"key\":\"D\",\"text\":\"替代画面\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 118,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-19",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "快速推近人物面部可能强调？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"情绪爆发、发现真相或心理冲击\"},{\"key\":\"B\",\"text\":\"天气变化\"},{\"key\":\"C\",\"text\":\"字幕大小\"},{\"key\":\"D\",\"text\":\"片尾长度\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 119,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-20",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "分析视听语言最重要的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"说明视听元素如何服务情绪、人物或叙事\"},{\"key\":\"B\",\"text\":\"只说画面漂亮\"},{\"key\":\"C\",\"text\":\"只背术语\"},{\"key\":\"D\",\"text\":\"不结合片段\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 120,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-21",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "俯拍人物通常可能表现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"弱小、受压、被观察或处于低位\"},{\"key\":\"B\",\"text\":\"必然权威\"},{\"key\":\"C\",\"text\":\"必然快乐\"},{\"key\":\"D\",\"text\":\"没作用\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 121,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-22",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "光线强烈明暗对比常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化冲突、悬疑、危险或人物内心分裂\"},{\"key\":\"B\",\"text\":\"删除空间信息\"},{\"key\":\"C\",\"text\":\"必然喜剧\"},{\"key\":\"D\",\"text\":\"只为省电\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 122,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-23",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "空镜头常见作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"建立环境、转换情绪、暗示主题或节奏停顿\"},{\"key\":\"B\",\"text\":\"一定无意义\"},{\"key\":\"C\",\"text\":\"只填时长\"},{\"key\":\"D\",\"text\":\"替代所有角色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 123,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-24",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "慢动作常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化情绪、突出关键瞬间或制造仪式感\"},{\"key\":\"B\",\"text\":\"让剧情消失\"},{\"key\":\"C\",\"text\":\"只用于纪录片\"},{\"key\":\"D\",\"text\":\"必然降低情绪\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 124,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-25",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "镜头晃动明显可能表达？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"紧张、混乱、真实感或人物失控\"},{\"key\":\"B\",\"text\":\"画面一定无效\"},{\"key\":\"C\",\"text\":\"喜剧唯一方法\"},{\"key\":\"D\",\"text\":\"剧情暂停\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 125,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-26",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "静默在影视声音设计中可能作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化压迫、尴尬、情绪断裂或等待感\"},{\"key\":\"B\",\"text\":\"说明没有声音\"},{\"key\":\"C\",\"text\":\"必然失误\"},{\"key\":\"D\",\"text\":\"与表达无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 126,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-27",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "色彩饱和度降低可能产生？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"压抑、冷静、现实或失落感\"},{\"key\":\"B\",\"text\":\"必然喜庆\"},{\"key\":\"C\",\"text\":\"必然爱情\"},{\"key\":\"D\",\"text\":\"没有情绪影响\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 127,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-28",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "镜头长时间停留在人物脸上通常为了？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"展现心理变化、情绪停顿或观众凝视\"},{\"key\":\"B\",\"text\":\"增加字幕\"},{\"key\":\"C\",\"text\":\"展示天气\"},{\"key\":\"D\",\"text\":\"没有意义\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 128,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-29",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "快节奏蒙太奇常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"压缩时间、展示过程或强化信息密度\"},{\"key\":\"B\",\"text\":\"延长时间\"},{\"key\":\"C\",\"text\":\"删除信息\"},{\"key\":\"D\",\"text\":\"只拍风景\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 129,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-30",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "声画不同步或反差可能用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"制造讽刺、悬疑、心理错位或复杂情绪\"},{\"key\":\"B\",\"text\":\"一定是错误\"},{\"key\":\"C\",\"text\":\"没有表达价值\"},{\"key\":\"D\",\"text\":\"只能用于片尾\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 130,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-31",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "角色背对镜头可能表达？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"疏离、隐藏、孤独或拒绝沟通\"},{\"key\":\"B\",\"text\":\"一定无意义\"},{\"key\":\"C\",\"text\":\"镜头错误\"},{\"key\":\"D\",\"text\":\"必然搞笑\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 131,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-32",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "镜头从远景逐渐推近人物，常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"从环境进入人物心理或强调人物重要性\"},{\"key\":\"B\",\"text\":\"删除人物\"},{\"key\":\"C\",\"text\":\"只显示天气\"},{\"key\":\"D\",\"text\":\"让声音变小\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 132,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-33",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "高饱和色彩可能产生？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强烈、夸张、梦幻、喜剧或情绪化效果\"},{\"key\":\"B\",\"text\":\"必然压抑\"},{\"key\":\"C\",\"text\":\"必然现实主义\"},{\"key\":\"D\",\"text\":\"无表达意义\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 133,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-34",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "视听分析中最应避免？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只堆术语，不解释表达作用\"},{\"key\":\"B\",\"text\":\"结合具体画面\"},{\"key\":\"C\",\"text\":\"说明情绪效果\"},{\"key\":\"D\",\"text\":\"联系人物状态\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 134,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-35",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "音乐节奏与剪辑节奏配合通常会？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"强化情绪推进和观看节奏\"},{\"key\":\"B\",\"text\":\"消除叙事\"},{\"key\":\"C\",\"text\":\"删除人物\"},{\"key\":\"D\",\"text\":\"必然无效\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 135,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-36",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "暗部空间保留过多可能用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"制造未知、危险、悬念或压迫感\"},{\"key\":\"B\",\"text\":\"必然曝光错误\"},{\"key\":\"C\",\"text\":\"没有作用\"},{\"key\":\"D\",\"text\":\"只为省灯\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 136,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-37",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "多使用近景和特写会让观众？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"更关注人物情绪和细节\"},{\"key\":\"B\",\"text\":\"更了解城市地图\"},{\"key\":\"C\",\"text\":\"忽略人物\"},{\"key\":\"D\",\"text\":\"看不到表情\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 137,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-38",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "大量使用远景可能强化？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"环境压迫、人物渺小或空间关系\"},{\"key\":\"B\",\"text\":\"眼神细节\"},{\"key\":\"C\",\"text\":\"台词数量\"},{\"key\":\"D\",\"text\":\"字幕大小\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 138,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-39",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "分析剪辑时应关注？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"镜头连接如何影响时间、空间、情绪和信息释放\"},{\"key\":\"B\",\"text\":\"只数镜头数量\"},{\"key\":\"C\",\"text\":\"只看设备\"},{\"key\":\"D\",\"text\":\"不看内容\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 139,
    "isEnabled": true
  },
  {
    "id": "bq-visual_language-40",
    "dimensionCode": "visual_language",
    "questionType": "single_choice",
    "questionText": "视听语言最终服务于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"情绪、人物、叙事、主题和观众体验\"},{\"key\":\"B\",\"text\":\"只服务画面好看\"},{\"key\":\"C\",\"text\":\"只服务演员\"},{\"key\":\"D\",\"text\":\"只服务时长\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 140,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-01",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物弧光通常指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"发型变化\"},{\"key\":\"B\",\"text\":\"人物从开头到结尾在认知、情感、价值或行为上的变化轨迹\"},{\"key\":\"C\",\"text\":\"出场次数\"},{\"key\":\"D\",\"text\":\"城市变化\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 201,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-02",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "情节点的主要作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"装饰台词\"},{\"key\":\"B\",\"text\":\"改变故事走向或推动人物进入新阶段\"},{\"key\":\"C\",\"text\":\"增加字幕\"},{\"key\":\"D\",\"text\":\"停止推进\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 202,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-03",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "剧情梗概核心应包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"服装颜色\"},{\"key\":\"B\",\"text\":\"主角、目标、阻碍、关键行动和结果\"},{\"key\":\"C\",\"text\":\"全部对白\"},{\"key\":\"D\",\"text\":\"演员表\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 203,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-04",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物关系在剧本分析中的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只填表\"},{\"key\":\"B\",\"text\":\"理解利益、情感、冲突和剧情动力\"},{\"key\":\"C\",\"text\":\"与剧情无关\"},{\"key\":\"D\",\"text\":\"判断颜值\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 204,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-05",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "外部冲突是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主角与反派争夺资源或目标\"},{\"key\":\"B\",\"text\":\"主角内心纠结\"},{\"key\":\"C\",\"text\":\"观众评价\"},{\"key\":\"D\",\"text\":\"海报风格\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 205,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-06",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "内部冲突是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主角在责任与欲望之间挣扎\"},{\"key\":\"B\",\"text\":\"两人打架\"},{\"key\":\"C\",\"text\":\"公司竞争\"},{\"key\":\"D\",\"text\":\"警察追捕罪犯\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 206,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-07",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "短剧开头通常需要快速建立？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物处境、冲突钩子、情绪刺激或期待感\"},{\"key\":\"B\",\"text\":\"所有配角人生\"},{\"key\":\"C\",\"text\":\"片尾名单\"},{\"key\":\"D\",\"text\":\"设备参数\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 207,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-08",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "反转有效性取决于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"毫无铺垫\"},{\"key\":\"B\",\"text\":\"出乎意料但逻辑成立\"},{\"key\":\"C\",\"text\":\"一定在最后一分钟\"},{\"key\":\"D\",\"text\":\"人物消失\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 208,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-09",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "故事拖沓的原因不包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"重复信息过多\"},{\"key\":\"B\",\"text\":\"目标不清\"},{\"key\":\"C\",\"text\":\"冲突推进慢\"},{\"key\":\"D\",\"text\":\"每场戏都推动变化\"}]",
    "correctAnswer": "D",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 209,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-10",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "区分事件和情节点是因为？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事件都不重要\"},{\"key\":\"B\",\"text\":\"情节点会改变处境、关系或故事方向\"},{\"key\":\"C\",\"text\":\"情节点只能结尾出现\"},{\"key\":\"D\",\"text\":\"事件只能配角完成\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 210,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-11",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "开场钩子的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"快速吸引观众继续观看\"},{\"key\":\"B\",\"text\":\"延长片尾\"},{\"key\":\"C\",\"text\":\"停止故事\"},{\"key\":\"D\",\"text\":\"隐藏名称\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 211,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-12",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "哪项最适合作为人物目标？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"女主想查清父亲死亡真相\"},{\"key\":\"B\",\"text\":\"女主穿白衣\"},{\"key\":\"C\",\"text\":\"房间有桌子\"},{\"key\":\"D\",\"text\":\"天气很好\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 212,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-13",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "铺垫的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"为后续情节、反转或行为建立依据\"},{\"key\":\"B\",\"text\":\"删除线索\"},{\"key\":\"C\",\"text\":\"忘记主线\"},{\"key\":\"D\",\"text\":\"增加道具\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 213,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-14",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "回收伏笔指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"前文信息在后文发挥作用或解释\"},{\"key\":\"B\",\"text\":\"删除前文\"},{\"key\":\"C\",\"text\":\"换演员\"},{\"key\":\"D\",\"text\":\"重复片名\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 214,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-15",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "短剧爽点通常来自？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"压抑后的反击、身份反转、真相揭露、情绪补偿\"},{\"key\":\"B\",\"text\":\"重复细节\"},{\"key\":\"C\",\"text\":\"无目标\"},{\"key\":\"D\",\"text\":\"黑屏\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 215,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-16",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物动机较弱的表现是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"行动缺少原因，突然且无铺垫\"},{\"key\":\"B\",\"text\":\"目标清晰\"},{\"key\":\"C\",\"text\":\"处境推动行动\"},{\"key\":\"D\",\"text\":\"选择与经历有关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 216,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-17",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "多线叙事最需要注意？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"各线有关联、对照或共同服务主题\"},{\"key\":\"B\",\"text\":\"各线完全无关\"},{\"key\":\"C\",\"text\":\"只增加人物\"},{\"key\":\"D\",\"text\":\"不需要主线\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 217,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-18",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "高潮段落通常是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主要冲突集中爆发并得到关键解决\"},{\"key\":\"B\",\"text\":\"片头字幕\"},{\"key\":\"C\",\"text\":\"随机对话\"},{\"key\":\"D\",\"text\":\"无关空镜\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 218,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-19",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "判断剧本结构清晰，较重要的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主角目标、冲突推进、关键转折和结果明确\"},{\"key\":\"B\",\"text\":\"台词越多越好\"},{\"key\":\"C\",\"text\":\"场景越杂越好\"},{\"key\":\"D\",\"text\":\"人名复杂\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 219,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-20",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "哪种剧本分析更有效？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"这集很好看\"},{\"key\":\"B\",\"text\":\"本集通过误会升级推动关系破裂，并在结尾用证据制造悬念\"},{\"key\":\"C\",\"text\":\"我喜欢角色\"},{\"key\":\"D\",\"text\":\"剧情很多\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 220,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-21",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物“外部目标”通常是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物想在行动层面达成的具体结果\"},{\"key\":\"B\",\"text\":\"人物发色\"},{\"key\":\"C\",\"text\":\"观众评论\"},{\"key\":\"D\",\"text\":\"背景音乐\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 221,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-22",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物“内部需求”通常是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物内心真正需要完成的成长或转变\"},{\"key\":\"B\",\"text\":\"人物吃什么\"},{\"key\":\"C\",\"text\":\"道具数量\"},{\"key\":\"D\",\"text\":\"镜头长度\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 222,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-23",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "结尾悬念的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"促使观众继续观看下一集\"},{\"key\":\"B\",\"text\":\"结束所有期待\"},{\"key\":\"C\",\"text\":\"删除冲突\"},{\"key\":\"D\",\"text\":\"降低追看欲\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 223,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-24",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "分集拆解最应记录？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"每集核心事件、冲突、转折、结尾钩子\"},{\"key\":\"B\",\"text\":\"每集天气\"},{\"key\":\"C\",\"text\":\"每集字体\"},{\"key\":\"D\",\"text\":\"每集文件大小\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 224,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-25",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "角色脸谱化的问题是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物单薄，缺少复杂动机和可信度\"},{\"key\":\"B\",\"text\":\"人物太真实\"},{\"key\":\"C\",\"text\":\"情节太清晰\"},{\"key\":\"D\",\"text\":\"冲突太合理\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 225,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-26",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "“强情节”通常强调？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事件推进、冲突变化和转折密度\"},{\"key\":\"B\",\"text\":\"无事发生\"},{\"key\":\"C\",\"text\":\"只看风景\"},{\"key\":\"D\",\"text\":\"台词越少越强\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 226,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-27",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "“弱情节”作品更依赖？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"氛围、人物心理、主题表达或生活质感\"},{\"key\":\"B\",\"text\":\"完全没有表达\"},{\"key\":\"C\",\"text\":\"只靠反转\"},{\"key\":\"D\",\"text\":\"删除人物\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 227,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-28",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "判断短剧是否有追看动力，重点看？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"冲突钩子、反转节奏、情绪释放和结尾悬念\"},{\"key\":\"B\",\"text\":\"片名颜色\"},{\"key\":\"C\",\"text\":\"演员身高\"},{\"key\":\"D\",\"text\":\"字幕大小\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 228,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-29",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物关系表应包含？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人物身份、关系、目标、冲突和变化\"},{\"key\":\"B\",\"text\":\"只写名字\"},{\"key\":\"C\",\"text\":\"只写服装\"},{\"key\":\"D\",\"text\":\"只写年龄\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 229,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-30",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "“主角被动”可能导致？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"行动力不足，故事推进依赖外部事件\"},{\"key\":\"B\",\"text\":\"冲突更强\"},{\"key\":\"C\",\"text\":\"目标更清晰\"},{\"key\":\"D\",\"text\":\"节奏更稳定\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 230,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-31",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "叙事中“误会”常用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"制造冲突、延迟真相、推动关系变化\"},{\"key\":\"B\",\"text\":\"删除人物关系\"},{\"key\":\"C\",\"text\":\"停止剧情\"},{\"key\":\"D\",\"text\":\"替代主题\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 231,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-32",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "短剧“反转过密”可能导致？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"可信度下降，观众疲劳\"},{\"key\":\"B\",\"text\":\"逻辑更强\"},{\"key\":\"C\",\"text\":\"人物更真实\"},{\"key\":\"D\",\"text\":\"节奏更慢\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 232,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-33",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "剧本拆解中“核心命题”指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"故事真正讨论的问题或价值主题\"},{\"key\":\"B\",\"text\":\"拍摄设备\"},{\"key\":\"C\",\"text\":\"字幕位置\"},{\"key\":\"D\",\"text\":\"演员排序\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 233,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-34",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "“情绪闭环”指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"前期积累的情绪在后续得到回应、释放或解决\"},{\"key\":\"B\",\"text\":\"情绪永远不变化\"},{\"key\":\"C\",\"text\":\"删除结尾\"},{\"key\":\"D\",\"text\":\"人物没有反应\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 234,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-35",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "故事开头信息过多可能导致？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"观众理解负担过重，钩子不突出\"},{\"key\":\"B\",\"text\":\"追看欲必然增强\"},{\"key\":\"C\",\"text\":\"冲突更清晰\"},{\"key\":\"D\",\"text\":\"主题更强\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 235,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-36",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "人物“选择”重要是因为？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"选择能体现人物价值、推动剧情并制造后果\"},{\"key\":\"B\",\"text\":\"选择无意义\"},{\"key\":\"C\",\"text\":\"只影响服装\"},{\"key\":\"D\",\"text\":\"只影响场景\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 236,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-37",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "剧本分析中判断“优点”应基于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"结构、人物、冲突、节奏、情绪效果等依据\"},{\"key\":\"B\",\"text\":\"单纯个人喜欢\"},{\"key\":\"C\",\"text\":\"演员热度\"},{\"key\":\"D\",\"text\":\"海报颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 237,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-38",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "剧本分析中判断“问题”应避免？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"空泛说“不好看”而没有依据\"},{\"key\":\"B\",\"text\":\"指出动机不足\"},{\"key\":\"C\",\"text\":\"指出节奏拖沓\"},{\"key\":\"D\",\"text\":\"指出冲突弱\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 238,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-39",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "“单集目标”通常用于判断？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"每一集是否有明确推进任务\"},{\"key\":\"B\",\"text\":\"片名长度\"},{\"key\":\"C\",\"text\":\"演员数量\"},{\"key\":\"D\",\"text\":\"字幕颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 239,
    "isEnabled": true
  },
  {
    "id": "bq-script_narrative-40",
    "dimensionCode": "script_narrative",
    "questionType": "single_choice",
    "questionText": "优秀剧本拆解应做到？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"抓主线、拆人物、找冲突、列节点、判断优劣\"},{\"key\":\"B\",\"text\":\"只复述剧情\"},{\"key\":\"C\",\"text\":\"只评价演员\"},{\"key\":\"D\",\"text\":\"只写感受\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 240,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-01",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 更适合优先承担哪类工作？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"替代所有人工判断\"},{\"key\":\"B\",\"text\":\"资料整理、初稿生成、创意发散、风格参考等辅助工作\"},{\"key\":\"C\",\"text\":\"保证无需审核\"},{\"key\":\"D\",\"text\":\"自动决定项目方向\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 301,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-02",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "使用 AIGC 生成影视分析内容最需要注意？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"语言流畅就准确\"},{\"key\":\"B\",\"text\":\"核对事实、避免幻觉，并结合人工判断修正\"},{\"key\":\"C\",\"text\":\"不能用于分析\"},{\"key\":\"D\",\"text\":\"越长越专业\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 302,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-03",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 在影视业务中的合理应用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"辅助生成短视频脚本初稿\"},{\"key\":\"B\",\"text\":\"复制他人剧本直接商用\"},{\"key\":\"C\",\"text\":\"替代版权审核\"},{\"key\":\"D\",\"text\":\"无需审核直接发布\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 303,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-04",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 幻觉指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"生成看似合理但实际不准确或不存在的信息\"},{\"key\":\"B\",\"text\":\"只能生成幻想题材\"},{\"key\":\"C\",\"text\":\"输出速度慢\"},{\"key\":\"D\",\"text\":\"内容有画面感\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 304,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-05",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成标题时人工需把关？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"准确、合规、符合事实和平台调性\"},{\"key\":\"B\",\"text\":\"越夸张越好\"},{\"key\":\"C\",\"text\":\"不用修改\"},{\"key\":\"D\",\"text\":\"必须错误\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 305,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-06",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "合理使用 AIGC 的做法是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"AI 生成初稿后人工核验、调整和优化\"},{\"key\":\"B\",\"text\":\"直接发布\"},{\"key\":\"C\",\"text\":\"复制原创内容商用\"},{\"key\":\"D\",\"text\":\"让 AI 承担法律判断\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 306,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-07",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 不应完全替代的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"最终价值判断和业务决策\"},{\"key\":\"B\",\"text\":\"资料整理\"},{\"key\":\"C\",\"text\":\"标题候选\"},{\"key\":\"D\",\"text\":\"框架草稿\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 307,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-08",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "好的提示词应包含？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"任务、材料、格式、维度和限制条件\"},{\"key\":\"B\",\"text\":\"随便分析\"},{\"key\":\"C\",\"text\":\"无背景\"},{\"key\":\"D\",\"text\":\"要求编造\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 308,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-09",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 业务风险包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事实错误、版权风险、同质化、价值偏差\"},{\"key\":\"B\",\"text\":\"效率提升\"},{\"key\":\"C\",\"text\":\"草稿更快\"},{\"key\":\"D\",\"text\":\"结构更清晰\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 309,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-10",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 在团队中的合理定位是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"辅助工具和效率放大器\"},{\"key\":\"B\",\"text\":\"最终负责人\"},{\"key\":\"C\",\"text\":\"自动发布系统\"},{\"key\":\"D\",\"text\":\"只能娱乐\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 310,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-11",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 改写文案最应避免？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"保留事实准确\"},{\"key\":\"B\",\"text\":\"未核实就夸大剧情或误导观众\"},{\"key\":\"C\",\"text\":\"优化语言\"},{\"key\":\"D\",\"text\":\"调整结构\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 311,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-12",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "用 AI 整理评论时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"让 AI 归纳高频观点后人工抽样核对原评论\"},{\"key\":\"B\",\"text\":\"完全相信 AI\"},{\"key\":\"C\",\"text\":\"删除负面评论\"},{\"key\":\"D\",\"text\":\"不看来源\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 312,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-13",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成分镜参考时人工需确认？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否符合剧情、角色、风格和制作可行性\"},{\"key\":\"B\",\"text\":\"完全不用改\"},{\"key\":\"C\",\"text\":\"越复杂越好\"},{\"key\":\"D\",\"text\":\"与项目无关\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 313,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-14",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "沉淀 AIGC 工作流最有价值的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"标准化提示词、审核清单和案例模板\"},{\"key\":\"B\",\"text\":\"每次从零开始\"},{\"key\":\"C\",\"text\":\"不记录过程\"},{\"key\":\"D\",\"text\":\"只保存失败结果\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 314,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-15",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "当 AI 输出与原始材料矛盾时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"以可靠原始材料为准并修正 AI 输出\"},{\"key\":\"B\",\"text\":\"一律相信 AI\"},{\"key\":\"C\",\"text\":\"删除原始材料\"},{\"key\":\"D\",\"text\":\"发布矛盾内容\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 315,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-16",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 做竞品分析时需补充？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"竞品范围、数据来源、维度和时间范围\"},{\"key\":\"B\",\"text\":\"随机猜测\"},{\"key\":\"C\",\"text\":\"不给竞品名\"},{\"key\":\"D\",\"text\":\"只要好听结论\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 316,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-17",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 输出同质化时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"提供风格样例、受众、渠道语气和差异化要求\"},{\"key\":\"B\",\"text\":\"继续模糊要求\"},{\"key\":\"C\",\"text\":\"不修改\"},{\"key\":\"D\",\"text\":\"全部一样\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 317,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-18",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "合规意识强的做法是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"对版权、肖像、敏感表达进行人工复核\"},{\"key\":\"B\",\"text\":\"AI 生成直接商用\"},{\"key\":\"C\",\"text\":\"无视授权\"},{\"key\":\"D\",\"text\":\"使用不明来源\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 318,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-19",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "人工复审清单不应缺少？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事实准确性、版权合规、平台规则、表达质量\"},{\"key\":\"B\",\"text\":\"只看字数\"},{\"key\":\"C\",\"text\":\"只看速度\"},{\"key\":\"D\",\"text\":\"只看押韵\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 319,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-20",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "对 AIGC 最合理的态度是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"利用效率优势，同时保留人工判断和责任\"},{\"key\":\"B\",\"text\":\"完全排斥\"},{\"key\":\"C\",\"text\":\"完全依赖\"},{\"key\":\"D\",\"text\":\"不学习\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 320,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-21",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成内容前，输入材料越清晰通常会？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"提高输出准确性和可用性\"},{\"key\":\"B\",\"text\":\"降低质量\"},{\"key\":\"C\",\"text\":\"必然违法\"},{\"key\":\"D\",\"text\":\"无影响\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 321,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-22",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 适合辅助做分集梗概，但必须？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"核对原片或可靠资料\"},{\"key\":\"B\",\"text\":\"不用核验\"},{\"key\":\"C\",\"text\":\"随意编造\"},{\"key\":\"D\",\"text\":\"删除人物\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 322,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-23",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成观点时，人工应重点判断？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"观点是否成立、是否有依据、是否符合业务目标\"},{\"key\":\"B\",\"text\":\"字数是否最多\"},{\"key\":\"C\",\"text\":\"是否绝对化\"},{\"key\":\"D\",\"text\":\"是否不需要证据\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 323,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-24",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成脚本初稿后，下一步应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"人工修改结构、事实、语气和传播钩子\"},{\"key\":\"B\",\"text\":\"直接发布\"},{\"key\":\"C\",\"text\":\"不看内容\"},{\"key\":\"D\",\"text\":\"删除来源\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 324,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-25",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 不能替代客户沟通的原因是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"客户目标、关系维护和责任判断需要人工处理\"},{\"key\":\"B\",\"text\":\"AI 不能打字\"},{\"key\":\"C\",\"text\":\"AI 不能总结\"},{\"key\":\"D\",\"text\":\"AI 只能画图\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 325,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-26",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "使用 AI 时保护隐私应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"避免输入敏感信息、未授权资料和客户机密\"},{\"key\":\"B\",\"text\":\"随意上传机密\"},{\"key\":\"C\",\"text\":\"公开客户信息\"},{\"key\":\"D\",\"text\":\"忽略权限\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 326,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-27",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成报告目录时，人工应检查？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否符合项目目标、逻辑顺序和交付要求\"},{\"key\":\"B\",\"text\":\"是否越长越好\"},{\"key\":\"C\",\"text\":\"是否全是术语\"},{\"key\":\"D\",\"text\":\"是否没有结论\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 327,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-28",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "用 AI 生成标题时，不能只追求？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"夸张吸睛而忽视事实和合规\"},{\"key\":\"B\",\"text\":\"准确\"},{\"key\":\"C\",\"text\":\"平台适配\"},{\"key\":\"D\",\"text\":\"用户理解\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 328,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-29",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 适合用于创意发散，是因为？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"可快速生成多个方向供人工筛选\"},{\"key\":\"B\",\"text\":\"能保证都可用\"},{\"key\":\"C\",\"text\":\"不需要人工\"},{\"key\":\"D\",\"text\":\"没有风险\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 329,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-30",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 输出的“引用”需要？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"核验来源是否真实可靠\"},{\"key\":\"B\",\"text\":\"直接相信\"},{\"key\":\"C\",\"text\":\"删除原文\"},{\"key\":\"D\",\"text\":\"不看链接\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 330,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-31",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 流程中设置审核节点是为了？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"控制质量、事实、合规和风格风险\"},{\"key\":\"B\",\"text\":\"降低效率到无法工作\"},{\"key\":\"C\",\"text\":\"替代创作\"},{\"key\":\"D\",\"text\":\"删除输出\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 331,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-32",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成分析框架后，人工要做？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"根据业务目标删减、补充和排序\"},{\"key\":\"B\",\"text\":\"完全照搬\"},{\"key\":\"C\",\"text\":\"不看材料\"},{\"key\":\"D\",\"text\":\"只改字体\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 332,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-33",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 在短周期培训中可用于？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"生成练习题、提供框架、辅助批改和复盘\"},{\"key\":\"B\",\"text\":\"替代新人学习\"},{\"key\":\"C\",\"text\":\"替代所有导师\"},{\"key\":\"D\",\"text\":\"直接判定录用\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 333,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-34",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "判断 AI 输出是否可用，最重要的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否准确、符合目标、可执行且风险可控\"},{\"key\":\"B\",\"text\":\"是否字多\"},{\"key\":\"C\",\"text\":\"是否语气夸张\"},{\"key\":\"D\",\"text\":\"是否没有来源\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 334,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-35",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 生成图像或视频参考时需注意？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"风格、版权、人物一致性和业务可用性\"},{\"key\":\"B\",\"text\":\"无需审核\"},{\"key\":\"C\",\"text\":\"只看好看\"},{\"key\":\"D\",\"text\":\"不看需求\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 335,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-36",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 辅助培训的关键不是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"让新人完全不思考\"},{\"key\":\"B\",\"text\":\"提供练习反馈\"},{\"key\":\"C\",\"text\":\"标准化训练\"},{\"key\":\"D\",\"text\":\"提升效率\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 336,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-37",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "使用 AI 做客户材料总结时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"保护客户信息，并核对摘要是否准确\"},{\"key\":\"B\",\"text\":\"公开客户资料\"},{\"key\":\"C\",\"text\":\"不核对\"},{\"key\":\"D\",\"text\":\"随意扩写\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 337,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-38",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 输出过于笼统时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"补充具体材料、目标、示例和输出格式\"},{\"key\":\"B\",\"text\":\"直接使用\"},{\"key\":\"C\",\"text\":\"删除任务\"},{\"key\":\"D\",\"text\":\"只要求更长\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 338,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-39",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AI 不能承担最终责任是因为？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"项目判断、合规风险和客户交付责任属于团队 / 人工\"},{\"key\":\"B\",\"text\":\"AI 不会输出文字\"},{\"key\":\"C\",\"text\":\"AI 不能分类\"},{\"key\":\"D\",\"text\":\"AI 没速度\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 339,
    "isEnabled": true
  },
  {
    "id": "bq-aigc_business-40",
    "dimensionCode": "aigc_business",
    "questionType": "single_choice",
    "questionText": "AIGC 业务能力的核心是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"知道怎么用、用在哪、风险在哪、如何人工把关\"},{\"key\":\"B\",\"text\":\"会让 AI 随机写\"},{\"key\":\"C\",\"text\":\"完全不用 AI\"},{\"key\":\"D\",\"text\":\"只追求快\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 340,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-01",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "分析作品是否适合改编短视频，合理维度是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只看演员颜值\"},{\"key\":\"B\",\"text\":\"题材吸引力、冲突密度、人物关系、节奏、可视化程度、目标受众\"},{\"key\":\"C\",\"text\":\"片名长度\"},{\"key\":\"D\",\"text\":\"是否有续集\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 401,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-02",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "面对大量项目材料，较好的分析顺序是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"直接下结论\"},{\"key\":\"B\",\"text\":\"先明确目标，再整理信息、提炼问题、形成判断和建议\"},{\"key\":\"C\",\"text\":\"只摘录原文\"},{\"key\":\"D\",\"text\":\"只看喜欢的部分\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 402,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-03",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "高质量分析结论应具备？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只有情绪\"},{\"key\":\"B\",\"text\":\"观点明确、依据充分、结构清晰，并给出可执行建议\"},{\"key\":\"C\",\"text\":\"文字复杂\"},{\"key\":\"D\",\"text\":\"重复题目\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 403,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-04",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "判断项目是否继续投入，最不合理的是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"分析受众和卖点\"},{\"key\":\"B\",\"text\":\"判断题材、冲突、节奏和传播潜力\"},{\"key\":\"C\",\"text\":\"只凭个人喜好\"},{\"key\":\"D\",\"text\":\"结合成本和风险\"}]",
    "correctAnswer": "C",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 404,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-05",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "哪种表达更体现分析能力？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"我觉得一般\"},{\"key\":\"B\",\"text\":\"该项目有受众基础，但前期冲突弱，建议先验证短视频传播点\"},{\"key\":\"C\",\"text\":\"不知道\"},{\"key\":\"D\",\"text\":\"还可以\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 405,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-06",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "目标导向的含义是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"先明确分析服务什么决策，再选择维度\"},{\"key\":\"B\",\"text\":\"先写很多字\"},{\"key\":\"C\",\"text\":\"只分析兴趣内容\"},{\"key\":\"D\",\"text\":\"不要结论\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 406,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-07",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "发现信息不足时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"编造信息\"},{\"key\":\"B\",\"text\":\"明确已有信息、指出缺失信息，并提出补充方向\"},{\"key\":\"C\",\"text\":\"放弃分析\"},{\"key\":\"D\",\"text\":\"假装完整\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 407,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-08",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "建议是否可执行主要看？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否说明下一步动作、对象、标准或产出\"},{\"key\":\"B\",\"text\":\"是否抽象\"},{\"key\":\"C\",\"text\":\"是否无责任人\"},{\"key\":\"D\",\"text\":\"是否只表态\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 408,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-09",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "多维度分析最需避免？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"观点与依据对应\"},{\"key\":\"B\",\"text\":\"维度互相支撑\"},{\"key\":\"C\",\"text\":\"罗列维度但没有结论\"},{\"key\":\"D\",\"text\":\"最后判断\"}]",
    "correctAnswer": "C",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 409,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-10",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "有效项目复盘表达是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"下次注意\"},{\"key\":\"B\",\"text\":\"问题在选题钩子弱、前 3 秒信息不足、目标用户不清，后续需验证标题和开头脚本\"},{\"key\":\"C\",\"text\":\"大家不努力\"},{\"key\":\"D\",\"text\":\"运气差\"}]",
    "correctAnswer": "B",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 410,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-11",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "工作中发现项目问题，第一步是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"确认问题事实、影响范围和紧急程度\"},{\"key\":\"B\",\"text\":\"责怪同事\"},{\"key\":\"C\",\"text\":\"隐瞒\"},{\"key\":\"D\",\"text\":\"不记录\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 411,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-12",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "问题汇报应包含？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"问题描述、影响范围、原因初判、已采取动作、建议方案和所需支持\"},{\"key\":\"B\",\"text\":\"只说出问题了\"},{\"key\":\"C\",\"text\":\"只表达情绪\"},{\"key\":\"D\",\"text\":\"只说客户难沟通\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 412,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-13",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "不应等到什么时候才汇报问题？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"问题刚出现且可能影响交付\"},{\"key\":\"B\",\"text\":\"已确认存在风险\"},{\"key\":\"C\",\"text\":\"需要资源支持\"},{\"key\":\"D\",\"text\":\"问题扩大且无法补救之后\"}]",
    "correctAnswer": "D",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 413,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-14",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "多久汇报一次问题更合理？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"根据项目节奏和紧急程度确定；关键风险即时汇报\"},{\"key\":\"B\",\"text\":\"永远不汇报\"},{\"key\":\"C\",\"text\":\"一年一次\"},{\"key\":\"D\",\"text\":\"项目结束后\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 414,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-15",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "与客户沟通问题的专业方式是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"客观说明问题、影响和方案，避免甩锅，并给出时间安排\"},{\"key\":\"B\",\"text\":\"都怪客户\"},{\"key\":\"C\",\"text\":\"不给方案\"},{\"key\":\"D\",\"text\":\"抱怨\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 415,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-16",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "客户需求不清晰或频繁变化时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"澄清目标、确认优先级、书面记录，并同步对时间和成本的影响\"},{\"key\":\"B\",\"text\":\"口头全答应\"},{\"key\":\"C\",\"text\":\"忽略需求\"},{\"key\":\"D\",\"text\":\"私下猜测\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 416,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-17",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "发现问题会影响交付时间，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"尽早同步风险，说明原因、影响、方案和新时间预估\"},{\"key\":\"B\",\"text\":\"截止再说\"},{\"key\":\"C\",\"text\":\"隐瞒进度\"},{\"key\":\"D\",\"text\":\"只说没办法\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 417,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-18",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "内部问题升级的合理时机是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"超出个人权限、影响关键节点、需要跨部门资源或存在客户风险\"},{\"key\":\"B\",\"text\":\"小事都升级\"},{\"key\":\"C\",\"text\":\"永不升级\"},{\"key\":\"D\",\"text\":\"结束后升级\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 418,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-19",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "问题处理后复盘关注？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"原因、过程、影响、预防措施和流程优化\"},{\"key\":\"B\",\"text\":\"谁倒霉\"},{\"key\":\"C\",\"text\":\"只说解决了\"},{\"key\":\"D\",\"text\":\"不记录\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 419,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-20",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "客户反馈与团队判断不一致时应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"理解客户目标和依据，再用数据、案例或方案对比沟通\"},{\"key\":\"B\",\"text\":\"直接否定客户\"},{\"key\":\"C\",\"text\":\"完全放弃团队判断\"},{\"key\":\"D\",\"text\":\"不回应\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 420,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-21",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "项目日报最应体现？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"今日进展、问题风险、明日计划和需要支持\"},{\"key\":\"B\",\"text\":\"只写忙\"},{\"key\":\"C\",\"text\":\"只写情绪\"},{\"key\":\"D\",\"text\":\"什么都不写\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 421,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-22",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "判断问题优先级应看？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"对交付时间、质量、客户关系和资源的影响\"},{\"key\":\"B\",\"text\":\"谁声音大\"},{\"key\":\"C\",\"text\":\"自己喜好\"},{\"key\":\"D\",\"text\":\"文件颜色\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 422,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-23",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "向上级汇报问题时，最好同时提供？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"问题事实和可选解决方案\"},{\"key\":\"B\",\"text\":\"只有抱怨\"},{\"key\":\"C\",\"text\":\"模糊感受\"},{\"key\":\"D\",\"text\":\"不完整截图\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 423,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-24",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "客户催进度时，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"说明当前进度、剩余工作、风险点和明确交付时间\"},{\"key\":\"B\",\"text\":\"不回复\"},{\"key\":\"C\",\"text\":\"随便承诺\"},{\"key\":\"D\",\"text\":\"责怪同事\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 424,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-25",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "如果自己无法判断问题严重性，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"及时找负责人确认，不要独自拖延\"},{\"key\":\"B\",\"text\":\"隐瞒\"},{\"key\":\"C\",\"text\":\"猜测\"},{\"key\":\"D\",\"text\":\"放弃\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 425,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-26",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "项目沟通中“书面确认”的作用是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"避免理解偏差，沉淀需求和责任边界\"},{\"key\":\"B\",\"text\":\"增加麻烦无意义\"},{\"key\":\"C\",\"text\":\"替代执行\"},{\"key\":\"D\",\"text\":\"删除沟通\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 426,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-27",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "面对客户临时新增需求，应先？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"判断需求影响范围，并确认是否调整排期或交付范围\"},{\"key\":\"B\",\"text\":\"立即全部答应\"},{\"key\":\"C\",\"text\":\"不告诉团队\"},{\"key\":\"D\",\"text\":\"直接拒绝不解释\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 427,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-28",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "项目中发现质量问题但时间紧，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"评估影响，提出优先级方案，与负责人确认取舍\"},{\"key\":\"B\",\"text\":\"假装没发现\"},{\"key\":\"C\",\"text\":\"全部重做但不告知\"},{\"key\":\"D\",\"text\":\"只抱怨\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 428,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-29",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "反馈问题时不应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"只指出问题，不提供影响判断或建议\"},{\"key\":\"B\",\"text\":\"说明问题事实\"},{\"key\":\"C\",\"text\":\"给出方案\"},{\"key\":\"D\",\"text\":\"同步进展\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 429,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-30",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "“风险前置”指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"在风险扩大前提前识别、同步和处理\"},{\"key\":\"B\",\"text\":\"问题结束后才说\"},{\"key\":\"C\",\"text\":\"永不记录\"},{\"key\":\"D\",\"text\":\"只靠运气\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 430,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-31",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "客户沟通中最应避免？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"情绪化、甩锅、承诺不确定事项\"},{\"key\":\"B\",\"text\":\"客观说明\"},{\"key\":\"C\",\"text\":\"给出方案\"},{\"key\":\"D\",\"text\":\"书面确认\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 431,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-32",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "复盘的目的不是？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"单纯追责和抱怨\"},{\"key\":\"B\",\"text\":\"找原因\"},{\"key\":\"C\",\"text\":\"优化流程\"},{\"key\":\"D\",\"text\":\"避免重复问题\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 432,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-33",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "新人进入项目初期应重点做到？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"明确任务目标、交付标准、时间节点和汇报对象\"},{\"key\":\"B\",\"text\":\"自己猜\"},{\"key\":\"C\",\"text\":\"不问问题\"},{\"key\":\"D\",\"text\":\"不做记录\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 433,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-34",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "任务接收后第一步应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"确认目标、范围、截止时间、输出格式和评价标准\"},{\"key\":\"B\",\"text\":\"直接开始随便做\"},{\"key\":\"C\",\"text\":\"不看要求\"},{\"key\":\"D\",\"text\":\"等别人提醒\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 434,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-35",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "如果交付标准不清晰，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"主动澄清并形成确认\"},{\"key\":\"B\",\"text\":\"自己猜\"},{\"key\":\"C\",\"text\":\"不做\"},{\"key\":\"D\",\"text\":\"随便交\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 435,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-36",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "项目中“闭环”指？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事情有反馈、有结果、有确认、有复盘\"},{\"key\":\"B\",\"text\":\"只提出问题\"},{\"key\":\"C\",\"text\":\"只开始不结束\"},{\"key\":\"D\",\"text\":\"不回复\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 436,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-37",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "好的项目反馈应该？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"事实清楚、影响明确、方案具体、时间可控\"},{\"key\":\"B\",\"text\":\"情绪激烈\"},{\"key\":\"C\",\"text\":\"模糊不清\"},{\"key\":\"D\",\"text\":\"没有结论\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 437,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-38",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "面对多项任务冲突，应？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"确认优先级和截止时间，必要时请求协调资源\"},{\"key\":\"B\",\"text\":\"全部拖延\"},{\"key\":\"C\",\"text\":\"随机选择\"},{\"key\":\"D\",\"text\":\"不沟通\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 438,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-39",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "项目交付前检查清单应包括？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"内容准确性、格式、客户要求、风险点和交付文件完整性\"},{\"key\":\"B\",\"text\":\"只看文件名\"},{\"key\":\"C\",\"text\":\"只看颜色\"},{\"key\":\"D\",\"text\":\"不检查\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 439,
    "isEnabled": true
  },
  {
    "id": "bq-analysis-40",
    "dimensionCode": "analysis",
    "questionType": "single_choice",
    "questionText": "7 天培训结束后判断新人能否进项目，关键看？",
    "optionsJson": "[{\"key\":\"A\",\"text\":\"是否能稳定产出基础分析、及时反馈问题并按要求修改\"},{\"key\":\"B\",\"text\":\"是否只完成选择题\"},{\"key\":\"C\",\"text\":\"是否说自己喜欢\"},{\"key\":\"D\",\"text\":\"是否不提问题\"}]",
    "correctAnswer": "A",
    "referenceAnswer": null,
    "score": 1,
    "rubric": "选择题：答对得 1 分，答错得 0 分。",
    "sortOrder": 440,
    "isEnabled": true
  },
  {
    "id": "bq-short-film-theory",
    "dimensionCode": "film_theory",
    "questionType": "short_answer",
    "questionText": "请简要说明“类型片”对观众理解作品有什么帮助，并举一个例子。",
    "optionsJson": null,
    "correctAnswer": null,
    "referenceAnswer": "类型片通过相对固定的题材、人物关系、叙事模式和情绪期待，帮助观众快速理解作品方向。例如悬疑片通常围绕谜题、线索、误导和真相揭示展开，观众会带着“寻找答案”的期待观看。",
    "score": 2,
    "rubric": "2分：概念准确，表达清晰，能结合具体例子或业务场景说明；1.5分：概念基本准确，有一定例子但分析不完整；1分：只理解部分概念，表达笼统；0.5分：有相关内容但概念混乱；0分：偏题或无有效回答。",
    "sortOrder": 501,
    "isEnabled": true
  },
  {
    "id": "bq-short-visual-language",
    "dimensionCode": "visual_language",
    "questionType": "short_answer",
    "questionText": "请从镜头角度、剪辑节奏或声音设计中任选一种，说明它如何影响观众情绪。",
    "optionsJson": null,
    "correctAnswer": null,
    "referenceAnswer": "剪辑节奏会影响观众情绪。快节奏剪辑通常制造紧张、急迫或兴奋感，适合动作、追逐、冲突升级；慢节奏剪辑则更容易形成沉静、压抑或思考感，适合人物心理展示。",
    "score": 2,
    "rubric": "2分：概念准确，表达清晰，能结合具体例子或业务场景说明；1.5分：概念基本准确，有一定例子但分析不完整；1分：只理解部分概念，表达笼统；0.5分：有相关内容但概念混乱；0分：偏题或无有效回答。",
    "sortOrder": 502,
    "isEnabled": true
  },
  {
    "id": "bq-short-script-narrative",
    "dimensionCode": "script_narrative",
    "questionType": "short_answer",
    "questionText": "拆解故事时，为什么要关注人物目标和人物阻碍？",
    "optionsJson": null,
    "correctAnswer": null,
    "referenceAnswer": "人物目标决定行动方向，人物阻碍制造冲突和情节推进。明确主角想要什么、为什么想要、遇到什么阻碍，才能判断故事主线是否清晰、冲突是否成立、剧情是否有推进力。",
    "score": 2,
    "rubric": "2分：概念准确，表达清晰，能结合具体例子或业务场景说明；1.5分：概念基本准确，有一定例子但分析不完整；1分：只理解部分概念，表达笼统；0.5分：有相关内容但概念混乱；0分：偏题或无有效回答。",
    "sortOrder": 503,
    "isEnabled": true
  },
  {
    "id": "bq-short-aigc-business",
    "dimensionCode": "aigc_business",
    "questionType": "short_answer",
    "questionText": "请说明影视内容生产中使用 AIGC 的一个优势和一个风险。",
    "optionsJson": null,
    "correctAnswer": null,
    "referenceAnswer": "优势是 AIGC 可以提升资料整理、初稿生成和创意发散效率；风险是 AI 输出可能存在事实错误、逻辑不严谨、版权或风格同质化问题，因此需要人工审核和合规判断。",
    "score": 2,
    "rubric": "2分：概念准确，表达清晰，能结合具体例子或业务场景说明；1.5分：概念基本准确，有一定例子但分析不完整；1分：只理解部分概念，表达笼统；0.5分：有相关内容但概念混乱；0分：偏题或无有效回答。",
    "sortOrder": 504,
    "isEnabled": true
  },
  {
    "id": "bq-short-analysis",
    "dimensionCode": "analysis",
    "questionType": "short_answer",
    "questionText": "如果你在项目执行过程中发现一个问题，可能会影响最终交付质量，你会怎么处理？",
    "optionsJson": null,
    "correctAnswer": null,
    "referenceAnswer": "先确认问题事实、影响范围、紧急程度和是否影响交付节点；如果能自行解决，尽快处理并同步结果；如果影响较大，应及时向负责人汇报，说明问题、影响、原因初判、已采取动作、建议方案和所需支持；处理完成后复盘，避免重复发生。",
    "score": 2,
    "rubric": "2分：概念准确，表达清晰，能结合具体例子或业务场景说明；1.5分：概念基本准确，有一定例子但分析不完整；1分：只理解部分概念，表达笼统；0.5分：有相关内容但概念混乱；0分：偏题或无有效回答。",
    "sortOrder": 505,
    "isEnabled": true
  }
];

const TASK_QUESTIONS: V11TaskQuestion[] = [
  {
    "id": "tq-1",
    "dimensionCode": "film_theory",
    "title": "影视基础理论方向：作品基础分析",
    "scenario": "任选一部熟悉的电影、剧集、短剧或微短剧，完成基础分析。",
    "extensionQuestion": "如果这部作品要推荐给目标用户，你会用哪一句话概括它的核心吸引力？为什么？",
    "scoreTotal": 20,
    "rubricJson": "[{\"name\":\"类型判断\",\"score\":4},{\"name\":\"主题与卖点\",\"score\":4},{\"name\":\"人物与冲突\",\"score\":4},{\"name\":\"类型规则理解\",\"score\":4},{\"name\":\"表达质量\",\"score\":4}]",
    "sortOrder": 1,
    "isEnabled": true,
    "mainTask": "1. 作品名称及基本类型\n2. 核心主题或情绪卖点\n3. 主角目标与主要冲突\n4. 类型规则或观众期待\n5. 最值得分析或学习的一点"
  },
  {
    "id": "tq-2",
    "dimensionCode": "visual_language",
    "title": "视听语言应用方向：片段视听分析",
    "scenario": "任选一段影视片段、短视频片段或广告片段进行视听语言分析。",
    "extensionQuestion": "如果预算或素材受限，你会优先保留哪两个视听设计来保证情绪表达？为什么？",
    "scoreTotal": 20,
    "rubricJson": "[{\"name\":\"片段描述准确\",\"score\":3},{\"name\":\"镜头/构图分析\",\"score\":4},{\"name\":\"色彩/光线/美术分析\",\"score\":3},{\"name\":\"声音/音乐分析\",\"score\":3},{\"name\":\"剪辑节奏分析\",\"score\":3},{\"name\":\"综合表达\",\"score\":4}]",
    "sortOrder": 2,
    "isEnabled": true,
    "mainTask": "1. 片段基本信息\n2. 镜头或构图特点\n3. 色彩、光线或美术风格\n4. 声音、音乐或环境音\n5. 剪辑节奏\n6. 视听元素如何服务情绪、人物或叙事"
  },
  {
    "id": "tq-3",
    "dimensionCode": "script_narrative",
    "title": "剧本叙事拆解方向：故事结构拆解",
    "scenario": "任选一部熟悉的影视作品或短剧，完成叙事拆解。",
    "extensionQuestion": "如果要把这个故事压缩成 1 分钟短视频，你会保留哪几个关键情节点？为什么？",
    "scoreTotal": 20,
    "rubricJson": "[{\"name\":\"故事主线概括\",\"score\":4},{\"name\":\"人物目标分析\",\"score\":4},{\"name\":\"核心冲突分析\",\"score\":4},{\"name\":\"情节点梳理\",\"score\":4},{\"name\":\"优缺点判断\",\"score\":4}]",
    "sortOrder": 3,
    "isEnabled": true,
    "mainTask": "1. 100 字以内概括故事主线\n2. 列出主要人物及人物目标\n3. 分析核心冲突\n4. 梳理至少 3 个关键情节点\n5. 判断故事优点和问题"
  },
  {
    "id": "tq-4",
    "dimensionCode": "aigc_business",
    "title": "AIGC 业务认知方向：AI 辅助内容生产流程",
    "scenario": "设计一个“AIGC 辅助影视内容生产 / 分析”的简单流程。",
    "extensionQuestion": "如果 AI 输出内容存在事实错误或版权风险，你会如何发现、修正并记录？",
    "scoreTotal": 20,
    "rubricJson": "[{\"name\":\"流程完整度\",\"score\":5},{\"name\":\"AI 使用合理性\",\"score\":4},{\"name\":\"人工把关意识\",\"score\":4},{\"name\":\"风险识别\",\"score\":4},{\"name\":\"风险控制措施\",\"score\":3}]",
    "sortOrder": 4,
    "isEnabled": true,
    "mainTask": "1. 可使用 AIGC 的环节\n2. AI 可输出什么\n3. 人工需要审核什么\n4. 可能风险\n5. 降低风险的方法"
  },
  {
    "id": "tq-5",
    "dimensionCode": "analysis",
    "title": "综合分析与项目反馈能力：项目问题反馈与客户沟通",
    "scenario": "你正在参与一个影视内容分析项目，原计划周五向客户提交分析报告。但周三下午，你发现：1）部分剧情信息来自二手资料，尚未核对原片；2）短视频传播点分析较弱，缺少明确标题和切片方向；3）客户临时新增“竞品对比”需求。如果不调整，报告可能按时提交但质量有风险；如果补充核验和竞品分析，可能延期半天到一天。",
    "extensionQuestion": "如果客户坚持不延期，你会如何调整交付范围和风险提示？",
    "scoreTotal": 20,
    "rubricJson": "[{\"name\":\"问题判断\",\"score\":4},{\"name\":\"内部沟通\",\"score\":4},{\"name\":\"客户沟通\",\"score\":4},{\"name\":\"解决方案\",\"score\":5},{\"name\":\"跟进复盘\",\"score\":3}]",
    "sortOrder": 5,
    "isEnabled": true,
    "mainTask": "1. 如何判断问题严重程度\n2. 先和谁沟通，沟通什么\n3. 如何向客户说明\n4. 提出哪些解决方案\n5. 后续如何跟进和复盘"
  }
];

const INTEREST_QUESTIONS: V11InterestQuestion[] = [
  {
    "id": "iq-1",
    "questionText": "请从五个方向中选择最感兴趣的两个方向，并结合经历说明原因。",
    "score": 5,
    "rubric": "5分：方向明确，理由具体，有经历或案例支撑；3-4分：方向较明确，但理由略笼统；1-2分：有选择，但理由不清晰；0分：无有效回答。",
    "sortOrder": 1,
    "isEnabled": true
  },
  {
    "id": "iq-2",
    "questionText": "你认为自己目前最擅长什么？最需要补足什么？请结合具体经历说明。",
    "score": 5,
    "rubric": "5分：优势和短板清晰，有案例和改进意识；3-4分：有基本认知，但不够具体；1-2分：表达模糊；0分：无有效回答。",
    "sortOrder": 2,
    "isEnabled": true
  },
  {
    "id": "iq-3",
    "questionText": "如果接下来需要在 7 天内完成集中培训，你会优先训练哪个方向？你计划如何快速提升？请写出每日行动安排和产出。",
    "score": 5,
    "rubric": "5分：方向明确，7 天计划具体，每天有任务、产出和复盘方式；4分：计划较具体，但个别天数产出不够明确；3分：有方向和大致计划，但缺少每日节奏；1-2分：有方向但计划不可执行；0分：无有效回答。",
    "sortOrder": 3,
    "isEnabled": true
  }
];

const DEFAULT_CONFIG: V11DataSourceConfig = {
  cloudFolderUrl: '',
  baseUrl: '',
  appToken: '',
  baseToken: '',
  tableIdMap: {},
  status: 'demo',
};

export class DemoAssessmentV11Repository implements AssessmentV11Repository {
  private dataSourceConfig: V11DataSourceConfig = { ...DEFAULT_CONFIG };
  private records: V11EvaluationRecord[] = [];
  private basicAnswers: V11BasicAnswer[] = [];
  private taskAnswers: V11TaskAnswer[] = [];
  private interestAnswers: V11InterestAnswer[] = [];

  async getDimensions(): Promise<V11Dimension[]> {
    return DIMENSIONS;
  }

  async getConfig(): Promise<V11AssessmentConfig> {
    return CONFIG;
  }

  async getBasicQuestions(): Promise<V11BasicQuestion[]> {
    return DOCUMENT_BASIC_QUESTIONS;
  }

  async getTaskQuestions(): Promise<V11TaskQuestion[]> {
    return DOCUMENT_TASK_QUESTIONS;
  }

  async getInterestQuestions(): Promise<V11InterestQuestion[]> {
    return DOCUMENT_INTEREST_QUESTIONS;
  }

  async getDataSourceConfig(): Promise<V11DataSourceConfig> {
    return this.dataSourceConfig;
  }

  async updateDataSourceConfig(update: Partial<V11DataSourceConfig>): Promise<V11DataSourceConfig> {
    this.dataSourceConfig = { ...this.dataSourceConfig, ...update, status: update.appToken ? 'configured' : 'demo' };
    return this.dataSourceConfig;
  }

  async getEvaluationRecords(): Promise<V11EvaluationRecord[]> {
    return this.records;
  }

  private trainingResources: V11TrainingResource[] = [];

  async getTrainingResources(): Promise<V11TrainingResource[]> {
    return this.trainingResources;
  }

  async createTrainingResource(resource: V11TrainingResource): Promise<V11TrainingResource> {
    this.trainingResources.push(resource);
    return resource;
  }

  async updateTrainingResource(id: string, update: Partial<V11TrainingResource>): Promise<V11TrainingResource> {
    const idx = this.trainingResources.findIndex((r: V11TrainingResource) => r.id === id);
    if (idx !== -1) {
      this.trainingResources[idx] = { ...this.trainingResources[idx], ...update };
      return this.trainingResources[idx];
    }
    throw new Error(`Training resource ${id} not found`);
  }

  async deleteTrainingResource(id: string): Promise<void> {
    this.trainingResources = this.trainingResources.filter((r: V11TrainingResource) => r.id !== id);
  }

  async createEvaluationRecord(record: V11EvaluationRecord): Promise<V11EvaluationRecord> {
    this.records.push(record);
    return record;
  }

  async saveBasicAnswers(answers: V11BasicAnswer[]): Promise<void> {
    this.basicAnswers.push(...answers);
  }

  async saveTaskAnswers(answers: V11TaskAnswer[]): Promise<void> {
    this.taskAnswers.push(...answers);
  }

  async saveInterestAnswers(answers: V11InterestAnswer[]): Promise<void> {
    this.interestAnswers.push(...answers);
  }

  async getEvaluationRecordById(id: string): Promise<V11EvaluationRecord | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }

  async getBasicAnswersByRecordId(recordId: string): Promise<V11BasicAnswer[]> {
    return this.basicAnswers.filter((a) => a.recordId === recordId);
  }

  async getTaskAnswersByRecordId(recordId: string): Promise<V11TaskAnswer[]> {
    return this.taskAnswers.filter((a) => a.recordId === recordId);
  }

  async getInterestAnswersByRecordId(recordId: string): Promise<V11InterestAnswer[]> {
    return this.interestAnswers.filter((a) => a.recordId === recordId);
  }

  async updateBasicAnswer(id: string, update: Partial<V11BasicAnswer>): Promise<void> {
    const idx = this.basicAnswers.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.basicAnswers[idx] = { ...this.basicAnswers[idx], ...update };
    }
  }

  async updateTaskAnswer(id: string, update: Partial<V11TaskAnswer>): Promise<void> {
    const idx = this.taskAnswers.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.taskAnswers[idx] = { ...this.taskAnswers[idx], ...update };
    }
  }

  async updateInterestAnswer(id: string, update: Partial<V11InterestAnswer>): Promise<void> {
    const idx = this.interestAnswers.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.interestAnswers[idx] = { ...this.interestAnswers[idx], ...update };
    }
  }

  async updateEvaluationRecord(id: string, update: Partial<V11EvaluationRecord>): Promise<V11EvaluationRecord> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.records[idx] = { ...this.records[idx], ...update, updatedAt: new Date().toISOString() };
      return this.records[idx];
    }
    throw new Error(`Evaluation record ${id} not found`);
  }

  private reports: V11AssessmentReport[] = [];

  async createReport(report: V11AssessmentReport): Promise<V11AssessmentReport> {
    const existing = this.reports.findIndex((r) => r.recordId === report.recordId);
    if (existing !== -1) {
      this.reports[existing] = report;
    } else {
      this.reports.push(report);
    }
    return report;
  }

  async updateReport(id: string, update: Partial<V11AssessmentReport>): Promise<V11AssessmentReport> {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.reports[idx] = { ...this.reports[idx], ...update, updatedAt: new Date().toISOString() };
      return this.reports[idx];
    }
    throw new Error(`Report ${id} not found`);
  }

  async getReportByRecordId(recordId: string): Promise<V11AssessmentReport | null> {
    return this.reports.find((r) => r.recordId === recordId) ?? null;
  }

  async getReports(): Promise<V11AssessmentReport[]> {
    return this.reports;
  }
}
