# AI Handoff Package

This folder is the clean handoff surface for any follow-on AI or researcher.

Use this folder instead of guessing from the dashboard code or browsing the full repo.

Current handoff state after the latest source-ingestion pass:

* `42` rows remain operationally unresolved and still need research
* `3` rows still lack an exact direct course-description link
* `8` rows are already `Fully Verified` but could still be polished with a cleaner schedule/class-search source

## Files

### `OSU_MRKT496_AI_Research_Queue.csv`

Primary handoff spreadsheet.

This file now lists only the rows that are still operationally unresolved, meaning they are not currently `Fully Verified`.

Typical reasons include:

* no direct schedule or section-proof URL
* conservative evidence state like `calendar_only`, `catalog_only`, or `unclear`
* verification state is still `Calendar Only`, `Restricted Access`, `Cohort Timing`, or `Graduate Only`

This is the file to use first.

### `OSU_MRKT496_Missing_Direct_Course_Links.csv`

Narrower list containing only the `3` rows where an exact direct course-artifact link was not found.

This is the best file to use if the follow-on AI should focus only on better course-description URLs.

### `OSU_MRKT496_Verified_Link_Polish_Queue.csv`

Optional polish list for rows that are already `Fully Verified` but still do not have the cleanest possible public schedule/class-search source stored in the repo.

This file is not the main priority. Use it only after the unresolved queue is exhausted.

## How To Use With Another AI

Give the AI this instruction:

1. Work row by row.
2. Prioritize the `Primary Research Task` column.
3. Prefer official university sources only.
4. Try to replace search or generic catalog links with exact course detail pages.
5. Try to find official live schedule, archived schedule, or official class-search proof tied to the exact course code.
6. Do not infer course cadence from the institution calendar alone.
7. If access restrictions are explicit, preserve them instead of forcing a row to fully verified.

## Important Definitions

### `Calendar Only`

The course and institutional calendar are real, but exact recurring public section proof is still missing.

### `Cohort Timing`

The timing is tied to a program or cohort start window rather than a normal standalone course rotation.

### `Restricted Access`

The course may exist and even be scheduled, but access is limited by major, class standing, approval, or program enrollment.

### `Fully Verified`

The exact course code is tied to official public course or schedule evidence plus calendar support.

## Recommended Order

1. Start with `OSU_MRKT496_AI_Research_Queue.csv`
2. If you want to narrow the task, use `OSU_MRKT496_Missing_Direct_Course_Links.csv`
3. Use `OSU_MRKT496_Verified_Link_Polish_Queue.csv` only for optional cleanup after the unresolved queue is done

For the full website terminology guide, also read [V12_Dashboard_Glossary.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/OSU%20Transfer%20Equivalency%20Research/02_Operational_Guides/V12_Dashboard_Glossary.md).
