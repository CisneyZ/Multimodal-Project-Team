import type { MajorMatch, ProjectCode } from './talent-rules';
export interface MajorRule { project: ProjectCode; pattern: RegExp; match: MajorMatch; requiresEvidence?: RegExp; }
export const MAJOR_RULES: MajorRule[] = [
  { project: 'SFT_MULTIMODAL', pattern: /影视摄影与制作|广播电视编导|戏剧影视导演|动画|数字媒体艺术/, match: 'EXACT', requiresEvidence: /影视|动态影像|剪辑|构图|影调|视听/ }, { project: 'SFT_MULTIMODAL', pattern: /戏剧影视文学|广告学|UI设计|影视制片|美术|视觉艺术/, match: 'CONDITIONAL', requiresEvidence: /影视|动态影像|剪辑|构图|影调|视听/ },
  { project: 'CAPTION_DIFF', pattern: /运营|数字媒体|视觉传达|影视制片|表演|演员|播音|主持/, match: 'EXCLUDED' }, { project: 'CAPTION_DIFF', pattern: /戏剧影视导演|戏剧影视文学|广播电视编导/, match: 'EXACT' }, { project: 'CAPTION_DIFF', pattern: /^(摄影|影视后期制作)$/, match: 'CONDITIONAL', requiresEvidence: /文字|描述|剧本|编剧|编辑/ },
  { project: 'FILM_CREATIVE_INTENT', pattern: /运营|数字媒体|视觉传达|影视制片|表演|演员|主持|普通美术|普通设计/, match: 'EXCLUDED' }, { project: 'FILM_CREATIVE_INTENT', pattern: /戏剧影视文学|戏剧影视导演|电影学|电影制作|影视摄影与制作|广播电视编导|影视美术/, match: 'EXACT' }, { project: 'FILM_CREATIVE_INTENT', pattern: /摄影|美术/, match: 'CONDITIONAL', requiresEvidence: /影视|电影|剧集/ },
];
