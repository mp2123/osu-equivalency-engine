# V9.0 Equivalency Analytics Engine: Operational User Manual

This comprehensive guide covers how to navigate the repository, utilize the V9.0 Interactive Dashboard, and successfully present this intelligence to the Oregon State University academic review desk to secure your MRKT 496 transfer credit waiver.

---

## 🗂️ 1. Repository Navigation (Where Everything Is)

The repository has been streamlined to separate legacy data from the active V9.0 engine. 

*   **`/Interactive_Dashboard/` (The Core Engine):** This is the crown jewel. It contains the standalone web application (`index.html`, `app.js`, `styles.css`, `data.js`). This is where you will spend 99% of your time.
*   **`README.md`:** The architectural map. It provides a high-level overview of the project's scope, capabilities, and the 59 validated universities.
*   **`/01_Equivalency_Reports/`:** This directory contains the older, static markdown reports (V1 through V7). They have been preserved for historical context but now contain warnings redirecting users to the Interactive Dashboard, as the static reports only list ~20 schools, whereas the dashboard contains all 59.
*   **`/02_Operational_Guides/`:** Where this manual resides, providing instruction on deployment and academic petitioning.
*   **`/03_Raw_Data/`:** A sandbox directory used during the initial extraction phases. It can be ignored by the end user.

---

## 🖥️ 2. How to Utilize the Interactive Dashboard

You do not need to install any servers, Node.js, or backend frameworks. The engine runs entirely locally in your web browser.

### To Launch:
1. Open the `/Interactive_Dashboard/` folder on your computer.
2. Double-click **`index.html`**. It will open natively in Google Chrome, Apple Safari, or Microsoft Edge.

### How to Use the Tools:
*   **Search & Filter:** Use the top navigation bar to instantly filter the 59 schools by modality ("Online" vs "In-Person"), or filter by "Tier 1: High Conviction" to only see the absolute best structural matches for OSU's practicum requirement.
*   **Smart Sorting:** Click any of the table headers (Ranking, Institution, Code, OSU Match) to sort the data matrix ascending or descending.
*   **Side-by-Side Comparison:** Check the boxes in the far-right "Compare" column for up to 3 schools (e.g., UC Berkeley, Penn State, WSU Global). Click the orange **"⚖ Compare Selected"** button that appears. This opens a dedicated war-room view comparing their radar charts, estimated tuition, and OSU fit justifications side-by-side.
*   **Deep Syllabus Analysis:** Click the **"View Syllabus Analysis"** button on any row. This opens a detailed modal showing:
    *   Exactly *why* the course matches MRKT 496.
    *   The estimated tuition cost (per credit, per course, or per year).
    *   **Direct Course Artifact** links that bypass university firewalls, routing you straight to the course catalog or archived PDF syllabus.

---

## 📤 3. How to Send the Data to an Advisor

Because the Interactive Dashboard is a local file living on your computer's hard drive, **you cannot just send an advisor a link to it** (unless you host it online, which is detailed below). Here is how you should share the intelligence gathered by the engine:

### Option A: The Professional "Data Matrix" Route (Recommended)
You built a CSV export tool specifically for professional communication.
1. Open the Dashboard (`index.html`).
2. Click the **"⬇ Export to CSV"** button.
3. This generates a clean, professional spreadsheet (`OSU_MRKT496_Equivalency_Report_V9.csv`) containing all 59 schools, their match scores, exact catalog quotes, tuition estimates, and deep URLs.
4. **Action:** Email your academic advisor and say, *"I have compiled a data matrix of 59 AACSB-accredited alternatives for MRKT 496. I have attached the CSV database for your review, and I would like to formally petition for [Target School Name]."*

### Option B: Hosting the Website Live on Vercel (The "Shock and Awe" Route)
If you want to send the advisor a living, clickable URL so they can interact with the dashboard and radar charts themselves, you can easily host this on your existing Vercel account. Because this is a vanilla HTML/CSS/JS application, it requires no complex build steps.

Here are the exact steps to deploy it using three different methods, depending on your preferred workflow:

**Method 1: The Drag-and-Drop Method (Fastest & Simplest)**
1. Log in to your Vercel Dashboard.
2. Click the **"Add New..."** button in the top right and select **"Project"**.
3. On the "Import Git Repository" page, look at the bottom or left side for the **"Deploy without Git"** section, which has a drag-and-drop zone.
4. Open your computer's file explorer (Finder), locate the **`/Interactive_Dashboard/`** folder inside this repository.
5. Drag and drop the *entire* folder into the Vercel upload zone.
6. Vercel will instantly upload and deploy the site, providing you with a live URL (e.g., `osu-equivalency-engine.vercel.app`).

**Method 2: The GitHub Integration Method (Best for Future Updates)**
1. If this repository is pushed to a GitHub account connected to your Vercel, go to the Vercel Dashboard and click **"Add New..." -> "Project"**.
2. Click **"Import"** next to this repository.
3. **CRITICAL STEP:** In the "Configure Project" screen, you must change the **Root Directory** so Vercel knows where the website lives. Click "Edit", select the `Interactive_Dashboard` folder, and click "Save".
4. Leave the "Framework Preset" as `Other` (since no build command is needed) and click **Deploy**.

**Method 3: The Vercel CLI Method (For Terminal Users)**
1. Open your terminal and navigate directly into the dashboard directory:
   `cd "/Users/michael_s_panico/Desktop/DevBase/active_projects/OSU Transfer Equivalency Research/Interactive_Dashboard"`
2. Run the Vercel deployment command: `npx vercel` (or just `vercel` if it's installed globally).
3. Follow the CLI prompts: press `Y` to set up and deploy, select your account scope, and hit `Enter` to accept the default settings (no build steps required).
4. To push it directly to a production URL, run `npx vercel --prod`.

Once deployed using any of these methods, you can copy the live URL and email it directly to your advisor!

---

## 📝 4. The Formal Petition Submission Process

When you have selected the exact course you want to take (e.g., UC Berkeley Extension's `BUS ADM X460.6` or Portland State's `MKTG 460`), you must submit a formal override petition to the OSU Business transfer desk. OSU evaluators require proof that the transfer course contains a hands-on "primary data collection project."

**Follow these exact steps:**

1. **Generate the Rationale:** 
    * Open the Dashboard.
    * Click "View Syllabus Analysis" for your chosen school.
    * Click the orange **"✍ Generate OSU Petition Rationale"** button at the bottom of the modal. 
    * This automatically writes a highly specific, rhetorically optimized petition letter using the school's specific data points and copies it directly to your clipboard.
2. **Download the Evidence:** 
    * Click the **"View Direct Course Artifact"** or **"View Archived Syllabus"** link in that same modal window. 
    * Save the resulting webpage as a PDF (Print -> Save as PDF) or download the actual syllabus PDF to your computer.
3. **Draft the Email:** 
    * Paste the generated rationale from Step 1 into the body of your email to the advisor.
    * **Attach the Syllabus/Artifact PDF** from Step 2. (This is non-negotiable; OSU will not approve a practicum waiver without seeing the syllabus proof).
    * **Attach the exported CSV file** (optional, but proves you did exhaustive academic research).

**Why this workflow is effective:** The generated rationale specifically targets OSU's institutional language. It forces the reviewer to acknowledge that the target course is AACSB accredited, operates at the upper-division level, and explicitly mandates the required "primary data collection project."

The system is primed and ready for deployment. Choose your target, generate the petition, provide the artifact, and secure the waiver.