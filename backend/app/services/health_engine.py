"""
Medical & Health Rule Engine
Rule-based logic for health condition mapping.
Maps nutritional values to medical conditions and generates alerts.
"""

# ─── Health Rules Database ───
HEALTH_RULES = {
    "high_calories": {
        "label": "High Calorie Content",
        "condition": lambda n: n.get("calories", 0) > 400,
        "message": "⚠️ This food is calorie-dense (>400 kcal per serving). Watch portion sizes.",
        "severity": "warning",
    },
    "high_carbs": {
        "label": "High Carbohydrates",
        "condition": lambda n: n.get("carbs_g", 0) > 40,
        "message": "🍞 High carbohydrate content. Be cautious if monitoring blood sugar.",
        "severity": "warning",
    },
    "high_fat": {
        "label": "High Fat Content",
        "condition": lambda n: n.get("fat_g", 0) > 15,
        "message": "🧈 High fat content. Consider heart-healthy alternatives.",
        "severity": "warning",
    },
    "high_sodium": {
        "label": "High Sodium",
        "condition": lambda n: n.get("sodium_mg", 0) > 500,
        "message": "🧂 High sodium content (>500mg). Not ideal for hypertension management.",
        "severity": "danger",
    },
    "high_sugar": {
        "label": "High Sugar",
        "condition": lambda n: n.get("sugar_g", 0) > 15,
        "message": "🍬 High sugar content. May spike blood glucose levels.",
        "severity": "warning",
    },
    "high_cholesterol": {
        "label": "High Cholesterol",
        "condition": lambda n: n.get("cholesterol_mg", 0) > 100,
        "message": "💛 High cholesterol content. Limit intake for cardiovascular health.",
        "severity": "warning",
    },
    "low_protein": {
        "label": "Low Protein",
        "condition": lambda n: n.get("protein_g", 0) < 3 and n.get("calories", 0) > 200,
        "message": "💪 Low protein but calorie-dense. Consider adding a protein source.",
        "severity": "info",
    },
    "low_fiber": {
        "label": "Low Fiber",
        "condition": lambda n: n.get("fiber_g", 0) < 1 and n.get("carbs_g", 0) > 20,
        "message": "🌾 Low fiber with high carbs. Pair with high-fiber foods.",
        "severity": "info",
    },
    "good_protein": {
        "label": "Good Protein Source",
        "condition": lambda n: n.get("protein_g", 0) >= 15,
        "message": "✅ Excellent protein source! Great for muscle recovery.",
        "severity": "success",
    },
    "low_calorie": {
        "label": "Low Calorie",
        "condition": lambda n: n.get("calories", 0) < 100,
        "message": "✅ Low-calorie food. Great for weight management!",
        "severity": "success",
    },
}

# ─── Condition-Specific Rules ───
CONDITION_RULES = {
    "diabetes": [
        {
            "check": lambda n: n.get("carbs_g", 0) > 30,
            "message": "🩸 DIABETES ALERT: Carbs exceed 30g. This may significantly raise blood glucose.",
            "severity": "danger",
        },
        {
            "check": lambda n: n.get("sugar_g", 0) > 10,
            "message": "🩸 DIABETES ALERT: High sugar content. Avoid or limit serving size.",
            "severity": "danger",
        },
        {
            "check": lambda n: n.get("fiber_g", 0) >= 3,
            "message": "✅ Good fiber content helps manage blood sugar levels.",
            "severity": "success",
        },
    ],
    "hypertension": [
        {
            "check": lambda n: n.get("sodium_mg", 0) > 400,
            "message": "❤️‍🩹 HYPERTENSION ALERT: Sodium exceeds 400mg. Choose low-sodium options.",
            "severity": "danger",
        },
        {
            "check": lambda n: n.get("fat_g", 0) > 15,
            "message": "❤️‍🩹 HYPERTENSION: High fat may worsen blood pressure. Opt for lean foods.",
            "severity": "warning",
        },
    ],
    "heart_disease": [
        {
            "check": lambda n: n.get("cholesterol_mg", 0) > 80,
            "message": "🫀 HEART: High cholesterol food. Limit intake to protect cardiovascular health.",
            "severity": "danger",
        },
        {
            "check": lambda n: n.get("fat_g", 0) > 12,
            "message": "🫀 HEART: Saturated fat may increase LDL cholesterol.",
            "severity": "warning",
        },
        {
            "check": lambda n: n.get("sodium_mg", 0) > 500,
            "message": "🫀 HEART: High sodium. Increases cardiovascular risk.",
            "severity": "danger",
        },
    ],
    "kidney_disease": [
        {
            "check": lambda n: n.get("protein_g", 0) > 20,
            "message": "🫘 KIDNEY: High protein may strain kidneys. Consult your nephrologist.",
            "severity": "warning",
        },
        {
            "check": lambda n: n.get("sodium_mg", 0) > 350,
            "message": "🫘 KIDNEY: Moderate-to-high sodium. Keep sodium under 2000mg/day total.",
            "severity": "warning",
        },
    ],
    "obesity": [
        {
            "check": lambda n: n.get("calories", 0) > 300,
            "message": "⚖️ WEIGHT: This food is calorie-dense. Track total daily intake.",
            "severity": "warning",
        },
        {
            "check": lambda n: n.get("fat_g", 0) > 10,
            "message": "⚖️ WEIGHT: High-fat food. Consider grilled/baked alternatives.",
            "severity": "warning",
        },
        {
            "check": lambda n: n.get("fiber_g", 0) >= 5,
            "message": "✅ High fiber promotes satiety — great for weight management!",
            "severity": "success",
        },
    ],
    "celiac": [
        {
            "check": lambda n: True,  # Always warn — AI can't detect gluten from nutrition alone
            "message": "🌾 CELIAC: Verify this food is gluten-free before consumption.",
            "severity": "info",
        },
    ],
    "anemia": [
        {
            "check": lambda n: n.get("protein_g", 0) >= 10,
            "message": "✅ ANEMIA: Good protein content supports iron absorption.",
            "severity": "success",
        },
        {
            "check": lambda n: n.get("protein_g", 0) < 5,
            "message": "🩸 ANEMIA: Low protein/iron. Add iron-rich foods like lentils or spinach.",
            "severity": "warning",
        },
    ],
}


