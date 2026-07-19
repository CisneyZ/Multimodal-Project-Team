import * as path from 'path';
import * as XLSX from 'xlsx';

export interface SchoolRule { name: string; tags: string[]; is985: boolean; is211: boolean; seniorCandidate: boolean; independentArt: boolean; referenceArt: boolean; filmMedia: boolean; strategy: string; aliases: string[]; }
let cache: SchoolRule[] | null = null;

/** The final source is the governed v0.4 workbook; this loader materializes every standard school and alias. */
export function schoolRules(): SchoolRule[] {
  if (cache) return cache;
  const workbook = XLSX.readFile(path.join(process.cwd(), 'docs/rules/MPT_高阶影视人才筛选规则库_v0.4.xlsx'));
  const rows = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets['02_院校标签库'], { header: 1, defval: '' }).slice(1);
  const aliases = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets['02A_院校别名库'], { header: 1, defval: '' }).slice(1);
  const aliasBySchool = new Map<string, string[]>();
  for (const row of aliases) { const [alias, standard] = row; if (alias && standard) aliasBySchool.set(standard, [...(aliasBySchool.get(standard) || []), alias]); }
  cache = rows.filter((row) => row[0]).map((row) => ({ name: row[0], tags: row[3].split('|').filter(Boolean), is985: row[4] === '是', is211: row[5] === '是', seniorCandidate: row[6] === '是', independentArt: row[7] === '是', referenceArt: row[8] === '是', filmMedia: row[9] === '是', strategy: row[13], aliases: [...new Set([...(row[14] ? row[14].split('|') : []), ...(aliasBySchool.get(row[0]) || [])])]}));
  return cache;
}

export function normalizeSchoolName(value?: string): SchoolRule | null { if (!value?.trim()) return null; const text = value.trim(); return schoolRules().find((rule) => rule.name === text || rule.aliases.includes(text)) || null; }
