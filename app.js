// Bi-Weekly Chore Management Application

class ChoreManager {
    constructor() {
        this.data = null;
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
        
        // Initialize with sample data first to ensure UI is populated
        this.loadSampleData();
        
        // Then try to load from GitHub or localStorage
        this.init();
    }
    
    async init() {
        try {
            await this.loadData();
            document.getElementById('loading-status').textContent = 'Data loaded successfully';
        } catch (error) {
            console.error('Error during initialization:', error);
            document.getElementById('loading-status').textContent = 'Using default data (GitHub data not available)';
        }
        
        this.setupEventListeners();
        document.getElementById('last-sync').textContent = new Date().toLocaleString();
    }
    
    async loadData() {
        try {
            // Try to fetch from GitHub JSON file
            const response = await fetch('current-chore-data.json');
            
            if (response.ok) {
                this.data = await response.json();
                console.log('Data loaded from GitHub:', this.data);
                this.updateUI();
                return;
            } else {
                console.error('Failed to load data from GitHub:', response.status);
            }
        } catch (error) {
            console.error('Error loading data from GitHub:', error);
        }
        
        // If loading from GitHub fails, try to load from localStorage
        const savedData = localStorage.getItem('choreData');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                console.log('Data loaded from localStorage');
                this.updateUI();
                return;
            } catch (error) {
                console.error('Error parsing data from localStorage:', error);
            }
        }
        
        // If we reach here, we keep using the sample data that was loaded in constructor
        console.log('Using sample data');
    }
    
    loadSampleData() {
        // Load sample data from the provided structure
        this.data = {
            "metadata": {
                "lastUpdated": "2025-05-31T02:43:00.000Z",
                "version": "2.1",
                "cycleNumber": 2,
                "description": "Enhanced chore tracking with violations"
            },
            "currentCycle": {
                "id": 1748640309493,
                "startDate": "2025-06-10T00:00:00.000Z",
                "endDate": "2025-06-13T00:00:00.000Z",
                "assignments": [
                    {"person": "Adam", "chore": "Replace foil in cooking stove"},
                    {"person": "Adam", "chore": "Wipe down kitchen countertops"},
                    {"person": "Ben", "chore": "Sweep kitchen"},
                    {"person": "Ben", "chore": "Ground-floor bathroom & toilet"},
                    {"person": "Isaac", "chore": "Sweep living room"},
                    {"person": "Isaac", "chore": "Hefker sweep ground floor living room - clean up items and trash"},
                    {"person": "Jason", "chore": "Wipe down kitchen stove, knobs, and surfaces"},
                    {"person": "Jason", "chore": "Ground-floor washing sink"},
                    {"person": "Jonah", "chore": "Mop down kitchen"},
                    {"person": "Jonah", "chore": "Vacuum living room"},
                    {"person": "Nahum", "chore": "General tidy-up of common spaces"},
                    {"person": "Nahum", "chore": "Recycling and trash disposal (out by Thursday night)"},
                    {"person": "Oliver", "chore": "Kitchen & dining-room tables: cloth replacement & wipe-down"},
                    {"person": "Oliver", "chore": "Second-floor bathroom, mop floor & toilet"},
                    {"person": "Spencer", "chore": "Vacuum kitchen"},
                    {"person": "Spencer", "chore": "Vacuum stairs"}
                ],
                "created": "2025-05-30T21:25:09.493Z"
            },
            "previousCycles": [
                {
                    "id": 1748540309493,
                    "startDate": "2025-05-27T00:00:00.000Z",
                    "endDate": "2025-05-30T00:00:00.000Z",
                    "assignments": [
                        {"person": "Oliver", "chore": "Sweep kitchen"},
                        {"person": "Spencer", "chore": "Mop down kitchen"},
                        {"person": "Ben", "chore": "Vacuum living room"},
                        {"person": "Isaac", "chore": "Vacuum stairs"},
                        {"person": "Jason", "chore": "Second-floor bathroom, mop floor & toilet"},
                        {"person": "Jonah", "chore": "Kitchen cleaning"},
                        {"person": "Nahum", "chore": "Recycling and trash disposal (out by Thursday night)"},
                        {"person": "Adam", "chore": "Ground-floor washing sink"}
                    ]
                }
            ],
            "completions": {
                "Adam-Replace foil in cooking stove": true,
                "Adam-Wipe down kitchen countertops": true,
                "Ben-Sweep kitchen": true,
                "Ben-Ground-floor bathroom & toilet": true,
                "Isaac-Sweep living room": true,
                "Isaac-Hefker sweep ground floor living room - clean up items and trash": true,
                "Jason-Wipe down kitchen stove, knobs, and surfaces": true,
                "Jason-Ground-floor washing sink": true,
                "Jonah-Mop down kitchen": false,
                "Jonah-Vacuum living room": false,
                "Nahum-General tidy-up of common spaces": true,
                "Nahum-Recycling and trash disposal (out by Thursday night)": true,
                "Oliver-Kitchen & dining-room tables: cloth replacement & wipe-down": true,
                "Oliver-Second-floor bathroom, mop floor & toilet": true,
                "Spencer-Vacuum kitchen": true,
                "Spencer-Vacuum stairs": true
            },
            "violations": {
                "active": [
                    {
                        "id": "v1",
                        "person": "Jonah",
                        "chore": "Mop down kitchen",
                        "cycle": 1748640309493,
                        "timestamp": "2025-05-30T21:30:00.000Z",
                        "carryOver": true
                    },
                    {
                        "id": "v2",
                        "person": "Jonah",
                        "chore": "Vacuum living room",
                        "cycle": 1748640309493,
                        "timestamp": "2025-05-30T21:30:00.000Z",
                        "carryOver": true
                    }
                ],
                "history": [
                    {
                        "id": "v0",
                        "person": "Jonah",
                        "chore": "Kitchen cleaning",
                        "cycle": 1748540309493,
                        "timestamp": "2025-05-28T20:00:00.000Z",
                        "resolved": "2025-05-29T10:00:00.000Z"
                    }
                ]
            },
            "statistics": {
                "completionRates": {
                    "Oliver": 1.0,
                    "Spencer": 1.0,
                    "Ben": 1.0,
                    "Isaac": 1.0,
                    "Jason": 1.0,
                    "Jonah": 0.0,
                    "Nahum": 1.0,
                    "Adam": 1.0
                },
                "violationCounts": {
                    "Oliver": 0,
                    "Spencer": 0,
                    "Ben": 0,
                    "Isaac": 0,
                    "Jason": 0,
                    "Jonah": 3,
                    "Nahum": 0,
                    "Adam": 0
                },
                "bestPerformers": ["Oliver", "Spencer", "Ben", "Isaac", "Jason", "Nahum", "Adam", "Jonah"]
            },
            "settings": {
                "cycleLength": 14,
                "minChoresPerPerson": 2,
                "maxChoresPerPerson": 2,
                "cycleStartDay": "Tuesday",
                "deadlineDay": "Friday",
                "timezone": "America/New_York"
            }
        };
        
        console.log('Loaded sample data');
        this.updateUI();
    }
    
    saveData() {
        if (this.data) {
            // Update last updated timestamp
            this.data.metadata.lastUpdated = new Date().toISOString();
            localStorage.setItem('choreData', JSON.stringify(this.data));
            console.log('Data saved to localStorage');
            
            // Update last sync display
            document.getElementById('last-sync').textContent = new Date().toLocaleString();
        }
    }
    
    setupEventListeners() {
        // Violation management
        document.getElementById('violation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addViolation();
        });
        
        document.getElementById('remove-violation-btn').addEventListener('click', () => {
            this.removeViolation();
        });
        
        document.getElementById('violation-person').addEventListener('change', () => {
            this.updateChoreSelectForPerson();
        });
        
        // Cycle generation
        document.getElementById('generate-cycle-btn').addEventListener('click', () => {
            this.generateNewCycle();
        });
        
        // Import/Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
        
        document.getElementById('github-export-btn').addEventListener('click', () => {
            this.exportForGitHub();
        });
    }
    
    updateUI() {
        if (!this.data) return;
        
        this.updateStatistics();
        this.updateCycleInfo();
        this.updateAssignments();
        this.updatePreviousCycles();
        this.updateViolations();
        this.updatePersonSelect();
        this.createCharts();
    }
    
    updateStatistics() {
        // Update metadata and statistics information
        const metadata = this.data.metadata;
        const stats = this.data.statistics;
        
        document.getElementById('current-cycle-number').textContent = metadata.cycleNumber;
        document.getElementById('last-updated').textContent = new Date(metadata.lastUpdated).toLocaleString();
        document.getElementById('active-violations-count').textContent = this.data.violations.active.length;
        
        // Calculate overall completion rate
        const completionRates = Object.values(stats.completionRates);
        const averageRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
        document.getElementById('overall-completion-rate').textContent = `${(averageRate * 100).toFixed(1)}%`;
    }
    
    updateCycleInfo() {
        // Update cycle dates and countdown
        const cycle = this.data.currentCycle;
        if (!cycle) return;
        
        const startDate = new Date(cycle.startDate);
        const endDate = new Date(cycle.endDate);
        
        document.getElementById('cycle-start-date').textContent = startDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('cycle-end-date').textContent = endDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Calculate days remaining
        const today = new Date();
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        const daysElement = document.getElementById('days-remaining');
        daysElement.textContent = daysRemaining > 0 ? `${daysRemaining} days` : 'Expired';
        
        // Update status class
        daysElement.className = 'status';
        if (daysRemaining <= 0) {
            daysElement.classList.add('status--error');
        } else if (daysRemaining <= 2) {
            daysElement.classList.add('status--warning');
        } else {
            daysElement.classList.add('status--info');
        }
    }
    
    updateAssignments() {
        // Display current assignments with completion status
        const assignmentsContainer = document.getElementById('assignments-container');
        const cycle = this.data.currentCycle;
        
        if (!cycle || !cycle.assignments || cycle.assignments.length === 0) {
            assignmentsContainer.innerHTML = '<div class="status status--warning">No current assignments. Generate a new cycle to start.</div>';
            return;
        }
        
        let html = `
            <table class="assignment-table">
                <thead>
                    <tr>
                        <th>Person</th>
                        <th>Chore</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Group assignments by person
        const assignmentsByPerson = {};
        for (const assignment of cycle.assignments) {
            if (!assignmentsByPerson[assignment.person]) {
                assignmentsByPerson[assignment.person] = [];
            }
            assignmentsByPerson[assignment.person].push(assignment.chore);
        }
        
        // Sort people for consistent order
        const sortedPeople = Object.keys(assignmentsByPerson).sort();
        
        for (const person of sortedPeople) {
            const chores = assignmentsByPerson[person];
            const rowspan = chores.length;
            
            chores.forEach((chore, index) => {
                const key = `${person}-${chore}`;
                const isCompleted = this.data.completions[key] || false;
                
                html += `<tr>`;
                
                // Only add person cell on first chore
                if (index === 0) {
                    html += `<td rowspan="${rowspan}">${person}</td>`;
                }
                
                html += `
                    <td>${chore}</td>
                    <td>
                        <div class="checkbox-container">
                            <input type="checkbox" id="checkbox-${key.replace(/\s+/g, '-')}" 
                                data-person="${person}" data-chore="${chore}" 
                                ${isCompleted ? 'checked' : ''}>
                            <label for="checkbox-${key.replace(/\s+/g, '-')}">
                                ${isCompleted ? 
                                    '<span class="status status--success">Complete</span>' : 
                                    '<span class="status status--warning">Pending</span>'}
                            </label>
                        </div>
                    </td>
                </tr>`;
            });
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        assignmentsContainer.innerHTML = html;
        
        // Add event listeners to checkboxes
        const checkboxes = assignmentsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const person = e.target.dataset.person;
                const chore = e.target.dataset.chore;
                this.toggleCompletion(person, chore);
            });
        });
    }
    
    toggleCompletion(person, chore) {
        const key = `${person}-${chore}`;
        this.data.completions[key] = !this.data.completions[key];
        
        // Update completion rates in statistics
        this.updateCompletionRates();
        
        // Save data
        this.saveData();
        
        // Update UI
        this.updateUI();
    }
    
    updateCompletionRates() {
        // Calculate completion rates for each person
        const completionCounts = {};
        const totalCounts = {};
        
        // Initialize counts
        for (const person of this.people) {
            completionCounts[person] = 0;
            totalCounts[person] = 0;
        }
        
        // Count completions
        for (const [key, isCompleted] of Object.entries(this.data.completions)) {
            const [person] = key.split('-');
            
            if (this.people.includes(person)) {
                totalCounts[person]++;
                if (isCompleted) {
                    completionCounts[person]++;
                }
            }
        }
        
        // Calculate rates
        for (const person of this.people) {
            const rate = totalCounts[person] > 0 ? completionCounts[person] / totalCounts[person] : 1.0;
            this.data.statistics.completionRates[person] = rate;
        }
        
        // Update best performers list
        this.data.statistics.bestPerformers = [...this.people].sort((a, b) => {
            // Sort by completion rate (descending)
            const rateA = this.data.statistics.completionRates[a];
            const rateB = this.data.statistics.completionRates[b];
            
            if (rateA !== rateB) {
                return rateB - rateA;
            }
            
            // If rates are equal, sort by violation count (ascending)
            return this.data.statistics.violationCounts[a] - this.data.statistics.violationCounts[b];
        });
    }
    
    updatePreviousCycles() {
        const container = document.getElementById('previous-cycles-container');
        const previousCycles = this.data.previousCycles;
        
        if (!previousCycles || previousCycles.length === 0) {
            container.innerHTML = '<div class="status status--info">No previous cycles recorded.</div>';
            return;
        }
        
        let html = '';
        
        // Display cycles in reverse chronological order
        for (const cycle of [...previousCycles].reverse()) {
            const startDate = new Date(cycle.startDate);
            const endDate = new Date(cycle.endDate);
            
            html += `
                <div class="previous-cycle-item">
                    <div class="previous-cycle-header">
                        <h4>Cycle ${previousCycles.indexOf(cycle) + 1}</h4>
                        <div class="cycle-dates-small">
                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                        </div>
                    </div>
                    
                    <table class="assignment-table">
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Chore</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Group assignments by person
            const assignmentsByPerson = {};
            for (const assignment of cycle.assignments) {
                if (!assignmentsByPerson[assignment.person]) {
                    assignmentsByPerson[assignment.person] = [];
                }
                assignmentsByPerson[assignment.person].push(assignment.chore);
            }
            
            // Sort people for consistent order
            const sortedPeople = Object.keys(assignmentsByPerson).sort();
            
            for (const person of sortedPeople) {
                const chores = assignmentsByPerson[person];
                const rowspan = chores.length;
                
                chores.forEach((chore, index) => {
                    html += `<tr>`;
                    
                    // Only add person cell on first chore
                    if (index === 0) {
                        html += `<td rowspan="${rowspan}">${person}</td>`;
                    }
                    
                    html += `<td>${chore}</td></tr>`;
                });
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    updateViolations() {
        const activeContainer = document.getElementById('active-violations-container');
        const historyContainer = document.getElementById('violation-history-container');
        
        // Update active violations
        if (!this.data.violations.active || this.data.violations.active.length === 0) {
            activeContainer.innerHTML = '<div class="status status--success">No active violations.</div>';
        } else {
            let activeHtml = '';
            
            for (const violation of this.data.violations.active) {
                activeHtml += `
                    <div class="violation-item" data-id="${violation.id}">
                        <div class="violation-details">
                            <div>
                                <span class="violation-person">${violation.person}</span>
                                <span class="violation-date">${new Date(violation.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="violation-chore">${violation.chore}</div>
                            ${violation.carryOver ? '<span class="status status--warning">Carry Over</span>' : ''}
                        </div>
                        <div class="violation-actions">
                            <button class="btn btn--sm btn--outline remove-violation-btn" data-id="${violation.id}">Remove</button>
                        </div>
                    </div>
                `;
            }
            
            activeContainer.innerHTML = activeHtml;
            
            // Add event listeners to remove buttons
            const removeButtons = activeContainer.querySelectorAll('.remove-violation-btn');
            removeButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.removeViolationById(id);
                });
            });
        }
        
        // Update violation history
        if (!this.data.violations.history || this.data.violations.history.length === 0) {
            historyContainer.innerHTML = '<div class="status status--info">No violation history.</div>';
        } else {
            let historyHtml = '';
            
            for (const violation of this.data.violations.history) {
                historyHtml += `
                    <div class="violation-item history-item">
                        <div class="violation-details">
                            <div>
                                <span class="violation-person">${violation.person}</span>
                                <span class="violation-date">${new Date(violation.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="violation-chore">${violation.chore}</div>
                            ${violation.resolved ? 
                                `<div class="violation-date">Resolved: ${new Date(violation.resolved).toLocaleString()}</div>` : 
                                ''}
                        </div>
                    </div>
                `;
            }
            
            historyContainer.innerHTML = historyHtml;
        }
    }
    
    updatePersonSelect() {
        const personSelect = document.getElementById('violation-person');
        const choreSelect = document.getElementById('violation-chore');
        
        // Clear current options
        personSelect.innerHTML = '<option value="">Select person...</option>';
        choreSelect.innerHTML = '<option value="">Select chore...</option>';
        
        // Add options for each person
        for (const person of this.people) {
            const option = document.createElement('option');
            option.value = person;
            option.textContent = person;
            personSelect.appendChild(option);
        }
        
        // Set current date in the date field
        const dateInput = document.getElementById('violation-date');
        const now = new Date();
        dateInput.value = now.toISOString().slice(0, 16);
    }
    
    updateChoreSelectForPerson() {
        const personSelect = document.getElementById('violation-person');
        const choreSelect = document.getElementById('violation-chore');
        const selectedPerson = personSelect.value;
        
        // Clear current options
        choreSelect.innerHTML = '<option value="">Select chore...</option>';
        
        if (!selectedPerson || !this.data.currentCycle) return;
        
        // Find chores assigned to the selected person
        const personChores = this.data.currentCycle.assignments
            .filter(assignment => assignment.person === selectedPerson)
            .map(assignment => assignment.chore);
        
        // Add options for each chore
        for (const chore of personChores) {
            const option = document.createElement('option');
            option.value = chore;
            option.textContent = chore;
            choreSelect.appendChild(option);
        }
    }
    
    addViolation() {
        const person = document.getElementById('violation-person').value;
        const chore = document.getElementById('violation-chore').value;
        const date = document.getElementById('violation-date').value;
        const carryOver = document.getElementById('violation-carry-over').value === 'true';
        
        if (!person || !chore || !date) {
            alert('Please select a person, chore, and date for the violation.');
            return;
        }
        
        // Create a new violation
        const violation = {
            id: `v${Date.now()}`,
            person: person,
            chore: chore,
            cycle: this.data.currentCycle.id,
            timestamp: new Date(date).toISOString(),
            carryOver: carryOver
        };
        
        // Add to active violations
        this.data.violations.active.push(violation);
        
        // Update violation counts in statistics
        this.data.statistics.violationCounts[person] = (this.data.statistics.violationCounts[person] || 0) + 1;
        
        // Save data
        this.saveData();
        
        // Reset form
        document.getElementById('violation-person').value = '';
        document.getElementById('violation-chore').value = '';
        document.getElementById('violation-carry-over').value = 'true';
        
        // Update UI
        this.updateUI();
    }
    
    removeViolation() {
        const person = document.getElementById('violation-person').value;
        const chore = document.getElementById('violation-chore').value;
        
        if (!person || !chore) {
            alert('Please select a person and chore to remove the violation.');
            return;
        }
        
        // Find the violation
        const index = this.data.violations.active.findIndex(v => 
            v.person === person && v.chore === chore
        );
        
        if (index === -1) {
            alert('No active violation found for this person and chore.');
            return;
        }
        
        this.resolveViolation(this.data.violations.active[index]);
    }
    
    removeViolationById(id) {
        // Find the violation
        const index = this.data.violations.active.findIndex(v => v.id === id);
        
        if (index === -1) {
            console.error('Violation not found:', id);
            return;
        }
        
        this.resolveViolation(this.data.violations.active[index]);
    }
    
    resolveViolation(violation) {
        // Mark as resolved
        violation.resolved = new Date().toISOString();
        
        // Move to history
        this.data.violations.history.push(violation);
        
        // Remove from active
        this.data.violations.active = this.data.violations.active.filter(v => v.id !== violation.id);
        
        // Save data
        this.saveData();
        
        // Update UI
        this.updateUI();
    }
    
    generateNewCycle() {
        const button = document.getElementById('generate-cycle-btn');
        const resultDiv = document.getElementById('generation-result');
        
        // Add loading state
        button.disabled = true;
        button.classList.add('is-loading');
        resultDiv.innerHTML = '';
        resultDiv.classList.add('hidden');
        
        // Generate the cycle (slight delay for visual feedback)
        setTimeout(() => {
            try {
                this.createNewCycle();
                
                // Success message
                resultDiv.innerHTML = '<div class="status status--success">New cycle generated successfully!</div>';
                resultDiv.classList.remove('hidden');
                
                // Save and update UI
                this.saveData();
                this.updateUI();
                
            } catch (error) {
                console.error('Error generating cycle:', error);
                resultDiv.innerHTML = `<div class="status status--error">Error: ${error.message}</div>`;
                resultDiv.classList.remove('hidden');
            }
            
            // Remove loading state
            button.disabled = false;
            button.classList.remove('is-loading');
        }, 800);
    }
    
    createNewCycle() {
        // Store current cycle in previous cycles if it exists
        if (this.data.currentCycle) {
            this.data.previousCycles.push(this.data.currentCycle);
        }
        
        // Get previous assignments to avoid repetition
        const previousAssignments = new Map();
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            for (const assignment of this.data.currentCycle.assignments) {
                if (!previousAssignments.has(assignment.person)) {
                    previousAssignments.set(assignment.person, []);
                }
                previousAssignments.get(assignment.person).push(assignment.chore);
            }
        }
        
        // Create a new cycle
        const now = new Date();
        const cycleId = Date.now();
        
        // Calculate start date (next Tuesday)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() + (2 - now.getDay() + 7) % 7);  // Next Tuesday
        
        if (startDate <= now) {
            startDate.setDate(startDate.getDate() + 7);  // If today is Tuesday, go to next week
        }
        
        // Calculate end date (following Friday)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);  // Friday is 3 days after Tuesday
        
        // Generate assignments ensuring no person gets the same chore as before
        const assignments = this.generateAssignments(previousAssignments);
        
        // Create the new cycle
        this.data.currentCycle = {
            id: cycleId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            assignments: assignments,
            created: now.toISOString()
        };
        
        // Update metadata
        this.data.metadata.cycleNumber++;
        this.data.metadata.lastUpdated = now.toISOString();
        
        // Initialize completions
        for (const assignment of assignments) {
            const key = `${assignment.person}-${assignment.chore}`;
            this.data.completions[key] = false;
        }
        
        // Include carry-over violations
        this.handleCarryOverViolations();
        
        return this.data.currentCycle;
    }
    
    handleCarryOverViolations() {
        // Find violations that should carry over to the new cycle
        const carryOverViolations = this.data.violations.active.filter(v => v.carryOver);
        
        if (carryOverViolations.length === 0) return;
        
        // Add these chores to the person's assignments in the new cycle
        for (const violation of carryOverViolations) {
            // Check if this chore is already assigned to someone else
            const existingAssignment = this.data.currentCycle.assignments.find(
                a => a.chore === violation.chore
            );
            
            if (existingAssignment) {
                // Remove from other person
                this.data.currentCycle.assignments = this.data.currentCycle.assignments.filter(
                    a => !(a.person === existingAssignment.person && a.chore === violation.chore)
                );
            }
            
            // Add to the violating person
            this.data.currentCycle.assignments.push({
                person: violation.person,
                chore: violation.chore
            });
            
            // Initialize completion status
            const key = `${violation.person}-${violation.chore}`;
            this.data.completions[key] = false;
            
            // Mark violation as handled by creating a new entry in history
            violation.resolved = new Date().toISOString();
            violation.carryOverHandled = true;
            this.data.violations.history.push({...violation});
        }
        
        // Remove handled violations from active list
        this.data.violations.active = this.data.violations.active.filter(v => !v.carryOverHandled);
    }
    
    generateAssignments(previousAssignments) {
        const assignments = [];
        const choreAssignments = new Map(); // Track which chores are assigned
        const personChores = new Map();     // Track how many chores each person has
        
        // Initialize personChores
        for (const person of this.people) {
            personChores.set(person, []);
        }
        
        // First, randomly distribute one chore to each person
        const shuffledPeople = [...this.people].sort(() => Math.random() - 0.5);
        const shuffledChores = [...this.chores].sort(() => Math.random() - 0.5);
        
        for (const person of shuffledPeople) {
            // Find a chore that wasn't assigned to this person in the previous cycle
            const prevChores = previousAssignments?.get(person) || [];
            
            let assignedChore = false;
            
            for (const chore of shuffledChores) {
                if (!choreAssignments.has(chore) && !prevChores.includes(chore)) {
                    assignments.push({ person, chore });
                    choreAssignments.set(chore, person);
                    personChores.get(person).push(chore);
                    assignedChore = true;
                    break;
                }
            }
            
            // If we couldn't find a chore that wasn't previously assigned,
            // just pick any unassigned chore
            if (!assignedChore) {
                for (const chore of shuffledChores) {
                    if (!choreAssignments.has(chore)) {
                        assignments.push({ person, chore });
                        choreAssignments.set(chore, person);
                        personChores.get(person).push(chore);
                        break;
                    }
                }
            }
        }
        
        // Now assign a second chore to each person
        for (const person of shuffledPeople) {
            // Skip if person already has 2 chores (from carry-over violations)
            if (personChores.get(person).length >= 2) continue;
            
            const prevChores = previousAssignments?.get(person) || [];
            const assignedChores = personChores.get(person);
            
            let assignedSecondChore = false;
            
            for (const chore of shuffledChores) {
                if (!choreAssignments.has(chore) && !prevChores.includes(chore) && !assignedChores.includes(chore)) {
                    assignments.push({ person, chore });
                    choreAssignments.set(chore, person);
                    personChores.get(person).push(chore);
                    assignedSecondChore = true;
                    break;
                }
            }
            
            // If we couldn't find a suitable second chore, just pick any unassigned chore
            if (!assignedSecondChore) {
                for (const chore of shuffledChores) {
                    if (!choreAssignments.has(chore)) {
                        assignments.push({ person, chore });
                        choreAssignments.set(chore, person);
                        personChores.get(person).push(chore);
                        break;
                    }
                }
            }
        }
        
        // Make sure all chores are assigned
        for (const chore of this.chores) {
            if (!choreAssignments.has(chore)) {
                // Find person with fewest chores
                let minPerson = this.people[0];
                let minChores = personChores.get(minPerson).length;
                
                for (const person of this.people) {
                    if (personChores.get(person).length < minChores) {
                        minPerson = person;
                        minChores = personChores.get(person).length;
                    }
                }
                
                assignments.push({ person: minPerson, chore });
                choreAssignments.set(chore, minPerson);
                personChores.get(minPerson).push(chore);
            }
        }
        
        return assignments;
    }
    
    createCharts() {
        this.createCompletionRateChart();
        this.createViolationChart();
    }
    
    createCompletionRateChart() {
        const ctx = document.getElementById('completion-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.completionChart) {
            window.completionChart.destroy();
        }
        
        const labels = this.people;
        const rates = labels.map(person => {
            const rate = this.data.statistics.completionRates[person] || 0;
            return Math.round(rate * 100);
        });
        
        window.completionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: rates,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Completion Rate (%)'
                        }
                    }
                }
            }
        });
    }
    
    createViolationChart() {
        const ctx = document.getElementById('violation-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.violationChart) {
            window.violationChart.destroy();
        }
        
        const labels = this.people;
        const violations = labels.map(person => this.data.statistics.violationCounts[person] || 0);
        
        window.violationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Violation Count',
                    data: violations,
                    backgroundColor: '#B4413C',
                    borderColor: '#B4413C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: 'Number of Violations'
                        }
                    }
                }
            }
        });
    }
    
    exportData() {
        // Create a JSON blob
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chore-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        const statusDiv = document.getElementById('import-export-status');
        statusDiv.textContent = 'Data exported successfully!';
        statusDiv.className = 'mt-8 status status--success';
        statusDiv.classList.remove('hidden');
        
        // Clear message after 3 seconds
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
    
    async importData(file) {
        if (!file) return;
        
        const statusDiv = document.getElementById('import-export-status');
        
        try {
            // Read file
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validate data
            if (!importedData.metadata || !importedData.currentCycle) {
                throw new Error('Invalid data format. Missing required fields.');
            }
            
            // Update data
            this.data = importedData;
            
            // Save to localStorage
            this.saveData();
            
            // Update UI
            this.updateUI();
            
            // Show success message
            statusDiv.textContent = 'Data imported successfully!';
            statusDiv.className = 'mt-8 status status--success';
            statusDiv.classList.remove('hidden');
            
        } catch (error) {
            console.error('Import error:', error);
            
            // Show error message
            statusDiv.textContent = `Error importing data: ${error.message}`;
            statusDiv.className = 'mt-8 status status--error';
            statusDiv.classList.remove('hidden');
        }
        
        // Reset file input
        document.getElementById('import-file').value = '';
        
        // Clear message after 5 seconds
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 5000);
    }
    
    exportForGitHub() {
        // Format data for GitHub
        const githubData = {
            metadata: this.data.metadata,
            currentCycle: this.data.currentCycle,
            previousCycles: this.data.previousCycles,
            completions: this.data.completions,
            violations: this.data.violations,
            statistics: this.data.statistics,
            settings: this.data.settings
        };
        
        // Create a JSON blob
        const dataStr = JSON.stringify(githubData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'current-chore-data.json';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        const statusDiv = document.getElementById('import-export-status');
        statusDiv.innerHTML = `
            <div class="status status--success">
                <p>GitHub file generated successfully!</p>
                <p>Upload this file to your GitHub repository as <code>current-chore-data.json</code></p>
            </div>
        `;
        statusDiv.classList.remove('hidden');
        
        // Don't auto-clear this message as it contains instructions
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const choreManager = new ChoreManager();
    
    // Make available globally for debugging
    window.choreManager = choreManager;
});