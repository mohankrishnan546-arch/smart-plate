/**
 * NutriVision AI - Reactive View Controller
 * Manages the Enterprise UI rendering and Chart integrations.
 */

import { store } from './store.js';
import { aiEngine } from './ai.js';
import { notifications } from './notifications.js';
import { community } from './community.js';

class ViewController {
    constructor() {
        this.currentView = 'dashboard';
        this.charts = {};
        this._listenersInitialized = false;
        this.elements = this._getElements();
        this._setupEventListeners();
        this._refreshDashboardData();
    }

    _getElements() {
        return {
            pageTitle: document.getElementById('page-title'),
            recognitionView: document.getElementById('recognition-view'),
            recentMeals: document.getElementById('recent-meals'),
            macroChart: document.getElementById('macro-chart'),
            modal: document.getElementById('modal-container'),
            modalContent: document.getElementById('modal-content'),
            modalClose: document.getElementById('modal-close'),
            btnScan: document.getElementById('btn-scan'),
            fileUpload: document.getElementById('file-upload'),
            calProgress: document.getElementById('cal-progress'),
            calFill: document.getElementById('cal-fill'),
            proteinProgress: document.getElementById('protein-progress'),
            proteinFill: document.getElementById('protein-fill'),
            healthScore: document.querySelector('.score-value'),
            healthLabel: document.querySelector('.score-label')
        };
    }

