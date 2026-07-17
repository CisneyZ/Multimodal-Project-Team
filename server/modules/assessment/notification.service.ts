import { Inject, Injectable, Logger } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { tongZhiJiLuBiao } from '@server/database/schema';
import type { NotificationType } from '@shared/api.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async create(
    type: NotificationType,
    targetRole: string,
    recordId: string | null,
    title: string,
    content: string,
  ): Promise<void> {
    await this.db.insert(tongZhiJiLuBiao).values({
      tongZhiLeiXing: type,
      jieShouJiaoSe: targetRole,
      guanLianJiLu: recordId,
      biaoTi: title,
      neiRong: content,
      zhuangTai: '未发送',
    });
    this.logger.log(`Notification created: ${type} -> ${targetRole}: ${title}`);
    // TODO: 接入飞书消息发送
    // await this.sendFeishuMessage(type, targetRole, title, content);
  }

  async list() {
    const rows = await this.db
      .select({
        id: tongZhiJiLuBiao.id,
        type: tongZhiJiLuBiao.tongZhiLeiXing,
        targetRole: tongZhiJiLuBiao.jieShouJiaoSe,
        recordId: tongZhiJiLuBiao.guanLianJiLu,
        title: tongZhiJiLuBiao.biaoTi,
        content: tongZhiJiLuBiao.neiRong,
        status: tongZhiJiLuBiao.zhuangTai,
        createdAt: tongZhiJiLuBiao.createdAt,
      })
      .from(tongZhiJiLuBiao)
      .orderBy(desc(tongZhiJiLuBiao.createdAt))
      .limit(200);

    return rows.map((r) => ({
      id: r.id,
      type: r.type as NotificationType,
      targetRole: r.targetRole,
      recordId: r.recordId,
      title: r.title,
      content: r.content,
      status: r.status,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));
  }

  async getByRecordId(recordId: string) {
    const { eq } = await import('drizzle-orm');
    const rows = await this.db
      .select({
        id: tongZhiJiLuBiao.id,
        type: tongZhiJiLuBiao.tongZhiLeiXing,
        targetRole: tongZhiJiLuBiao.jieShouJiaoSe,
        recordId: tongZhiJiLuBiao.guanLianJiLu,
        title: tongZhiJiLuBiao.biaoTi,
        content: tongZhiJiLuBiao.neiRong,
        status: tongZhiJiLuBiao.zhuangTai,
        createdAt: tongZhiJiLuBiao.createdAt,
      })
      .from(tongZhiJiLuBiao)
      .where(eq(tongZhiJiLuBiao.guanLianJiLu, recordId))
      .orderBy(desc(tongZhiJiLuBiao.createdAt));

    return rows.map((r) => ({
      id: r.id,
      type: r.type as NotificationType,
      targetRole: r.targetRole,
      recordId: r.recordId,
      title: r.title,
      content: r.content,
      status: r.status,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));
  }

  // TODO: 填入飞书 Webhook/机器人 Token 即可启用真实消息发送
  // async sendFeishuMessage(type: NotificationType, targetRole: string, title: string, content: string) {
  //   const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  //   if (!webhookUrl) { this.logger.log('Dry-run: no FEISHU_WEBHOOK_URL configured'); return; }
  //   await fetch(webhookUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ msg_type: 'text', content: { text: `${title}\n${content}` } }),
  //   });
  // }
}
