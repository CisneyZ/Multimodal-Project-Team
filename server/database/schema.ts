/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { bigint, boolean, doublePrecision, foreignKey, index, integer, pgEnum, pgTable, text, time, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const cePingZhuangTai = pgEnum("测评状态", ['进行中', '已完成', '待复核', '已复核']);

export const shiYongDangWei = pgEnum("适用挡位", ['入门补强', '基础执行', '岗位进阶', '骨干培养']);

export const ziYuanLeiXing = pgEnum("资源类型", ['课程', '实操任务', '案例包', '考核标准']);

export const nanDu = pgEnum("难度", ['1', '2', '3', '4', '5']);

export const tiXing = pgEnum("题型", ['单选', '判断', '主观']);

export const onboardingRuleAnswers = pgTable("onboarding_rule_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  progressId: uuid("progress_id").notNull(),
  questionId: uuid("question_id").notNull(),
  answer: text("answer").notNull(),
  score: integer("score").notNull().default(0),
  isCorrect: boolean("is_correct").notNull().default(false),
  explanation: text("explanation"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const onboardingProgress = pgTable("onboarding_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  newcomerName: varchar("newcomer_name", { length: 100 }).notNull(),
  targetRole: varchar("target_role", { length: 100 }).notNull(),
  assessmentRecordId: uuid("assessment_record_id"),
  backgroundCompletedAt: customTimestamptz("background_completed_at", { precision: 3 }),
  rulesCompletedAt: customTimestamptz("rules_completed_at", { precision: 3 }),
  ruleTestCompletedAt: customTimestamptz("rule_test_completed_at", { precision: 3 }),
  ruleTestScore: integer("rule_test_score"),
  status: varchar("status", { length: 50 }).notNull().default('background_pending'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const onboardingRuleQuestions = pgTable("onboarding_rule_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(),
  options: text("options"),
  correctAnswer: varchar("correct_answer", { length: 200 }).notNull(),
  explanation: text("explanation"),
  score: integer("score").notNull().default(10),
  sortOrder: integer("sort_order").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const onboardingMaterials = pgTable("onboarding_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  materialType: varchar("material_type", { length: 50 }).notNull(),
  feishuUrl: text("feishu_url").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const tongZhiJiLuBiao = pgTable("通知记录表", {
  id: uuid("id").primaryKey().defaultRandom(),
  tongZhiLeiXing: text("通知类型").notNull(),
  jieShouJiaoSe: text("接收角色").notNull(),
  guanLianJiLu: uuid("关联记录"),
  biaoTi: text("标题").notNull(),
  neiRong: text("内容").notNull(),
  zhuangTai: text("状态").notNull().default('未发送'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
});

export const daTiMingXiBiao = pgTable("答题明细表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  cePingJiLu: uuid("测评记录").notNull(),
  tiMu: uuid("题目").notNull(),
  xinRenDaAn: text("新人答案").notNull(),
  ziDongDeFen: bigint("自动得分", { mode: 'number' }),
  pingFenLiYou: text("评分理由"),
  zhiXinDu: doublePrecision("置信度"),
  shiFouXuYaoFuHe: boolean("是否需要复核"),
  suoShuWeiDuKuaiZhao: text("所属维度快照"),
  manFenKuaiZhao: bigint("满分快照", { mode: 'number' }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868248073500873").on(table.id),
  foreignKey({
    columns: [table.cePingJiLu],
    foreignColumns: [cePingJiLuBiao.id],
    name: "fk_relation_1868248073508058",
  }),
  foreignKey({
    columns: [table.tiMu],
    foreignColumns: [tiKuBiao.id],
    name: "fk_relation_1868248073508074",
  }),
]);

export const cePingJiLuBiao = pgTable("测评记录表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  xinRenXingMing: text("新人姓名").notNull(),
  muBiaoGangWei: text("目标岗位").notNull(),
  cePingZhuangTai: cePingZhuangTai("测评状态").notNull(),
  yingShiJiChuLiLunDeFen: bigint("影视基础理论得分", { mode: 'number' }),
  shiTingYuYanYingYongDeFen: bigint("视听语言应用得分", { mode: 'number' }),
  juBenXuShiChaiJieDeFen: bigint("剧本叙事拆解得分", { mode: 'number' }),
  aIGCYeWuRenZhiDeFen: bigint("AIGC业务认知得分", { mode: 'number' }),
  zongHeFenXiNengLiDeFen: bigint("综合分析能力得分", { mode: 'number' }),
  zongFen: bigint("总分", { mode: 'number' }),
  tuiJianDangWei: shiYongDangWei("推荐档位"),
  baoRuoWeiDu: nanDu("薄弱维度"),
  zhiNengTiZongJie: text("智能体总结"),
  tiJiaoShiJian: time("提交时间"),
  fuHeRen: userProfile("复核人"),
  fuHeYiJian: text("复核意见"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868291069182035").on(table.id),
]);

export const peiXunZiYuanBiao = pgTable("培训资源表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  suoShuWeiDu: uuid("所属维度").notNull(),
  ziYuanMingCheng: text("资源名称").notNull(),
  ziYuanLeiXing: ziYuanLeiXing("资源类型").notNull(),
  shiYongDangWei: shiYongDangWei("适用档位").notNull(),
  xueXiZhouQi: bigint("学习周期", { mode: 'number' }).notNull(),
  daBiaoBiaoZhun: text("达标标准"),
  ziYuanLianJie: fileAttachment("资源链接"),
  shiFouQiYong: boolean("是否启用").notNull().default(true),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868299061282851").on(table.id),
  foreignKey({
    columns: [table.suoShuWeiDu],
    foreignColumns: [nengLiWeiDuBiao.id],
    name: "fk_relation_1868299061287027",
  }),
]);

export const pingFenGuiZeBiao = pgTable("评分规则表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  suoShuWeiDu: uuid("所属维度").notNull(),
  tiXing: tiXing("题型").notNull(),
  pingFenBiaoZhun: text("评分标准").notNull(),
  gaoFenYangLi: text("高分样例"),
  zhongFenYangLi: text("中分样例"),
  diFenYangLi: text("低分样例"),
  renGongFuHeYuZhi: doublePrecision("人工复核阈值").notNull().default(0.65),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868297657163907").on(table.id),
  foreignKey({
    columns: [table.suoShuWeiDu],
    foreignColumns: [nengLiWeiDuBiao.id],
    name: "fk_relation_1868297657167875",
  }),
]);

export const tiKuBiao = pgTable("题库表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  tiMuBianHao: integer("题目编号").notNull(),
  suoShuWeiDu: uuid("所属维度").notNull(),
  tiXing: tiXing("题型").notNull(),
  tiGan: text("题干").notNull(),
  xuanXiangA: text("选项A"),
  xuanXiangB: text("选项B"),
  xuanXiangC: text("选项C"),
  xuanXiangD: text("选项D"),
  biaoZhunDaAn: text("标准答案"),
  pingFenGuanJianCi: text("评分关键词"),
  fenZhi: bigint("分值", { mode: 'number' }).notNull(),
  nanDu: nanDu("难度").notNull(),
  shiFouQiYong: boolean("是否启用").notNull().default(true),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868248260167003").on(table.id),
  foreignKey({
    columns: [table.suoShuWeiDu],
    foreignColumns: [nengLiWeiDuBiao.id],
    name: "fk_relation_1868248260171963",
  }),
]);

export const nengLiWeiDuBiao = pgTable("能力维度表", {
  id: uuid("id").primaryKey().unique().defaultRandom(),
  weiDuBianMa: text("维度编码").notNull(),
  weiDuMingCheng: text("维度名称").notNull(),
  weiDuShuoMing: text("维度说明"),
  diFenJianYi: text("低分建议"),
  zhongFenJianYi: text("中分建议"),
  gaoFenJianYi: text("高分建议"),
  paiXu: bigint("排序", { mode: 'number' }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`now()`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  uniqueIndex("unq_1868248259948634").on(table.id),
]);

// table aliases
export const cePingJiLuBiaoTable = cePingJiLuBiao;
export const daTiMingXiBiaoTable = daTiMingXiBiao;
export const nengLiWeiDuBiaoTable = nengLiWeiDuBiao;
export const onboardingMaterialsTable = onboardingMaterials;
export const onboardingProgressTable = onboardingProgress;
export const onboardingRuleAnswersTable = onboardingRuleAnswers;
export const onboardingRuleQuestionsTable = onboardingRuleQuestions;
export const peiXunZiYuanBiaoTable = peiXunZiYuanBiao;
export const pingFenGuiZeBiaoTable = pingFenGuiZeBiao;
export const tiKuBiaoTable = tiKuBiao;
export const tongZhiJiLuBiaoTable = tongZhiJiLuBiao;
