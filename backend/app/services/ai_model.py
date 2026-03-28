"""
AI Food Recognition Service
Uses Groq LLaMA (text) for food name classification from description,
with a built-in Indian Nutrition Database as instant fallback.
"""
import os
import json
import base64
import requests
from app.config import settings
from PIL import Image

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

def log_ai(msg):
    try:
        with open("ai_log.txt", "a") as f:
            f.write(f"[AI] {msg}\n")
    except Exception:
        pass
    print(f"[AI] {msg}")

# =====================================================
# BUILT-IN INDIAN FOOD NUTRITION DATABASE
# Source: Indian Food Composition Tables (ICMR)
# =====================================================
FOOD_NUTRITION_DB = {
    "idli":          {"calories": 58,  "protein_g": 2.0, "carbs_g": 12.0, "fat_g": 0.4, "allergens": ["Gluten", "Rice"]},
    "dosa":          {"calories": 168, "protein_g": 3.8, "carbs_g": 28.0, "fat_g": 5.0, "allergens": ["Rice", "Urad Dal"]},
    "masala dosa":   {"calories": 230, "protein_g": 5.0, "carbs_g": 35.0, "fat_g": 9.0, "allergens": ["Gluten", "Dairy"]},
    "samosa":        {"calories": 262, "protein_g": 4.5, "carbs_g": 30.0, "fat_g": 13.0, "allergens": ["Gluten"]},
    "poori":         {"calories": 180, "protein_g": 3.5, "carbs_g": 22.0, "fat_g": 9.0, "allergens": ["Gluten"]},
    "chapati":       {"calories": 120, "protein_g": 3.6, "carbs_g": 20.0, "fat_g": 3.7, "allergens": ["Gluten"]},
    "butter naan":   {"calories": 320, "protein_g": 8.0, "carbs_g": 50.0, "fat_g": 9.0, "allergens": ["Gluten", "Dairy"]},
    "chole bhature": {"calories": 450, "protein_g": 14.0,"carbs_g": 62.0, "fat_g": 16.0,"allergens": ["Gluten"]},
    "dal makhani":   {"calories": 198, "protein_g": 8.5, "carbs_g": 22.0, "fat_g": 9.0, "allergens": ["Dairy"]},
    "kadai paneer":  {"calories": 290, "protein_g": 12.0,"carbs_g": 14.0, "fat_g": 22.0,"allergens": ["Dairy"]},
    "pav bhaji":     {"calories": 350, "protein_g": 7.0, "carbs_g": 55.0, "fat_g": 12.0,"allergens": ["Gluten", "Dairy"]},
    "jalebi":        {"calories": 360, "protein_g": 3.5, "carbs_g": 72.0, "fat_g": 7.5, "allergens": ["Gluten", "Sugar"]},
    "dhokla":        {"calories": 160, "protein_g": 5.5, "carbs_g": 25.0, "fat_g": 4.5, "allergens": ["Gluten"]},
    "pakode":        {"calories": 250, "protein_g": 6.0, "carbs_g": 28.0, "fat_g": 13.0,"allergens": ["Gluten"]},
    "paani puri":    {"calories": 200, "protein_g": 4.0, "carbs_g": 36.0, "fat_g": 5.5, "allergens": ["Gluten"]},
    "momos":         {"calories": 220, "protein_g": 9.0, "carbs_g": 28.0, "fat_g": 8.0, "allergens": ["Gluten"]},
    "fried rice":    {"calories": 280, "protein_g": 6.0, "carbs_g": 50.0, "fat_g": 7.5, "allergens": ["Soy", "Egg"]},
    "kaathi rolls":  {"calories": 380, "protein_g": 14.0,"carbs_g": 48.0, "fat_g": 16.0,"allergens": ["Gluten", "Egg"]},
    "kulfi":         {"calories": 195, "protein_g": 4.5, "carbs_g": 28.0, "fat_g": 8.0, "allergens": ["Dairy"]},
    "burger":        {"calories": 450, "protein_g": 18.0,"carbs_g": 45.0, "fat_g": 22.0,"allergens": ["Gluten", "Dairy"]},
    "pizza":         {"calories": 530, "protein_g": 20.0,"carbs_g": 55.0, "fat_g": 25.0,"allergens": ["Gluten", "Dairy"]},
    "chai":          {"calories": 80,  "protein_g": 2.0, "carbs_g": 14.0, "fat_g": 2.0, "allergens": ["Dairy"]},
    "upma":          {"calories": 150, "protein_g": 4.0, "carbs_g": 25.0, "fat_g": 4.5, "allergens": ["Gluten"]},
    "uttapam":       {"calories": 175, "protein_g": 4.5, "carbs_g": 28.0, "fat_g": 5.5, "allergens": []},
    "biryani":       {"calories": 430, "protein_g": 18.0,"carbs_g": 60.0, "fat_g": 14.0,"allergens": ["Dairy"]},
    "paneer":        {"calories": 265, "protein_g": 18.0,"carbs_g": 3.0,  "fat_g": 20.0,"allergens": ["Dairy"]},
    "rice":          {"calories": 130, "protein_g": 2.7, "carbs_g": 28.0, "fat_g": 0.3, "allergens": []},
    "vada":          {"calories": 225, "protein_g": 7.0, "carbs_g": 22.0, "fat_g": 11.0,"allergens": ["Gluten"]},
    "halwa":         {"calories": 380, "protein_g": 5.0, "carbs_g": 55.0, "fat_g": 15.0,"allergens": ["Dairy", "Gluten"]},
    "raita":         {"calories": 80,  "protein_g": 3.5, "carbs_g": 8.0,  "fat_g": 3.5, "allergens": ["Dairy"]},
}