    _setupEventListeners() {
        // Persistent elements (outside dashboard-grid) — bind only once
        if (!this._listenersInitialized) {
            if (this.elements.btnScan) {
                this.elements.btnScan.addEventListener('click', () => {
                    // Always look up the current file-upload element (it may be re-created)
                    const fileUpload = document.getElementById('file-upload');
                    if (fileUpload) fileUpload.click();
                });
            }
            if (this.elements.modalClose) {
                this.elements.modalClose.addEventListener('click', () => {
                    this.elements.modal.classList.add('hidden');
                });
            }
            this._listenersInitialized = true;
        }

        // Dynamic elements (inside dashboard-grid) — safe to re-bind since element is new
        if (this.elements.fileUpload) {
            this.elements.fileUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
    }

    _refreshDashboardData() {
        const stats = store.getDailyStats();
        const state = store.getState();
        const history = state.history;
        const goals = state.user.goals;

        this._renderMealHistory(history);
        this._updateCharts(stats);
        this._updateGoalProgress(stats, goals);
        this._updateHealthScore(history);
    }

    async handleFileUpload(file) {
        // Dashboard Scanning State
        this.elements.recognitionView.innerHTML = `
            <div class="scanning-container">
                <div class="scanning-pulse"></div>
                <div class="spinner">🧠</div>
                <p>Decoding Nutritional Patterns...</p>
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
        `;

        this.showLoadingModal('Applying Enterprise Vision Core...');
        
        try {
            const results = await aiEngine.recognizeFood(file);
            this.renderRecognitionResult(results);
            notifications.notify('Pattern Recognized', `Deep Neural Match: ${results.foodName} (${results.confidence}%)`, '🔍');
        } catch (error) {
            console.error('AI Processing Error:', error);
            this.showErrorModal('Vision system connection failed.');
        }
    }

    showLoadingModal(message) {
        this.elements.modal.classList.remove('hidden');
        this.elements.modalContent.innerHTML = `
            <div class="loading-container">
                <div class="spinner">⚙️</div>
                <p>${message}</p>
                <span class="subtext">Edge Inference Layers: 152 / ResNet-V2 Optimized</span>
            </div>
        `;
    }

    showErrorModal(message) {
        this.elements.modal.classList.remove('hidden');
        this.elements.modalContent.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Close</button>
            </div>
        `;
    }

    renderRecognitionResult(results) {
        const { foodName, confidence, nutrition, category } = results;
        
        this.elements.modalContent.innerHTML = `
            <div class="result-layout">
                <div class="result-header">
                    <span class="badge ${category.toLowerCase()}">${category}</span>
                    <h2>${foodName}</h2>
                    <p class="confidence">Confidence Score: <span class="accent">${confidence}%</span></p>
                </div>
                <div class="nutrition-grid">
                    <div class="nutri-stat"><strong>${nutrition.calories}</strong> <span>Kcal</span></div>
                    <div class="nutri-stat"><strong>${nutrition.protein}g</strong> <span>Protein</span></div>
                    <div class="nutri-stat"><strong>${nutrition.carbs}g</strong> <span>Carbs</span></div>
                    <div class="nutri-stat"><strong>${nutrition.fats}g</strong> <span>Fats</span></div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" id="btn-save-meal">💾 Log to Enterprise History</button>
                    <button class="btn btn-secondary" id="btn-cancel-meal">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('btn-save-meal').onclick = () => {
            store.addMeal(nutrition);
            this.elements.modal.classList.add('hidden');
            notifications.notify('Success', `${foodName} logged to history.`, '✅');
            this.renderDashboard();
        };

        document.getElementById('btn-cancel-meal').onclick = () => {
            this.elements.modal.classList.add('hidden');
        };
    }

    renderDashboard() {
        this.currentView = 'dashboard';
        this.elements.pageTitle.innerText = 'Enterprise Dashboard';
        
        const mainGrid = document.querySelector('.dashboard-grid');
        if (mainGrid) {
            mainGrid.innerHTML = `
                <!-- Health Score Card -->
                <div class="card card-hero glass-effect">
                    <h3>Personalized Health Score</h3>
                    <div class="score-container">
                        <div class="score-circle">
                            <span class="score-value">84</span>
                            <span class="score-label">Excellent</span>
                        </div>
                        <div class="score-insights">
                            <ul class="insight-list">
                                <li>✨ Protein intake increased by 12%</li>
                                <li>💧 Hydration goal reached 5 days in a row</li>
                                <li>🍎 Veggie diversity is at an all-time high</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Macro Overview Card -->
                <div class="card glass-effect">
                    <h3>Daily Goal Progress</h3>
                    <div class="goal-stats">
                        <div class="goal-item">
                            <div class="goal-info">
                                <span>Calories</span>
                                <span id="cal-progress">0 / 2500 kcal</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div id="cal-fill" class="progress-fill-static" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="goal-item">
                            <div class="goal-info">
                                <span>Protein</span>
                                <span id="protein-progress">0 / 150g</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div id="protein-fill" class="progress-fill-static protein" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container compact">
                        <canvas id="macro-chart"></canvas>
                    </div>
                </div>

                <!-- Recognition Area -->
                <div class="card card-span-2 glass-effect ai-recognition-zone">
                    <div class="zone-header">
                        <h3>Real-time Food Intelligence</h3>
                        <p>Our AI analyzes macros and nutrients in seconds.</p>
                    </div>
                    <div class="recognition-content" id="recognition-view">
                        <div class="empty-state">
                            <div class="camera-placeholder">📸</div>
                            <p>Capture or Drop an image to start recognition</p>
                            <label for="file-upload" class="btn btn-secondary">Upload Image</label>
                            <input type="file" id="file-upload" accept="image/*" hidden>
                        </div>
                    </div>
                </div>

                <!-- Recent Meals -->
                <div class="card glass-effect">
                    <h3>Recent Meal Analytics</h3>
                    <div class="meal-list" id="recent-meals">
                        <!-- Dynamic content -->
                    </div>
                </div>
            `;
        }

        // Re-sync elements and listeners
        this.elements = this._getElements();
        this._setupEventListeners();
        this._refreshDashboardData();
    }

    _updateGoalProgress(stats, goals) {
        if (!this.elements.calProgress) return;

        const calPct = Math.min(100, (stats.calories / goals.calories) * 100);
        const proteinPct = Math.min(100, (stats.protein / goals.protein) * 100);

        this.elements.calProgress.innerText = `${Math.round(stats.calories)} / ${goals.calories} kcal`;
        this.elements.calFill.style.width = `${calPct}%`;
        
        this.elements.proteinProgress.innerText = `${Math.round(stats.protein)} / ${goals.protein}g`;
        this.elements.proteinFill.style.width = `${proteinPct}%`;
    }

    _updateHealthScore(history) {
        if (!this.elements.healthScore) return;
        
        // Simple heuristic: Average health score of today's meals
        const today = new Date().toISOString().split('T')[0];
        const todaysMeals = history.filter(m => m.date.startsWith(today));
        
        let score = 84; // Default starting score
        if (todaysMeals.length > 0) {
            const scores = todaysMeals.map(m => aiEngine.calculateHealthScore(m));
            score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }

        this.elements.healthScore.innerText = score;
        
        let label = 'Excellent';
        if (score < 50) label = 'Poor';
        else if (score < 70) label = 'Fair';
        else if (score < 85) label = 'Good';
        
        this.elements.healthLabel.innerText = label;
        
        // Update visual circle
        const circle = document.querySelector('.score-circle');
        if (circle) {
            circle.style.background = `conic-gradient(var(--primary) ${score}%, var(--slate-800) 0%)`;
        }
    }

    renderHistory() {
        this.currentView = 'history';
        this.elements.pageTitle.innerText = 'Meal History Timeline';
        
        const history = store.getState().history;
        const mainGrid = document.querySelector('.dashboard-grid');
        
        mainGrid.innerHTML = `
            <div class="card glass-effect card-span-2">
                <div class="timeline-header">
                    <h3>Detailed Entry Log</h3>
                    <button class="btn btn-secondary btn-sm" id="btn-clear-history">Clear History</button>
                </div>
                <div class="history-timeline">
                    ${history.length > 0 ? history.map(meal => `
                        <div class="history-item glass-effect">
                            <div class="item-header">
                                <span class="item-date">${new Date(meal.date).toLocaleString()}</span>
                                <span class="badge ${meal.category?.toLowerCase() || 'general'}">${meal.category || 'Meal'}</span>
                            </div>
                            <div class="item-body">
                                <h4>${meal.name}</h4>
                                <div class="item-macros">
                                    <span>🔥 ${meal.calories} kcal</span>
                                    <span>🥩 ${meal.protein}g P</span>
                                    <span>🍞 ${meal.carbs}g C</span>
                                    <span>🥑 ${meal.fats}g F</span>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state"><p>No history found. Start recognition to log your first meal!</p></div>'}
                </div>
            </div>
        `;

        const clearBtn = document.getElementById('btn-clear-history');
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('Are you sure you want to wipe all enterprise history?')) {
                    store.clearHistory();
                    this.renderHistory();
                    notifications.notify('History Cleared', 'All meal logs have been removed.', '🗑️');
                }
            };
        }
    }

    renderCommunity() {
        this.currentView = 'community';
        this.elements.pageTitle.innerText = 'Community Feed';
        
        const feed = community.getFeed();
        const mainGrid = document.querySelector('.dashboard-grid');
        
        mainGrid.innerHTML = `
            <div class="community-timeline glass-effect card-span-2">
                <div class="timeline-header">
                    <h3>Global Trends & Shares</h3>
                </div>
                <div class="timeline-posts">
                    ${feed.map(post => `
                        <div class="post-card">
                            <div class="post-header">
                                <div class="user-avatar small">${post.avatar}</div>
                                <div class="user-meta">
                                    <span class="user-name">${post.user} ${post.verified ? '✅' : ''}</span>
                                    <span class="post-time">${post.time}</span>
                                </div>
                            </div>
                            <div class="post-content">
                                <p>Just enjoyed a <strong>${post.meal}</strong>. Full macro transparency!</p>
                                <span class="stats-badge">${post.stats}</span>
                            </div>
                            <div class="post-actions">
                                <button class="action-btn">❤️ ${post.likes}</button>
                                <button class="action-btn">💬 Comment</button>
                                <button class="action-btn">🚀 Share</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card glass-effect sticky-top">
                <h3>Top Contributors</h3>
                <div class="leaderboard">
                    <div class="leader-item">
                        <span>🥇 Dr. Emily Watson</span>
                        <span class="score">4.9k</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderHealthIntel() {
        this.currentView = 'macros';
        this.elements.pageTitle.innerText = 'Nutritional Intelligence';
        
        const history = store.getState().history;
        const mainGrid = document.querySelector('.dashboard-grid');
        const tdee = aiEngine.predictMetabolism(history);
        
        // Calculate dynamic vulnerabilities from history
        const vitA = history.reduce((sum, m) => sum + (m.vitA || 0), 0) / (history.length || 1);
        const vitC = history.reduce((sum, m) => sum + (m.vitC || 0), 0) / (history.length || 1);
        const zinc = history.reduce((sum, m) => sum + (m.zinc || 0), 0) / (history.length || 1);

        mainGrid.innerHTML = `
            <div class="card glass-effect card-span-2">
                <h3>Vulnerability Radar</h3>
                <div class="large-chart-container">
                    <canvas id="nutrient-radar-chart"></canvas>
                </div>
            </div>
            <div class="card glass-effect">
                <h3>Intel Insights</h3>
                <p class="subtitle">AI Match found micronutrient patterns in your history.</p>
                <ul class="insight-list">
                    <li>${vitA < 10 ? '📉' : '✅'} Vitamin A: ${vitA.toFixed(1)}% of baseline</li>
                    <li>${vitC < 50 ? '📉' : '✅'} Vitamin C: ${vitC.toFixed(1)}% of baseline</li>
                    <li>${zinc < 1 ? '📉' : '✅'} Zinc Density: ${zinc.toFixed(1)}mg avg</li>
                </ul>
            </div>
            <div class="card glass-effect">
                <h3>Predictive Metabolism</h3>
                <div class="score-circle">
                    <span class="score-value">${(tdee/1000).toFixed(1)}k</span>
                    <span class="score-label">TDEE kcal/day</span>
                </div>
                <p class="subtext" style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-secondary); text-align: center;">
                    Based on your ${history.length} recent meal profiles.
                </p>
            </div>
        `;
        
        setTimeout(() => this._renderDetailedCharts(history), 100);
    }

    _renderDetailedCharts(history) {
        const radarCtx = document.getElementById('nutrient-radar-chart');
        if (!radarCtx) return;
        
        // Aggregate nutrients for radar
        const avg = (key) => history.reduce((s, m) => s + (m[key] || 0), 0) / (history.length || 1);

        new Chart(radarCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Vitamin A', 'Vitamin C', 'Zinc', 'Fiber', 'Protein Density', 'Iron'],
                datasets: [{
                    label: 'Current Profile',
                    data: [avg('vitA')*2, avg('vitC'), avg('zinc')*10, avg('fiber')*4, avg('protein')/2, avg('iron')*10],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    pointBackgroundColor: '#10b981'
                }, {
                    label: 'Enterprise Goal',
                    data: [80, 100, 80, 100, 80, 80],
                    borderColor: 'rgba(255,255,255,0.1)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        pointLabels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } },
                        ticks: { display: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                }
            }
        });
    }

    renderSettings() {
        this.currentView = 'settings';
        this.elements.pageTitle.innerText = 'Platform Settings';
        
        const state = store.getState();
        const mainGrid = document.querySelector('.dashboard-grid');
        
        mainGrid.innerHTML = `
            <div class="card glass-effect card-span-2">
                <h3>Enterprise Profile</h3>
                <div class="settings-form">
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" class="input-modern" value="${state.user.name}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Account Tier</label>
                        <div class="tier-badge">Enterprise Gold</div>
                    </div>
                </div>
            </div>
            <div class="card glass-effect">
                <h3>Global Metadata</h3>
                <div class="toggle-group">
                    <span>Offline Sync</span>
                    <label class="switch">
                        <input type="checkbox" checked disabled>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-group">
                    <span>AI Model Pre-caching</span>
                    <label class="switch">
                        <input type="checkbox" checked disabled>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="card glass-effect">
                <h3>Platform Status</h3>
                <div class="status-list">
                    <div class="status-item">
                        <span>Neural Core v2.0</span>
                        <span class="status-online">Online</span>
                    </div>
                    <div class="status-item">
                        <span>NutritionDB</span>
                        <span class="status-online">Connected</span>
                    </div>
                </div>
            </div>
        `;
    }

    switchView(viewId) {
        this.currentView = viewId;
        const main = document.querySelector('.main-content');
        main.style.opacity = '0';
        
        setTimeout(() => {
            if (viewId === 'community') {
                this.renderCommunity();
            } else if (viewId === 'history') {
                this.renderHistory();
            } else if (viewId === 'macros') {
                this.renderHealthIntel();
            } else if (viewId === 'settings') {
                this.renderSettings();
            } else if (viewId === 'dashboard') {
                this.renderDashboard();
            }
            main.style.opacity = '1';
        }, 150);
    }

    _renderMealHistory(history) {
        if (!this.elements.recentMeals) return;
        this.elements.recentMeals.innerHTML = history.slice(0, 5).map(meal => `
            <div class="meal-item">
                <div class="meal-icon">🥗</div>
                <div class="meal-details">
                    <span class="meal-name">${meal.name}</span>
                    <span class="meal-macros">${meal.calories} kcal | P: ${meal.protein}g | C: ${meal.carbs}g</span>
                </div>
                <div class="meal-time">just now</div>
            </div>
        `).join('');
    }

    _updateCharts(stats) {
        if (!this.elements.macroChart) return;
        if (this.charts.macro) this.charts.macro.destroy();

        const ctx = this.elements.macroChart.getContext('2d');
        this.charts.macro = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fats'],
                datasets: [{
                    data: [stats.protein, stats.carbs, stats.fats],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 12
                }]
            },
            options: {
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                    }
                }
            }
        });
    }
}

export const view = new ViewController();
export default view;
