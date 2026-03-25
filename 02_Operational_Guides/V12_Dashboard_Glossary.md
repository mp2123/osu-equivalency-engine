# V12 Dashboard Glossary and Field Guide

This file explains the meaning behind the website's labels, badges, cards, scores, and exports.

It is the plain-English reference for the V12 interactive dashboard in `/Interactive_Dashboard/`.

## 1. Core Idea

Each row in the dashboard is one candidate course being compared against Oregon State University's `MRKT 496: Marketing Research Practicum`.

The website is not just asking whether a course title looks similar. It is evaluating:

* whether the course structure looks like a real marketing research practicum
* whether the course appears accessible enough to be actionable
* whether public evidence exists for course timing and section rotation
* whether the course is a realistic petition candidate for OSU transfer review

## 2. Top Analytics Cards

### Candidate Distribution by Tier

Shows how many rows are classified as:

* `Tier 1`: highest-conviction matches
* `Tier 2`: strong contenders with some caveats
* `Tier 3`: backup strategies or weaker fits

### Accreditation Matrix

Shows the accreditation mix across the 60 schools. This matters because AACSB and ACBSP context affects how strong the institutional comparison looks in a petition.

### System Telemetry

Shows the live dashboard totals:

* `Total Validated Equivalencies`: total rows in the dataset
* `Online/Hybrid Potential`: rows whose delivery mode indicates realistic remote or hybrid access
* `AACSB Tier-1 Elites`: count of the strongest top-tier candidates

### Verification Matrix

Shows the live evidence state of the dataset:

* `Fully Verified`
* `Calendar Only`
* `Cohort Timing`
* `Restricted Access`
* `Graduate Only`

These are derived from each row's `verificationMeta.sectionProof`.

## 3. Filters and Controls

### Search

Text search across institution and course fields.

### Tier Filter

Limits the view to Tier 1, Tier 2, or Tier 3 candidates.

### Format Filter

Filters by modality such as `Online`, `Remote`, or `In-Person`.

### Verification Filter

Filters by evidence/access state:

* `Fully Verified`: the exact course code is backed by public official course or schedule proof plus calendar support
* `Calendar Only`: the course exists and the calendar is known, but the recurring public section rotation is not fully published
* `Restricted`: the course may exist and even be scheduled, but access is limited by major, standing, program enrollment, approval, or similar gating
* `Cohort`: timing is driven by program or cohort starts instead of a standard standalone term rotation
* `Graduate Only`: the row is structurally graduate-level and should be treated as a higher articulation risk

### Export to CSV

Exports the full dataset.

### Export Action Queue

Exports only rows that are not fully verified so the remaining research workload is easy to manage.

### Compare Selected

Opens a side-by-side comparison for up to three rows.

## 4. Table Columns

### Ranking

The candidate tier, not a strict linear rank from 1 to 60.

### Institution

The school or provider name.

### Code

The candidate course code being compared to OSU MRKT 496.

### Format

The delivery mode. This reflects practical access assumptions, not just branding language.

### Offering Snapshot

A compact view of two ideas combined:

* the likely offering pattern
* the verification badge underneath it

This is meant to be quick to scan, while the modal splits the concepts apart in more detail.

### OSU Match

The current fit score against OSU MRKT 496. This is the primary comparative score in the table.

### Credits

The credit value published for the candidate course.

### Options

Opens the modal with the full explanation, links, radar, and petition generator.

### Compare

Lets the row be added to the comparison view.

## 5. Availability Language

The dashboard now separates course timing into two different ideas:

### Course Offering Pattern

This is the best public read on how the course itself is offered.

Possible meanings:

* `Offered: Fall / Spring`: public evidence supports those terms for the course
* `Rolling / monthly start`: the provider runs on frequent start cycles instead of standard semesters
* `Cohort-based`: the course is tied to a program or lockstep cohort schedule
* `Restricted access`: the course may exist in those terms, but access is gated
* `Public evidence points to ... but the full recurring term pattern is not publicly verified`: the course exists, but the exact stable cadence is still conservative

### Academic Calendar Dates

These are the institution or program start dates captured during the audit.

This does not automatically mean the exact course runs every listed term. It only means the school or program calendar for those terms is known.

## 6. What "Cohort-Based" Means

`Cohort-based` means the row is driven by a program sequence or start window, not a normal independent class rotation.

In practice, this usually means:

