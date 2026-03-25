# <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Oregon_State_Beavers_logo.svg/1200px-Oregon_State_Beavers_logo.svg.png" width="30"> OSU MRKT 496 Transfer Equivalency Repository
**Target Objective:** Secure transfer credit waiver for Oregon State University's `MRKT 496: Marketing Research Practicum` by validating equivalent syllabus structures from AACSB-accredited peer institutions.

---

## 🚀 The Equivalency Analytics Engine (V12.0 Precision Sweep)

The static markdown matrix has been deprecated in favor of a standalone **Interactive Web Application** built entirely in Vanilla HTML/CSS/JS.

We have successfully reverse-engineered OSU's practicum requirements and identified **60 AACSB/ACBSP-accredited universities** that explicitly mandate primary data collection projects, rendering them theoretically equivalent to MRKT 496.

### How to Access the Data
Do NOT run a server. You do not need Node.js or React. 
1. Navigate to the `/Interactive_Dashboard/` folder in this repository.
2. Double-click `index.html` to open it natively in Chrome or Safari.

**V12.0 Capabilities Included:**
- 📊 **Embedded Analytics:** Chart.js integration visualizes the tier distribution and accreditation matrix.
- 🎯 **OSU Match Scoring:** The algorithm assesses how perfectly the target syllabus maps the "practicum" requirement using a gradient progress bar.
- 🗓️ **Availability Intelligence:** Every row now uses structured `availabilityMeta` data so course offering pattern and academic calendar dates are displayed separately instead of as one mixed string.
- 🔎 **Source Traceability:** Each school now carries source-backed course/calendar metadata, and the modal exposes an academic calendar link when that evidence exists.
- 🧭 **Verification Routing:** Every row now exposes a verification state (`Fully Verified`, `Calendar Only`, `Restricted Access`, `Cohort Timing`, `Graduate Only`) so public-proof strength and access risk are explicit.
- ⚖️ **Candidate Comparison:** Select and compare up to 3 universities side-by-side with syllabus alignment radar charts.
- ✍️ **Petition Generator:** Instant generation of formal OSU transfer credit waiver rationale for any candidate.
- 💰 **Tuition Analysis:** Real-time visibility into per-course/per-credit tuition estimates for top-tier candidates.
- 🔗 **Deep-Link Artifacts:** Direct routing to official course catalogs and archived syllabi to bypass university paywalls.
- 💾 **CSV Exporting:** Instantly download the 60-university database as a spreadsheet with offering model, start-date, and source URL columns.
- ⚡ **Zero-Friction Search & Sort:** Instant filtering and column-based sorting to find the perfect match.

### Need the definitions behind the website?
See [02_Operational_Guides/V12_Dashboard_Glossary.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/OSU%20Transfer%20Equivalency%20Research/02_Operational_Guides/V12_Dashboard_Glossary.md) for the plain-English meaning of:

* `Cohort Timing`
* `Calendar Only`
* evidence levels
* verification states
* radar axes
* table columns
* modal cards
* CSV exports

---

## 🗂️ Repository Architecture

| Directory / File | Description |
| :--- | :--- |
| 📁 `Interactive_Dashboard/` | **[CRITICAL]** The core web application containing the 60-school dataset, normalized availability/source metadata, the glassmorphic CSS, JS filtering, comparison logic, and CSV export logic. |
| 📁 `01_Equivalency_Reports/` | Formal markdown petition documents. Includes the exact rhetorical frameworks and logic required to present to the OSU R1 Faculty review desk. |
| 📁 `02_Operational_Guides/` | User-facing operational docs, including the dashboard glossary that explains all website terminology and evidence states. |
| 📁 `03_Raw_Data/` | Sandbox directory for staging unvetted university leads or downloading PDF syllabus documents. |
| 📄 `README.md` | This architectural map. |

---

## 📌 Phase Overview
**Project Status: ACTIVE ENHANCEMENT** (35+ distinct phases executed).
- Transitioned from flawed Playwright scraping to invisible API extraction.
- Scaled from 11 targets → 28 targets → 36 targets → 46 → **60 Target Universities**.
- Engineered the V8.0 UI with side-by-side comparison and an integrated petition generator.
- Upgraded to V12.0 Precision Sweep with normalized availability metadata, source traceability, and evidence-first score tightening where access or term confidence dropped.

*Built by Antigravity*