def get_nutrition(food_name: str) -> dict:
    """Lookup nutrition from our Indian food DB."""
    key = food_name.lower().strip()
    for db_key, data in FOOD_NUTRITION_DB.items():
        if db_key in key or key in db_key:
            return data
    # Generic fallback
    return {"calories": 200, "protein_g": 5.0, "carbs_g": 30.0, "fat_g": 7.0, "allergens": []}

def encode_image_base64(image_path: str) -> str:
    with Image.open(image_path) as img:
        if img.mode in ("RGBA", "P", "CMYK"):
            img = img.convert("RGB")
        temp_path = image_path + "_tmp.jpg"
        img.save(temp_path, format="JPEG", quality=85)
    with open(temp_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def predict_food(image_path: str) -> dict:
    """
    Sends image to Groq LLaMA Vision (meta-llama/llama-4-scout-17b-16e-instruct)
    Falls back to local nutrition DB if API fails.
    """
    log_ai(f"Starting food scan for: {image_path}")
    
    food_list = ", ".join(FOOD_NUTRITION_DB.keys())
    prompt = f"""You are an expert Indian food recognition AI.
Look at this food image and identify what food it is.

Choose the CLOSEST match from this list: {food_list}

Reply with ONLY a JSON object, nothing else:
{{
  "food_name": "idli",
  "confidence": 0.95,
  "description": "South Indian steamed rice cake"
}}"""

    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            b64 = encode_image_base64(image_path)
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
                    ]
                }],
                temperature=0.05,
                max_tokens=200
            )
            
            text = response.choices[0].message.content.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "{" in text:
                text = text[text.find("{"):text.rfind("}")+1]
            
            parsed = json.loads(text)
            food_name = parsed.get("food_name", "Unknown Food")
            confidence = parsed.get("confidence", 0.80)
            
            nutr = get_nutrition(food_name)
            log_ai(f"Groq Scout Vision Success: {food_name}")
            
            return {
                "is_food": True,
                "food_name": food_name.title(),
                "confidence": confidence,
                "allergens": nutr.get("allergens", []),
                "additives": [],
                "nutrition": {
                    "calories": nutr["calories"],
                    "protein_g": nutr["protein_g"],
                    "carbs_g": nutr["carbs_g"],
                    "fat_g": nutr["fat_g"]
                }
            }
        except Exception as e:
            log_ai(f"Groq Scout Error: {e}")

    # Gemini fallback
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model_name = "gemini-1.5-flash-latest"
            model = genai.GenerativeModel(model_name)
            with Image.open(image_path) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img_copy = img.copy()
            response = model.generate_content([prompt, img_copy])
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "{" in text:
                text = text[text.find("{"):text.rfind("}")+1]
            parsed = json.loads(text)
            food_name = parsed.get("food_name", "Unknown Food")
            nutr = get_nutrition(food_name)
            log_ai(f"Gemini Fallback Success: {food_name}")
            return {
                "is_food": True,
                "food_name": food_name.title(),
                "confidence": parsed.get("confidence", 0.80),
                "allergens": nutr.get("allergens", []),
                "additives": [],
                "nutrition": {
                    "calories": nutr["calories"],
                    "protein_g": nutr["protein_g"],
                    "carbs_g": nutr["carbs_g"],
                    "fat_g": nutr["fat_g"]
                }
            }
        except Exception as e:
            log_ai(f"Gemini Fallback Error: {e}")

    log_ai("All AI engines failed - returning error state")
    return {"food_name": "Could not identify food", "confidence": 0, "is_food": False}


def get_personalized_verdict(food_name: str, nutrition: dict, user_profile: dict, lang: str = "en") -> dict:
    """Uses Groq LLaMA 3.3 70B (text) for health verdict."""
    try:
        from groq import Groq
        if not settings.GROQ_API_KEY:
            return {"verdict": "Consult Doctor", "explanation": "No AI key provided."}
        
        client = Groq(api_key=settings.GROQ_API_KEY)
        prompt = f"""Act as a medical nutritionist. Give a brief health verdict.
Food: {food_name}
Nutrition per serving: {nutrition}
User health conditions: {user_profile.get('health_conditions', [])}
Name: {user_profile.get('full_name', 'User')}

Is this food safe for this user? Be brief (2 sentences max).
Reply ONLY with JSON:
{{"verdict": "Safe", "explanation": "reason here"}}
(verdict must be one of: Safe, Caution, Harmful)"""

        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150
        )
        text = res.choices[0].message.content.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "{" in text:
            text = text[text.find("{"):text.rfind("}")+1]
        return json.loads(text)
    except Exception as e:
        log_ai(f"Verdict Error: {e}")
        return {"verdict": "Consult Doctor", "explanation": "Refer to your nutritionist for advice."}


def get_ai_recommendations(user_dict: dict, daily_summary: dict, lang: str = "en") -> list:
    """Uses Groq LLaMA 3.3 70B for daily health tips."""
    try:
        from groq import Groq
        if not settings.GROQ_API_KEY:
            return []
        client = Groq(api_key=settings.GROQ_API_KEY)
        prompt = f"""Act as a nutritionist. Give exactly 2 one-sentence tips.
User: {user_dict.get('full_name', 'User')}, conditions: {user_dict.get('health_conditions', [])}
Today's intake: {daily_summary}
Reply ONLY with a JSON array: ["tip 1", "tip 2"]"""
        
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=120
        )
        text = res.choices[0].message.content.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        if "[" in text:
            text = text[text.find("["):text.rfind("]")+1]
        out = json.loads(text)
        return out if isinstance(out, list) else []
    except Exception as e:
        log_ai(f"Recommendations Error: {e}")
        return []
