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


def translate_message(msg_key: str, lang: str = "en") -> str:
    """Helper to translate health engine messages."""
    translations = {
        "ta": {
            "high_cal": "⚠️ அதிக கலோரிகள் (>400 kcal). அளவைக் குறைக்கவும்.",
            "high_carb": "🍞 அதிக மாவுச்சத்து. சர்க்கரை அளவை கவனிக்கவும்.",
            "high_fat": "🧈 அதிக கொழுப்புச்சத்து. இதய ஆரோக்கியத்தை கவனிக்கவும்.",
            "high_sodium": "🧂 அதிக உப்பு சத்து (>500mg). இரத்த அழுத்தத்திற்கு நல்லது அல்ல.",
            "high_sugar": "🍬 அதிக சர்க்கரை. இரத்த சர்க்கரை அளவை உயர்த்தலாம்.",
            "high_chol": "💛 அதிக கொலஸ்ட்ரால். இதய ஆரோக்கியத்திற்காக அளவைக் குறைக்கவும்.",
            "low_pro": "💪 புரதம் குறைவு. ஒரு புரத ஆதாரத்தைச் சேர்க்கவும்.",
            "low_fib": "🌾 நார்ச்சத்து குறைவு. நார்ச்சத்துள்ள காய்கறிகளைச் சேர்க்கவும்.",
            "good_pro": "✅ சிறந்த புரத ஆதாரம்! தசைகளுக்கு நல்லது.",
            "low_cal": "✅ குறைந்த கலோரிகள். எடை இழப்பிற்கு சிறந்தது!",
            "daily_cal_exceeded": "⚠️ தினசரி கலோரி இலக்கு தாண்டப்பட்டது.",
            "daily_sodium_high": "🧂 உப்பு அளவு அதிகம். அதிக தண்ணீர் குடிக்கவும்.",
            "daily_fiber_low": "🌾 நார்ச்சத்து குறைவு. காய்கறிகளை அதிகம் சேர்க்கவும்.",
            "daily_sugar_high": "🍬 சர்க்கரை அளவு அதிகம். இனிப்புகளைத் தவிர்க்கவும்.",
            "daily_protein_met": "✅ தினசரி புரத இலக்கு எட்டப்பட்டது! நன்று."
        },
        "hi": {
            "high_cal": "⚠️ उच्च कैलोरी (>400 kcal)। मात्रा पर ध्यान दें।",
            "high_carb": "🍞 उच्च कार्बोहाइड्रेट। ब्लड शुगर का ध्यान रखें।",
            "high_fat": "🧈 उच्च वसा। हृदय स्वास्थ्य पर विचार करें।",
            "high_sodium": "🧂 उच्च सोडियम (>500mg)। उच्च रक्तचाप के लिए सही नहीं है।",
            "high_sugar": "🍬 उच्च चीनी। ब्लड शुगर बढ़ सकता है।",
            "high_chol": "💛 उच्च कोलेस्ट्रॉल। हृदय स्वास्थ्य के लिए सीमित करें।",
            "low_pro": "💪 कम प्रोटीन। प्रोटीन स्रोत शामिल करें।",
            "low_fib": "🌾 कम फाइबर। रेशेदार भोजन शामिल करें।",
            "good_pro": "✅ उत्कृष्ट प्रोटीन स्रोत! मांसपेशियों के लिए बहुत अच्छा।",
            "low_cal": "✅ कम कैलोरी वाला भोजन। वजन प्रबंधन के लिए बहुत अच्छा!",
            "daily_cal_exceeded": "⚠️ दैनिक कैलोरी सीमा पार हो गई है।",
            "daily_sodium_high": "🧂 सोडियम का स्तर अधिक है। पानी का सेवन बढ़ाएं।",
            "daily_fiber_low": "🌾 फाइबर कम है। अधिक सब्जियां शामिल करें।",
            "daily_sugar_high": "🍬 चीनी का सेवन अधिक है। मिठाई सीमित करें।",
            "daily_protein_met": "✅ दैनिक प्रोटीन लक्ष्य पूरा हुआ! बहुत अच्छे।"
        }
    }
    
    # Mapping for English (keys to original messages)
    en_map = {
        "high_cal": "⚠️ This food is calorie-dense (>400 kcal per serving).",
        "high_carb": "🍞 High carbohydrate content. Be cautious if monitoring sugar.",
        "high_fat": "🧈 High fat content. Consider heart-healthy alternatives.",
        "high_sodium": "🧂 High sodium content (>500mg). Not ideal for hypertension.",
        "high_sugar": "🍬 High sugar content. May spike blood glucose levels.",
        "high_chol": "💛 High cholesterol content. Limit intake for heart health.",
        "low_pro": "💪 Low protein. Consider adding a protein source.",
        "low_fib": "🌾 Low fiber. Pair with high-fiber foods.",
        "good_pro": "✅ Excellent protein source! Great for muscle recovery.",
        "low_cal": "✅ Low-calorie food. Great for weight management!",
        "daily_cal_exceeded": "⚠️ Daily calorie limit exceeded.",
        "daily_sodium_high": "🧂 Daily sodium levels are high. Increase water intake.",
        "daily_fiber_low": "🌾 Fiber intake is low today. Add more vegetables.",
        "daily_sugar_high": "🍬 Sugar intake is high today. Limit sweets.",
        "daily_protein_met": "✅ Daily protein target met! Great job."
    }
    
    if lang == "en":
        return en_map.get(msg_key, msg_key)
    return translations.get(lang, {}).get(msg_key, en_map.get(msg_key, msg_key))

def evaluate_health_alerts(nutrition: dict, lang: str = "en") -> list:
    """Evaluate nutrition against all general health rules."""
    alerts = []
    mapping = {
        "high_calories": "high_cal", "high_carbs": "high_carb", "high_fat": "high_fat",
        "high_sodium": "high_sodium", "high_sugar": "high_sugar", "high_cholesterol": "high_chol",
        "low_protein": "low_pro", "low_fiber": "low_fib", "good_protein": "good_pro",
        "low_calorie": "low_cal"
    }
    for rule_id, rule in HEALTH_RULES.items():
        try:
            if rule["condition"](nutrition):
                alerts.append(translate_message(mapping.get(rule_id, rule_id), lang))
        except Exception:
            continue
    return alerts


def evaluate_daily_alerts(summary: dict, lang: str = "en") -> list:
    """Evaluate daily summary totals against daily health targets."""
    alerts = []
    mapping = {
        "exceeds_calories": "daily_cal_exceeded", "high_daily_sodium": "daily_sodium_high",
        "low_daily_fiber": "daily_fiber_low", "high_daily_sugar": "daily_sugar_high",
        "protein_target_met": "daily_protein_met"
    }
    for rule_id, rule in DAILY_HEALTH_RULES.items():
        try:
            if rule["condition"](summary):
                alerts.append(translate_message(mapping.get(rule_id, rule_id), lang))
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
