document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const tierFilter = document.getElementById('tierFilter');
    const modalityFilter = document.getElementById('modalityFilter');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    
    // Telemetry Elements
    const totalCount = document.getElementById('totalCount');
    const tier1Count = document.getElementById('tier1Count');
    const onlineCount = document.getElementById('onlineCount');
    
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

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    function initCharts(data) {
        const countsByTier = { 1: 0, 2: 0, 3: 0 };
        const countsByAccreditation = { 'AACSB': 0, 'ACBSP': 0, 'Other': 0 };
        let onlineTally = 0;

        data.forEach(item => {
            countsByTier[item.tier] = (countsByTier[item.tier] || 0) + 1;
            if(item.modality.includes('Online') || item.modality.includes('Remote')) onlineTally++;
            if(item.accreditation.includes('AACSB')) countsByAccreditation['AACSB']++;
            else if(item.accreditation.includes('ACBSP')) countsByAccreditation['ACBSP']++;
            else countsByAccreditation['Other']++;
        });

        if(totalCount) totalCount.textContent = data.length;
        if(tier1Count) tier1Count.textContent = countsByTier[1];
        if(onlineCount) onlineCount.textContent = onlineTally;

        const ctxTier = document.getElementById('tierChart').getContext('2d');
        if(tierChartInstance) tierChartInstance.destroy();
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
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' }
        });

        const ctxAcc = document.getElementById('accreditationChart').getContext('2d');
        if(accChartInstance) accChartInstance.destroy();
        accChartInstance = new Chart(ctxAcc, {
            type: 'bar',
            data: {
                labels: ['AACSB', 'ACBSP', 'Other'],
                datasets: [{
                    label: 'Universities',
                    data: [countsByAccreditation['AACSB'], countsByAccreditation['ACBSP'], countsByAccreditation['Other']],
                    backgroundColor: ['#00f0ff', '#ff6b00', '#94a3b8'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });
    }

    function renderMatchScore(score) {
        let badgeClass = 'score-low';
        let fillClass = 'fill-low';
        if (score >= 90) { badgeClass = 'score-high'; fillClass = 'fill-high'; }
        else if (score >= 80) { badgeClass = 'score-med'; fillClass = 'fill-med'; }

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
        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 60px; color: #94a3b8;">No transfer candidates found aligning with parameters.</td></tr>`;
            return;
        }
        data.forEach(item => {
            const isChecked = selectedSchools.includes(item.institution) ? 'checked' : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="tier-badge tier-${item.tier}">Tier ${item.tier}</span></td>
                <td><strong>${item.institution}</strong></td>
                <td><span style="color:#00f0ff">${item.course}</span></td>
                <td>${item.modality}</td>
                <td>${renderMatchScore(item.matchScore)}</td>
                <td>${item.credits}</td>
                <td><button class="view-btn" onclick="openModal('${item.institution}')">View Syllabus Analysis</button></td>
                <td>
                    <label class="checkbox-container">
                        <input type="checkbox" ${isChecked} onchange="toggleSchool('${item.institution}')">
                        <span class="checkmark"></span>
                    </label>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.toggleSchool = function(instName) {
        if (selectedSchools.includes(instName)) {
            selectedSchools = selectedSchools.filter(s => s !== instName);
        } else {
            if (selectedSchools.length >= 3) {
                alert("You can compare up to 3 institutions at once.");
                renderTable(getCurrentFilteredData()); // Uncheck the checkbox
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

    function exportToCsv() {
        const data = window.courseData; 
        if (!data || !data.length) return;
        
        const headers = ["Institution", "Course Code", "Modality", "Credits", "Accreditation", "Conviction Tier", "Term Availability", "Match Score (%)", "Estimated Tuition", "Official Catalog Quote", "OSU Syllabus Justification", "Direct Verification Tool"];
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        
        data.forEach(item => {
            let directUrl = (item.links && item.links.length > 1) ? item.links[1].url : item.links[0].url;
            const row = [
                `"${item.institution}"`,
                `"${item.course}"`,
                `"${item.modality}"`,
                `"${item.credits}"`,
                `"${item.accreditation}"`,
                `"${item.tier}"`,
                `"${item.availability}"`,
                `"${item.matchScore}"`,
                `"${item.tuitionEstimate || 'Variable - Check Catalog'}"`,
                `"${(item.catalogSnapshot || '').replace(/"/g, '""')}"`,
                `"${item.justification.replace(/"/g, '""')}"`,
                `"${directUrl}"`
            ];
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "OSU_MRKT496_Equivalency_Report_V9.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function sortData(data) {
        const { column, direction } = currentSort;
        return data.sort((a, b) => {
            let valA, valB;
            if (column === 'matchScore') { valA = a.matchScore; valB = b.matchScore; }
            else if (column === 'tier') { valA = a.tier; valB = b.tier; }
            else if (column === 'institution') { valA = a.institution.toLowerCase(); valB = b.institution.toLowerCase(); }
            else if (column === 'course') { valA = a.course.toLowerCase(); valB = b.course.toLowerCase(); }
            
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function getCurrentFilteredData() {
        const searchTerm = searchInput.value.toLowerCase();
        const tier = tierFilter.value;
        const modality = modalityFilter.value;

        let filtered = window.courseData.filter(item => {
            const matchesSearch = item.institution.toLowerCase().includes(searchTerm) || 
                                  item.course.toLowerCase().includes(searchTerm);
            const matchesTier = tier === 'all' || item.tier.toString() === tier;
            const matchesModality = modality === 'all' || item.modality.includes(modality);
            
            return matchesSearch && matchesTier && matchesModality;
        });

        return sortData(filtered);
    }

    function filterData() {
        const filtered = getCurrentFilteredData();
        renderTable(filtered);
    }

    // Sorting event listeners
    document.getElementById('sort-tier').addEventListener('click', () => handleSort('tier'));
    document.getElementById('sort-inst').addEventListener('click', () => handleSort('institution'));
    document.getElementById('sort-code').addEventListener('click', () => handleSort('course'));
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
    exportCsvBtn.addEventListener('click', exportToCsv);

    window.openModal = function(instName) {
        const course = window.courseData.find(c => c.institution === instName);
        if(!course) return;
        
        document.getElementById('modalTitle').textContent = course.institution;
        document.getElementById('modalCourse').textContent = course.course;
        document.getElementById('modalAvail').textContent = course.availability;
        document.getElementById('modalTuition').textContent = course.tuitionEstimate || "Contact for Quote";
        
        document.getElementById('modalQuote').innerHTML = course.catalogSnapshot || "Official course research catalog snapshot pending formal request.";

        let justHTML = course.justification
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
        
        // V7.0 Dynamic Navigation Instructions logic!
        const instructionsContainer = document.getElementById('dynamicInstructions');
        let instructionHTML = `<small style="color: var(--accent); letter-spacing: 1px; text-transform: uppercase; font-weight:700;"><span class="icon">🧭</span> Verification Routing Instructions</small>`;
        
        if (course.exact_link_found) {
            instructionHTML += `<p style="font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; margin-top: 8px;"><strong>Automated Deep-Link Secured:</strong> Click the primary <em>'View Direct Course Artifact'</em> link below to bypass the university directory. <br><br>If the requested syllabus (<strong>${course.course}</strong>) is locked behind a student firewall, use the secondary Department Domain link and contact an advisor directly with the catalog quote from the left.</p>`;
        } else {
            instructionHTML += `<p style="font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; margin-top: 8px;"><strong>Manual Navigation Required:</strong> Due to university firewall restrictions, an automated deep-link could not be established by the extractor.<br><br>1. Click <em>'Search Academic Catalog'</em> below.<br>2. Type <strong>${course.course}</strong> into the university's internal search bar.<br>3. Locate the official syllabus module to verify the methodologies quoted on the left.</p>`;
        }
        instructionsContainer.innerHTML = instructionHTML;

        // Populate Links
        const linkContainer = document.getElementById('dynamicLinkContainer');
        linkContainer.innerHTML = '';
        if(course.links && course.links.length > 0) {
            course.links.forEach((linkObj, index) => {
                const btn = document.createElement('a');
                btn.href = linkObj.url;
                btn.target = '_blank';
                btn.className = index === 0 ? 'action-btn primary-btn' : 'action-btn primary-btn secondary-btn';
                btn.style.width = '100%';
                btn.innerHTML = `<span class="btn-text">${linkObj.title}</span> <span class="arrow">↗</span>`;
                linkContainer.appendChild(btn);
            });
        }

        // V8.0 Petition Generator Logic
        generatePetitionBtn.onclick = () => {
            const cleanJustification = course.justification.replace(/\[.*?\]:/g, '').trim();
            const credits = course.credits.includes('Sem') ? '3-semester-credit / 45-contact-hour' : '4-quarter-credit / 40-contact-hour';
            const petitionText = `
I am respectfully requesting a reevaluation of ${course.course}: Marketing Research from ${course.institution} to fulfill my Oregon State University requirement for MRKT 496: Marketing Research Practicum. 

As outlined in the attached syllabus, this ${credits} course operates at the upper-division level within an ${course.accreditation}-accredited business school. I have specifically highlighted the major course project, which requires students to design an instrument, collect primary field data, and analyze the results—directly aligning with OSU’s requirement for 'practical experience in the collection, analysis, and interpretation of primary data.' 

Key Alignment Facts:
- Institution: ${course.institution}
- Course: ${course.course}
- Accreditation: ${course.accreditation}
- Credits: ${course.credits}
- Syllabus Justification: ${cleanJustification}

I believe this project satisfies the 75% content alignment requirement for a direct equivalency to MRKT 496.
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
        tierBadge.textContent = 'Tier ' + course.tier;
        tierBadge.className = 'tier-badge tier-' + course.tier;
        
        if(radarChartInstance) radarChartInstance.destroy();
        
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
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 12, family: 'Inter', weight: 'bold' } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            }
        });
        
        // V6.1 Scroll Lock
        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // V8.0 Comparison Logic
    compareBtn.onclick = () => {
        compareGrid.innerHTML = '';
        comparisonRadarInstances.forEach(chart => chart.destroy());
        comparisonRadarInstances = [];

        selectedSchools.forEach(instName => {
            const course = window.courseData.find(c => c.institution === instName);
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
                    <h3 style="margin: 10px 0 5px 0">${course.institution}</h3>
                    <p style="color:var(--secondary); font-weight:700;">${course.course}</p>
                </div>
                <div style="height: 200px; width: 100%;">
                    <canvas id="radar-${instName.replace(/\s+/g, '')}"></canvas>
                </div>
                <div style="font-size: 0.85rem; color: #cbd5e1; flex-grow: 1;">
                    <p><strong>OSU Fit:</strong> ${course.matchScore}%</p>
                    <p><strong>Est. Tuition:</strong> <span class="neon-green">${course.tuitionEstimate}</span></p>
                    <p style="margin-top:10px;">${course.justification}</p>
                </div>
                <button class="action-btn primary-btn secondary-btn" style="width:100%" onclick="openModal('${course.institution}')">Full Analysis</button>
            `;
            compareGrid.appendChild(card);

            const ctx = document.getElementById(`radar-${instName.replace(/\s+/g, '')}`).getContext('2d');
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
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            pointLabels: { display: true, font: { size: 10 } },
                            ticks: { display: false, max: 100 }
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
        document.body.style.overflow = 'auto'; // Re-enable background scrolling
        setTimeout(() => modal.style.display = 'none', 300);
    };

    closeBtn.onclick = closeModal;

    const closeCompareModal = () => {
        compareModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        setTimeout(() => compareModal.style.display = 'none', 300);
    };

    compareClose.onclick = closeCompareModal;
    window.onclick = (e) => { 
        if (e.target === modal) closeModal(); 
        if (e.target === compareModal) closeCompareModal(); 
    }
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modal.style.display === 'block') closeModal(); });

    // Initial Bootstrap
    renderTable(window.courseData);
    initCharts(window.courseData);
});
