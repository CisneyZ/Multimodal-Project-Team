# MPT Platform v0.1 数据模型

## 核心关系

```text
User
Candidate ─ CandidateProfile
Candidate ─ ResumeAsset
Candidate ─ ScreeningRun ─ ScreeningResult ─ ScreeningEvidence
Project ─ ProjectRule
Candidate ─ AssessmentReport
User ─ OperationLog
```

## Candidate

```text
id
name
phone
email
city
current_role
resume_source
recruitment_status
analysis_status
notes
is_deleted
created_by
created_at
updated_at
```

## CandidateProfile

```text
candidate_id
education
school
major
work_years
editing_experience
writing_experience
directing_experience
photography_experience
postproduction_experience
portfolio
project_experience
annotation_experience
quality_review_experience
content_review_experience
ai_evaluation_experience
writing_ability
visual_aesthetic
composition_ability
lighting_tone_ability
narrative_ability
style_judgement
full_time_status
available_months
trial_task_willingness
availability_date
missing_fields
field_sources
manually_corrected
updated_at
```

## ResumeAsset

```text
id
candidate_id
original_name
mime_type
size_bytes
storage_path
extracted_text
parse_status
parse_error
created_at
```

## Project

```text
id
code
name
description
status
requirements
created_at
updated_at
```

内置 code：

```text
RL_NARRATIVE_EDITING
CAPTION_DIFF
```

## ProjectRule

```text
id
project_id
version
dimension_code
dimension_name
max_score
rule_type
config
priority
is_active
created_at
```

## ScreeningRun

```text
id
candidate_id
started_by
analysis_mode
rule_version
status
started_at
completed_at
error_message
```

## ScreeningResult

```text
id
screening_run_id
project_id
total_score
base_level
final_level
hard_status
blocking_reasons
unmet_items
missing_items
created_at
```

## ScreeningEvidence

```text
id
screening_result_id
dimension_code
score
max_score
evidence_text
reason
source_type
source_ref
```

## AssessmentReport

```text
id
candidate_id
screening_run_id
recommended_project_id
recommendation_level
summary
report_content
risk_items
missing_information
follow_up_questions
next_action
analysis_mode
rule_version
created_at
updated_at
```

## 删除策略

- Candidate 默认软删除；
- 历史筛选和报告不随意物理删除；
- Project 停用，不建议删除；
- 文件按合规策略清理。
