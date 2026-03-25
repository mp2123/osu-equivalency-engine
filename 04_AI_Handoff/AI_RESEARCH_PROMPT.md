# Ready-to-Paste AI Research Prompt

Use this prompt with the handoff CSV files in this folder.

Current package state:

* `OSU_MRKT496_AI_Research_Queue.csv`: `41` unresolved rows
* `OSU_MRKT496_Missing_Direct_Course_Links.csv`: `3` rows
* `OSU_MRKT496_Verified_Link_Polish_Queue.csv`: `4` optional polish rows
* full dataset verification mix: `19` `Fully Verified`, `25` `Calendar Only`, `11` `Restricted Access`, `4` `Cohort Timing`, `1` `Graduate Only`

## Prompt

You are helping improve an Oregon State University MRKT 496 transfer-equivalency research repo.

I am giving you a CSV where each row is a university course that still has one or more sourcing gaps.

Your job:

1. Work row by row.
2. Use only official university or provider sources.
3. Prefer exact course-detail, course-description, bulletin, catalog, registrar, and official class-search pages.
4. Try to improve the row in this order:
   * find an exact direct official course-description page for the exact course code
   * find official live schedule, archived schedule, or official class-search proof tied to the exact course code
   * confirm whether the published access restrictions are real and should stay
   * do not infer recurring course cadence from the institution calendar alone
5. If the row is marked `Restricted Access`, preserve that unless official evidence clearly disproves it.
6. If the row is marked `Cohort Timing`, do not convert it into a normal semester rotation without explicit proof.
7. If the row is marked `Graduate Only`, do not treat it as a clean undergraduate analogue unless official evidence supports that claim.
8. If the public class-search or schedule tool requires login, portal access, or an interactive flow that does not expose a stable course-specific URL, say that clearly and treat the row as not further improvable from public sources.

Priority order:

1. Resolve the `3` missing direct course-description links first.
2. Then target the highest-value `Calendar Only` rows that could still gain official schedule proof.
3. Then improve `Restricted Access` rows only if you can confirm or narrow the actual enrollment restriction from an official source.
4. Leave `Cohort Timing` and `Graduate Only` rows conservative unless the source clearly supports a stronger claim.

Return results in a structured table with these columns:

* institution
* course_code
* better_course_source_url
* better_schedule_source_url
* better_calendar_source_url
* evidence_found_summary
* can_promote_to_course_and_calendar (`yes` or `no`)
* should_verification_status_change (`yes` or `no`)
* recommended_verification_status
* access_restrictions_found
* notes

If you cannot improve a row from public sources, say that explicitly instead of guessing.

## Which File To Use

### `OSU_MRKT496_AI_Research_Queue.csv`

Use this first. It contains the rows that are still not fully resolved.

### `OSU_MRKT496_Missing_Direct_Course_Links.csv`

Use this if you want the narrower task of improving exact direct course-description links only.

### `OSU_MRKT496_Verified_Link_Polish_Queue.csv`

Use this only after the unresolved queue is done. These rows are already operational, and the task is just to improve the stored schedule/class-search source quality.
