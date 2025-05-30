// Bi-Weekly Chore Management Application
class ChoreManager {
    constructor() {
        this.currentDate = new Date('2025-05-30');
        this.nextCycleStart = new Date('2025-06-10');
        this.nextCycleDeadline = new Date('2025-06-13');
        
        this.people = ["Oliver", "Spencer", "Ben", "Isaac", "Jason", "Jonah", "Nahum", "Adam"];
        this.chores = [
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
            "Bless the home with one Psalm of choice", 
            "Vacuum stairs",
            "Hefker sweep ground floor living room - clean up items and trash"
        ];

        this.data = {
            cycles: [],
            violations: [],
            currentCycle: null,
            completions: {},
            settings: {
                cycleLength: 14 // days
            }
        };

        this.dbName = 'ChoreManagerDB';
        this.dbVersion = 1;
        this.db = null;

        this.init();
    }

    async init() {
        await this.initDB();
        await this.loadData();
        await this.tryLoadFromGitHub();
        this.setupEventListeners();
        this.updateUI();
        // Initialize violation selects immediately
        this.updateViolationSelects();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('choreData')) {
                    db.createObjectStore('choreData', { keyPath: 'id' });
                }
            };
        });
    }

    async saveData() {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['choreData'], 'readwrite');
        const store = transaction.objectStore('choreData');
        
        await store.put({
            id: 'main',
            data: this.data,
            lastUpdated: new Date().toISOString()
        });
    }

    async loadData() {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['choreData'], 'readonly');
        const store = transaction.objectStore('choreData');
        const request = store.get('main');
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                if (request.result) {
                    this.data = { ...this.data, ...request.result.data };
                }
                resolve();
            };
            request.onerror = () => resolve();
        });
    }

    async tryLoadFromGitHub() {
        try {
            // Try to fetch current-chore-data.json from GitHub
            const response = await fetch('./current-chore-data.json');
            if (response.ok) {
                const githubData = await response.json();
                if (githubData.currentCycle) {
                    this.data.currentCycle = githubData.currentCycle;
                    this.data.completions = githubData.completions || {};
                }
            }
        } catch (error) {
            console.log('GitHub data not available, using local data');
        }
    }

    setupEventListeners() {
        document.getElementById('generateCycleBtn').addEventListener('click', () => this.generateNewCycle());
        document.getElementById('addViolationBtn').addEventListener('click', () => this.addViolation());
        document.getElementById('removeViolationBtn').addEventListener('click', () => this.removeViolation());
        document.getElementById('toggleFutureCycles').addEventListener('click', () => this.toggleFutureCycles());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleFileImport(e));
        document.getElementById('generateGithubFileBtn').addEventListener('click', () => this.generateGitHubFile());
    }

    calculateDaysRemaining() {
        const today = this.currentDate;
        const nextCycle = this.nextCycleStart;
        const diffTime = nextCycle - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    generateNewCycle() {
        const button = document.getElementById('generateCycleBtn');
        button.classList.add('loading');
        button.disabled = true;

        setTimeout(() => {
            const assignments = this.generateAssignments();
            const cycleId = Date.now();
            
            const newCycle = {
                id: cycleId,
                startDate: new Date(this.nextCycleStart),
                endDate: new Date(this.nextCycleDeadline),
                assignments: assignments,
                created: new Date().toISOString()
            };

            this.data.currentCycle = newCycle;
            this.data.cycles.push(newCycle);
            this.data.completions[cycleId] = {};

            // Initialize completion status
            assignments.forEach(assignment => {
                this.data.completions[cycleId][`${assignment.person}-${assignment.chore}`] = false;
            });

            this.saveData();
            this.updateAssignmentsDisplay();
            this.updateViolationSelects();
            this.updateStatistics();

            button.classList.remove('loading');
            button.disabled = false;
        }, 300);
    }

    generateAssignments() {
        const assignments = [];
        const peopleChores = {};
        const choreAssignments = {};

        // Initialize tracking
        this.people.forEach(person => {
            peopleChores[person] = [];
        });

        // Get previous cycle assignments to avoid repeats
        const previousAssignments = this.getPreviousAssignments();

        // Shuffle chores for random assignment
        const shuffledChores = [...this.chores].sort(() => Math.random() - 0.5);
        const shuffledPeople = [...this.people].sort(() => Math.random() - 0.5);

        // Assign chores ensuring each person gets at least 2 chores
        let personIndex = 0;
        
        shuffledChores.forEach(chore => {
            let assigned = false;
            let attempts = 0;
            
            while (!assigned && attempts < this.people.length) {
                const person = shuffledPeople[personIndex % this.people.length];
                
                // Check if person had this chore last cycle
                const hadLastCycle = previousAssignments.some(prev => 
                    prev.person === person && prev.chore === chore
                );

                if (!hadLastCycle || attempts >= this.people.length - 1) {
                    assignments.push({ person, chore });
                    peopleChores[person].push(chore);
                    choreAssignments[chore] = person;
                    assigned = true;
                }
                
                personIndex++;
                attempts++;
            }
        });

        // Ensure everyone has at least 2 chores
        this.people.forEach(person => {
            while (peopleChores[person].length < 2) {
                // Find unassigned or reassignable chores
                const availableChores = this.chores.filter(chore => {
                    const currentAssignee = choreAssignments[chore];
                    return !currentAssignee || peopleChores[currentAssignee].length > 2;
                });

                if (availableChores.length > 0) {
                    const chore = availableChores[Math.floor(Math.random() * availableChores.length)];
                    const previousAssignee = choreAssignments[chore];
                    
                    if (previousAssignee) {
                        // Remove from previous assignee
                        peopleChores[previousAssignee] = peopleChores[previousAssignee].filter(c => c !== chore);
                        assignments.splice(assignments.findIndex(a => a.person === previousAssignee && a.chore === chore), 1);
                    }
                    
                    // Assign to current person
                    assignments.push({ person, chore });
                    peopleChores[person].push(chore);
                    choreAssignments[chore] = person;
                }
            }
        });

        return assignments.sort((a, b) => a.person.localeCompare(b.person));
    }

    getPreviousAssignments() {
        if (this.data.cycles.length === 0) return [];
        const lastCycle = this.data.cycles[this.data.cycles.length - 1];
        return lastCycle.assignments || [];
    }

    updateAssignmentsDisplay() {
        const container = document.getElementById('assignmentsTable');
        
        if (!this.data.currentCycle) {
            container.innerHTML = '<div class="status status--warning">No assignments generated yet. Click "Generate New Cycle" to start.</div>';
            return;
        }

        const assignments = this.data.currentCycle.assignments;
        const cycleId = this.data.currentCycle.id;
        
        let html = `
            <div class="assignments-grid">
                <div>Person</div>
                <div>Chore</div>
                <div>Status</div>
            </div>
        `;

        assignments.forEach(assignment => {
            const completionKey = `${assignment.person}-${assignment.chore}`;
            const isCompleted = this.data.completions[cycleId]?.[completionKey] || false;
            
            html += `
                <div class="assignments-grid">
                    <div class="person-name">${assignment.person}</div>
                    <div class="chore-text">${assignment.chore}</div>
                    <div class="completion-checkbox">
                        <input type="checkbox" id="completion-${completionKey.replace(/[^a-zA-Z0-9]/g, '')}" 
                               ${isCompleted ? 'checked' : ''}
                               data-cycle-id="${cycleId}" data-completion-key="${completionKey}">
                        <label for="completion-${completionKey.replace(/[^a-zA-Z0-9]/g, '')}">
                            ${isCompleted ? '<span class="status status--success">Complete</span>' : '<span class="status status--warning">Pending</span>'}
                        </label>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners to checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const cycleId = e.target.dataset.cycleId;
                const completionKey = e.target.dataset.completionKey;
                this.toggleCompletion(cycleId, completionKey);
            });
        });
    }

    toggleCompletion(cycleId, completionKey) {
        if (!this.data.completions[cycleId]) {
            this.data.completions[cycleId] = {};
        }
        
        this.data.completions[cycleId][completionKey] = !this.data.completions[cycleId][completionKey];
        this.saveData();
        
        // Update just the label instead of redrawing entire table
        const checkbox = document.querySelector(`input[data-completion-key="${completionKey}"]`);
        if (checkbox) {
            const label = checkbox.nextElementSibling;
            const isCompleted = this.data.completions[cycleId][completionKey];
            label.innerHTML = isCompleted ? 
                '<span class="status status--success">Complete</span>' : 
                '<span class="status status--warning">Pending</span>';
        }
        
        this.updateStatistics();
    }

    updateViolationSelects() {
        const personSelect = document.getElementById('violationPerson');
        const choreSelect = document.getElementById('violationChore');

        // Update person select
        personSelect.innerHTML = '<option value="">Select person...</option>';
        this.people.forEach(person => {
            personSelect.innerHTML += `<option value="${person}">${person}</option>`;
        });

        // Update chore select with current assignments or all chores if no current cycle
        choreSelect.innerHTML = '<option value="">Select chore...</option>';
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            this.data.currentCycle.assignments.forEach(assignment => {
                choreSelect.innerHTML += `<option value="${assignment.chore}">${assignment.chore}</option>`;
            });
        } else {
            // Show all chores if no current cycle
            this.chores.forEach(chore => {
                choreSelect.innerHTML += `<option value="${chore}">${chore}</option>`;
            });
        }
    }

    addViolation() {
        const person = document.getElementById('violationPerson').value;
        const chore = document.getElementById('violationChore').value;

        if (!person || !chore) {
            alert('Please select both a person and a chore.');
            return;
        }

        const violation = {
            id: Date.now(),
            person,
            chore,
            date: new Date().toISOString(),
            cycleId: this.data.currentCycle?.id
        };

        this.data.violations.push(violation);
        this.saveData();
        this.updateViolationsList();
        this.updateStatistics();

        // Reset selects
        document.getElementById('violationPerson').value = '';
        document.getElementById('violationChore').value = '';
    }

    removeViolation() {
        const person = document.getElementById('violationPerson').value;
        const chore = document.getElementById('violationChore').value;

        if (!person || !chore) {
            alert('Please select both a person and a chore to remove violation.');
            return;
        }

        const violationIndex = this.data.violations.findIndex(v => 
            v.person === person && v.chore === chore && v.cycleId === this.data.currentCycle?.id
        );

        if (violationIndex !== -1) {
            this.data.violations.splice(violationIndex, 1);
            this.saveData();
            this.updateViolationsList();
            this.updateStatistics();

            // Reset selects
            document.getElementById('violationPerson').value = '';
            document.getElementById('violationChore').value = '';
        } else {
            alert('No matching violation found for the selected person and chore.');
        }
    }

    updateViolationsList() {
        const container = document.getElementById('violationsList');
        const currentViolations = this.data.violations.filter(v => 
            v.cycleId === this.data.currentCycle?.id
        );

        if (currentViolations.length === 0) {
            container.innerHTML = '<div class="status status--success">No violations recorded.</div>';
            return;
        }

        let html = '';
        currentViolations.forEach(violation => {
            html += `
                <div class="violation-item">
                    <div class="violation-text">
                        <strong>${violation.person}</strong> - ${violation.chore}
                        <small>(${new Date(violation.date).toLocaleDateString()})</small>
                    </div>
                    <button class="violation-remove" onclick="choreManager.removeViolationById('${violation.id}')">
                        ✕
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    removeViolationById(violationId) {
        const index = this.data.violations.findIndex(v => v.id === violationId);
        if (index !== -1) {
            this.data.violations.splice(index, 1);
            this.saveData();
            this.updateViolationsList();
            this.updateStatistics();
        }
    }

    toggleFutureCycles() {
        const content = document.getElementById('futureCyclesContent');
        const icon = document.getElementById('toggleIcon');
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.textContent = '▲';
            this.generateFutureCycles();
        } else {
            content.classList.add('hidden');
            icon.textContent = '▼';
        }
    }

    generateFutureCycles() {
        const container = document.getElementById('futureCyclesTable');
        const cycles = [];
        
        // Generate 26 bi-weekly cycles (1 year)
        let currentStart = new Date(this.nextCycleStart);
        
        for (let i = 0; i < 26; i++) {
            const start = new Date(currentStart);
            const end = new Date(start);
            end.setDate(end.getDate() + 3); // Tuesday to Friday
            
            cycles.push({
                cycle: i + 1,
                start: start.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                end: end.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            });
            
            // Move to next bi-weekly cycle
            currentStart.setDate(currentStart.getDate() + 14);
        }

        let html = `
            <div class="cycles-grid">
                <div>Cycle</div>
                <div>Start Date (Tuesday)</div>
                <div>Deadline (Friday)</div>
            </div>
        `;

        cycles.forEach(cycle => {
            html += `
                <div class="cycles-grid">
                    <div>Cycle ${cycle.cycle}</div>
                    <div>${cycle.start}</div>
                    <div>${cycle.end}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    updateStatistics() {
        const totalCycles = this.data.cycles.length;
        const totalViolations = this.data.violations.length;
        
        // Calculate completion rate
        let totalTasks = 0;
        let completedTasks = 0;
        
        Object.values(this.data.completions).forEach(cycle => {
            Object.entries(cycle).forEach(([key, completed]) => {
                totalTasks++;
                if (completed) completedTasks++;
            });
        });
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

        document.getElementById('totalCycles').textContent = totalCycles;
        document.getElementById('totalViolations').textContent = totalViolations;
        document.getElementById('completionRate').textContent = `${completionRate}%`;

        // Update personal statistics
        this.updatePersonalStats();
    }

    updatePersonalStats() {
        const container = document.getElementById('personalStats');
        const personStats = {};

        // Initialize stats for each person
        this.people.forEach(person => {
            personStats[person] = {
                totalTasks: 0,
                completedTasks: 0,
                violations: 0
            };
        });

        // Count tasks and completions
        this.data.cycles.forEach(cycle => {
            cycle.assignments?.forEach(assignment => {
                const person = assignment.person;
                personStats[person].totalTasks++;
                
                const completionKey = `${assignment.person}-${assignment.chore}`;
                if (this.data.completions[cycle.id]?.[completionKey]) {
                    personStats[person].completedTasks++;
                }
            });
        });

        // Count violations
        this.data.violations.forEach(violation => {
            if (personStats[violation.person]) {
                personStats[violation.person].violations++;
            }
        });

        let html = `
            <h4>Personal Performance</h4>
            <div class="person-stat">
                <div>Person</div>
                <div>Completion Rate</div>
                <div>Violations</div>
            </div>
        `;

        this.people.forEach(person => {
            const stats = personStats[person];
            const rate = stats.totalTasks > 0 ? 
                Math.round((stats.completedTasks / stats.totalTasks) * 100) : 100;
            
            html += `
                <div class="person-stat">
                    <div>${person}</div>
                    <div>${rate}% (${stats.completedTasks}/${stats.totalTasks})</div>
                    <div>${stats.violations}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    exportData() {
        const exportData = {
            ...this.data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chore-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData() {
        document.getElementById('importFileInput').click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (importedData.cycles && importedData.violations !== undefined) {
                this.data = { ...this.data, ...importedData };
                await this.saveData();
                this.updateUI();
                alert('Data imported successfully!');
            } else {
                alert('Invalid file format. Please select a valid backup file.');
            }
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    }

    generateGitHubFile() {
        const button = document.getElementById('generateGithubFileBtn');
        button.classList.add('loading');
        button.disabled = true;

        setTimeout(() => {
            const githubData = {
                currentCycle: this.data.currentCycle,
                completions: this.data.currentCycle ? 
                    this.data.completions[this.data.currentCycle.id] : {},
                lastUpdated: new Date().toISOString(),
                stats: {
                    totalCycles: this.data.cycles.length,
                    totalViolations: this.data.violations.length,
                    activeAssignments: this.data.currentCycle?.assignments?.length || 0
                }
            };

            const blob = new Blob([JSON.stringify(githubData, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'current-chore-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show instructions
            document.getElementById('githubInstructions').classList.remove('hidden');

            button.classList.remove('loading');
            button.disabled = false;
        }, 300);
    }

    updateUI() {
        // Update dates display
        const daysRemaining = this.calculateDaysRemaining();
        document.getElementById('daysRemaining').textContent = `${daysRemaining} days`;
        
        // Update all UI components
        this.updateAssignmentsDisplay();
        this.updateViolationSelects();
        this.updateViolationsList();
        this.updateStatistics();
    }
}

// Initialize the application
let choreManager;

document.addEventListener('DOMContentLoaded', () => {
    choreManager = new ChoreManager();
    // Make it globally available for onclick handlers
    window.choreManager = choreManager;
});