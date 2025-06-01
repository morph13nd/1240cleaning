class ChoreManager {
    constructor() {
        // Initialize with proper data structure
        this.data = {
            metadata: {
                lastUpdated: new Date().toISOString(),
                version: "2.2",
                cycleNumber: 1,
                description: "Bi-weekly Shabbat cleaning",
                baseShabbatDate: "2025-05-30T18:00:00.000Z"
            },
            currentCycle: {},
            previousCycles: [],
            violations: [],
            people: ["Oliver", "Spencer", "Ben", "Isaac", "Jason", "Jonah", "Nahum", "Adam"],
            chores: [
                "Second-floor bathroom, mop floor & toilet",
                "Ground-floor washing sink",
                "Sweep kitchen",
                "Sweep living room",
                "Ground-floor bathroom & toilet",
                "Recycling and trash disposal (out by Thursday night)",
                "Vacuum kitchen",
                "Vacuum living room",
                "Mop down kitchen",
                "Kitchen & dining-room tables: cloth replacement & wipe-down",
                "Replace foil in cooking stove",
                "Wipe down kitchen stove, knobs, and surfaces",
                "Wipe down kitchen countertops",
                "General tidy-up of common spaces",
                "Vacuum stairs",
                "Hefker sweep ground floor living room - clean up items and trash"
            ],
            settings: {
                cycleLength: 14,
                minChoresPerPerson: 2,
                maxChoresPerPerson: 3,
                cycleStartDay: "Tuesday",
                deadlineDay: "Friday",
                timezone: "America/New_York"
            },
            statistics: {}
        };
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupEventListeners();
        this.render();
    }

    async loadInitialData() {
        try {
            const response = await fetch('current-chore-data.json');
            if (response.ok) {
                const data = await response.json();
                this.data = {
                    ...this.data,
                    ...data,
                    previousCycles: data.previousCycles || [],
                    violations: data.violations || []
                };
            }
        } catch (error) {
            console.log('Using default data structure');
        }
        this.updateStatistics();
    }

    // FIXED: Base date calculation for 2-week cycles from May 30, 2025
    getBaseShabbatDate() {
        return new Date('2025-05-30T18:00:00.000Z');
    }

    calculateCycleDates(cycleNumber) {
        const baseDate = this.getBaseShabbatDate();
        const weeksFromBase = (cycleNumber - 1) * 2; // Every 2 weeks
        
        // Calculate start date (Tuesday before Shabbat)
        const startDate = new Date(baseDate);
        startDate.setDate(baseDate.getDate() + (weeksFromBase * 7) - 3);
        
        // Calculate end date (Friday - Shabbat start)
        const endDate = new Date(baseDate);
        endDate.setDate(baseDate.getDate() + (weeksFromBase * 7));
        
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }

    // FIXED: Generate new cycle with proper date calculation
    generateNewCycle() {
        if (!Array.isArray(this.data.previousCycles)) {
            this.data.previousCycles = [];
        }
        
        // Archive current cycle
        if (Object.keys(this.data.currentCycle).length > 0) {
            this.data.previousCycles.push(this.data.currentCycle);
        }

        const cycleNumber = this.data.metadata.cycleNumber || 1;
        const dates = this.calculateCycleDates(cycleNumber);

        // Generate new assignments avoiding previous chores
        const newAssignments = this.generateAssignments();

        this.data.currentCycle = {
            id: Date.now(),
            startDate: dates.startDate,
            endDate: dates.endDate,
            assignments: newAssignments,
            completions: this.createBlankCompletions(newAssignments),
            created: new Date().toISOString(),
            cycleNumber: cycleNumber
        };

        this.data.metadata.cycleNumber = cycleNumber + 1;
        this.data.metadata.lastUpdated = new Date().toISOString();
        
        this.updateStatistics();
        this.saveToLocalStorage();
        this.render();
    }

    generateAssignments() {
        const assignments = [];
        const lastCycleAssignments = this.getLastCycleAssignments();
        
        this.data.people.forEach(person => {
            const previousChores = lastCycleAssignments
                .filter(a => a.person === person)
                .map(a => a.chore);
            
            const availableChores = this.data.chores.filter(chore => 
                !previousChores.includes(chore)
            );
            
            // Assign 2 chores per person
            const shuffled = availableChores.sort(() => 0.5 - Math.random());
            for (let i = 0; i < 2 && i < shuffled.length; i++) {
                assignments.push({
                    person: person,
                    chore: shuffled[i]
                });
            }
        });
        
        return assignments;
    }

    getLastCycleAssignments() {
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            return this.data.currentCycle.assignments;
        }
        return [];
    }

    createBlankCompletions(assignments) {
        const completions = {};
        assignments.forEach(assignment => {
            const key = `${assignment.person}-${assignment.chore}`;
            completions[key] = false;
        });
        return completions;
    }

    // FIXED: Violation management
    addViolation(person, chore) {
        if (!person || !chore) return;
        
        const newViolation = {
            id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            person,
            chore,
            timestamp: new Date().toISOString(),
            resolved: false
        };
        
        if (!Array.isArray(this.data.violations)) {
            this.data.violations = [];
        }
        
        this.data.violations.push(newViolation);
        this.updateStatistics();
        this.saveToLocalStorage();
        this.render();
    }

    removeViolation(violationId) {
        this.data.violations = this.data.violations.filter(v => v.id !== violationId);
        this.updateStatistics();
        this.saveToLocalStorage();
        this.render();
    }

    // Statistics and display methods
    updateStatistics() {
        const stats = {};
        
        this.data.people.forEach(person => {
            const personViolations = this.data.violations.filter(v => v.person === person);
            const totalAssignments = this.getTotalAssignments(person);
            const completedAssignments = this.getCompletedAssignments(person);
            
            stats[person] = {
                violations: personViolations.length,
                completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) : 0,
                activeViolations: personViolations.filter(v => !v.resolved).length
            };
        });
        
        this.data.statistics = stats;
    }

    getTotalAssignments(person) {
        let total = 0;
        if (this.data.currentCycle.assignments) {
            total += this.data.currentCycle.assignments.filter(a => a.person === person).length;
        }
        this.data.previousCycles.forEach(cycle => {
            if (cycle.assignments) {
                total += cycle.assignments.filter(a => a.person === person).length;
            }
        });
        return total;
    }

    getCompletedAssignments(person) {
        let completed = 0;
        if (this.data.currentCycle.completions) {
            Object.entries(this.data.currentCycle.completions).forEach(([key, value]) => {
                if (key.startsWith(person + '-') && value === true) {
                    completed++;
                }
            });
        }
        this.data.previousCycles.forEach(cycle => {
            if (cycle.completions) {
                Object.entries(cycle.completions).forEach(([key, value]) => {
                    if (key.startsWith(person + '-') && value === true) {
                        completed++;
                    }
                });
            }
        });
        return completed;
    }

    // Data persistence
    saveToLocalStorage() {
        localStorage.setItem('choreManagerData', JSON.stringify(this.data));
    }

    // Export/Import functionality
    handleExport() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chore-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    updateGitHubFile() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "current-chore-data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.data = {
                    ...this.data,
                    ...importedData,
                    previousCycles: importedData.previousCycles || [],
                    violations: importedData.violations || []
                };
                this.updateStatistics();
                this.render();
                this.saveToLocalStorage();
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // UI Rendering
    render() {
        this.renderCurrentCycle();
        this.renderViolations();
        this.renderStatistics();
        this.renderHistory();
    }

    renderCurrentCycle() {
        const cycleEl = document.getElementById('currentCycle');
        if (!cycleEl) return;
        
        const currentCycle = this.data.currentCycle;
        if (!currentCycle.assignments) {
            cycleEl.innerHTML = '<p>No current cycle. Generate a new cycle to begin.</p>';
            return;
        }

        const startDate = new Date(currentCycle.startDate).toLocaleDateString();
        const endDate = new Date(currentCycle.endDate).toLocaleDateString();

        let html = `
            <h3>Current Cycle: ${startDate} - ${endDate}</h3>
            <div class="assignments-grid">
        `;

        this.data.people.forEach(person => {
            const personChores = currentCycle.assignments.filter(a => a.person === person);
            html += `
                <div class="person-card">
                    <h4>${person}</h4>
                    <ul>
            `;
            personChores.forEach(assignment => {
                const completionKey = `${assignment.person}-${assignment.chore}`;
                const isCompleted = currentCycle.completions[completionKey];
                html += `
                    <li class="${isCompleted ? 'completed' : 'pending'}">
                        ${assignment.chore}
                        <button onclick="choreManager.toggleCompletion('${completionKey}')">
                            ${isCompleted ? 'Undo' : 'Done'}
                        </button>
                    </li>
                `;
            });
            html += '</ul></div>';
        });

        html += '</div>';
        cycleEl.innerHTML = html;
    }

    toggleCompletion(completionKey) {
        if (this.data.currentCycle.completions) {
            this.data.currentCycle.completions[completionKey] = !this.data.currentCycle.completions[completionKey];
            this.updateStatistics();
            this.saveToLocalStorage();
            this.render();
        }
    }

    renderViolations() {
        const violationsEl = document.getElementById('violations');
        if (!violationsEl) return;

        let html = `
            <h3>⚠️ Violations</h3>
            <div class="violation-controls">
                <select id="violationPerson">
                    <option value="">Select Person</option>
                    ${this.data.people.map(person => `<option value="${person}">${person}</option>`).join('')}
                </select>
                <select id="violationChore">
                    <option value="">Select Chore</option>
                    ${this.data.chores.map(chore => `<option value="${chore}">${chore}</option>`).join('')}
                </select>
                <button onclick="choreManager.addViolationFromUI()">Add Violation</button>
            </div>
            <div class="violations-list">
        `;

        this.data.violations.forEach(violation => {
            const date = new Date(violation.timestamp).toLocaleDateString();
            html += `
                <div class="violation-item">
                    <span><strong>${violation.person}</strong>: ${violation.chore}</span>
                    <span class="violation-date">${date}</span>
                    <button onclick="choreManager.removeViolation('${violation.id}')">Remove</button>
                </div>
            `;
        });

        html += '</div>';
        violationsEl.innerHTML = html;
    }

    addViolationFromUI() {
        const personEl = document.getElementById('violationPerson');
        const choreEl = document.getElementById('violationChore');
        
        if (personEl.value && choreEl.value) {
            this.addViolation(personEl.value, choreEl.value);
            personEl.value = '';
            choreEl.value = '';
        }
    }

    renderStatistics() {
        const statsEl = document.getElementById('statistics');
        if (!statsEl) return;

        let html = '<h3>📊 Statistics</h3><div class="stats-grid">';
        
        Object.entries(this.data.statistics).forEach(([person, stats]) => {
            html += `
                <div class="stat-card">
                    <h4>${person}</h4>
                    <p>Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%</p>
                    <p>Total Violations: ${stats.violations}</p>
                    <p>Active Violations: ${stats.activeViolations}</p>
                </div>
            `;
        });

        html += '</div>';
        statsEl.innerHTML = html;
    }

    renderHistory() {
        const historyEl = document.getElementById('history');
        if (!historyEl) return;

        let html = '<h3>🕰️ Previous Cycles</h3>';
        
        this.data.previousCycles.forEach((cycle, index) => {
            const startDate = new Date(cycle.startDate).toLocaleDateString();
            const endDate = new Date(cycle.endDate).toLocaleDateString();
            
            html += `
                <div class="history-cycle">
                    <h4>Cycle ${cycle.cycleNumber || index + 1}: ${startDate} - ${endDate}</h4>
                </div>
            `;
        });

        historyEl.innerHTML = html;
    }

    // Event listeners
    setupEventListeners() {
        // Generate cycle button
        const generateBtn = document.getElementById('generateCycle');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateNewCycle());
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }

        // GitHub button
        const githubBtn = document.getElementById('githubBtn');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => this.updateGitHubFile());
        }

        // Import button
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('change', (e) => this.handleImport(e));
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.choreManager = new ChoreManager();
});