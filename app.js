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
            "Vacuum stairs",
            "Hefker sweep ground floor living room - clean up items and trash"
        ];

        this.data = {
            cycles: [],
            violations: [],
            currentCycle: null,
            completions: {},
            statistics: {
                totalCycles: 0,
                totalViolations: 0,
                completionRates: {}
            },
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
                // Process the GitHub data
                if (githubData.currentCycle) {
                    this.processGitHubData(githubData);
                    await this.saveData();
                    console.log('Loaded data from GitHub');
                }
            }
        } catch (error) {
            console.log('GitHub data not available, using local data');
        }
    }

    processGitHubData(githubData) {
        // Extract data from GitHub format into our internal format
        if (githubData.currentCycle) {
            const cycle = githubData.currentCycle;
            
            // Format dates correctly
            const startDate = new Date(cycle.startDate);
            const deadlineDate = new Date(cycle.deadlineDate);
            
            // Format assignments into our internal structure
            const assignments = [];
            cycle.assignments.forEach(assignment => {
                // Skip any assignment with "Bless the home" as that's been removed
                assignment.chores.forEach(chore => {
                    if (!chore.includes("Bless the home")) {
                        assignments.push({
                            person: assignment.person,
                            chore: chore
                        });
                    }
                });
            });
            
            this.data.currentCycle = {
                id: cycle.id || `cycle-${deadlineDate.toISOString().split('T')[0]}`,
                startDate: startDate,
                endDate: deadlineDate,
                assignments: assignments
            };
            
            // Create completions object for this cycle
            if (!this.data.completions[this.data.currentCycle.id]) {
                this.data.completions[this.data.currentCycle.id] = {};
            }
            
            // Initialize completions based on GitHub data
            assignments.forEach(assignment => {
                const key = `${assignment.person}-${assignment.chore}`;
                // Check if this person has completed their assignments according to GitHub data
                const personData = cycle.assignments.find(a => a.person === assignment.person);
                const isCompleted = personData ? !!personData.completed : false;
                this.data.completions[this.data.currentCycle.id][key] = isCompleted;
            });
            
            // Process violations if available
            if (cycle.assignments) {
                cycle.assignments.forEach(personAssignment => {
                    if (personAssignment.violations > 0) {
                        // Add violations for each chore
                        personAssignment.chores.forEach(chore => {
                            if (!chore.includes("Bless the home")) {
                                for (let i = 0; i < personAssignment.violations; i++) {
                                    this.data.violations.push({
                                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                                        person: personAssignment.person,
                                        chore: chore,
                                        date: new Date().toISOString(),
                                        cycleId: this.data.currentCycle.id
                                    });
                                }
                            }
                        });
                    }
                });
            }
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
        const today = new Date();
        const nextCycle = new Date(this.nextCycleStart);
        const diffTime = nextCycle - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    generateNewCycle() {
        const button = document.getElementById('generateCycleBtn');
        button.classList.add('loading');
        button.disabled = true;

        setTimeout(() => {
            const assignments = this.generateAssignments();
            const cycleId = `cycle-${Date.now()}`;
            
            // Calculate the next cycle dates
            let nextStart;
            let nextEnd;
            
            if (this.data.currentCycle) {
                // If we have a current cycle, add 14 days to its start date
                nextStart = new Date(this.data.currentCycle.startDate);
                nextStart.setDate(nextStart.getDate() + 14);
                
                nextEnd = new Date(nextStart);
                nextEnd.setDate(nextEnd.getDate() + 3); // End is 3 days after start (Tuesday to Friday)
            } else {
                // Use the default next cycle dates
                nextStart = new Date(this.nextCycleStart);
                nextEnd = new Date(this.nextCycleDeadline);
            }
            
            const newCycle = {
                id: cycleId,
                startDate: nextStart,
                endDate: nextEnd,
                assignments: assignments,
                created: new Date().toISOString()
            };

            this.data.currentCycle = newCycle;
            this.data.cycles.push(newCycle);
            this.data.completions[cycleId] = {};

            // Initialize completion status
            assignments.forEach(assignment => {
                const key = `${assignment.person}-${assignment.chore}`;
                this.data.completions[cycleId][key] = false;
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
        const prevAssignments = new Map();

        // Initialize tracking
        this.people.forEach(person => {
            peopleChores[person] = [];
        });

        // Get previous cycle assignments to avoid repeats
        if (this.data.currentCycle) {
            this.data.currentCycle.assignments.forEach(assignment => {
                if (!prevAssignments.has(assignment.person)) {
                    prevAssignments.set(assignment.person, []);
                }
                prevAssignments.get(assignment.person).push(assignment.chore);
            });
        }

        // Shuffle chores and people for random assignment
        const shuffledChores = [...this.chores].sort(() => Math.random() - 0.5);
        const shuffledPeople = [...this.people].sort(() => Math.random() - 0.5);

        // First pass: assign one chore to each person avoiding previous assignments
        for (const person of shuffledPeople) {
            const prevChores = prevAssignments.get(person) || [];
            
            // Find a chore that wasn't assigned to this person in the previous cycle
            for (const chore of shuffledChores) {
                if (!prevChores.includes(chore) && !peopleChores[person].includes(chore) && 
                    !assignments.some(a => a.chore === chore)) {
                    
                    assignments.push({ person, chore });
                    peopleChores[person].push(chore);
                    break;
                }
            }
            
            // If no suitable chore found, just assign any unassigned chore
            if (peopleChores[person].length === 0) {
                for (const chore of shuffledChores) {
                    if (!assignments.some(a => a.chore === chore)) {
                        assignments.push({ person, chore });
                        peopleChores[person].push(chore);
                        break;
                    }
                }
            }
        }

        // Second pass: assign second chore to each person
        for (const person of shuffledPeople) {
            const prevChores = prevAssignments.get(person) || [];
            
            // If person already has 2 chores, skip
            if (peopleChores[person].length >= 2) continue;
            
            // Find a chore that wasn't assigned to this person in the previous cycle
            for (const chore of shuffledChores) {
                if (!prevChores.includes(chore) && !peopleChores[person].includes(chore) && 
                    !assignments.some(a => a.chore === chore)) {
                    
                    assignments.push({ person, chore });
                    peopleChores[person].push(chore);
                    break;
                }
            }
            
            // If still no suitable chore found, just assign any unassigned chore
            if (peopleChores[person].length < 2) {
                for (const chore of shuffledChores) {
                    if (!assignments.some(a => a.chore === chore)) {
                        assignments.push({ person, chore });
                        peopleChores[person].push(chore);
                        break;
                    }
                }
            }
        }

        // Check if any chores are left unassigned due to constraints
        const unassignedChores = shuffledChores.filter(
            chore => !assignments.some(a => a.chore === chore)
        );

        // Assign any remaining chores to people with less than 2
        for (const chore of unassignedChores) {
            // Find person with fewest chores
            const person = this.people.reduce((minPerson, p) => 
                (peopleChores[p].length < peopleChores[minPerson].length) ? p : minPerson
            , this.people[0]);
            
            assignments.push({ person, chore });
            peopleChores[person].push(chore);
        }

        // Final check: ensure everyone has exactly 2 chores
        for (const person of this.people) {
            // If person has more than 2 chores, remove extras
            while (peopleChores[person].length > 2) {
                const choreToRemove = peopleChores[person][peopleChores[person].length - 1];
                peopleChores[person].pop();
                
                const indexToRemove = assignments.findIndex(a => 
                    a.person === person && a.chore === choreToRemove
                );
                
                if (indexToRemove !== -1) {
                    assignments.splice(indexToRemove, 1);
                }
                
                // Find person with fewest chores
                const targetPerson = this.people.reduce((minPerson, p) => 
                    (peopleChores[p].length < peopleChores[minPerson].length && p !== person) ? p : minPerson
                , this.people[0] === person ? this.people[1] : this.people[0]);
                
                assignments.push({ person: targetPerson, chore: choreToRemove });
                peopleChores[targetPerson].push(choreToRemove);
            }
            
            // If person has less than 2 chores, this shouldn't happen but handle it
            while (peopleChores[person].length < 2) {
                // Find person with most chores
                const targetPerson = this.people.reduce((maxPerson, p) => 
                    (peopleChores[p].length > peopleChores[maxPerson].length && p !== person) ? p : maxPerson
                , this.people[0] === person ? this.people[1] : this.people[0]);
                
                if (peopleChores[targetPerson].length <= 2) {
                    break; // Can't take from anyone else, this is a problem with our data
                }
                
                const choreToMove = peopleChores[targetPerson][peopleChores[targetPerson].length - 1];
                peopleChores[targetPerson].pop();
                
                const indexToMove = assignments.findIndex(a => 
                    a.person === targetPerson && a.chore === choreToMove
                );
                
                if (indexToMove !== -1) {
                    assignments[indexToMove].person = person;
                    peopleChores[person].push(choreToMove);
                }
            }
        }

        return assignments.sort((a, b) => a.person.localeCompare(b.person));
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

        // Group assignments by person
        const personAssignments = {};
        for (const assignment of assignments) {
            if (!personAssignments[assignment.person]) {
                personAssignments[assignment.person] = [];
            }
            personAssignments[assignment.person].push(assignment.chore);
        }

        // Display assignments grouped by person
        for (const person of this.people) {
            const chores = personAssignments[person] || [];
            
            // Skip if no chores (though everyone should have 2)
            if (chores.length === 0) continue;
            
            for (const chore of chores) {
                const completionKey = `${person}-${chore}`;
                const isCompleted = this.data.completions[cycleId]?.[completionKey] || false;
                
                html += `
                    <div class="assignments-grid">
                        <div class="person-name">${person}</div>
                        <div class="chore-text">${chore}</div>
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
            }
        }

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

        // Clear current options
        personSelect.innerHTML = '<option value="">Select person...</option>';
        choreSelect.innerHTML = '<option value="">Select chore...</option>';

        // Add people options
        this.people.forEach(person => {
            personSelect.innerHTML += `<option value="${person}">${person}</option>`;
        });

        // Update chore select with current assignments if we have a current cycle
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            // Get unique chores from current assignments
            const currentChores = [...new Set(
                this.data.currentCycle.assignments.map(a => a.chore)
            )].sort();
            
            // Add chore options
            currentChores.forEach(chore => {
                choreSelect.innerHTML += `<option value="${chore}">${chore}</option>`;
            });
        } else {
            // No current cycle, show all possible chores
            this.chores.forEach(chore => {
                choreSelect.innerHTML += `<option value="${chore}">${chore}</option>`;
            });
        }
        
        // Add event listener to person select to filter chores
        personSelect.addEventListener('change', () => {
            const selectedPerson = personSelect.value;
            
            // If no person selected or no current cycle, skip
            if (!selectedPerson || !this.data.currentCycle) return;
            
            // Get chores assigned to selected person
            const personChores = this.data.currentCycle.assignments
                .filter(a => a.person === selectedPerson)
                .map(a => a.chore);
            
            // Update chore select
            choreSelect.innerHTML = '<option value="">Select chore...</option>';
            personChores.forEach(chore => {
                choreSelect.innerHTML += `<option value="${chore}">${chore}</option>`;
            });
        });
    }

    addViolation() {
        const person = document.getElementById('violationPerson').value;
        const chore = document.getElementById('violationChore').value;

        if (!person || !chore) {
            alert('Please select both a person and a chore.');
            return;
        }

        // Check if this person is assigned this chore in the current cycle
        let isAssigned = false;
        if (this.data.currentCycle) {
            isAssigned = this.data.currentCycle.assignments.some(
                a => a.person === person && a.chore === chore
            );
        }

        if (!isAssigned) {
            alert(`${person} is not currently assigned to "${chore}". Violations can only be added for current assignments.`);
            return;
        }

        const violation = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
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
        
        // Filter to current cycle if we have one
        const currentViolations = this.data.currentCycle
            ? this.data.violations.filter(v => v.cycleId === this.data.currentCycle.id)
            : this.data.violations;

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
        
        // Determine starting date for future cycles
        let currentStart;
        if (this.data.currentCycle) {
            currentStart = new Date(this.data.currentCycle.startDate);
            currentStart.setDate(currentStart.getDate() + 14); // Start from next cycle
        } else {
            currentStart = new Date(this.nextCycleStart);
        }
        
        // Generate 26 bi-weekly cycles (1 year)
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
        
        // Update days remaining
        document.getElementById('daysRemaining').textContent = `${this.calculateDaysRemaining()} days`;
    }

    updatePersonalStats() {
        const container = document.getElementById('personalStats');
        const personStats = {};

        // Initialize stats for each person
        this.people.forEach(person => {
            personStats[person] = {
                totalTasks: 0,
                completedTasks: 0,
                violations: 0,
                completionRate: 100
            };
        });

        // Count tasks and completions
        Object.entries(this.data.completions).forEach(([cycleId, completions]) => {
            Object.entries(completions).forEach(([key, isCompleted]) => {
                const [person] = key.split('-');
                if (personStats[person]) {
                    personStats[person].totalTasks++;
                    if (isCompleted) {
                        personStats[person].completedTasks++;
                    }
                }
            });
        });

        // Count violations
        this.data.violations.forEach(violation => {
            if (personStats[violation.person]) {
                personStats[violation.person].violations++;
            }
        });

        // Calculate completion rates
        Object.keys(personStats).forEach(person => {
            const stats = personStats[person];
            stats.completionRate = stats.totalTasks > 0 
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                : 100;
        });

        // Sort people by completion rate (highest first) and then by violations (lowest first)
        const sortedPeople = [...this.people].sort((a, b) => {
            const statsA = personStats[a];
            const statsB = personStats[b];
            
            if (statsA.completionRate !== statsB.completionRate) {
                return statsB.completionRate - statsA.completionRate;
            }
            
            return statsA.violations - statsB.violations;
        });

        let html = `
            <h4>Personal Performance</h4>
            <div class="person-stat">
                <div>Person</div>
                <div>Completion Rate</div>
                <div>Violations</div>
            </div>
        `;

        // Show stats for each person, sorted by performance
        sortedPeople.forEach(person => {
            const stats = personStats[person];
            const rateClass = stats.completionRate >= 90 
                ? 'status--success' 
                : (stats.completionRate >= 70 ? 'status--warning' : 'status--error');
                
            const violationClass = stats.violations === 0 
                ? 'status--success' 
                : (stats.violations <= 2 ? 'status--warning' : 'status--error');
            
            html += `
                <div class="person-stat">
                    <div>${person}</div>
                    <div>
                        <span class="status ${rateClass}">${stats.completionRate}%</span>
                        <small>(${stats.completedTasks}/${stats.totalTasks})</small>
                    </div>
                    <div>
                        <span class="status ${violationClass}">${stats.violations}</span>
                    </div>
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
            
            // Validate the imported data
            if (importedData.cycles !== undefined && 
                importedData.violations !== undefined &&
                importedData.completions !== undefined) {
                
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
            // If no current cycle, create a template one for GitHub
            const currentCycle = this.data.currentCycle || {
                id: `cycle-${new Date().toISOString().split('T')[0]}`,
                startDate: this.nextCycleStart,
                endDate: this.nextCycleDeadline,
                assignments: []
            };

            // Format assignments by person for GitHub format
            const personAssignments = [];
            const peopleChores = {};
            
            // If we have assignments, group them
            if (currentCycle.assignments && currentCycle.assignments.length > 0) {
                // Group chores by person
                currentCycle.assignments.forEach(assignment => {
                    if (!peopleChores[assignment.person]) {
                        peopleChores[assignment.person] = [];
                    }
                    peopleChores[assignment.person].push(assignment.chore);
                });
            } else {
                // Create empty assignments for GitHub template
                this.people.forEach(person => {
                    peopleChores[person] = [];
                });
            }
            
            // Format into GitHub-compatible structure
            for (const person of this.people) {
                const chores = peopleChores[person] || [];
                
                // Count violations for this person in current cycle
                const violations = this.data.violations.filter(
                    v => v.person === person && v.cycleId === currentCycle.id
                ).length;
                
                // Check if all chores are completed
                const allCompleted = chores.length > 0 ? chores.every(chore => {
                    const key = `${person}-${chore}`;
                    return this.data.completions[currentCycle.id]?.[key] || false;
                }) : false;
                
                personAssignments.push({
                    person,
                    chores: chores.length > 0 ? chores : ["No chores assigned yet"],
                    completed: allCompleted,
                    violations,
                    lastCompleted: allCompleted ? new Date().toISOString() : null
                });
            }

            // Create next cycles data (future cycles)
            const nextCycles = [];
            let nextStart = new Date(currentCycle.startDate);
            for (let i = 0; i < 3; i++) {
                nextStart = new Date(nextStart);
                nextStart.setDate(nextStart.getDate() + 14);
                
                const nextEnd = new Date(nextStart);
                nextEnd.setDate(nextEnd.getDate() + 3);
                
                nextCycles.push({
                    cycleNumber: (this.data.cycles.length || 0) + i + 1,
                    startDate: nextStart.toISOString().split('T')[0],
                    deadlineDate: nextEnd.toISOString().split('T')[0]
                });
            }
            
            const githubData = {
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: "1.0",
                    cycleNumber: this.data.cycles.length || 1,
                    description: "Bi-weekly chore assignments for Shabbat cleanup"
                },
                currentCycle: {
                    id: currentCycle.id,
                    startDate: (currentCycle.startDate instanceof Date ? currentCycle.startDate : new Date(currentCycle.startDate)).toISOString().split('T')[0],
                    deadlineDate: (currentCycle.endDate instanceof Date ? currentCycle.endDate : new Date(currentCycle.endDate)).toISOString().split('T')[0],
                    type: "bi-weekly",
                    assignments: personAssignments
                },
                settings: {
                    cycleLength: 14,
                    minChoresPerPerson: 2,
                    maxChoresPerPerson: 2,
                    cycleStartDay: "Tuesday",
                    deadlineDay: "Friday",
                    timezone: "America/New_York"
                },
                nextCycles: nextCycles
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
    // Make it globally available for certain functions
    window.choreManager = choreManager;
});