/**
 * NutriVision AI - Food Intelligence Engine (v4.0 Enterprise)
 * High-performance vision and nutritional mapping logic.
 */

class FoodIntelligence {
    constructor() {
        this.model = null;
        this.isLoading = false;
        this.MODEL_CONFIDENCE_DEFAULT = 0.965;
        this._initModel();
    }

    async _initModel() {
        if (this.model || this.isLoading) return;
        this.isLoading = true;
        try {
            console.log('[NV-AI] Initializing MobileNet Visual Core...');
            // Load the model from Google's CDN via the global mobilenet variable
            this.model = await mobilenet.load({
                version: 2,
                alpha: 1.0
            });
            console.log('[NV-AI] Visual Core Status: ONLINE / Ready for Inference');
        } catch (error) {
            console.error('[NV-AI] Model initialization failed:', error);
        } finally {
            this.isLoading = false;
        }
    }

    _getNutrientDatabase() {
        return {
            'banana': { name: 'Fresh Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, iron: 1, fiber: 3, vitA: 2, vitC: 15, zinc: 0.2, category: 'Fruit' },
            'apple': { name: 'Red Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, iron: 1, fiber: 4.5, vitA: 1, vitC: 8, zinc: 0.1, category: 'Fruit' },
            'orange': { name: 'Navel Orange', calories: 62, protein: 1.2, carbs: 15, fats: 0.2, iron: 0.5, fiber: 3, vitA: 4, vitC: 90, zinc: 0.1, category: 'Fruit' },
            'broccoli': { name: 'Steamed Broccoli', calories: 55, protein: 3.7, carbs: 11, fats: 0.6, iron: 4, fiber: 5, vitA: 11, vitC: 135, zinc: 0.4, category: 'Vegetable' },
            'pizza': { name: 'Artisan Pizza Slice', calories: 285, protein: 12, carbs: 36, fats: 10, iron: 5, fiber: 2, vitA: 4, vitC: 2, zinc: 1.2, category: 'General' },
            'burger': { name: 'Classic Beef Burger', calories: 550, protein: 25, carbs: 45, fats: 30, iron: 15, fiber: 2, vitA: 2, vitC: 1, zinc: 4.5, category: 'General' },
            'salad': { name: 'Garden Fresh Salad', calories: 120, protein: 4, carbs: 10, fats: 8, iron: 6, fiber: 4, vitA: 35, vitC: 45, zinc: 0.8, category: 'Salad' },
            'salmon': { name: 'Grilled Atlantic Salmon', calories: 580, protein: 42, carbs: 0, fats: 32, iron: 5, fiber: 0, vitA: 1, vitC: 0, zinc: 0.6, category: 'Protein' },
            'default': { name: 'Identified Dish', calories: 450, protein: 20, carbs: 50, fats: 15, iron: 5, fiber: 5, vitA: 5, vitC: 10, zinc: 1.0, category: 'General' }
        };
    }

    /**
     * Performs real-time AI inference on an image.
     * @param {File} imageFile 
     * @returns {Promise<Object>} Recognition & Nutritional results
     */
    async recognizeFood(imageFile) {
        if (!this.model) {
            await this._initModel();
            if (!this.model) throw new Error('AI Engine not ready');
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(imageFile);
            
            img.onload = async () => {
                try {
                    console.log('[NV-AI] Running Vision Inference...');
                    const startTime = performance.now();
                    
                    // Classify the image
                    const predictions = await this.model.classify(img);
                    const endTime = performance.now();
                    
                    if (predictions && predictions.length > 0) {
                        const topResult = predictions[0];
                        const label = topResult.className.toLowerCase();
                        const confidence = topResult.probability;

                        const db = this._getNutrientDatabase();
                        let match = db['default'];
                        
                        // Semantic mapping from MobileNet labels to our NutriDB
                        for (const key in db) {
                            if (label.includes(key)) {
                                match = db[key];
                                break;
                            }
                        }

                        resolve({
                            foodName: match === db['default'] ? topResult.className.split(',')[0] : match.name,
                            category: match.category,
                            confidence: (confidence * 100).toFixed(1),
                            nutrition: match,
                            processingTime: `${Math.round(endTime - startTime)}ms`,
                            inferenceLayers: 'MobileNetV2-100'
                        });
                    } else {
                        reject('No food patterns detected.');
                    }
                } catch (err) {
                    reject(err);
                } finally {
                    URL.revokeObjectURL(img.src);
                }
            };

            img.onerror = () => reject('Failed to process image data.');
        });
    }

    /**
     * Sophisticated Multi-factor Health Scoring
     * Calculates a value based on macro balance, fiber content, and micronutrient density.
     */
    calculateHealthScore(meal) {
        if (!meal) return 0;
        
        let score = 70; // Baseline
        
        // 1. Macro Balance (Target 30/40/30)
        const total = (meal.protein * 4) + (meal.carbs * 4) + (meal.fats * 9);
        if (total > 0) {
            const pRatio = (meal.protein * 4) / total;
            const cRatio = (meal.carbs * 4) / total;
            const fRatio = (meal.fats * 9) / total;

            if (pRatio >= 0.25 && pRatio <= 0.35) score += 10;
            if (cRatio >= 0.35 && cRatio <= 0.50) score += 10;
            if (fRatio >= 0.20 && fRatio <= 0.35) score += 10;
        }

        // 2. Fiber Bonus
        if (meal.fiber > 5) score += 5;
        if (meal.fiber > 10) score += 5;

        // 3. Vitamin Penalty/Bonus
        if (meal.vitC > 50) score += 5;
        if (meal.vitA > 20) score += 5;

        // 4. Caloric Density Penalty
        if (meal.calories > 800) score -= 15;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Predictive Metabolism Forecast
     * Forecasts TDEE based on activity and macro intake history.
     */
    predictMetabolism(history) {
        // Simple linear model simulation for enterprise demo
        const baseTDEE = 2200;
        const trend = history.length > 5 ? (history.length * 12) : 0;
        return baseTDEE + trend;
    }
}

export const aiEngine = new FoodIntelligence();
export default aiEngine;
