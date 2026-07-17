import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Bot } from 'lucide-react';
import type { V11SubmitResponse } from '@shared/api.interface';

interface V11SubmitStatusProps {
  result: V11SubmitResponse;
  onReset: () => void;
}

const V11SubmitStatus: React.FC<V11SubmitStatusProps> = ({ result, onReset }) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-400/10 shadow-[0_0_44px_rgba(16,185,129,0.22)]">
          <CheckCircle className="h-12 w-12 text-emerald-300" />
        </div>

        <h2 className="text-center text-xl font-bold text-white">
          已提交，等待评估人评分与报告生成
        </h2>

        <div className="muchen-border-flow muchen-border-flow-active w-full max-w-md rounded-2xl p-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/52">基础认知客观题得分</span>
              <span className="text-3xl font-bold tabular-nums text-[#8fdcff]">
                {result.basicAutoScore} <span className="text-base font-normal text-white/44">/ 15</span>
              </span>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/52">待人工评分项</span>
              <span className="text-sm font-medium text-white">
                {result.basicPendingReview} 道简答题
              </span>
            </div>

            <div className="border-t border-white/10" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/52">任务型测评与兴趣问卷</span>
              <span className="text-sm font-medium text-white">待评估人评分</span>
            </div>
          </div>
        </div>

        <p className="max-w-sm text-center text-sm leading-6 text-white/52">
          评估人将在后台完成简答题、任务题和兴趣问卷的评分，报告生成后可在后台查看。
        </p>

        <motion.div
          className="flex w-full max-w-sm items-start gap-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7b4dff]/16">
            <Bot className="h-3.5 w-3.5 text-[#8fdcff]" />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5 text-sm leading-relaxed text-white/78">
            好的，恭喜你完成测评，请稍等，跟着我的脚步来了解一下项目背景和公司细则吧。
          </div>
        </motion.div>

        <button
          type="button"
          onClick={onReset}
          className="muchen-secondary-btn rounded-lg px-5 py-2 text-sm"
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default V11SubmitStatus;
