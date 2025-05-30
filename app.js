// Bi-Weekly Chore Management Application
class ChoreManager {
    constructor() {
        this.currentDate = new Date('2025-05-30');
        this.nextCycleStart = new Date('2025-06-10');
        this.nextCycleDeadline = new Date('2025-06-13');
        
        this.people = ["Oliver", "Spencer", "Ben", "Isaac", "Jason", "Jonah", "Nahum", "Adam"];
        
        // Updated chores list with blessing chore removed as requested
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
    }

    async init() {
        try {
            console.log('Initializing ChoreManager...');
            await this.initDB();
            await this.loadData();
            await this.tryLoadFromGitHub();
            this.setupEventListeners();
            this.updateUI();
            console.log('ChoreManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ChoreManager:', error);
            // Continue with basic functionality even if some features fail
            this.setupEventListeners();
            this.updateUI();
        }
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                resolve(); // Don't fail completely if IndexedDB isn't available
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
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
        if (!this.db) {
            console.warn('IndexedDB not available, data not saved');
            return;
        }
        
        try {
            const transaction = this.db.transaction(['choreData'], 'readwrite');
            const store = transaction.objectStore('choreData');
            
            await store.put({
                id: 'main',
                data: this.data,
                lastUpdated: new Date().toISOString()
            });
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async loadData() {
        if (!this.db) {
            console.warn('IndexedDB not available, using default data');
            return;
        }
        
        try {
            const transaction = this.db.transaction(['choreData'], 'readonly');
            const store = transaction.objectStore('choreData');
            const request = store.get('main');
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    if (request.result && request.result.data) {
                        this.data = { ...this.data, ...request.result.data };
                        console.log('Data loaded from IndexedDB');
                    } else {
                        console.log('No existing data found, using defaults');
                    }
                    resolve();
                };
                request.onerror = () => {
                    console.error('Error loading data:', request.error);
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error in loadData:', error);
        }
    }

    async tryLoadFromGitHub() {
        try {
            const response = await fetch('./current-chore-data.json');
            if (response.ok) {
                const githubData = await response.json();
                if (githubData.currentCycle) {
                    this.data.currentCycle = githubData.currentCycle;
                    this.data.completions = githubData.completions || {};
                    console.log('GitHub data loaded successfully');
                }
            }
        } catch (error) {
            console.log('GitHub data not available, using local data');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Make sure all DOM elements exist before attaching listeners
        const generateBtn = document.getElementById('generateCycleBtn');
        const addViolationBtn = document.getElementById('addViolationBtn');
        const removeViolationBtn = document.getElementById('removeViolationBtn');
        const toggleFutureBtn = document.getElementById('toggleFutureCycles');
        const exportBtn = document.getElementById('exportDataBtn');
        const importBtn = document.getElementById('importDataBtn');
        const importFileInput = document.getElementById('importFileInput');
        const generateGithubBtn = document.getElementById('generateGithubFileBtn');

        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate cycle button clicked');
                this.generateNewCycle();
            });
        }

        if (addViolationBtn) {
            addViolationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add violation button clicked');
                this.addViolation();
            });
        }

        if (removeViolationBtn) {
            removeViolationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Remove violation button clicked');
                this.removeViolation();
            });
        }

        if (toggleFutureBtn) {
            toggleFutureBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Toggle future cycles button clicked');
                this.toggleFutureCycles();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Export data button clicked');
                this.exportData();
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Import data button clicked');
                this.importData();
            });
        }

        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                console.log('File input changed');
                this.handleFileImport(e);
            });
        }

        if (generateGithubBtn) {
            generateGithubBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate GitHub file button clicked');
                this.generateGitHubFile();
            });
        }

        console.log('Event listeners set up successfully');
    }

    calculateDaysRemaining() {
        const today = this.currentDate;
        const nextCycle = this.nextCycleStart;
        const diffTime = nextCycle - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    generateNewCycle() {
        console.log('Starting to generate new cycle...');
        const button = document.getElementById('generateCycleBtn');
        
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }

        // Use setTimeout to allow UI to update before processing
        setTimeout(() => {
            try {
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

                console.log('New cycle generated successfully');
            } catch (error) {
                console.error('Error generating cycle:', error);
            } finally {
                if (button) {
                    button.classList.remove('loading');
                    button.disabled = false;
                }
            }
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
                } else {
                    break; // No more chores available
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
        
        if (!container) {
            console.error('Assignments table container not found');
            return;
        }

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
            const checkboxId = `completion-${completionKey.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
            
            html += `
                <div class="assignments-grid">
                    <div class="person-name">${assignment.person}</div>
                    <div class="chore-text">${assignment.chore}</div>
                    <div class="completion-checkbox">
                        <input type="checkbox" id="${checkboxId}" 
                               ${isCompleted ? 'checked' : ''}
                               data-cycle-id="${cycleId}" data-completion-key="${completionKey}">
                        <label for="${checkboxId}">
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

        if (!personSelect || !choreSelect) {
            console.error('Violation select elements not found');
            return;
        }

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
        const person = document.getElementById('violationPerson')?.value;
        const chore = document.getElementById('violationChore')?.value;

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
        const person = document.getElementById('violationPerson')?.value;
        const chore = document.getElementById('violationChore')?.value;

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
        
        if (!container) {
            console.error('Violations list container not found');
            return;
        }

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
                    <button class="violation-remove" data-violation-id="${violation.id}">
                        ✕
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners to remove buttons
        container.querySelectorAll('.violation-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const violationId = e.target.dataset.violationId;
                this.removeViolationById(violationId);
            });
        });
    }

    removeViolationById(violationId) {
        const index = this.data.violations.findIndex(v => v.id == violationId);
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
        
        if (!content || !icon) {
            console.error('Future cycles elements not found');
            return;
        }

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
        
        if (!container) {
            console.error('Future cycles table container not found');
            return;
        }

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

        const totalCyclesEl = document.getElementById('totalCycles');
        const totalViolationsEl = document.getElementById('totalViolations');
        const completionRateEl = document.getElementById('completionRate');

        if (totalCyclesEl) totalCyclesEl.textContent = totalCycles;
        if (totalViolationsEl) totalViolationsEl.textContent = totalViolations;
        if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;

        // Update personal statistics
        this.updatePersonalStats();
    }

    updatePersonalStats() {
        const container = document.getElementById('personalStats');
        
        if (!container) {
            console.error('Personal stats container not found');
            return;
        }

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
        const fileInput = document.getElementById('importFileInput');
        if (fileInput) {
            fileInput.click();
        }
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
        
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }

        setTimeout(() => {
            try {
                const githubData = {
                    metadata: {
                        lastUpdated: new Date().toISOString(),
                        version: "1.0",
                        cycleNumber: this.data.cycles.length + 1,
                        description: "Bi-weekly chore assignments for Shabbat cleanup"
                    },
                    currentCycle: this.data.currentCycle,
                    completions: this.data.currentCycle ? 
                        this.data.completions[this.data.currentCycle.id] : {},
                    settings: {
                        cycleLength: 14,
                        minChoresPerPerson: 2,
                        maxChoresPerPerson: 3,
                        cycleStartDay: "Tuesday",
                        deadlineDay: "Friday",
                        timezone: "America/New_York"
                    },
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
                const instructions = document.getElementById('githubInstructions');
                if (instructions) {
                    instructions.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error generating GitHub file:', error);
                alert('Error generating GitHub file: ' + error.message);
            } finally {
                if (button) {
                    button.classList.remove('loading');
                    button.disabled = false;
                }
            }
        }, 300);
    }

    updateUI() {
        // Update dates display
        const daysRemaining = this.calculateDaysRemaining();
        const daysRemainingEl = document.getElementById('daysRemaining');
        if (daysRemainingEl) {
            daysRemainingEl.textContent = `${daysRemaining} days`;
        }
        
        // Update all UI components
        this.updateAssignmentsDisplay();
        this.updateViolationSelects();
        this.updateViolationsList();
        this.updateStatistics();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing ChoreManager...');
    
    try {
        window.choreManager = new ChoreManager();
        await window.choreManager.init();
    } catch (error) {
        console.error('Failed to initialize ChoreManager:', error);
        // Try basic initialization without advanced features
        window.choreManager = new ChoreManager();
        window.choreManager.setupEventListeners();
        window.choreManager.updateUI();
    }
});