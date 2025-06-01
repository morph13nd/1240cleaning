// Bi-Weekly Chore Management Application

class ChoreManager {
    constructor() {
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
        
        // Initialize with default data structure to prevent undefined errors
        this.data = {
            metadata: {
                lastUpdated: new Date().toISOString(),
                version: "2.1",
                cycleNumber: 1,
                description: "Bi-weekly chore assignments for Shabbat cleanup"
            },
            currentCycle: null,
            previousCycles: [],  // Ensure this is always an array
            violations: [],      // Simplified violations structure
            people: this.people,
            chores: this.chores,
            settings: {
                cycleLength: 14,
                minChoresPerPerson: 2,
                maxChoresPerPerson: 2,
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
        
        this.init();
    }
    
    async init() {
        // Try to load data from provided JSON structure first
        this.loadSampleData();
        this.setupEventListeners();
        this.updateUI();
        document.getElementById('last-sync').textContent = new Date().toLocaleString();
    }
    
    loadSampleData() {
        // Use the provided JSON data structure
        const sampleData = {
            "metadata": {
                "lastUpdated": "2025-05-31T04:12:00.000Z",
                "version": "2.1", 
                "cycleNumber": 2,
                "description": "Bi-weekly chore assignments for Shabbat cleanup"
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
                "created": "2025-05-30T21:25:09.493Z"
            },
            "previousCycles": [
                {
                    "id": 1748580000000,
                    "startDate": "2025-05-27T00:00:00.000Z",
                    "endDate": "2025-05-30T00:00:00.000Z", 
                    "assignments": [
                        {"person": "Adam", "chore": "Vacuum kitchen"},
                        {"person": "Adam", "chore": "General tidy-up of common spaces"},
                        {"person": "Ben", "chore": "Second-floor bathroom, mop floor & toilet"},
                        {"person": "Ben", "chore": "Vacuum stairs"}
                    ],
                    "completions": {
                        "Adam-Vacuum kitchen": true,
                        "Adam-General tidy-up of common spaces": true,
                        "Ben-Second-floor bathroom, mop floor & toilet": true,
                        "Ben-Vacuum stairs": true
                    },
                    "created": "2025-05-27T10:00:00.000Z"
                }
            ],
            "violations": [
                {
                    "id": "v_1717110000_abc123",
                    "person": "Jonah",
                    "chore": "Mop down kitchen",
                    "cycleId": 1748640309493,
                    "timestamp": "2025-05-31T02:30:00.000Z",
                    "resolved": false
                },
                {
                    "id": "v_1717110060_def456", 
                    "person": "Jonah",
                    "chore": "Vacuum living room",
                    "cycleId": 1748640309493,
                    "timestamp": "2025-05-31T02:31:00.000Z",
                    "resolved": false
                }
            ],
            "people": this.people,
            "chores": this.chores,
            "settings": {
                "cycleLength": 14,
                "minChoresPerPerson": 2,
                "maxChoresPerPerson": 3,
                "cycleStartDay": "Tuesday",
                "deadlineDay": "Friday",
                "timezone": "America/New_York"
            },
            "statistics": {
                "totalCycles": 2,
                "totalViolations": 2,
                "completionRates": {
                    "Adam": 1.0,
                    "Ben": 1.0,
                    "Isaac": 1.0,
                    "Jason": 1.0,
                    "Jonah": 0.5,
                    "Nahum": 1.0,
                    "Oliver": 1.0,
                    "Spencer": 1.0
                }
            }
        };
        
        // Merge sample data with our data structure
        this.data = { ...this.data, ...sampleData };
        
        // Ensure arrays are properly initialized
        if (!Array.isArray(this.data.previousCycles)) {
            this.data.previousCycles = [];
        }
        if (!Array.isArray(this.data.violations)) {
            this.data.violations = [];
        }
        
        console.log('Sample data loaded successfully');
    }
    
    saveData() {
        // Update metadata
        this.data.metadata.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        try {
            localStorage.setItem('choreData', JSON.stringify(this.data, null, 2));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
        }
        
        // Update last sync display
        document.getElementById('last-sync').textContent = new Date().toLocaleString();
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
        
        // Important: Add event listener for person selection change
        document.getElementById('violation-person').addEventListener('change', (e) => {
            console.log('Person changed to:', e.target.value);
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
        this.updateStatistics();
        this.updateCycleInfo();
        this.updateAssignments();
        this.updatePreviousCycles();
        this.updateViolations();
        this.updateViolationSelects();
        this.createCharts();
    }
    
    updateStatistics() {
        const metadata = this.data.metadata;
        const stats = this.data.statistics;
        
        document.getElementById('current-cycle-number').textContent = metadata.cycleNumber;
        document.getElementById('last-updated').textContent = new Date(metadata.lastUpdated).toLocaleString();
        document.getElementById('active-violations-count').textContent = this.data.violations.filter(v => !v.resolved).length;
        
        // Calculate overall completion rate
        const completionRates = Object.values(stats.completionRates || {});
        const averageRate = completionRates.length > 0 ? 
            completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length : 0;
        document.getElementById('overall-completion-rate').textContent = `${(averageRate * 100).toFixed(1)}%`;
    }
    
    updateCycleInfo() {
        if (!this.data.currentCycle) return;
        
        const cycle = this.data.currentCycle;
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
        const container = document.getElementById('assignments-container');
        
        if (!this.data.currentCycle || !this.data.currentCycle.assignments) {
            container.innerHTML = '<div class="status status--warning">No current assignments. Generate a new cycle to start.</div>';
            return;
        }
        
        const assignments = this.data.currentCycle.assignments;
        const completions = this.data.currentCycle.completions || {};
        
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
        assignments.forEach(assignment => {
            if (!assignmentsByPerson[assignment.person]) {
                assignmentsByPerson[assignment.person] = [];
            }
            assignmentsByPerson[assignment.person].push(assignment.chore);
        });
        
        // Sort people for consistent order
        const sortedPeople = Object.keys(assignmentsByPerson).sort();
        
        sortedPeople.forEach(person => {
            const chores = assignmentsByPerson[person];
            const rowspan = chores.length;
            
            chores.forEach((chore, index) => {
                const key = `${person}-${chore}`;
                const isCompleted = completions[key] || false;
                const checkboxId = `checkbox-${key.replace(/[^a-zA-Z0-9]/g, '')}`;
                
                html += `<tr>`;
                
                // Only add person cell on first chore
                if (index === 0) {
                    html += `<td rowspan="${rowspan}" class="person-cell">${person}</td>`;
                }
                
                html += `
                    <td>${chore}</td>
                    <td>
                        <div class="completion-status">
                            <input type="checkbox" id="${checkboxId}" 
                                data-person="${person}" data-chore="${chore}" 
                                ${isCompleted ? 'checked' : ''}>
                            <label for="${checkboxId}">
                                ${isCompleted ? 
                                    '<span class="status status--success">Complete</span>' : 
                                    '<span class="status status--warning">Pending</span>'}
                            </label>
                        </div>
                    </td>
                </tr>`;
            });
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        // Add event listeners to checkboxes
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
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
        
        if (!this.data.currentCycle.completions) {
            this.data.currentCycle.completions = {};
        }
        
        this.data.currentCycle.completions[key] = !this.data.currentCycle.completions[key];
        
        // Update completion rates in statistics
        this.updateCompletionRates();
        
        // Save data and update UI
        this.saveData();
        this.updateAssignments();
        this.updateStatistics();
    }
    
    updateCompletionRates() {
        const completionCounts = {};
        const totalCounts = {};
        
        // Initialize counts
        this.people.forEach(person => {
            completionCounts[person] = 0;
            totalCounts[person] = 0;
        });
        
        // Count completions from current cycle
        if (this.data.currentCycle && this.data.currentCycle.completions) {
            Object.entries(this.data.currentCycle.completions).forEach(([key, isCompleted]) => {
                const [person] = key.split('-');
                if (this.people.includes(person)) {
                    totalCounts[person]++;
                    if (isCompleted) {
                        completionCounts[person]++;
                    }
                }
            });
        }
        
        // Count completions from previous cycles
        this.data.previousCycles.forEach(cycle => {
            if (cycle.completions) {
                Object.entries(cycle.completions).forEach(([key, isCompleted]) => {
                    const [person] = key.split('-');
                    if (this.people.includes(person)) {
                        totalCounts[person]++;
                        if (isCompleted) {
                            completionCounts[person]++;
                        }
                    }
                });
            }
        });
        
        // Calculate rates
        this.people.forEach(person => {
            const rate = totalCounts[person] > 0 ? completionCounts[person] / totalCounts[person] : 1.0;
            this.data.statistics.completionRates[person] = rate;
        });
    }
    
    updatePreviousCycles() {
        const container = document.getElementById('previous-cycles-container');
        
        if (!this.data.previousCycles || this.data.previousCycles.length === 0) {
            container.innerHTML = '<div class="status status--info">No previous cycles recorded.</div>';
            return;
        }
        
        let html = '';
        
        // Display cycles in reverse chronological order
        [...this.data.previousCycles].reverse().forEach((cycle, index) => {
            const startDate = new Date(cycle.startDate);
            const endDate = new Date(cycle.endDate);
            
            html += `
                <div class="previous-cycle-item">
                    <div class="previous-cycle-header">
                        <h4>Cycle ${this.data.previousCycles.length - index}</h4>
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
            cycle.assignments.forEach(assignment => {
                if (!assignmentsByPerson[assignment.person]) {
                    assignmentsByPerson[assignment.person] = [];
                }
                assignmentsByPerson[assignment.person].push(assignment.chore);
            });
            
            // Sort people for consistent order
            const sortedPeople = Object.keys(assignmentsByPerson).sort();
            
            sortedPeople.forEach(person => {
                const chores = assignmentsByPerson[person];
                const rowspan = chores.length;
                
                chores.forEach((chore, choreIndex) => {
                    html += `<tr>`;
                    
                    // Only add person cell on first chore
                    if (choreIndex === 0) {
                        html += `<td rowspan="${rowspan}">${person}</td>`;
                    }
                    
                    html += `<td>${chore}</td></tr>`;
                });
            });
            
            html += `</tbody></table></div>`;
        });
        
        container.innerHTML = html;
    }
    
    updateViolations() {
        const container = document.getElementById('active-violations-container');
        
        const activeViolations = this.data.violations.filter(v => !v.resolved);
        
        if (activeViolations.length === 0) {
            container.innerHTML = '<div class="status status--success">No active violations.</div>';
        } else {
            let html = '';
            
            activeViolations.forEach(violation => {
                html += `
                    <div class="violation-item" data-id="${violation.id}">
                        <div class="violation-details">
                            <div>
                                <span class="violation-person">${violation.person}</span>
                                <span class="violation-date">${new Date(violation.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="violation-chore">${violation.chore}</div>
                        </div>
                        <div class="violation-actions">
                            <button class="remove-violation-btn" data-id="${violation.id}">Remove</button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
            // Add event listeners to remove buttons
            const removeButtons = container.querySelectorAll('.remove-violation-btn');
            removeButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.removeViolationById(id);
                });
            });
        }
    }
    
    updateViolationSelects() {
        const personSelect = document.getElementById('violation-person');
        const choreSelect = document.getElementById('violation-chore');
        
        console.log('Updating violation selects...');
        
        // Clear and populate person select
        personSelect.innerHTML = '<option value="">Select person...</option>';
        this.people.forEach(person => {
            const option = document.createElement('option');
            option.value = person;
            option.textContent = person;
            personSelect.appendChild(option);
        });
        
        // Clear chore select initially
        choreSelect.innerHTML = '<option value="">Select person first...</option>';
        
        // Set current date in the date field
        const dateInput = document.getElementById('violation-date');
        const now = new Date();
        dateInput.value = now.toISOString().slice(0, 16);
        
        console.log('Violation selects updated');
    }
    
    updateChoreSelectForPerson() {
        const personSelect = document.getElementById('violation-person');
        const choreSelect = document.getElementById('violation-chore');
        const selectedPerson = personSelect.value;
        
        console.log('Updating chore select for person:', selectedPerson);
        
        // Clear current options
        choreSelect.innerHTML = '<option value="">Select chore...</option>';
        
        if (!selectedPerson) {
            choreSelect.innerHTML = '<option value="">Select person first...</option>';
            return;
        }
        
        if (!this.data.currentCycle || !this.data.currentCycle.assignments) {
            choreSelect.innerHTML = '<option value="">No current cycle available</option>';
            return;
        }
        
        // Find chores assigned to the selected person
        const personChores = this.data.currentCycle.assignments
            .filter(assignment => assignment.person === selectedPerson)
            .map(assignment => assignment.chore);
        
        console.log('Person chores found:', personChores);
        
        if (personChores.length === 0) {
            choreSelect.innerHTML = '<option value="">No chores assigned to this person</option>';
            return;
        }
        
        // Add options for each chore
        personChores.forEach(chore => {
            const option = document.createElement('option');
            option.value = chore;
            option.textContent = chore;
            choreSelect.appendChild(option);
        });
        
        console.log('Chore select updated with', personChores.length, 'chores');
    }
    
    addViolation() {
        const person = document.getElementById('violation-person').value;
        const chore = document.getElementById('violation-chore').value;
        const date = document.getElementById('violation-date').value;
        
        console.log('Adding violation:', { person, chore, date });
        
        if (!person || !chore || !date) {
            alert('Please select a person, chore, and date for the violation.');
            return;
        }
        
        // Create a new violation
        const violation = {
            id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            person: person,
            chore: chore,
            cycleId: this.data.currentCycle ? this.data.currentCycle.id : null,
            timestamp: new Date(date).toISOString(),
            resolved: false
        };
        
        // Add to violations array
        this.data.violations.push(violation);
        
        // Update statistics
        this.data.statistics.totalViolations = this.data.violations.length;
        
        // Save data
        this.saveData();
        
        // Reset form
        document.getElementById('violation-person').value = '';
        document.getElementById('violation-chore').innerHTML = '<option value="">Select person first...</option>';
        
        // Update UI
        this.updateViolations();
        this.updateStatistics();
        
        console.log('Violation added successfully');
        alert('Violation added successfully!');
    }
    
    removeViolation() {
        const person = document.getElementById('violation-person').value;
        const chore = document.getElementById('violation-chore').value;
        
        console.log('Removing violation:', { person, chore });
        
        if (!person || !chore) {
            alert('Please select a person and chore to remove the violation.');
            return;
        }
        
        // Find the violation
        const index = this.data.violations.findIndex(v => 
            v.person === person && v.chore === chore && !v.resolved
        );
        
        if (index === -1) {
            alert('No active violation found for this person and chore.');
            return;
        }
        
        // Remove the violation
        this.data.violations.splice(index, 1);
        
        // Update statistics
        this.data.statistics.totalViolations = this.data.violations.length;
        
        // Save data
        this.saveData();
        
        // Reset form
        document.getElementById('violation-person').value = '';
        document.getElementById('violation-chore').innerHTML = '<option value="">Select person first...</option>';
        
        // Update UI
        this.updateViolations();
        this.updateStatistics();
        
        console.log('Violation removed successfully');
        alert('Violation removed successfully!');
    }
    
    removeViolationById(id) {
        console.log('Removing violation by ID:', id);
        
        // Find and remove the violation
        const index = this.data.violations.findIndex(v => v.id === id);
        
        if (index === -1) {
            console.error('Violation not found:', id);
            return;
        }
        
        this.data.violations.splice(index, 1);
        
        // Update statistics
        this.data.statistics.totalViolations = this.data.violations.length;
        
        // Save data and update UI
        this.saveData();
        this.updateViolations();
        this.updateStatistics();
        
        console.log('Violation removed successfully');
    }
    
    generateNewCycle() {
        const button = document.getElementById('generate-cycle-btn');
        const resultDiv = document.getElementById('generation-result');
        
        console.log('Generating new cycle...');
        
        // Add loading state
        button.disabled = true;
        button.classList.add('is-loading');
        resultDiv.innerHTML = '';
        resultDiv.classList.add('hidden');
        
        setTimeout(() => {
            try {
                this.createNewCycle();
                
                // Success message
                resultDiv.innerHTML = '<div class="status status--success">New cycle generated successfully!</div>';
                resultDiv.classList.remove('hidden');
                
                // Save and update UI
                this.saveData();
                this.updateUI();
                
                console.log('New cycle generated successfully');
                
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
        // Ensure previousCycles is initialized as an array
        if (!Array.isArray(this.data.previousCycles)) {
            this.data.previousCycles = [];
        }
        
        // Store current cycle in previous cycles if it exists
        if (this.data.currentCycle) {
            this.data.previousCycles.push(this.data.currentCycle);
        }
        
        // Get previous assignments to avoid repetition
        const previousAssignments = new Map();
        if (this.data.currentCycle && this.data.currentCycle.assignments) {
            this.data.currentCycle.assignments.forEach(assignment => {
                if (!previousAssignments.has(assignment.person)) {
                    previousAssignments.set(assignment.person, []);
                }
                previousAssignments.get(assignment.person).push(assignment.chore);
            });
        }
        
        // Create a new cycle
        const now = new Date();
        const cycleId = Date.now();
        
        // Calculate start date (next Tuesday)
        const startDate = new Date(now);
        const daysUntilTuesday = (2 - startDate.getDay() + 7) % 7;
        if (daysUntilTuesday === 0) {
            startDate.setDate(startDate.getDate() + 7); // If today is Tuesday, go to next week
        } else {
            startDate.setDate(startDate.getDate() + daysUntilTuesday);
        }
        
        // Calculate end date (following Friday)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3); // Friday is 3 days after Tuesday
        
        // Generate assignments ensuring no person gets the same chore as before
        const assignments = this.generateAssignments(previousAssignments);
        
        // Create the new cycle
        this.data.currentCycle = {
            id: cycleId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            assignments: assignments,
            completions: {},
            created: now.toISOString()
        };
        
        // Initialize completions
        assignments.forEach(assignment => {
            const key = `${assignment.person}-${assignment.chore}`;
            this.data.currentCycle.completions[key] = false;
        });
        
        // Update metadata
        this.data.metadata.cycleNumber++;
        this.data.metadata.lastUpdated = now.toISOString();
        this.data.statistics.totalCycles = this.data.metadata.cycleNumber;
        
        console.log('New cycle created:', this.data.currentCycle);
        
        return this.data.currentCycle;
    }
    
    generateAssignments(previousAssignments) {
        const assignments = [];
        const choreAssignments = new Map();
        const personChores = new Map();
        
        // Initialize personChores
        this.people.forEach(person => {
            personChores.set(person, []);
        });
        
        // Shuffle arrays for randomness
        const shuffledPeople = [...this.people].sort(() => Math.random() - 0.5);
        const shuffledChores = [...this.chores].sort(() => Math.random() - 0.5);
        
        // First pass: assign one chore to each person
        shuffledPeople.forEach(person => {
            const prevChores = previousAssignments?.get(person) || [];
            let assignedChore = false;
            
            // Try to find a chore that wasn't assigned to this person in the previous cycle
            for (const chore of shuffledChores) {
                if (!choreAssignments.has(chore) && !prevChores.includes(chore)) {
                    assignments.push({ person, chore });
                    choreAssignments.set(chore, person);
                    personChores.get(person).push(chore);
                    assignedChore = true;
                    break;
                }
            }
            
            // If no suitable chore found, just pick any unassigned chore
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
        });
        
        // Second pass: assign a second chore to each person
        shuffledPeople.forEach(person => {
            if (personChores.get(person).length >= 2) return;
            
            const prevChores = previousAssignments?.get(person) || [];
            const assignedChores = personChores.get(person);
            let assignedSecondChore = false;
            
            for (const chore of shuffledChores) {
                if (!choreAssignments.has(chore) && 
                    !prevChores.includes(chore) && 
                    !assignedChores.includes(chore)) {
                    assignments.push({ person, chore });
                    choreAssignments.set(chore, person);
                    personChores.get(person).push(chore);
                    assignedSecondChore = true;
                    break;
                }
            }
            
            // If still no suitable chore found, just pick any unassigned chore
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
        });
        
        // Ensure all chores are assigned
        this.chores.forEach(chore => {
            if (!choreAssignments.has(chore)) {
                // Find person with fewest chores
                let minPerson = this.people[0];
                let minChores = personChores.get(minPerson).length;
                
                this.people.forEach(person => {
                    if (personChores.get(person).length < minChores) {
                        minPerson = person;
                        minChores = personChores.get(person).length;
                    }
                });
                
                assignments.push({ person: minPerson, chore });
                choreAssignments.set(chore, minPerson);
                personChores.get(minPerson).push(chore);
            }
        });
        
        return assignments;
    }
    
    createCharts() {
        this.createCompletionRateChart();
        this.createViolationChart();
    }
    
    createCompletionRateChart() {
        const ctx = document.getElementById('completion-chart');
        if (!ctx) return;
        
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
        const ctx = document.getElementById('violation-chart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (window.violationChart) {
            window.violationChart.destroy();
        }
        
        const labels = this.people;
        const violations = labels.map(person => {
            return this.data.violations.filter(v => v.person === person).length;
        });
        
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
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chore-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showImportExportStatus('Data exported successfully!', 'success');
    }
    
    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validate data structure
            if (!importedData.metadata || !importedData.people || !importedData.chores) {
                throw new Error('Invalid data format. Missing required fields.');
            }
            
            // Ensure arrays are properly initialized
            if (!Array.isArray(importedData.previousCycles)) {
                importedData.previousCycles = [];
            }
            if (!Array.isArray(importedData.violations)) {
                importedData.violations = [];
            }
            
            // Update data
            this.data = importedData;
            
            // Save and update UI
            this.saveData();
            this.updateUI();
            
            this.showImportExportStatus('Data imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showImportExportStatus(`Error importing data: ${error.message}`, 'error');
        }
        
        // Reset file input
        document.getElementById('import-file').value = '';
    }
    
    exportForGitHub() {
        // Create GitHub-compatible format
        const githubData = JSON.parse(JSON.stringify(this.data));
        
        const dataStr = JSON.stringify(githubData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'current-chore-data.json';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showImportExportStatus('GitHub file generated successfully! Upload this file to your repository.', 'success');
    }
    
    showImportExportStatus(message, type) {
        const statusDiv = document.getElementById('import-export-status');
        statusDiv.textContent = message;
        statusDiv.className = `mt-8 status status--${type}`;
        statusDiv.classList.remove('hidden');
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const choreManager = new ChoreManager();
    
    // Make available globally for debugging
    window.choreManager = choreManager;
});