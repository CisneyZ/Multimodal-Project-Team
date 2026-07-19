import { analyzeTalentProfile, getMajorMatch, normalizeSchool, type ProjectCode, type StructuredTalentProfile } from './talent-rules';
import { schoolRules } from './school-rules.data';

const seniorSft: StructuredTalentProfile = {
  name: '测试候选人', education: '本科', school: '北京电影学院', major: '影视摄影与制作',
  fullTimeStatus: true, availableMonths: 6, filmAnalysisEvidence: ['长期拉片并分析构图、影调和叙事'],
  editingEvidence: ['独立完成剧情短片剪辑'], visualLanguageEvidence: ['能分析镜头语言'],
  works: [{ name: '商业短片', type: '叙事商业作品', role: '剪辑师', responsibilities: '独立完成剪辑与调色', result: '已上线' }],
  sources: {}, manuallyCorrected: false,
};

describe('MPT v0.4 deterministic talent rules', () => {
  it('gives a senior SFT candidate a deterministic high match', () => {
    const first = analyzeTalentProfile(seniorSft);
    const second = analyzeTalentProfile(seniorSft);
    expect(first.talentLevel).toBe('SENIOR');
    expect(first.projectMatches.find((x) => x.projectCode === 'SFT_MULTIMODAL')?.finalMatchLevel).toBe('HIGH_MATCH');
    expect(second.talentLevel).toBe(first.talentLevel);
    expect(second.projectMatches).toEqual(first.projectMatches);
    expect(second.report.generatedAt).toBeTruthy();
  });

  it('keeps digital media outcomes independent by project', () => {
    const result = analyzeTalentProfile({ ...seniorSft, major: '数字媒体艺术' });
    expect(result.projectMatches.find((x) => x.projectCode === 'SFT_MULTIMODAL')?.majorMatch).toBe('EXACT');
    expect(result.projectMatches.find((x) => x.projectCode === 'CAPTION_DIFF')?.majorMatch).toBe('EXCLUDED');
    expect(result.projectMatches.find((x) => x.projectCode === 'FILM_CREATIVE_INTENT')?.majorMatch).toBe('EXCLUDED');
  });

  it('never converts missing full-time information into failure', () => {
    const result = analyzeTalentProfile({ ...seniorSft, fullTimeStatus: null });
    const sft = result.projectMatches.find((x) => x.projectCode === 'SFT_MULTIMODAL')!;
    expect(sft.requirements.find((x) => x.code === 'FULL_TIME')?.status).toBe('MISSING');
    expect(sft.finalMatchLevel).toBe('INSUFFICIENT_INFORMATION');
  });

  it('rejects a 985 candidate whose major is not a target major', () => {
    const result = analyzeTalentProfile({ ...seniorSft, school: '北京大学', major: '计算机科学', works: [] });
    expect(result.talentLevel).toBe('REJECT');
    expect(result.rankedProjectMatches).toEqual([]);
  });

  it.each([
    ['Caption dual core path', { major: '广播电视编导', annotationEvidence: ['4个月视频文字描述标注'], qualityReviewEvidence: ['视频质检'], writingEvidence: ['结构化描述'], works: [{ name: '短剧', type: '网剧', role: '编导', responsibilities: '脚本与分镜' }] }, 'CAPTION_DIFF', 'HIGH_MATCH'],
    ['Caption digital-media exclusion', { major: '数字媒体艺术', annotationEvidence: ['4个月视频文字描述标注'], writingEvidence: ['结构化描述'] }, 'CAPTION_DIFF', 'NOT_QUALIFIED'],
    ['photography without writing', { major: '摄影', writingEvidence: [] }, 'CAPTION_DIFF', 'INSUFFICIENT_INFORMATION'],
    ['creative-intent senior', { major: '戏剧影视文学', creativeExperience: ['网剧《夜航》编剧，负责分集剧本与人物弧光'], writingEvidence: ['完成《夜航》创作阐述和镜头段落分析'], filmAnalysisEvidence: ['完成网剧《夜航》拉片，分析叙事视角、镜头调度与节奏原因'], works: [{ name: '夜航', type: '商业网剧', role: '编剧', responsibilities: '负责分集剧本、人物弧光和创作阐述', result: '已上线可验证' }] }, 'FILM_CREATIVE_INTENT', 'HIGH_MATCH'],
    ['short-video operations exclusion', { major: '运营', school: '北京电影学院', creativeExperience: ['短视频运营'] }, 'FILM_CREATIVE_INTENT', 'NOT_QUALIFIED'],
    ['ordinary university broadcast boundary', { school: '普通综合大学', major: '广播电视编导' }, 'FILM_CREATIVE_INTENT', 'INSUFFICIENT_INFORMATION'],
    ['senior school unclear commercial role', { works: [{ name: '商业片', type: '商业作品' }] }, 'SFT_MULTIMODAL', 'INSUFFICIENT_INFORMATION'],
  ])('%s follows the matrix outcome', (_name, overrides, project, expected) => {
    const r = analyzeTalentProfile({ ...seniorSft, ...overrides });
    expect(r.projectMatches.find((x) => x.projectCode === project)?.finalMatchLevel).toBe(expected);
  });

  it('keeps every score within its dimension and project bounds', () => {
    for (const match of analyzeTalentProfile(seniorSft).projectMatches) {
      expect(match.totalScore).toBeGreaterThanOrEqual(0); expect(match.totalScore).toBeLessThanOrEqual(100);
      for (const item of match.evidence) { expect(item.score).toBeGreaterThanOrEqual(0); expect(item.score).toBeLessThanOrEqual(item.maxScore); }
    }
  });

  it.each([
    ['AUTO_WITH_EXACT_MAJOR', { school: '云南艺术学院', major: '影视摄影与制作', works: [] }, 'INTERMEDIATE'],
    ['MANUAL_REVIEW_WITH_EXACT_MAJOR', { school: '中央美术学院', major: '动画', works: [] }, 'MANUAL_REVIEW'],
    ['NO_AUTO', { school: '上海音乐学院', major: '影视摄影与制作' }, 'MANUAL_REVIEW'],
    ['non senior school cannot become senior by works', { school: '上海师范大学', major: '影视摄影与制作' }, 'MANUAL_REVIEW'],
  ])('school strategy %s is applied', (_name, override, expected) => expect(analyzeTalentProfile({ ...seniorSft, ...override }).talentLevel).toBe(expected));

  it('normalizes legacy school and academy aliases from the workbook', () => {
    expect(normalizeSchool('上海电影学院')).toBe('上海大学');
    expect(normalizeSchool('北京师范大学艺术与传媒学院')).toBe('北京师范大学');
  });

  it('loads every workbook school and alias row', () => {
    expect(schoolRules().length).toBe(168);
    expect(schoolRules().flatMap((x) => x.aliases).length).toBeGreaterThanOrEqual(40);
  });

  it.each([
    ['SFT digital media with evidence', 'SFT_MULTIMODAL', '数字媒体艺术', { editingEvidence: ['独立完成动态影像剪辑'] }, 'EXACT'],
    ['SFT digital media without evidence', 'SFT_MULTIMODAL', '数字媒体艺术', { editingEvidence: [], filmAnalysisEvidence: [], visualLanguageEvidence: [], creativeExperience: [] }, 'CONDITIONAL'],
    ['SFT animation with evidence', 'SFT_MULTIMODAL', '动画', { visualLanguageEvidence: ['构图影调和视听语言分析'] }, 'EXACT'],
    ['SFT UI without evidence', 'SFT_MULTIMODAL', 'UI设计', {}, 'CONDITIONAL'],
    ['Caption photography without writing', 'CAPTION_DIFF', '摄影', { writingEvidence: [] }, 'CONDITIONAL'],
    ['Caption photography with writing', 'CAPTION_DIFF', '摄影', { writingEvidence: ['结构化文字描述'] }, 'CONDITIONAL'],
    ['Caption excludes digital media', 'CAPTION_DIFF', '数字媒体艺术', { editingEvidence: ['剪辑'] }, 'EXCLUDED'],
    ['creative intent excludes digital media', 'FILM_CREATIVE_INTENT', '数字媒体艺术', { creativeExperience: ['网剧剪辑'] }, 'EXCLUDED'],
  ])('%s enforces required evidence', (_name, project, major, override, expected) => expect(getMajorMatch(project as ProjectCode, major, { ...seniorSft, ...override })).toBe(expected));
});
