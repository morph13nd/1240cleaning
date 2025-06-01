class ChoreManager {
    constructor() {
        this.data = this.getDefaultData();
        this.chart = null;
        this.init();
    }

    getDefaultData() {
        return {
            metadata: {
                lastUpdated: new Date().toISOString(),
                version: "2.1",
                cycleNumber: 1,
                description: "Bi-weekly chore assignments for Shabbat cleanup"
            },
            currentCycle: {},
            previousCycles: [], // FIXED: Initialize as empty array
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
            statistics: {
                totalCycles: 0,
                totalViolations: 0,
                completionRates: {}
            }
        };
    }

    async init() {
        console.log('Initializing ChoreManager...');
        await this.loadInitialData();
        this.setupEventListeners();
        this.hideLoading();
        this.renderAll();
    }

    async loadInitialData() {
        try {
            const response = await fetch('./current-chore-data.json');
            if (response.ok) {
                const loadedData = await response.json();
                this.data = { ...this.getDefaultData(), ...loadedData };
                // Ensure arrays are properly initialized
                if (!Array.isArray(this.data.previousCycles)) {
                    this.data.previousCycles = [];
                }
                if (!Array.isArray(this.data.violations)) {
                    this.data.violations = [];
                }
                console.log('Data loaded from GitHub file:', this.data);
            }
        } catch (error) {
            console.log('No GitHub file found, using default data');
        }
    }

    setupEventListeners() {
        // Generate new cycle
        document.getElementById('generateCycleBtn').addEventListener('click', () => {
            this.generateNewCycle();
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData('chore-data');
        });

        // GitHub export
        document.getElementById('githubExportBtn').addEventListener('click', () => {
            this.exportData('current-chore-data');
        });

        // Import data
        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Add violation
        document.getElementById('addViolationBtn').addEventListener('click', () => {
            this.addViolation();
        });

        // Set default violation date to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('violationDateInput').value = now.toISOString().slice(0, 16);
    }

    generateNewCycle() {
        console.log('Generating new cycle...');
        
        // Archive current cycle if it exists
        if (this.data.currentCycle && Object.keys(this.data.currentCycle).length > 0) {
            // Ensure previousCycles is initialized
            if (!Array.isArray(this.data.previousCycles)) {
                this.data.previousCycles = [];
            }
            this.data.previousCycles.push(this.data.currentCycle);
            console.log('Archived current cycle');
        }

        // Calculate next cycle dates (bi-weekly from today)
        const now = new Date();
        const nextTuesday = this.getNextTuesday(now);
        const nextFriday = new Date(nextTuesday);
        nextFriday.setDate(nextFriday.getDate() + 3);

        // Generate new assignments
        const assignments = this.generateAssignments();
        
        // Create new cycle
        this.data.currentCycle = {
            id: Date.now(),
            startDate: nextTuesday.toISOString(),
            endDate: nextFriday.toISOString(),
            assignments: assignments,
            completions: this.createCompletionsObject(assignments),
            created: new Date().toISOString()
        };

        // Update metadata
        this.data.metadata.cycleNumber = (this.data.previousCycles.length || 0) + 1;
        this.data.metadata.lastUpdated = new Date().toISOString();
        this.data.statistics.totalCycles = this.data.metadata.cycleNumber;

        console.log('New cycle generated:', this.data.currentCycle);
        this.renderAll();
    }

    getNextTuesday(fromDate) {
        const date = new Date(fromDate);
        const dayOfWeek = date.getDay();
        const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
        if (daysUntilTuesday === 0 && date.getHours() >= 12) {
            // If it's Tuesday afternoon, get next Tuesday
            date.setDate(date.getDate() + 7);
        } else {
            date.setDate(date.getDate() + daysUntilTuesday);
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }

    generateAssignments() {
        const assignments = [];
        const lastCycleAssignments = this.getLastCycleAssignments();
        
        this.data.people.forEach(person => {
            const lastChores = lastCycleAssignments
                .filter(a => a.person === person)
                .map(a => a.chore);
            
            // Get available chores (not done last cycle)
            const availableChores = this.data.chores.filter(chore => 
                !lastChores.includes(chore)
            );
            
            // Randomly assign 2 chores
            const assignedChores = this.getRandomChores(availableChores, 2);
            assignedChores.forEach(chore => {
                assignments.push({ person, chore });
            });
        });

        return assignments;
    }

    getLastCycleAssignments() {
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            return this.data.currentCycle.assignments;
        }
        return [];
    }

    getRandomChores(chores, count) {
        const shuffled = [...chores].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    createCompletionsObject(assignments) {
        const completions = {};
        assignments.forEach(assignment => {
            const key = `${assignment.person}-${assignment.chore}`;
            completions[key] = false;
        });
        return completions;
    }

    // VIOLATION MANAGEMENT - FIXED
    addViolation() {
        const person = document.getElementById('violationPersonSelect').value;
        const chore = document.getElementById('violationChoreInput').value.trim();
        const timestamp = document.getElementById('violationDateInput').value;

        if (!person || !chore || !timestamp) {
            alert('Please fill in all violation fields');
            return;
        }

        const violation = {
            id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            person: person,
            chore: chore,
            cycleId: this.data.currentCycle.id || 'unknown',
            timestamp: new Date(timestamp).toISOString(),
            resolved: false
        };

        // Ensure violations array exists
        if (!Array.isArray(this.data.violations)) {
            this.data.violations = [];
        }

        this.data.violations.push(violation);
        this.data.statistics.totalViolations = this.data.violations.length;
        this.data.metadata.lastUpdated = new Date().toISOString();

        // Clear form
        document.getElementById('violationPersonSelect').value = '';
        document.getElementById('violationChoreInput').value = '';
        
        console.log('Added violation:', violation);
        this.renderAll();
    }

    removeViolation(violationId) {
        if (!Array.isArray(this.data.violations)) {
            this.data.violations = [];
            return;
        }

        this.data.violations = this.data.violations.filter(v => v.id !== violationId);
        this.data.statistics.totalViolations = this.data.violations.length;
        this.data.metadata.lastUpdated = new Date().toISOString();
        
        console.log('Removed violation:', violationId);
        this.renderAll();
    }

    // IMPORT/EXPORT - FIXED
    exportData(filename = 'chore-data') {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('Exported data:', filename);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Merge with default structure to ensure all properties exist
                this.data = { ...this.getDefaultData(), ...importedData };
                
                // Ensure arrays are properly initialized
                if (!Array.isArray(this.data.previousCycles)) {
                    this.data.previousCycles = [];
                }
                if (!Array.isArray(this.data.violations)) {
                    this.data.violations = [];
                }
                
                console.log('Imported data:', this.data);
                this.renderAll();
                
                // Clear the file input
                event.target.value = '';
                
            } catch (error) {
                alert('Error importing file: ' + error.message);
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    // RENDERING METHODS
    renderAll() {
        this.renderStatistics();
        this.renderCurrentCycle();
        this.renderViolations();
        this.renderPreviousCycles();
        this.populateViolationForm();
    }

    renderStatistics() {
        this.calculateStatistics();
        this.renderChart();
        this.renderQuickStats();
        this.renderActiveViolations();
    }

    calculateStatistics() {
        // Calculate completion rates
        const rates = {};
        this.data.people.forEach(person => {
            rates[person] = this.calculatePersonCompletionRate(person);
        });
        this.data.statistics.completionRates = rates;
    }

    calculatePersonCompletionRate(person) {
        let totalAssignments = 0;
        let completedAssignments = 0;

        // Current cycle
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            const currentAssignments = this.data.currentCycle.assignments.filter(a => a.person === person);
            totalAssignments += currentAssignments.length;
            
            currentAssignments.forEach(assignment => {
                const key = `${assignment.person}-${assignment.chore}`;
                if (this.data.currentCycle.completions && this.data.currentCycle.completions[key]) {
                    completedAssignments++;
                }
            });
        }

        // Previous cycles
        if (Array.isArray(this.data.previousCycles)) {
            this.data.previousCycles.forEach(cycle => {
                if (cycle.assignments) {
                    const assignments = cycle.assignments.filter(a => a.person === person);
                    totalAssignments += assignments.length;
                    
                    assignments.forEach(assignment => {
                        const key = `${assignment.person}-${assignment.chore}`;
                        if (cycle.completions && cycle.completions[key]) {
                            completedAssignments++;
                        }
                    });
                }
            });
        }

        return totalAssignments > 0 ? (completedAssignments / totalAssignments) : 1;
    }

    renderChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const rates = this.data.statistics.completionRates || {};
        const labels = Object.keys(rates);
        const data = Object.values(rates).map(rate => (rate * 100).toFixed(1));

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: data,
                    backgroundColor: labels.map(label => {
                        const rate = rates[label];
                        if (rate >= 0.9) return '#28a745';
                        if (rate >= 0.7) return '#ffc107';
                        return '#dc3545';
                    }),
                    borderColor: '#333',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderQuickStats() {
        const totalViolations = this.data.violations ? this.data.violations.length : 0;
        const activeViolations = this.data.violations ? 
            this.data.violations.filter(v => !v.resolved).length : 0;
        
        const html = `
            <div class="stat-item">
                <span class="stat-label">Total Cycles:</span>
                <span class="stat-value">${this.data.statistics.totalCycles || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Active Violations:</span>
                <span class="stat-value violation-count">${activeViolations}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Violations:</span>
                <span class="stat-value">${totalViolations}</span>
            </div>
        `;
        
        document.getElementById('quickStats').innerHTML = html;
    }

    renderActiveViolations() {
        const activeViolations = this.data.violations ? 
            this.data.violations.filter(v => !v.resolved) : [];
        
        if (activeViolations.length === 0) {
            document.getElementById('activeViolations').innerHTML = '<p class="no-violations">No active violations 🎉</p>';
            return;
        }

        const html = activeViolations.map(violation => `
            <div class="violation-item">
                <strong>${violation.person}</strong><br>
                ${violation.chore}<br>
                <small>${new Date(violation.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
        
        document.getElementById('activeViolations').innerHTML = html;
    }

    renderCurrentCycle() {
        if (!this.data.currentCycle || !this.data.currentCycle.assignments) {
            document.getElementById('cycleDates').innerHTML = '<p>No current cycle. Generate a new cycle to get started.</p>';
            document.getElementById('currentAssignments').innerHTML = '';
            return;
        }

        // Render cycle dates
        const startDate = new Date(this.data.currentCycle.startDate).toLocaleDateString();
        const endDate = new Date(this.data.currentCycle.endDate).toLocaleDateString();
        document.getElementById('cycleDates').innerHTML = `
            <p><strong>Cycle ${this.data.metadata.cycleNumber}:</strong> ${startDate} - ${endDate}</p>
        `;

        // Group assignments by person
        const assignmentsByPerson = {};
        this.data.currentCycle.assignments.forEach(assignment => {
            if (!assignmentsByPerson[assignment.person]) {
                assignmentsByPerson[assignment.person] = [];
            }
            assignmentsByPerson[assignment.person].push(assignment);
        });

        // Render assignments
        const html = Object.entries(assignmentsByPerson).map(([person, assignments]) => {
            const choresList = assignments.map(assignment => {
                const key = `${assignment.person}-${assignment.chore}`;
                const completed = this.data.currentCycle.completions && this.data.currentCycle.completions[key];
                const completedClass = completed ? 'completed' : '';
                
                return `
                    <div class="chore-item ${completedClass}">
                        <input type="checkbox" 
                               id="${key}" 
                               ${completed ? 'checked' : ''}
                               onchange="choreManager.toggleChoreCompletion('${key}')">
                        <label for="${key}">${assignment.chore}</label>
                    </div>
                `;
            }).join('');

            return `
                <div class="person-assignments">
                    <h3>${person}</h3>
                    <div class="chores-list">
                        ${choresList}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('currentAssignments').innerHTML = html;
    }

    toggleChoreCompletion(key) {
        if (!this.data.currentCycle.completions) {
            this.data.currentCycle.completions = {};
        }
        
        this.data.currentCycle.completions[key] = !this.data.currentCycle.completions[key];
        this.data.metadata.lastUpdated = new Date().toISOString();
        
        console.log('Toggled completion for:', key, this.data.currentCycle.completions[key]);
        this.renderStatistics(); // Update stats
    }

    renderViolations() {
        this.renderViolationsList();
    }

    renderViolationsList() {
        if (!Array.isArray(this.data.violations) || this.data.violations.length === 0) {
            document.getElementById('violationsList').innerHTML = '<p>No violations recorded.</p>';
            return;
        }

        const html = this.data.violations.map(violation => `
            <div class="violation-item">
                <div class="violation-info">
                    <strong>${violation.person}</strong> - ${violation.chore}<br>
                    <small>Date: ${new Date(violation.timestamp).toLocaleString()}</small><br>
                    <small>Cycle ID: ${violation.cycleId}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="choreManager.removeViolation('${violation.id}')">
                    Remove
                </button>
            </div>
        `).join('');
        
        document.getElementById('violationsList').innerHTML = html;
    }

    renderPreviousCycles() {
        if (!Array.isArray(this.data.previousCycles) || this.data.previousCycles.length === 0) {
            document.getElementById('previousCycles').innerHTML = '<p>No previous cycles.</p>';
            return;
        }

        const html = this.data.previousCycles.reverse().map((cycle, index) => {
            const startDate = new Date(cycle.startDate).toLocaleDateString();
            const endDate = new Date(cycle.endDate).toLocaleDateString();
            const totalAssignments = cycle.assignments ? cycle.assignments.length : 0;
            const completedAssignments = cycle.completions ? 
                Object.values(cycle.completions).filter(c => c).length : 0;
            
            return `
                <div class="cycle-summary">
                    <h4>Cycle ${this.data.previousCycles.length - index} (${startDate} - ${endDate})</h4>
                    <p>Completed: ${completedAssignments}/${totalAssignments} assignments</p>
                </div>
            `;
        }).join('');
        
        document.getElementById('previousCycles').innerHTML = html;
    }

    populateViolationForm() {
        const select = document.getElementById('violationPersonSelect');
        select.innerHTML = '<option value="">Select Person</option>';
        
        this.data.people.forEach(person => {
            const option = document.createElement('option');
            option.value = person;
            option.textContent = person;
            select.appendChild(option);
        });
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.choreManager = new ChoreManager();
});

// Global function for checkbox changes (needed for inline onclick)
function toggleChoreCompletion(key) {
    if (window.choreManager) {
        window.choreManager.toggleChoreCompletion(key);
    }
}