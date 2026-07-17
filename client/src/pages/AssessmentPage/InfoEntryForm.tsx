import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POSITION_OPTIONS } from "./quiz-data";
import {
  FileText,
  Clock,
  Bot,
  UserCheck,
  BarChart3,
  Eye,
  Wand2,
  Layers,
  Cpu,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

interface InfoEntryFormProps {
  onStart: (name: string, position: string) => void;
}

const INFO_TAGS = [
  { icon: FileText, label: "22 道题" },
  { icon: Clock, label: "15-20 分钟" },
  { icon: Bot, label: "AI 预评" },
  { icon: UserCheck, label: "人工复核" },
  { icon: BarChart3, label: "能力画像" },
];

const CAPABILITY_MODEL = [
  {
    icon: Eye,
    name: "影视基础理论",
    desc: "镜头语言、叙事结构、色彩体系等核心知识储备",
  },
  {
    icon: Wand2,
    name: "视听语言应用",
    desc: "多模态内容理解与视觉表达方案的设计能力",
  },
  {
    icon: Layers,
    name: "剧本叙事拆解",
    desc: "Prompt 拆解、场景拆解、故事逻辑的结构化分析",
  },
  {
    icon: Cpu,
    name: "AIGC 业务认知",
    desc: "AI 工具边界判断、生成内容质量评估与风险识别",
  },
  {
    icon: BrainCircuit,
    name: "综合分析与项目反馈能力",
    desc: "跨维度信息整合、项目判断与决策建议能力",
  },
];

const InfoEntryForm: React.FC<InfoEntryFormProps> = ({ onStart }) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [errors, setErrors] = useState<{ name?: string; position?: string }>(
    {},
  );

  const handleSubmit = () => {
    const newErrors: { name?: string; position?: string } = {};
    if (!name.trim()) newErrors.name = "请输入新人姓名";
    if (!position) newErrors.position = "请选择目标岗位";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onStart(name.trim(), position);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          AI 内容编导能力评估控制台
        </h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          面向大模型公司内容生产岗位，覆盖影视基础、视听表达、叙事拆解、AIGC
          认知、综合分析五大能力维度
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {INFO_TAGS.map((tag) => (
          <span
            key={tag.label}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
            <tag.icon className="h-3 w-3" />
            {tag.label}
          </span>
        ))}
      </div>

      <div className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          测评信息
        </h2>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            测评人姓名
          </label>
          <Input
            placeholder="请输入你的姓名"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            目标岗位
          </label>
          <select
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              if (errors.position)
                setErrors((prev) => ({ ...prev, position: undefined }));
            }}
            className={`flex h-9 w-full rounded-sm border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
              errors.position ? "border-destructive" : "border-border"
            }`}
          >
            <option value="">请选择目标岗位</option>
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.position && (
            <p className="mt-1 text-xs text-destructive">{errors.position}</p>
          )}
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          开始测评
        </Button>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          能力评估模型
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITY_MODEL.map((cap) => (
            <div
              key={cap.name}
              className="rounded-sm border border-border bg-background p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <cap.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {cap.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoEntryForm;