* the provider publishes a program start date
* the class may be embedded inside a sequence
* the exact standalone section cadence is not exposed like a normal semester course

That is why the verification badge for these rows is `Cohort Timing`, not `Fully Verified`.

## 7. What "Calendar Only" Means

`Calendar Only` means:

* the course itself is real
* an official calendar source is real
* but the recurring public section rotation for that exact course code is not fully visible from open sources

This is conservative by design. It prevents the dashboard from overstating certainty just because the institution has a published semester calendar.

## 8. Evidence Levels

These come from `availabilityMeta.evidenceLevel`.

### `course_and_calendar`

Best state. The row has both course-level timing evidence and calendar support.

### `calendar_only`

The institution or program calendar is known, but the exact recurring course cadence remains conservative.

### `catalog_only`

The course is supported by catalog evidence, but schedule or calendar certainty is still weaker.

### `unclear`

The public evidence is too thin to make a stronger claim, so the row is intentionally conservative.

## 9. Verification Statuses

These come from `verificationMeta.sectionProof`.

### `Fully Verified`

The exact course code is supported by official public evidence tied to a real term, schedule, or course matrix.

### `Calendar Only`

The course and calendar are real, but exact recurring public section proof is still missing.

### `Restricted Access`

The course may be valid academically but is not freely accessible. Examples:

* major-only
* class-standing minimum
* instructor consent
* nondegree restrictions
* program enrollment gate

### `Cohort Timing`

The timing is real, but it is program-driven rather than a standard public course rotation.

### `Graduate Only`

The course is structurally graduate-level and should be treated as a higher-risk transfer analogue.

## 10. Radar Chart Meaning

The radar compares five dimensions:

* `Primary Data`: how clearly the course requires original data collection or live fieldwork
* `Survey Design`: how strongly the course includes survey or research instrument design
* `Analysis`: the depth of analysis, interpretation, and research-method execution
* `Reporting`: the strength of final deliverables, presentation, or client-style reporting
* `OSU Fit`: the overall transfer-practicality score after access, cadence, and structural risks are considered

OSU is the fixed benchmark row and stays at `100` on all five axes.

## 11. Match Score vs Radar

The table's `OSU Match` score is kept aligned with the radar's fifth axis, `OSU Fit`.

In this repo, the intended rule is that `matchScore` and `radarData[4]` stay equal.

## 12. Modal Cards

### Course Tag

Institution plus course code identity.

### Course Offering Pattern

Human-readable output derived from `availabilityMeta`.

### Academic Calendar Dates

The official term dates captured during the audit.

### Verification Status

The current public-proof state for the row.

### Next Verification Step

The most useful next action if a row is not already fully verified.

### Estimated Tuition

Best-available cost estimate for practical planning.

### Official Syllabus Directive

A short catalog or syllabus quote supporting the equivalency argument.

### Syllabus Mapping vs OSU Requirements

Narrative explanation of why the course is a plausible MRKT 496 analogue.

## 13. Compare View

The compare modal is meant for decision-making, not raw data entry. It highlights:

* score/radar differences
* verification state
* next verification step
* cost and delivery differences

## 14. Petition Generator

This produces a draft rationale for OSU review.

Important rule:

* if a row is not fully verified, the petition text now includes a caution block reminding the user to confirm live schedule timing before relying on the row operationally

## 15. Exports

### Full CSV

Exports the full 60-row dataset with:

* match score
* tier
* delivery mode
* offering model
* offered terms
* known dates
* evidence level
* verification state
* course/calendar/schedule URLs

### Action Queue CSV

Exports only the rows that still require more follow-up work.

This is the operational checklist for future verification passes.

## 16. Source of Truth in the Data

The website is driven by three structured blocks in `Interactive_Dashboard/data.js`:

### `availabilityMeta`

Defines the offering model, offered terms, known dates, notes, and evidence level.

### `sources`

Stores the best official course, calendar, and schedule URLs plus verification dates.

### `verificationMeta`

Stores the row's proof classification, next step, and review date.

## 17. Practical Interpretation

The safest way to read the dashboard is:

* `Fully Verified` rows are the strongest operational candidates
* `Calendar Only` rows are academically promising but still need live schedule confirmation
* `Restricted Access` rows may be strong academically but weak operationally
* `Cohort Timing` rows can still be useful, but planning depends on program timing
* `Graduate Only` rows are usually strategic references, not first-choice petition targets

That is the intended meaning behind the website's language.
