# V12.0 Handover & Remaining Tasks: Intelligence & Precision Sweep

This document outlines the remaining tasks and findings for the next agent to finalize the **V12.0 Upgrade**. The goal is absolute precision for the OSU Benchmark and 100% calendar accuracy for all 59 schools.

## 🏁 Current Status
*   **V9.0 - V11.0:** Completed (Deep links, Tuition, OSU Baseline Injection, Mobile UI fixes).
*   **V12.0:** Initiated. Benchmarking and initial calendar research performed.

## 🔍 Critical Findings (For Next Agent)
1.  **OSU MRKT 496 Availability:** Research confirms this course is primarily a **Spring Term** course (confirmed for Spring 2026, Section 410). Listings for Fall 2025/2026 are not currently active in Ecampus. 
    *   *Action:* Update OSU Target in `data.js` to `availability: "Spring (Mar 30)"`.
2.  **Radar Scaling Bug:** The user noted the OSU Target radar doesn't appear "100%". 
    *   *Technical Discovery:* In `app.js`, the Chart.js radar options have `ticks: { display: false, min: 0, max: 100 }`. 
    *   *Action:* Verify that `data.js` for OSU has `[100, 100, 100, 100, 100]` and that no CSS/JS clipping is occurring.
3.  **Portland State (Top Candidate):** Verified as **In-Person / Online**. Modality has been updated in `data.js`.

## 📋 Remaining Task List

### 1. The "Master Clock" Calendar Audit
*   Audit all 59 entries in `data.js`.
*   Replace generic "Late Aug" or "Early Jan" placeholders with specific start dates for Fall 2026 and Spring 2027.
*   **Gathered Dates to Inject:**
    *   **Portland State:** Fall (Sep 28) / Spring (Mar 29)
    *   **UC Berkeley Ext:** Fall (Aug 26) / Spring (Jan 19)
    *   **Penn State World Campus:** Fall (Aug 24) / Spring (Jan 11)
    *   **Temple University:** Fall (Aug 31) / Spring (Jan 11)
    *   **ASU:** Fall (Aug 20) / Spring (Jan 11)
    *   **SF State:** Fall (Aug 24) / Spring (Jan 20)

### 2. Final Modality Sweep (22 Schools)
*   Aggressively search for "Summer Online" or "Asynchronous" offerings for the remaining 22 schools marked as "In-Person".
*   Priority: University of Minnesota (MKTG 3011) and University of Oregon (MKTG 390).

### 3. UI/UX Verification
*   Confirm the Modal 'X' button fix remains stable across all browsers.
*   Ensure the "Generate Petition" logic uses the updated `availability` dates correctly in the generated text.

## 🚀 Deployment Instructions
1.  Update `Interactive_Dashboard/data.js` with the specific dates and OSU Spring correction.
2.  Run `node -e` parsing check to ensure JSON integrity.
3.  `git add . && git commit -m "feat: Final V12.0 Precision Sweep" && git push`

---
**Prepared by Jarvis V11.0**
