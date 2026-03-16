import os
import json
import google.generativeai as genai
from app.config import settings

# Try loading YOLO; graceful fallback if not available
_model = None
try:
    from ultralytics import YOLO
    model_path = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
    _model = YOLO(model_path)
    print(f"[AI] YOLOv8 model loaded from {model_path}")
except Exception as e:
    print(f"[AI] YOLOv8 not available, using fallback classifier: {e}")

# Food-101 class names (subset mapped to common foods)
FOOD_101_CLASSES = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare",
    "beet_salad", "beignets", "bibimbap", "bread_pudding", "breakfast_burrito",
    "bruschetta", "caesar_salad", "cannoli", "caprese_salad", "carrot_cake",
    "ceviche", "cheesecake", "cheese_plate", "chicken_curry", "chicken_quesadilla",
    "chicken_wings", "chocolate_cake", "chocolate_mousse", "churros", "clam_chowder",
    "club_sandwich", "crab_cakes", "creme_brulee", "croque_madame", "cup_cakes",
    "deviled_eggs", "donuts", "dumplings", "edamame", "eggs_benedict",
    "escargots", "falafel", "filet_mignon", "fish_and_chips", "foie_gras",
    "french_fries", "french_onion_soup", "french_toast", "fried_calamari", "fried_rice",
    "frozen_yogurt", "garlic_bread", "gnocchi", "greek_salad", "grilled_cheese_sandwich",
    "grilled_salmon", "guacamole", "gyoza", "hamburger", "hot_and_sour_soup",
    "hot_dog", "huevos_rancheros", "hummus", "ice_cream", "lasagna",
    "lobster_bisque", "lobster_roll_sandwich", "macaroni_and_cheese", "macarons", "miso_soup",
    "mussels", "nachos", "omelette", "onion_rings", "oysters",
    "pad_thai", "paella", "pancakes", "panna_cotta", "peking_duck",
    "pho", "pizza", "pork_chop", "poutine", "prime_rib",
    "pulled_pork_sandwich", "ramen", "ravioli", "red_velvet_cake", "risotto",
    "samosa", "sashimi", "scallops", "seaweed_salad", "shrimp_and_grits",
    "spaghetti_bolognese", "spaghetti_carbonara", "spring_rolls", "steak",
    "strawberry_shortcake", "sushi", "tacos", "takoyaki", "tiramisu",
    "tuna_tartare", "waffles",
]

# Indian food additions
INDIAN_FOODS = [
    "biryani", "butter_chicken", "chapati", "dal", "dosa",
    "idli", "naan", "palak_paneer", "paneer_tikka", "paratha",
    "poha", "rajma", "roti", "sambar", "tandoori_chicken",
    "upma", "vada", "khichdi", "chole", "aloo_gobi",
]

ALL_FOODS = FOOD_101_CLASSES + INDIAN_FOODS


def predict_food(image_path: str) -> dict:
    """
    Predict food from an image.
    Prioritizes Gemini for high-level, exact analysis.
    Returns: {"food_name": str, "confidence": float, "is_food": bool, "nutrition": dict}
    """
    # 1. Try Gemini (High level AI model for exact output + non-food filtering)
    if settings.GEMINI_API_KEY:
        gemini_res = _predict_with_gemini(image_path)
        if gemini_res:
            return gemini_res

    # 2. Fallback to YOLO
    if _model is not None:
        res = _predict_with_yolo(image_path)
        res["is_food"] = True # YOLO assumes it's looking for objects, we'll trust it's food for now
        return res
    else:
        res = _predict_fallback(image_path)
        res["is_food"] = True
        return res


