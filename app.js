// Shabbat Chore Manager Application
class ChoreManager {
    constructor() {
        this.individuals = ["Oliver", "Spencer", "Ben", "Isaac", "Jason", "Jonah", "Nahum", "Adam"];
        this.chores = [
            "Second-floor bathroom, mop floor & toilet",
            "Ground-floor washing sink", 
            "Sweep kitchen",
            "Sweep living room",
            "Ground-floor bathroom & toilet",
            "Recycling and trash disposal (due by Thursday night)",
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
            "Hefker sweep ground floor living room - take any items and trash out and about around the room, on the floor, etc. and place them in a trash bag to be thrown out by Thursday"
        ];
        
        this.db = null;
        this.currentCycle = null;
        this.performanceChart = null;
        this.choreChart = null;
        
        this.init();
    }
    
    async init() {
        await this.initDB();
        await this.loadCurrentCycle();
        this.setupEventListeners();
        this.setupTabs();
        this.renderCurrentCycle();
        this.updateStatistics();
        this.updateCommitMessage();
    }
    
    // Database Management
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ChoreManagerDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Cycles store
                if (!db.objectStoreNames.contains('cycles')) {
                    const cyclesStore = db.createObjectStore('cycles', { keyPath: 'id', autoIncrement: true });
                    cyclesStore.createIndex('startDate', 'startDate', { unique: false });
                }
                
                // Assignments store
                if (!db.objectStoreNames.contains('assignments')) {
                    const assignmentsStore = db.createObjectStore('assignments', { keyPath: 'id', autoIncrement: true });
                    assignmentsStore.createIndex('cycleId', 'cycleId', { unique: false });
                    assignmentsStore.createIndex('person', 'person', { unique: false });
                }
                
