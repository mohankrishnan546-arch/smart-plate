/**
 * NutriVision AI - Enterprise Data Store
 * Handles persistence and state synchronization.
 */

class HealthStore {
    constructor() {
        this.DB_KEY = 'nutrivision_v4_data';
        this.state = this._load() || this._getInitialState();
    }

    _getInitialState() {
        return {
            user: {
                name: 'James Doe',
                role: 'Enterprise Member',
                goals: {
                    calories: 2500,
                    protein: 150,
                    carbs: 250,
                    fats: 80
                }
            },
            history: [
                { id: 1, name: 'Quinoa Salad', calories: 420, protein: 12, carbs: 54, fats: 18, date: new Date().toISOString() },
                { id: 2, name: 'Grilled Salmon', calories: 580, protein: 42, carbs: 0, fats: 32, date: new Date().toISOString() }
            ],
            metrics: {
                healthScore: 84,
                dailyHydration: 1.8, // liters
                weightTrend: [78, 77.8, 77.5, 77.2, 77.0, 76.8, 76.5]
            }
        };
    }

    _load() {
        const saved = localStorage.getItem(this.DB_KEY);
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Core store corrupted. Resetting data.');
            return null;
        }
    }

    _save() {
        localStorage.setItem(this.DB_KEY, JSON.stringify(this.state));
    }

    addMeal(meal) {
        const newMeal = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...meal
        };
        this.state.history.unshift(newMeal);
        this._save();
        return newMeal;
    }

    clearHistory() {
        this.state.history = [];
        this._save();
        return true;
    }

    getDailyStats() {
        const today = new Date().toISOString().split('T')[0];
        const meals = this.state.history.filter(m => m.date.startsWith(today));
        
        const totals = meals.reduce((acc, meal) => {
            acc.calories += (meal.calories || 0);
            acc.protein += (meal.protein || 0);
            acc.carbs += (meal.carbs || 0);
            acc.fats += (meal.fats || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        return totals;
    }

    getState() {
        return this.state;
    }
}

export const store = new HealthStore();
export default store;