def _predict_with_gemini(image_path: str) -> dict:
    """Use Gemini 1.5 Flash for precise food identification and nutrition estimation."""
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Determine MIME type (basic check)
        mime_type = "image/jpeg"
        if image_path.lower().endswith(".png"): mime_type = "image/png"
        elif image_path.lower().endswith(".webp"): mime_type = "image/webp"

        with open(image_path, "rb") as f:
            img_data = f.read()

        prompt = """
        You are a professional nutrition and food recognition AI.
        Analyze the image and:
        1. Determine if it contains food. If it's NOT food, return {"is_food": false}.
        2. If it IS food, provide the exact name of the dish and estimated nutrition per 100g.
        
        Respond ONLY with a JSON object:
        {
          "is_food": true,
          "food_name": "Exact Dish Name",
          "confidence": 0.98,
          "nutrition": {
            "calories": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0,
            "fiber_g": 0.0, "sugar_g": 0.0, "sodium_mg": 0.0, "cholesterol_mg": 0.0,
            "vitamin_a_iu": 0.0, "vitamin_c_mg": 0.0, "calcium_mg": 0.0, "iron_mg": 0.0, "potassium_mg": 0.0,
            "serving_size": "100g"
          }
        }
        """

        response = model.generate_content([
            prompt,
            {"mime_type": mime_type, "data": img_data}
        ])
        
        text = response.text.strip()
        # Extract JSON if wrapped in markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"[AI] Gemini Error: {e}")
        return None


def get_ai_recommendations(user_profile: dict, today_summary: dict) -> list:
    """Use Gemini to suggest foods based on health profile and daily intake."""
    if not settings.GEMINI_API_KEY:
        return ["Add more leafy greens to your diet.", "Try to include high-protein snacks."]

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze this user's nutritional status and provide 3 specific food recommendations.
        
        User Profile:
        - Health Conditions: {user_profile.get('health_conditions', [])}
        - Current Status: {user_profile.get('full_name')}
        
        Today's Intake:
        - Calories: {today_summary.get('total_calories')}
        - Protein: {today_summary.get('total_protein')}g
        - Carbs: {today_summary.get('total_carbs')}g
        - Fat: {today_summary.get('total_fat')}g
        
        Format your response as a JSON array of 3 strings. 
        Each recommendation should be concise and explain WHY (e.g., "Eat 100g of Spinach to boost Iron intake for your Anemia").
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"[AI] Recommendation Error: {e}")
        return ["Consult with a nutritionist for personalized plans."]


def get_personalized_verdict(food_name: str, nutrition: dict, user_profile: dict) -> dict:
    """
    Personalized Health Advisor AI:
    Analyzes a specific food against a user's medical conditions.
    Returns: {"verdict": "Safe/Caution/Avoid", "explanation": "Why?"}
    """
    if not settings.GEMINI_API_KEY:
        return {"verdict": "Neutral", "explanation": "Please enable AI for personalized verdicts."}

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a clinical nutrition expert. Analyze this food for a specific user.
        
        Food: {food_name}
        Nutrition (per 100g): {json.dumps(nutrition)}
        
        User Profile:
        - Conditions: {user_profile.get('health_conditions', [])}
        - Age: {user_profile.get('age')}
        
        Determine if this food is generally good or bad for THIS specific user.
        Consider glycemic index, sodium for hypertension, fats for heart disease, etc.
        
        Respond ONLY with a JSON object:
        {{
          "verdict": "Safe" | "Caution" | "Avoid",
          "explanation": "A concise, professional explanation of why this verdict was given for their specific conditions."
        }}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"[AI] Verdict Error: {e}")
        return {"verdict": "Caution", "explanation": "Unable to determine personalized verdict at this time."}


def _predict_with_yolo(image_path: str) -> dict:
    """Use YOLOv8 for prediction."""
    results = _model(image_path)
    best_name = "unknown_food"
    best_conf = 0.0

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            name = _model.names.get(cls_id, "unknown")
            conf = float(box.conf[0])
            if conf > best_conf:
                best_conf = conf
                best_name = name

    # Map YOLO generic classes to food names
    food_mapping = {
        "bowl": "rice_bowl",
        "sandwich": "club_sandwich",
        "cake": "chocolate_cake",
        "pizza": "pizza",
        "hot dog": "hot_dog",
        "donut": "donuts",
        "apple": "apple",
        "orange": "orange",
        "banana": "banana",
        "broccoli": "broccoli",
        "carrot": "carrot",
    }
    mapped = food_mapping.get(best_name.lower(), best_name)

    return {"food_name": mapped, "confidence": round(best_conf, 3)}


def _predict_fallback(image_path: str) -> dict:
    """Fallback: return a demo prediction based on filename keywords."""
    fname = os.path.basename(image_path).lower()

    for food in ALL_FOODS:
        if food.replace("_", "") in fname.replace("_", "").replace("-", "").replace(" ", ""):
            return {"food_name": food, "confidence": 0.85}

    # Default demo response
    return {"food_name": "rice_bowl", "confidence": 0.72}