                // Violations store
                if (!db.objectStoreNames.contains('violations')) {
                    const violationsStore = db.createObjectStore('violations', { keyPath: 'id', autoIncrement: true });
                    violationsStore.createIndex('person', 'person', { unique: false });
                    violationsStore.createIndex('cycleId', 'cycleId', { unique: false });
                }
            };
        });
    }
    
    async saveToStore(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getFromStore(storeName, query = null) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = query ? store.get(query) : store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async updateInStore(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Cycle Management
    async loadCurrentCycle() {
        const cycles = await this.getFromStore('cycles');
        if (cycles.length > 0) {
            this.currentCycle = cycles[cycles.length - 1];
        } else {
            await this.createNewCycle();
        }
    }
    
    async createNewCycle() {
        const now = new Date();
        const tuesday = this.getNextTuesday(now);
        const friday = new Date(tuesday);
        friday.setDate(friday.getDate() + 3);
        
        const cycle = {
            startDate: tuesday.toISOString(),
            endDate: friday.toISOString(),
            isActive: true,
            createdAt: now.toISOString()
        };
        
        const cycleId = await this.saveToStore('cycles', cycle);
        cycle.id = cycleId;
        this.currentCycle = cycle;
        
        await this.generateAssignments(cycleId);
        this.showNotification('New cycle created successfully!', 'success');
    }
    
    getNextTuesday(date) {
        const tuesday = new Date(date);
        const dayOfWeek = tuesday.getDay();
        const daysUntilTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;
        tuesday.setDate(tuesday.getDate() + daysUntilTuesday);
        tuesday.setHours(0, 0, 0, 0);
        return tuesday;
    }
    
    async generateAssignments(cycleId) {
        const previousAssignments = await this.getPreviousAssignments();
        const assignments = this.createBalancedAssignments(previousAssignments);
        
        for (const assignment of assignments) {
            assignment.cycleId = cycleId;
            assignment.completed = false;
            assignment.assignedAt = new Date().toISOString();
            await this.saveToStore('assignments', assignment);
        }
    }
    
    async getPreviousAssignments() {
        const cycles = await this.getFromStore('cycles');
        if (cycles.length < 2) return [];
        
        const previousCycle = cycles[cycles.length - 2];
        const assignments = await this.getFromStore('assignments');
        return assignments.filter(a => a.cycleId === previousCycle.id);
    }
    
    createBalancedAssignments(previousAssignments) {
        const assignments = [];
        const previousChoresByPerson = {};
        
        // Track previous chores
        previousAssignments.forEach(assignment => {
            if (!previousChoresByPerson[assignment.person]) {
                previousChoresByPerson[assignment.person] = [];
            }
            previousChoresByPerson[assignment.person].push(assignment.chore);
        });
        
        // Create shuffled chore list
        const availableChores = [...this.chores];
        this.shuffleArray(availableChores);
        
        let choreIndex = 0;
        
        // Assign 2+ chores per person, avoiding recent repetitions
        for (const person of this.individuals) {
            const personPreviousChores = previousChoresByPerson[person] || [];
            let assigned = 0;
            
            while (assigned < 2 && choreIndex < availableChores.length) {
                const chore = availableChores[choreIndex];
                
                // Skip if person did this chore recently
                if (!personPreviousChores.includes(chore)) {
                    assignments.push({
                        person: person,
                        chore: chore
                    });
                    assigned++;
                }
                choreIndex++;
            }
        }
        
        // Assign remaining chores
        while (choreIndex < availableChores.length) {
            const randomPerson = this.individuals[Math.floor(Math.random() * this.individuals.length)];
            assignments.push({
                person: randomPerson,
                chore: availableChores[choreIndex]
            });
            choreIndex++;
        }
        
        return assignments;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // UI Rendering
    async renderCurrentCycle() {
        if (!this.currentCycle) return;
        
        const startDate = new Date(this.currentCycle.startDate);
        const endDate = new Date(this.currentCycle.endDate);
        
        document.getElementById('current-cycle').textContent = 
            `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        
        await this.renderAssignments();
        await this.renderViolations();
        this.updateProgress();
    }
    
    async renderAssignments() {
        const assignments = await this.getFromStore('assignments');
        const currentAssignments = assignments.filter(a => a.cycleId === this.currentCycle.id);
        
        const assignmentsByPerson = {};
        currentAssignments.forEach(assignment => {
            if (!assignmentsByPerson[assignment.person]) {
                assignmentsByPerson[assignment.person] = [];
            }
            assignmentsByPerson[assignment.person].push(assignment);
        });
        
        const violations = await this.getFromStore('violations');
        const currentViolations = violations.filter(v => v.cycleId === this.currentCycle.id);
        const violationsByPerson = {};
        currentViolations.forEach(violation => {
            violationsByPerson[violation.person] = (violationsByPerson[violation.person] || 0) + 1;
        });
        
        const grid = document.getElementById('assignments-grid');
        grid.innerHTML = '';
        
        for (const person of this.individuals) {
            const personAssignments = assignmentsByPerson[person] || [];
            const violationCount = violationsByPerson[person] || 0;
            
            const card = document.createElement('div');
            card.className = 'person-card';
            card.innerHTML = `
                <div class="person-header">
                    <h3 class="person-name">${person}</h3>
                    <span class="violation-count ${violationCount === 0 ? 'zero' : ''}">${violationCount} violations</span>
                </div>
                <div class="chore-list">
                    ${personAssignments.map(assignment => `
                        <div class="chore-item ${assignment.completed ? 'completed' : ''}">
                            <input type="checkbox" class="chore-checkbox" 
                                   ${assignment.completed ? 'checked' : ''} 
                                   data-assignment-id="${assignment.id}">
                            <p class="chore-text">${assignment.chore}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            grid.appendChild(card);
        }
        
        // Add event listeners for checkboxes
        document.querySelectorAll('.chore-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleChoreCompletion(parseInt(e.target.dataset.assignmentId), e.target.checked);
            });
        });
    }
    
    async renderViolations() {
        const violations = await this.getFromStore('violations');
        const currentViolations = violations.filter(v => v.cycleId === this.currentCycle.id);
        
        const violationsList = document.getElementById('violations-list');
        
        if (currentViolations.length === 0) {
            violationsList.innerHTML = '<div class="empty-state"><p>No violations this cycle! 🎉</p></div>';
            return;
        }
        
        violationsList.innerHTML = currentViolations.map(violation => `
            <div class="violation-item">
                <div class="violation-person">${violation.person}</div>
                <div class="violation-details">
                    <div>Chore: ${violation.chore}</div>
                    <div>Date: ${new Date(violation.createdAt).toLocaleDateString()}</div>
                    <div>Reason: ${violation.reason}</div>
                </div>
            </div>
        `).join('');
    }
    
    async updateProgress() {
        const assignments = await this.getFromStore('assignments');
        const currentAssignments = assignments.filter(a => a.cycleId === this.currentCycle.id);
        
        const completed = currentAssignments.filter(a => a.completed).length;
        const total = currentAssignments.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${percentage}% Complete (${completed}/${total})`;
    }
    
    async toggleChoreCompletion(assignmentId, completed) {
        const assignments = await this.getFromStore('assignments');
        const assignment = assignments.find(a => a.id === assignmentId);
        
        if (assignment) {
            assignment.completed = completed;
            assignment.completedAt = completed ? new Date().toISOString() : null;
            await this.updateInStore('assignments', assignment);
            
            // Check for violations when marking incomplete after deadline
            if (!completed) {
                const endDate = new Date(this.currentCycle.endDate);
                const now = new Date();
                
                if (now > endDate) {
                    await this.addViolation(assignment.person, assignment.chore, 'Marked incomplete after deadline');
                }
            }
            
            await this.renderCurrentCycle();
            this.updateStatistics();
        }
    }
    
    async addViolation(person, chore, reason) {
        const violation = {
            person: person,
            chore: chore,
            reason: reason,
            cycleId: this.currentCycle.id,
            createdAt: new Date().toISOString()
        };
        
        await this.saveToStore('violations', violation);
    }
    
    // Statistics Generation
    async generateStatistics() {
        const cycles = await this.getFromStore('cycles');
        const assignments = await this.getFromStore('assignments');
        const violations = await this.getFromStore('violations');
        
        const stats = {
            metadata: {
                generatedAt: new Date().toISOString(),
                cycleRange: cycles.length > 0 ? 
                    `${new Date(cycles[0].startDate).toLocaleDateString()} - ${new Date(cycles[cycles.length - 1].endDate).toLocaleDateString()}` : 
                    'No cycles',
                totalCycles: cycles.length,
                appVersion: '1.0.0'
            },
            overallStats: {
                totalChoresAssigned: assignments.length,
                totalChoresCompleted: assignments.filter(a => a.completed).length,
                overallCompletionRate: assignments.length > 0 ? 
                    Math.round((assignments.filter(a => a.completed).length / assignments.length) * 100) : 0,
                totalViolations: violations.length
            },
            individualStats: this.individuals.map(person => {
                const personAssignments = assignments.filter(a => a.person === person);
                const personViolations = violations.filter(v => v.person === person);
                const completed = personAssignments.filter(a => a.completed).length;
                
                return {
                    name: person,
                    completionRate: personAssignments.length > 0 ? 
                        Math.round((completed / personAssignments.length) * 100) : 0,
                    totalAssigned: personAssignments.length,
                    totalCompleted: completed,
                    currentViolations: personViolations.filter(v => v.cycleId === this.currentCycle?.id).length,
                    violationHistory: personViolations.map(v => ({
                        date: v.createdAt,
                        chore: v.chore,
                        reason: v.reason
                    })),
                    performanceScore: this.calculatePerformanceScore(personAssignments, personViolations)
                };
            }),
            choreStats: this.chores.map(chore => {
                const choreAssignments = assignments.filter(a => a.chore === chore);
                const completed = choreAssignments.filter(a => a.completed).length;
                
                return {
                    choreName: chore,
                    completionRate: choreAssignments.length > 0 ? 
                        Math.round((completed / choreAssignments.length) * 100) : 0,
                    timesAssigned: choreAssignments.length,
                    timesCompleted: completed
                };
            }),
            cycleHistory: cycles.map(cycle => {
                const cycleAssignments = assignments.filter(a => a.cycleId === cycle.id);
                const cycleViolations = violations.filter(v => v.cycleId === cycle.id);
                
                return {
                    cycleDate: cycle.startDate,
                    assignments: cycleAssignments.map(a => ({
                        person: a.person,
                        chore: a.chore,
                        completed: a.completed
                    })),
                    completions: cycleAssignments.filter(a => a.completed).length,
                    violations: cycleViolations.map(v => ({
                        person: v.person,
                        chore: v.chore,
                        reason: v.reason
                    }))
                };
            }),
            trends: {
                weeklyCompletionRates: this.calculateWeeklyTrends(cycles, assignments),
                monthlyViolationCounts: this.calculateMonthlyViolations(violations),
                chorePopularity: this.calculateChorePopularity(assignments)
            }
        };
        
        return stats;
    }
    
    calculatePerformanceScore(assignments, violations) {
        if (assignments.length === 0) return 0;
        
        const completionRate = assignments.filter(a => a.completed).length / assignments.length;
        const violationPenalty = violations.length * 0.1;
        
        return Math.max(0, Math.round((completionRate - violationPenalty) * 100));
    }
    
    calculateWeeklyTrends(cycles, assignments) {
        return cycles.map(cycle => {
            const cycleAssignments = assignments.filter(a => a.cycleId === cycle.id);
            const completed = cycleAssignments.filter(a => a.completed).length;
            return {
                week: new Date(cycle.startDate).toLocaleDateString(),
                completionRate: cycleAssignments.length > 0 ? 
                    Math.round((completed / cycleAssignments.length) * 100) : 0
            };
        });
    }
    
    calculateMonthlyViolations(violations) {
        const monthly = {};
        violations.forEach(violation => {
            const month = new Date(violation.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            monthly[month] = (monthly[month] || 0) + 1;
        });
        
        return Object.entries(monthly).map(([month, count]) => ({ month, count }));
    }
    
    calculateChorePopularity(assignments) {
        const popularity = {};
        assignments.forEach(assignment => {
            if (assignment.completed) {
                popularity[assignment.chore] = (popularity[assignment.chore] || 0) + 1;
            }
        });
        
        return Object.entries(popularity)
            .sort(([,a], [,b]) => b - a)
            .map(([chore, count]) => ({ chore, count }));
    }
    
    async downloadStatistics() {
        try {
            const stats = await this.generateStatistics();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `chore-statistics-${timestamp}.json`;
            
            const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Statistics downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading statistics:', error);
            this.showNotification('Error downloading statistics', 'error');
        }
    }
    
    async loadStatisticsFile(file) {
        try {
            const text = await file.text();
            const stats = JSON.parse(text);
            
            this.displayLoadedStatistics(stats);
            this.showNotification('Statistics loaded successfully!', 'success');
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showNotification('Error loading statistics file', 'error');
        }
    }
    
    displayLoadedStatistics(stats) {
        // Update overview stats
        document.getElementById('overall-completion').textContent = `${stats.overallStats.overallCompletionRate}%`;
        document.getElementById('total-cycles').textContent = stats.metadata.totalCycles;
        document.getElementById('active-violations').textContent = stats.overallStats.totalViolations;
        
        const bestPerformer = stats.individualStats.reduce((best, current) => 
            current.performanceScore > best.performanceScore ? current : best, 
            stats.individualStats[0]
        );
        document.getElementById('best-performer').textContent = bestPerformer.name;
        
        // Render individual stats
        this.renderIndividualStats(stats.individualStats);
        
        // Update charts
        this.updateCharts(stats);
    }
    
    async updateStatistics() {
        const stats = await this.generateStatistics();
        this.displayLoadedStatistics(stats);
    }
    
    renderIndividualStats(individualStats) {
        const container = document.getElementById('individual-stats');
        container.innerHTML = individualStats.map(person => `
            <div class="individual-stat-card">
                <div class="individual-stat-header">
                    <h4 class="individual-stat-name">${person.name}</h4>
                    <span class="individual-completion-rate">${person.completionRate}%</span>
                </div>
                <div class="individual-stat-details">
                    <div class="stat-detail">
                        <span>Assigned:</span>
                        <span>${person.totalAssigned}</span>
                    </div>
                    <div class="stat-detail">
                        <span>Completed:</span>
                        <span>${person.totalCompleted}</span>
                    </div>
                    <div class="stat-detail">
                        <span>Violations:</span>
                        <span>${person.currentViolations}</span>
                    </div>
                    <div class="stat-detail">
                        <span>Score:</span>
                        <span>${person.performanceScore}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateCharts(stats) {
        // Performance Chart
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
        
        const performanceCtx = document.getElementById('performance-chart').getContext('2d');
        this.performanceChart = new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: stats.individualStats.map(p => p.name),
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: stats.individualStats.map(p => p.completionRate),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        // Chore Chart
        if (this.choreChart) {
            this.choreChart.destroy();
        }
        
        const topChores = stats.choreStats
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, 8);
        
        const choreCtx = document.getElementById('chore-chart').getContext('2d');
        this.choreChart = new Chart(choreCtx, {
            type: 'doughnut',
            data: {
                labels: topChores.map(c => c.choreName.substring(0, 20) + '...'),
                datasets: [{
                    data: topChores.map(c => c.completionRate),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Event Listeners
    setupEventListeners() {
        // New cycle button
        document.getElementById('new-cycle-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to start a new cycle? This will end the current cycle.')) {
                await this.createNewCycle();
                await this.renderCurrentCycle();
                this.updateStatistics();
            }
        });
        
        // Export data
        document.getElementById('export-data-btn').addEventListener('click', async () => {
            const allData = {
                cycles: await this.getFromStore('cycles'),
                assignments: await this.getFromStore('assignments'),
                violations: await this.getFromStore('violations')
            };
            
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chore-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        // Import data
        document.getElementById('import-data-btn').addEventListener('click', () => {
            document.getElementById('import-data-input').click();
        });
        
        document.getElementById('import-data-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    // Clear existing data and import new data
                    // This is a simplified version - in production you'd want more sophisticated merging
                    await this.clearAllData();
                    await this.importData(data);
                    
                    await this.loadCurrentCycle();
                    await this.renderCurrentCycle();
                    this.updateStatistics();
                    
                    this.showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    this.showNotification('Error importing data', 'error');
                }
            }
        });
        
        // Statistics buttons
        document.getElementById('generate-stats-btn').addEventListener('click', () => {
            this.downloadStatistics();
        });
        
        document.getElementById('load-stats-btn').addEventListener('click', () => {
            document.getElementById('load-stats-input').click();
        });
        
        document.getElementById('load-stats-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.loadStatisticsFile(file);
            }
        });
        
        // Copy commit message
        document.getElementById('copy-commit-btn').addEventListener('click', () => {
            const textarea = document.getElementById('commit-message');
            textarea.select();
            document.execCommand('copy');
            this.showNotification('Commit message copied!', 'success');
        });
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Load specific tab content
                if (targetTab === 'history') {
                    this.renderCycleHistory();
                }
            });
        });
    }
    
    async renderCycleHistory() {
        const cycles = await this.getFromStore('cycles');
        const assignments = await this.getFromStore('assignments');
        const violations = await this.getFromStore('violations');
        
        const historyContainer = document.getElementById('cycle-history');
        
        if (cycles.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state"><h3>No cycles yet</h3><p>Start your first cleaning cycle to see history here.</p></div>';
            return;
        }
        
        historyContainer.innerHTML = cycles.reverse().map(cycle => {
            const cycleAssignments = assignments.filter(a => a.cycleId === cycle.id);
            const cycleViolations = violations.filter(v => v.cycleId === cycle.id);
            const completed = cycleAssignments.filter(a => a.completed).length;
            const completionRate = cycleAssignments.length > 0 ? Math.round((completed / cycleAssignments.length) * 100) : 0;
            
            return `
                <div class="cycle-history-item">
                    <div class="cycle-history-header">
                        <span class="cycle-date">${new Date(cycle.startDate).toLocaleDateString()} - ${new Date(cycle.endDate).toLocaleDateString()}</span>
                        <div class="cycle-completion">
                            <div class="cycle-completion-bar">
                                <div class="cycle-completion-fill" style="width: ${completionRate}%"></div>
                            </div>
                            <span>${completionRate}%</span>
                        </div>
                    </div>
                    <div class="cycle-summary">
                        <div class="cycle-stat">
                            <span>Assigned:</span>
                            <span>${cycleAssignments.length}</span>
                        </div>
                        <div class="cycle-stat">
                            <span>Completed:</span>
                            <span>${completed}</span>
                        </div>
                        <div class="cycle-stat">
                            <span>Violations:</span>
                            <span>${cycleViolations.length}</span>
                        </div>
                        <div class="cycle-stat">
                            <span>People:</span>
                            <span>${new Set(cycleAssignments.map(a => a.person)).size}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateCommitMessage() {
        const now = new Date();
        const message = `Update chore statistics - ${now.toLocaleDateString()}

- Generated comprehensive cleaning cycle statistics
- Includes completion rates, violations, and performance metrics
- Covers cycle period and individual performance data

Generated by Shabbat Chore Manager v1.0.0`;
        
        document.getElementById('commit-message').value = message;
    }
    
    async clearAllData() {
        const stores = ['cycles', 'assignments', 'violations'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
    
    async importData(data) {
        if (data.cycles) {
            for (const cycle of data.cycles) {
                await this.saveToStore('cycles', cycle);
            }
        }
        if (data.assignments) {
            for (const assignment of data.assignments) {
                await this.saveToStore('assignments', assignment);
            }
        }
        if (data.violations) {
            for (const violation of data.violations) {
                await this.saveToStore('violations', violation);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ChoreManager();
});