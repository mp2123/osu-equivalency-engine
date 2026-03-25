document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const tierFilter = document.getElementById('tierFilter');
    const modalityFilter = document.getElementById('modalityFilter');
    const verificationFilter = document.getElementById('verificationFilter');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const actionQueueBtn = document.getElementById('actionQueueBtn');

    // Telemetry Elements
    const totalCount = document.getElementById('totalCount');
    const tier1Count = document.getElementById('tier1Count');
    const onlineCount = document.getElementById('onlineCount');
    const verifiedCount = document.getElementById('verifiedCount');
    const calendarOnlyCount = document.getElementById('calendarOnlyCount');
    const cohortCount = document.getElementById('cohortCount');
    const restrictedCount = document.getElementById('restrictedCount');
    const graduateOnlyCount = document.getElementById('graduateOnlyCount');

    // Comparison State
    let selectedSchools = [];
    const compareBtn = document.getElementById('compareBtn');
    const compareCount = document.getElementById('compareCount');
    const compareModal = document.getElementById('compareModal');
    const compareClose = document.querySelector('.compare-close');
    const compareGrid = document.getElementById('compareGrid');

    // Sorting State
    let currentSort = { column: 'matchScore', direction: 'desc' };

    // Modal Elements
    const modal = document.getElementById('detailModal');
    const closeBtn = document.querySelector('.close-btn');
    const generatePetitionBtn = document.getElementById('generatePetitionBtn');

    // Chart instances
    let tierChartInstance = null;
    let accChartInstance = null;
    let radarChartInstance = null;
    let comparisonRadarInstances = [];
    const RADAR_SCALE_MAX = 100;
    const TERM_DATE_ORDER = [
        ['summer2026', 'Summer 2026'],
        ['fall2026', 'Fall 2026'],
        ['winter2027', 'Winter 2027'],
        ['spring2027', 'Spring 2027']
    ];

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function csvEscape(value) {
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
    }

    function formatIsoDate(isoDate) {
        if (!isoDate) return '';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(`${isoDate}T12:00:00`));
    }

    function formatIsoDateShort(isoDate) {
        if (!isoDate) return '';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(new Date(`${isoDate}T12:00:00`));
    }

    function formatTermList(terms = []) {
        if (!terms.length) return '';
        return terms.join(' / ');
    }

    function prettifyEvidenceLevel(level = 'unclear') {
        const labels = {
            course_and_calendar: 'Course + calendar verified',
            calendar_only: 'Calendar verified; course cadence conservative',
            catalog_only: 'Catalog verified; schedule/calendar conservative',
            unclear: 'Conservative / unclear'
        };
        return labels[level] || level.replace(/_/g, ' ');
    }

    function getVerificationStatusLabel(sectionProof = 'not_public') {
        const labels = {
            verified: 'Fully Verified',
            not_public: 'Calendar Only',
            restricted: 'Restricted Access',
            cohort: 'Cohort Timing',
            graduate_only: 'Graduate Only'
        };
        return labels[sectionProof] || 'Calendar Only';
    }

    function getVerificationStatusTone(sectionProof = 'not_public') {
        const tones = {
            verified: 'verified',
            not_public: 'calendar',
            restricted: 'restricted',
            cohort: 'cohort',
            graduate_only: 'graduate'
        };
        return tones[sectionProof] || 'calendar';
    }

    function getVerificationInstruction(course) {
        const sectionProof = course.verificationMeta && course.verificationMeta.sectionProof;
        switch (sectionProof) {
            case 'verified':
                return 'Strong verification path: the exact course code is supported by official course or schedule evidence plus an official calendar source. Start with the primary course artifact below, then use the calendar link only to confirm term timing.';
            case 'restricted':
                return 'Access warning: this row is structurally restricted or approval-dependent. Verify the course artifact first, then confirm visiting or nondegree access directly with the program or registrar before treating it as actionable.';
            case 'cohort':
                return 'Timing warning: this row is driven by cohort or program timing rather than a stable standalone semester rotation. Use the program page below to confirm the next start window before relying on it for petition planning.';
            case 'graduate_only':
                return 'Transfer-fit warning: this row is graduate-only and should be treated as a structural articulation risk. Confirm OSU transfer treatment before using it as an equivalency target.';
            case 'not_public':
            default:
                return 'Conservative verification path: the course and institution timing are real, but the recurring public section rotation is not fully published. Start with the course/source link below, then check the institution\'s live class search when the target term opens.';
        }
    }

    function getVerificationSortRank(sectionProof = 'not_public') {
        const order = {
            verified: 0,
            not_public: 1,
            cohort: 2,
            restricted: 3,
            graduate_only: 4
        };
        return order[sectionProof] ?? 99;
    }

    function getKnownDateEntries(meta = {}) {
        const termStartDates = meta.termStartDates || {};
        return TERM_DATE_ORDER
            .map(([key, label]) => ({ key, label, isoDate: termStartDates[key] || null }))
            .filter(entry => entry.isoDate);
    }

    function getRelevantDateEntries(meta = {}) {
        const entries = getKnownDateEntries(meta);
        const offeredTerms = meta.offeredTerms || [];
        if (!offeredTerms.length) return entries;

        return entries.filter(entry => offeredTerms.includes(entry.label.split(' ')[0]));
    }

    function getOfferingPatternText(course) {
        const meta = course.availabilityMeta;
        if (!meta) return 'Availability metadata not loaded.';

        const termList = formatTermList(meta.offeredTerms);
        const note = meta.sessionNotes ? ` ${meta.sessionNotes}` : '';
        const access = meta.accessNote ? ` ${meta.accessNote}` : '';

        switch (meta.offeringModel) {
            case 'term':
                return `${termList ? `Offered: ${termList}.` : 'Published term schedule available.'}${note}${access}`.trim();
            case 'rolling':
                return `Rolling / monthly start.${note}${access}`.trim();
            case 'cohort':
                return `Cohort-based.${note}${access}`.trim();
            case 'program_restricted':
                return `${termList ? `Published evidence points to ${termList}.` : 'Availability is program-restricted.'}${note}${access}`.trim();
            case 'unclear':
            default:
                return `${termList ? `Public evidence points to ${termList}, but the full recurring term pattern is not publicly verified.` : 'The recurring term pattern is not publicly verified.'}${note}${access}`.trim();
        }
    }

    function getAcademicCalendarText(course) {
        const meta = course.availabilityMeta;
        if (!meta) return 'Academic calendar dates were not captured.';

        const entries = getKnownDateEntries(meta);
        if (entries.length) {
            return entries.map(entry => `${entry.label}: ${formatIsoDate(entry.isoDate)}`).join(' | ');
        }

        if (course.sources && course.sources.calendar) {
            return 'Official academic calendar source captured; no specific start dates were stored for this row.';
        }

        return 'No academic calendar date was captured during this audit.';
    }

    function getCompactAvailabilitySummary(course) {
        const meta = course.availabilityMeta;
        if (!meta) return 'Availability metadata pending';

        const entries = getRelevantDateEntries(meta);
        const shortDates = entries.map(entry => formatIsoDateShort(entry.isoDate));
        const termList = formatTermList(meta.offeredTerms);

        switch (meta.offeringModel) {
            case 'term':
                return termList
                    ? `${termList}${shortDates.length ? ` (${shortDates.join(' / ')})` : ''}`
                    : `Published term schedule${shortDates.length ? ` (${shortDates.join(' / ')})` : ''}`;
            case 'rolling':
                return 'Rolling / monthly start';
            case 'cohort':
                return `Cohort-based${shortDates.length ? ` (${shortDates.join(' / ')})` : ''}`;
            case 'program_restricted':
                return termList ? `Restricted access: ${termList}` : 'Restricted / approval-dependent';
            case 'unclear':
            default:
                return termList ? `Conservative: ${termList}` : 'Term pattern not publicly verified';
        }
    }

    function getKnownStartDatesCsv(course) {
        return getKnownDateEntries(course.availabilityMeta)
            .map(entry => `${entry.label}: ${formatIsoDate(entry.isoDate)}`)
            .join(' | ');
    }

    function buildSourceLinks(course) {
        const buttons = [];
        const seen = new Set();

        function pushLink(title, url) {
            if (!title || !url || seen.has(url)) return;
            seen.add(url);
            buttons.push({ title, url });
        }

        if (course.sources && course.sources.course) {
            pushLink(course.sources.course.title || 'View Course Source', course.sources.course.url);
        }
        if (course.sources && course.sources.schedule) {
            pushLink(course.sources.schedule.title || 'View Live Schedule', course.sources.schedule.url);
        }
        if (course.sources && course.sources.calendar) {
            pushLink('View Academic Calendar', course.sources.calendar.url);
        }
        (course.links || []).forEach(linkObj => pushLink(linkObj.title, linkObj.url));

        return buttons;
    }

    function getPrimaryVerificationUrl(course) {
        return (course.sources && course.sources.course && course.sources.course.url)
            || (course.sources && course.sources.schedule && course.sources.schedule.url)
            || ((course.links || [])[1] && course.links[1].url)
            || ((course.links || [])[0] && course.links[0].url)
            || '';
    }

    function enrichCourseRecord(course) {
        return {
            ...course,
            availabilityDerived: {
                summary: getCompactAvailabilitySummary(course),
                offeringPattern: getOfferingPatternText(course),
                academicCalendar: getAcademicCalendarText(course),
                evidenceLabel: prettifyEvidenceLevel(course.availabilityMeta && course.availabilityMeta.evidenceLevel),
                knownStartDates: getKnownStartDatesCsv(course),
                sourceLinks: buildSourceLinks(course)
            },
            verificationDerived: {
                statusLabel: getVerificationStatusLabel(course.verificationMeta && course.verificationMeta.sectionProof),
                tone: getVerificationStatusTone(course.verificationMeta && course.verificationMeta.sectionProof),
                instruction: getVerificationInstruction(course),
                nextStep: course.verificationMeta && course.verificationMeta.nextVerificationStep
                    ? course.verificationMeta.nextVerificationStep
                    : "Check the institution's public class search when the target term schedule opens."
            }
        };
    }

    window.courseData = (window.courseData || []).map(enrichCourseRecord);

    function initCharts(data) {
        const countsByTier = { 1: 0, 2: 0, 3: 0 };
        const countsByAccreditation = { AACSB: 0, ACBSP: 0, Other: 0 };
        const countsByVerification = { verified: 0, not_public: 0, cohort: 0, restricted: 0, graduate_only: 0 };
        let onlineTally = 0;

        data.forEach(item => {
            countsByTier[item.tier] = (countsByTier[item.tier] || 0) + 1;
            if (item.modality.includes('Online') || item.modality.includes('Remote')) onlineTally++;
            if (item.accreditation.includes('AACSB')) countsByAccreditation.AACSB++;
            else if (item.accreditation.includes('ACBSP')) countsByAccreditation.ACBSP++;
            else countsByAccreditation.Other++;
            if (item.verificationMeta && item.verificationMeta.sectionProof) {
                countsByVerification[item.verificationMeta.sectionProof] = (countsByVerification[item.verificationMeta.sectionProof] || 0) + 1;
            }
        });

        if (totalCount) totalCount.textContent = data.length;
        if (tier1Count) tier1Count.textContent = countsByTier[1];
        if (onlineCount) onlineCount.textContent = onlineTally;
        if (verifiedCount) verifiedCount.textContent = countsByVerification.verified;
        if (calendarOnlyCount) calendarOnlyCount.textContent = countsByVerification.not_public;
        if (cohortCount) cohortCount.textContent = countsByVerification.cohort;
        if (restrictedCount) restrictedCount.textContent = countsByVerification.restricted;
        if (graduateOnlyCount) graduateOnlyCount.textContent = countsByVerification.graduate_only;

        const ctxTier = document.getElementById('tierChart').getContext('2d');
        if (tierChartInstance) tierChartInstance.destroy();
        tierChartInstance = new Chart(ctxTier, {
            type: 'doughnut',
            data: {
                labels: ['Tier 1 Elite', 'Tier 2 Strong', 'Tier 3 Backup'],
                datasets: [{
                    data: [countsByTier[1], countsByTier[2], countsByTier[3]],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } },
                cutout: '70%'
            }
        });

        const ctxAcc = document.getElementById('accreditationChart').getContext('2d');
        if (accChartInstance) accChartInstance.destroy();
        accChartInstance = new Chart(ctxAcc, {
            type: 'bar',
            data: {
                labels: ['AACSB', 'ACBSP', 'Other'],
                datasets: [{
                    label: 'Universities',
                    data: [countsByAccreditation.AACSB, countsByAccreditation.ACBSP, countsByAccreditation.Other],
                    backgroundColor: ['#00f0ff', '#ff6b00', '#94a3b8'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderMatchScore(score) {
        let badgeClass = 'score-low';
        let fillClass = 'fill-low';
        if (score >= 90) {
            badgeClass = 'score-high';
            fillClass = 'fill-high';
        } else if (score >= 80) {
            badgeClass = 'score-med';
            fillClass = 'fill-med';
        }

        return `
            <div class="match-score-container">
                <span class="score-badge ${badgeClass}">${score}% Fit Match</span>
                <div class="match-bar-bg">
                    <div class="match-bar-fill ${fillClass}" style="width: ${score}%"></div>
                </div>
            </div>
        `;
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 60px; color: #94a3b8;">No transfer candidates found aligning with parameters.</td></tr>';
            return;
        }

        data.forEach(item => {
            const isChecked = selectedSchools.includes(item.institution) ? 'checked' : '';
            const safeInstitution = JSON.stringify(item.institution);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="tier-badge tier-${item.tier}">Tier ${item.tier}</span></td>
                <td><strong>${escapeHtml(item.institution)}</strong></td>
                <td><span style="color:#00f0ff">${escapeHtml(item.course)}</span></td>
                <td>${escapeHtml(item.modality)}</td>
                <td>
                    <span class="availability-summary">${escapeHtml(item.availabilityDerived.summary)}</span>
                    <span class="verification-pill verification-${escapeHtml(item.verificationDerived.tone)}">${escapeHtml(item.verificationDerived.statusLabel)}</span>
                </td>
                <td>${renderMatchScore(item.matchScore)}</td>
                <td>${escapeHtml(item.credits)}</td>
                <td><button class="view-btn" onclick='openModal(${safeInstitution})'>View Syllabus Analysis</button></td>
                <td>
                    <label class="checkbox-container">
                        <input type="checkbox" ${isChecked} onchange='toggleSchool(${safeInstitution})'>
                        <span class="checkmark"></span>
                    </label>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.toggleSchool = function(instName) {
        if (selectedSchools.includes(instName)) {
            selectedSchools = selectedSchools.filter(school => school !== instName);
        } else {
            if (selectedSchools.length >= 3) {
                alert('You can compare up to 3 institutions at once.');
                renderTable(getCurrentFilteredData());
                return;
            }
            selectedSchools.push(instName);
        }
        updateCompareButton();
    };

    function updateCompareButton() {
        if (selectedSchools.length > 0) {
            compareBtn.style.display = 'inline-block';
            compareCount.textContent = selectedSchools.length;
        } else {
            compareBtn.style.display = 'none';
        }
    }

    function downloadCsv(filename, headers, rows) {
        const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportToCsv() {
        const data = window.courseData;
        if (!data || !data.length) return;

        const headers = [
            'Institution',
            'Course Code',
            'Modality',
            'Credits',
            'Accreditation',
            'Conviction Tier',
            'Availability Summary',
            'Course Offering Pattern',
            'Academic Calendar Dates',
            'Offering Model',
            'Offered Terms',
            'Known Start Dates',
            'Evidence Level',
            'Verification Status',
            'Course Proof Type',
            'Calendar Proof Type',
            'Section Proof',
            'Next Verification Step',
            'Reviewed On',
            'Match Score (%)',
            'Estimated Tuition',
            'Official Catalog Quote',
            'OSU Syllabus Justification',
            'Course Source URL',
            'Calendar Source URL',
            'Schedule Source URL',
            'Primary Verification URL'
        ];

        const rows = data.map(item => {
            const meta = item.availabilityMeta || {};
            return [
                csvEscape(item.institution),
                csvEscape(item.course),
                csvEscape(item.modality),
                csvEscape(item.credits),
                csvEscape(item.accreditation),
                csvEscape(item.tier),
                csvEscape(item.availabilityDerived.summary),
                csvEscape(item.availabilityDerived.offeringPattern),
                csvEscape(item.availabilityDerived.academicCalendar),
                csvEscape(meta.offeringModel || ''),
                csvEscape((meta.offeredTerms || []).join(' / ')),
                csvEscape(item.availabilityDerived.knownStartDates),
                csvEscape(item.availabilityDerived.evidenceLabel),
                csvEscape(item.verificationDerived.statusLabel),
                csvEscape(item.verificationMeta && item.verificationMeta.courseProof ? item.verificationMeta.courseProof : ''),
                csvEscape(item.verificationMeta && item.verificationMeta.calendarProof ? item.verificationMeta.calendarProof : ''),
                csvEscape(item.verificationMeta && item.verificationMeta.sectionProof ? item.verificationMeta.sectionProof : ''),
                csvEscape(item.verificationDerived.nextStep),
                csvEscape(item.verificationMeta && item.verificationMeta.reviewedOn ? item.verificationMeta.reviewedOn : ''),
                csvEscape(item.matchScore),
                csvEscape(item.tuitionEstimate || 'Variable - Check Catalog'),
                csvEscape(item.catalogSnapshot || ''),
                csvEscape(item.justification || ''),
                csvEscape(item.sources && item.sources.course ? item.sources.course.url : ''),
                csvEscape(item.sources && item.sources.calendar ? item.sources.calendar.url : ''),
                csvEscape(item.sources && item.sources.schedule ? item.sources.schedule.url : ''),
                csvEscape(getPrimaryVerificationUrl(item))
            ];
        });
        downloadCsv('OSU_MRKT496_Equivalency_Report_V12.csv', headers, rows);
    }

    function exportActionQueueCsv() {
        const data = (window.courseData || [])
            .filter(item => item.verificationMeta && item.verificationMeta.sectionProof !== 'verified')
            .sort((a, b) => {
                if (a.tier !== b.tier) return a.tier - b.tier;
                if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
                return a.institution.localeCompare(b.institution);
            });

        if (!data.length) return;

        const headers = [
            'Institution',
            'Course Code',
            'Tier',
            'Modality',
            'Match Score (%)',
            'Verification Status',
            'Evidence Level',
            'Next Verification Step',
            'Course Source URL',
            'Schedule Source URL',
            'Calendar Source URL',
            'Reviewed On'
        ];

        const rows = data.map(item => [
            csvEscape(item.institution),
            csvEscape(item.course),
            csvEscape(item.tier),
            csvEscape(item.modality),
            csvEscape(item.matchScore),
            csvEscape(item.verificationDerived.statusLabel),
            csvEscape(item.availabilityDerived.evidenceLabel),
            csvEscape(item.verificationDerived.nextStep),
            csvEscape(item.sources && item.sources.course ? item.sources.course.url : ''),
            csvEscape(item.sources && item.sources.schedule ? item.sources.schedule.url : ''),
            csvEscape(item.sources && item.sources.calendar ? item.sources.calendar.url : ''),
            csvEscape(item.verificationMeta && item.verificationMeta.reviewedOn ? item.verificationMeta.reviewedOn : '')
        ]);

        downloadCsv('OSU_MRKT496_Verification_Action_Queue_V12.csv', headers, rows);
    }

    function sortData(data) {
        const { column, direction } = currentSort;
        return data.sort((a, b) => {
            let valA;
            let valB;
            if (column === 'matchScore') {
                valA = a.matchScore;
                valB = b.matchScore;
            } else if (column === 'tier') {
                valA = a.tier;
                valB = b.tier;
            } else if (column === 'institution') {
                valA = a.institution.toLowerCase();
                valB = b.institution.toLowerCase();
            } else if (column === 'course') {
                valA = a.course.toLowerCase();
                valB = b.course.toLowerCase();
            } else if (column === 'verification') {
                valA = getVerificationSortRank(a.verificationMeta && a.verificationMeta.sectionProof);
                valB = getVerificationSortRank(b.verificationMeta && b.verificationMeta.sectionProof);
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            if (column === 'verification' && a.matchScore !== b.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return 0;
        });
    }

    function getCurrentFilteredData() {
        const searchTerm = searchInput.value.toLowerCase();
        const tier = tierFilter.value;
        const modality = modalityFilter.value;
        const verification = verificationFilter.value;

        const filtered = window.courseData.filter(item => {
            const matchesSearch = item.institution.toLowerCase().includes(searchTerm)
                || item.course.toLowerCase().includes(searchTerm);
            const matchesTier = tier === 'all' || item.tier.toString() === tier;
            const matchesModality = modality === 'all' || item.modality.includes(modality);
            const matchesVerification = verification === 'all'
                || (item.verificationMeta && item.verificationMeta.sectionProof === verification);
            return matchesSearch && matchesTier && matchesModality && matchesVerification;
        });

        return sortData(filtered);
    }

    function filterData() {
        renderTable(getCurrentFilteredData());
    }

    document.getElementById('sort-tier').addEventListener('click', () => handleSort('tier'));
    document.getElementById('sort-inst').addEventListener('click', () => handleSort('institution'));
    document.getElementById('sort-code').addEventListener('click', () => handleSort('course'));
    document.getElementById('sort-verification').addEventListener('click', () => handleSort('verification'));
    document.getElementById('sort-score').addEventListener('click', () => handleSort('matchScore'));

    function handleSort(column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        filterData();
    }

    searchInput.addEventListener('input', filterData);
    tierFilter.addEventListener('change', filterData);
    modalityFilter.addEventListener('change', filterData);
    verificationFilter.addEventListener('change', filterData);
    exportCsvBtn.addEventListener('click', exportToCsv);
    actionQueueBtn.addEventListener('click', exportActionQueueCsv);

    window.openModal = function(instName) {
        const course = window.courseData.find(candidate => candidate.institution === instName);
        if (!course) return;

        document.getElementById('modalTitle').textContent = course.institution;
        document.getElementById('modalCourse').textContent = course.course;
        document.getElementById('modalOfferingPattern').textContent = course.availabilityDerived.offeringPattern;
        document.getElementById('modalCalendarDates').textContent = course.availabilityDerived.academicCalendar;
        document.getElementById('modalVerificationStatus').textContent = course.verificationDerived.statusLabel;
        document.getElementById('modalNextVerificationStep').textContent = course.verificationDerived.nextStep;
        document.getElementById('modalTuition').textContent = course.tuitionEstimate || 'Contact for Quote';
        document.getElementById('modalQuote').innerHTML = course.catalogSnapshot || 'Official course research catalog snapshot pending formal request.';

        const justHTML = (course.justification || '')
            .replace(/\[BASELINE STANDARD\]:/g, '<strong style="color:#00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">[BASELINE STANDARD]:</strong>')
            .replace(/\[EXPLICIT PRACTICUM EVIDENCE\]:/g, '<strong style="color:var(--tier1)">[EXPLICIT PRACTICUM EVIDENCE]:</strong>')
            .replace(/\[PROJECT EVIDENCE\]:/g, '<strong style="color:var(--tier2)">[PROJECT EVIDENCE]:</strong>')
            .replace(/\[PRACTICUM ALIGNMENT\]:/g, '<strong style="color:var(--tier1)">[PRACTICUM ALIGNMENT]:</strong>')
            .replace(/\[COMPETENCY FOCUS\]:/g, '<strong style="color:var(--tier2)">[COMPETENCY FOCUS]:</strong>')
            .replace(/\[METHODOLOGY ALIGNMENT\]:/g, '<strong style="color:var(--tier2)">[METHODOLOGY ALIGNMENT]:</strong>')
            .replace(/\[ELITE OVERFLOW\]:/g, '<strong style="color:var(--secondary)">[ELITE OVERFLOW]:</strong>')
            .replace(/\[REGIONAL MATCH\]:/g, '<strong style="color:var(--secondary)">[REGIONAL MATCH]:</strong>')
            .replace(/\[WEAK ALIGNMENT\]:/g, '<strong style="color:var(--tier3)">[STRATEGY RISK]:</strong>')
            .replace(/\[ACCREDITATION RISK\]:/g, '<strong style="color:var(--tier3)">[ACCREDITATION RISK]:</strong>')
            .replace(/\[THEORY RISK\]:/g, '<strong style="color:var(--tier3)">[THEORY RISK]:</strong>')
            .replace(/\[LEVELING RISK\]:/g, '<strong style="color:var(--tier3)">[LEVELING RISK]:</strong>')
            .replace(/\[CREDIT RISK\]:/g, '<strong style="color:var(--tier3)">[CREDIT RISK]:</strong>')
            .replace(/\[PRE-REQ BLOCK\]:/g, '<strong style="color:var(--tier3)">[PRE-REQ BLOCK]:</strong>')
            .replace(/\[AVAILABILITY RISK\]:/g, '<strong style="color:var(--tier3)">[AVAILABILITY RISK]:</strong>');
        document.getElementById('modalJustification').innerHTML = justHTML;

        const instructionsContainer = document.getElementById('dynamicInstructions');
        let instructionHTML = '<small style="color: var(--accent); letter-spacing: 1px; text-transform: uppercase; font-weight:700;"><span class="icon">🧭</span> Verification Routing Instructions</small>';
        instructionHTML += `<p style="font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; margin-top: 8px;"><strong>${escapeHtml(course.verificationDerived.statusLabel)}:</strong> ${escapeHtml(course.verificationDerived.instruction)}</p>`;
        instructionsContainer.innerHTML = instructionHTML;

        const linkContainer = document.getElementById('dynamicLinkContainer');
        linkContainer.innerHTML = '';
        course.availabilityDerived.sourceLinks.forEach((linkObj, index) => {
            const btn = document.createElement('a');
            btn.href = linkObj.url;
            btn.target = '_blank';
            btn.className = index === 0 ? 'action-btn primary-btn' : 'action-btn primary-btn secondary-btn';
            btn.style.width = '100%';
            btn.innerHTML = `<span class="btn-text">${escapeHtml(linkObj.title)}</span> <span class="arrow">↗</span>`;
            linkContainer.appendChild(btn);
        });

        generatePetitionBtn.onclick = () => {
            const cleanJustification = (course.justification || '').replace(/\[.*?\]:/g, '').trim();
            const credits = course.credits.includes('Sem')
                ? '3-semester-credit / 45-contact-hour'
                : '4-quarter-credit / 40-contact-hour';
            const cautionBlock = course.verificationMeta && course.verificationMeta.sectionProof === 'verified'
                ? ''
                : '\nEnrollment timing should still be confirmed against the institution\'s current live schedule because the recurring public section rotation for this course is not fully published.\n';
            const petitionText = `
I am respectfully requesting a reevaluation of ${course.course}: Marketing Research from ${course.institution} to fulfill my Oregon State University requirement for MRKT 496: Marketing Research Practicum.

As outlined in the attached syllabus, this ${credits} course operates at the upper-division level within an ${course.accreditation}-accredited business school. I have specifically highlighted the major course project, which requires students to design an instrument, collect primary field data, and analyze the results, directly aligning with OSU's requirement for practical experience in the collection, analysis, and interpretation of primary data.

Source-backed planning notes:
- Course offering pattern: ${course.availabilityDerived.offeringPattern}
- Academic calendar dates: ${course.availabilityDerived.academicCalendar}
- Evidence level: ${course.availabilityDerived.evidenceLabel}

Key Alignment Facts:
- Institution: ${course.institution}
- Course: ${course.course}
- Accreditation: ${course.accreditation}
- Credits: ${course.credits}
- Syllabus Justification: ${cleanJustification}

${cautionBlock}
I believe this course satisfies the 75% content alignment requirement for a direct equivalency to MRKT 496, subject to OSU's final review of the attached syllabus and schedule evidence.
            `.trim();

            navigator.clipboard.writeText(petitionText).then(() => {
                const originalText = generatePetitionBtn.innerHTML;
                generatePetitionBtn.innerHTML = '<span>✅ Copied to Clipboard!</span>';
                generatePetitionBtn.style.background = '#10b981';
                setTimeout(() => {
                    generatePetitionBtn.innerHTML = originalText;
                    generatePetitionBtn.style.background = '';
                }, 2000);
            });
        };

        const tierBadge = document.getElementById('modalTier');
        tierBadge.textContent = `Tier ${course.tier}`;
        tierBadge.className = `tier-badge tier-${course.tier}`;

        if (radarChartInstance) radarChartInstance.destroy();

        const ctxRadar = document.getElementById('radarChart').getContext('2d');
        radarChartInstance = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Primary Data', 'Survey Design', 'Analysis', 'Reporting', 'OSU Fit'],
                datasets: [{
                    label: 'Syllabus Match Vector',
                    data: course.radarData || [50, 50, 50, 50, 50],
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    borderColor: '#00f0ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff6b00',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ff6b00',
                    pointRadius: 4
                }]
            },
            options: {
                scales: {
                    r: {
                        min: 0,
                        max: RADAR_SCALE_MAX,
                        beginAtZero: true,
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 12, family: 'Inter', weight: 'bold' } },
                        ticks: { display: false }
                    }
                },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            }
        });

        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    };

    compareBtn.onclick = () => {
        compareGrid.innerHTML = '';
        comparisonRadarInstances.forEach(chart => chart.destroy());
        comparisonRadarInstances = [];

        selectedSchools.forEach(instName => {
            const course = window.courseData.find(candidate => candidate.institution === instName);
            const safeInstitution = JSON.stringify(course.institution);
            const card = document.createElement('div');
            card.className = 'glass-panel card-fx comparison-card';
            card.style.minWidth = '350px';
            card.style.flex = '1';
            card.style.padding = '20px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '15px';

            card.innerHTML = `
                <div style="text-align:center">
                    <span class="tier-badge tier-${course.tier}">Tier ${course.tier}</span>
                    <h3 style="margin: 10px 0 5px 0">${escapeHtml(course.institution)}</h3>
                    <p style="color:var(--secondary); font-weight:700;">${escapeHtml(course.course)}</p>
                </div>
                <div style="height: 200px; width: 100%;">
                    <canvas id="radar-${course.institution.replace(/\s+/g, '')}"></canvas>
                </div>
                <div style="font-size: 0.85rem; color: #cbd5e1; flex-grow: 1;">
                    <p><strong>OSU Fit:</strong> ${course.matchScore}%</p>
                    <p><strong>Availability:</strong> ${escapeHtml(course.availabilityDerived.summary)}</p>
                    <p><strong>Verification:</strong> ${escapeHtml(course.verificationDerived.statusLabel)}</p>
                    <p><strong>Next step:</strong> ${escapeHtml(course.verificationDerived.nextStep)}</p>
                    <p><strong>Est. Tuition:</strong> <span class="neon-green">${escapeHtml(course.tuitionEstimate || 'Variable - Check Catalog')}</span></p>
                    <p style="margin-top:10px;">${escapeHtml(course.justification)}</p>
                </div>
                <button class="action-btn primary-btn secondary-btn" style="width:100%" onclick='openModal(${safeInstitution})'>Full Analysis</button>
            `;
            compareGrid.appendChild(card);

            const ctx = document.getElementById(`radar-${course.institution.replace(/\s+/g, '')}`).getContext('2d');
            const radarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Primary', 'Survey', 'Analysis', 'Reporting', 'Fit'],
                    datasets: [{
                        data: course.radarData || [50, 50, 50, 50, 50],
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        borderColor: '#00f0ff',
                        borderWidth: 1,
                        pointRadius: 2
                    }]
                },
                options: {
                    scales: {
                        r: {
                            min: 0,
                            max: RADAR_SCALE_MAX,
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            pointLabels: { display: true, font: { size: 10 } },
                            ticks: { display: false }
                        }
                    },
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                }
            });
            comparisonRadarInstances.push(radarChart);
        });

        document.body.style.overflow = 'hidden';
        compareModal.style.display = 'block';
        setTimeout(() => compareModal.classList.add('show'), 10);
    };

    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };

    closeBtn.onclick = closeModal;

    const closeCompareModal = () => {
        compareModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            compareModal.style.display = 'none';
        }, 300);
    };

    compareClose.onclick = closeCompareModal;
    window.onclick = event => {
        if (event.target === modal) closeModal();
        if (event.target === compareModal) closeCompareModal();
    };
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.style.display === 'block') closeModal();
    });

    renderTable(window.courseData);
    initCharts(window.courseData);
});
