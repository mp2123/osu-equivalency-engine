# V12.0 Precision Sweep: Implementation Record

This file is now the implementation record for the V12.0 precision sweep. The planned work has been applied to the interactive dashboard and dataset.

## Current Status
* **Dataset normalized:** All 60 rows now use `availabilityMeta` and `sources` as the source of truth.
* **UI updated:** The dashboard now separates `Course Offering Pattern` from `Academic Calendar Dates` in the modal and exports both in CSV.
* **Verification layer added:** Every row now carries `verificationMeta`, and the dashboard surfaces verification badges, a verification-state filter, modal next-step guidance, and compare-card verification routing.
* **Radar fixed:** The 0-100 radial scale remains pinned correctly, so the OSU benchmark fills the chart as intended.
* **Placeholder strings removed:** Legacy strings such as `Late Aug`, `Early Jan`, and free-floating `Unclear` were removed from the data payload.
* **Evidence strengthened:** The current evidence mix is `21` `course_and_calendar`, `30` `calendar_only`, `7` `catalog_only`, and `2` `unclear`.
* **Calendar source coverage:** All 60 rows now carry a non-null official or program-level calendar source in the dataset.
* **Verification mix:** The current section-proof mix is `17` `verified`, `30` `not_public`, `4` `cohort`, `8` `restricted`, and `1` `graduate_only`.

## Resolved Findings
1. **OSU MRKT 496 benchmark:** Kept at `matchScore = 100` with a full `[100, 100, 100, 100, 100]` radar vector. The offering model is now stored as a Spring-focused term pattern with explicit calendar dates and the note that no public Fall Ecampus section was located during this audit.
2. **Portland State:** Preserved as `In-Person / Online` with a Fall/Winter pattern instead of the old Fall/Spring assumption.
3. **ASU, SF State, Minnesota, Penn State, Temple, and Colorado State:** Previously verified dates were preserved in structured form during the normalization pass.
4. **Florida State University:** Promoted from generic calendar-only handling to exact official Fall 2026 schedule proof for `MAR 4613`, using the registrar's published Fall 2026 undergraduate class-search snapshot.
5. **University of Illinois and University of Maryland:** Both now carry exact official schedule proof, but both remain conservatively classified as `restricted` because the published schedules limit access to specific majors and class-standing thresholds.
6. **University of Wisconsin and University of Idaho:** Both now carry official term-linked course evidence that removes the earlier availability doubt. Wisconsin is backed by an official `Last Taught: Spring 2026` course guide entry, and Idaho is backed by an official `Typically Offered: Fall and Spring` course catalog term pattern.
7. **Montana State University:** Promoted from generic calendar-only handling to official catalog term-pattern proof for `BMKT 342R`, then reclassified as `restricted` because the published course entry reserves online registration for business majors and degree-required students while routing others through manual permission.
8. **TESU and APUS:** Both now carry exact public course-level schedule proof. TESU is backed by its official courses-and-schedules page for `MKT-4110`, and APUS is backed by its official course schedule page for `MKTG 400`, converting both rows from calendar-only handling to fully verified rolling-start options.
9. **University of Utah:** Promoted from generic calendar-only handling to official catalog term-pattern proof for `MKTG 4450`, then reclassified as `restricted` because the published course entry requires business-school major/minor status or a specific QAMO major pathway.
10. **FIU Online:** Reclassified from generic calendar-only handling to `restricted` because the official FIU course catalog makes access limits explicit for `MAR 4613`, even though a live public section rotation still was not captured.
11. **University of Georgia:** Promoted from generic calendar-only handling to `fully verified` because the official UGA Bulletin course detail for `MARK 4000` explicitly states `Semester Course Offered: Offered every year`.
12. **Evidence-first scoring:** Rows only moved when the new audit introduced a real access or cadence-confidence risk. Program-restricted rows and calendar-only rows were tightened conservatively, and the fifth radar axis stays aligned with `matchScore`.

## Dataset Contract
Each row in `Interactive_Dashboard/data.js` now carries:

```js
availabilityMeta: {
  offeringModel: "term" | "rolling" | "cohort" | "program_restricted" | "unclear",
  offeredTerms: ["Fall", "Winter", "Spring", "Summer"],
  termStartDates: {
    fall2026: "YYYY-MM-DD" | null,
    winter2027: "YYYY-MM-DD" | null,
    spring2027: "YYYY-MM-DD" | null,
    summer2026: "YYYY-MM-DD" | null
  },
  sessionNotes: "short human note or empty string",
  accessNote: "short human note or empty string",
  evidenceLevel: "course_and_calendar" | "calendar_only" | "catalog_only" | "unclear"
},
sources: {
  course: { title, url, verifiedOn },
  calendar: { title, url, verifiedOn } | null,
  schedule: { title, url, verifiedOn } | null
},
verificationMeta: {
  courseProof: "direct" | "catalog" | "search" | "program_sheet",
  calendarProof: "institution" | "program" | "extension",
  sectionProof: "verified" | "not_public" | "restricted" | "cohort" | "graduate_only",
  nextVerificationStep: "short action text",
  reviewedOn: "YYYY-MM-DD"
}
```

The legacy `availability` string is no longer stored in the dataset. `Interactive_Dashboard/app.js` derives the compact summary, modal text, petition text, CSV columns, verification badges, and filter state from `availabilityMeta`, `sources`, and `verificationMeta`.

## Validation Targets Completed
* `data.js` loads cleanly in Node with a browser shim.
* All 60 rows contain `availabilityMeta`, `sources`, and `verificationMeta`.
* No rows contain `Late Aug` or `Early Jan`.
* No rows have `matchScore` more than 1 point away from radar axis 5.
* All rows have a non-null calendar source and a non-empty next verification step.

## Residual Follow-Up
The repo no longer has structural blockers for availability/date handling. Any future pass should focus on:

* improving evidence quality for rows still marked `calendar_only`, `catalog_only`, or `unclear`
* pulling more live section/schedule proof so additional rows can graduate from institution-level calendar evidence to true course-and-calendar evidence
* revisiting a small number of extension/program rows where program timing is official but standalone section cadence remains conservative