# ─── Daily Summary Rules ───
DAILY_HEALTH_RULES = {
    "exceeds_calories": {
        "condition": lambda n: n.get("total_calories", 0) > 2500,
        "message": "⚠️ Daily calorie limit exceeded (Target: 2000-2500 kcal).",
        "severity": "danger",
    },
    "high_daily_sodium": {
        "condition": lambda n: n.get("total_sodium", 0) > 2300,
        "message": "🧂 Daily sodium levels are high (>2300mg). Increase water intake.",
        "severity": "warning",
    },
    "low_daily_fiber": {
        "condition": lambda n: n.get("total_fiber", 0) < 25 and n.get("total_calories", 0) > 1500,
        "message": "🌾 Fiber intake is low today. Consider adding more vegetables or whole grains.",
        "severity": "info",
    },
    "high_daily_sugar": {
        "condition": lambda n: n.get("total_sugar", 0) > 50,
        "message": "🍬 Sugar intake is high today. Limit further sweet intake.",
        "severity": "warning",
    },
    "protein_target_met": {
        "condition": lambda n: n.get("total_protein", 0) >= 60,
        "message": "✅ Daily protein target met! Great job on maintaining muscle health.",
        "severity": "success",
    }
}


def evaluate_health_alerts(nutrition: dict) -> list:
    """Evaluate nutrition against all general health rules."""
    alerts = []
    for rule_id, rule in HEALTH_RULES.items():
        try:
            if rule["condition"](nutrition):
                alerts.append(rule["message"])
        except Exception:
            continue
    return alerts


def evaluate_daily_alerts(summary: dict) -> list:
    """Evaluate daily summary totals against daily health targets."""
    alerts = []
    for rule_id, rule in DAILY_HEALTH_RULES.items():
        try:
            if rule["condition"](summary):
                alerts.append(rule["message"])
        except Exception:
            continue
    return alerts


def get_condition_rules(condition: str, nutrition: dict) -> list:
    """Get alerts specific to a medical condition."""
    rules = CONDITION_RULES.get(condition.lower(), [])
    alerts = []
    for rule in rules:
        try:
            if rule["check"](nutrition):
                alerts.append(rule["message"])
        except Exception:
            continue
    return alerts


def calculate_risk_score(nutrition: dict, conditions: list = None) -> dict:
    """Calculate an overall health risk score (0-100) for a food item."""
    score = 0
    factors = []

    # General checks
    if nutrition.get("calories", 0) > 400:
        score += 15
        factors.append("High calories")
    if nutrition.get("sodium_mg", 0) > 500:
        score += 20
        factors.append("High sodium")
    if nutrition.get("sugar_g", 0) > 15:
        score += 15
        factors.append("High sugar")
    if nutrition.get("cholesterol_mg", 0) > 100:
        score += 15
        factors.append("High cholesterol")
    if nutrition.get("fat_g", 0) > 15:
        score += 10
        factors.append("High fat")

    # Positive factors reduce score
    if nutrition.get("fiber_g", 0) >= 3:
        score -= 5
        factors.append("Good fiber (benefit)")
    if nutrition.get("protein_g", 0) >= 15:
        score -= 5
        factors.append("Good protein (benefit)")

    # Condition-specific risks
    if conditions:
        for cond in conditions:
            alerts = get_condition_rules(cond, nutrition)
            score += len(alerts) * 5

    score = max(0, min(100, score))

    return {
        "score": score,
        "level": "low" if score < 25 else "moderate" if score < 50 else "high" if score < 75 else "critical",
        "factors": factors,
    }
