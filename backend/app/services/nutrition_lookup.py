"""
Nutrition Lookup Service
Data sources:
  - USDA FoodData Central (public dataset)
  - Indian Food Composition Table (ICMR)
  - Food-101 mapped nutrition values
"""

# ─── USDA FoodData Central (per 100g serving) ───
USDA_NUTRITION_DB = {
    "apple": {"calories": 52, "protein_g": 0.3, "carbs_g": 14, "fat_g": 0.2, "fiber_g": 2.4, "sugar_g": 10.4, "sodium_mg": 1, "cholesterol_mg": 0, "serving_size": "1 medium (182g)"},
    "banana": {"calories": 89, "protein_g": 1.1, "carbs_g": 23, "fat_g": 0.3, "fiber_g": 2.6, "sugar_g": 12.2, "sodium_mg": 1, "cholesterol_mg": 0, "serving_size": "1 medium (118g)"},
    "orange": {"calories": 47, "protein_g": 0.9, "carbs_g": 12, "fat_g": 0.1, "fiber_g": 2.4, "sugar_g": 9.4, "sodium_mg": 0, "cholesterol_mg": 0, "serving_size": "1 medium (131g)"},
    "pizza": {"calories": 266, "protein_g": 11.4, "carbs_g": 33, "fat_g": 10.4, "fiber_g": 2.3, "sugar_g": 3.6, "sodium_mg": 598, "cholesterol_mg": 17, "serving_size": "1 slice (107g)"},
    "hamburger": {"calories": 295, "protein_g": 17, "carbs_g": 24, "fat_g": 14, "fiber_g": 1.3, "sugar_g": 5, "sodium_mg": 562, "cholesterol_mg": 52, "serving_size": "1 burger (226g)"},
    "hot_dog": {"calories": 290, "protein_g": 10.3, "carbs_g": 24, "fat_g": 17.1, "fiber_g": 0.8, "sugar_g": 4, "sodium_mg": 810, "cholesterol_mg": 42, "serving_size": "1 hot dog (98g)"},
    "french_fries": {"calories": 312, "protein_g": 3.4, "carbs_g": 41, "fat_g": 15, "fiber_g": 3.8, "sugar_g": 0.3, "sodium_mg": 210, "cholesterol_mg": 0, "serving_size": "1 medium (117g)"},
    "fried_rice": {"calories": 163, "protein_g": 4.5, "carbs_g": 24, "fat_g": 5.2, "fiber_g": 1.2, "sugar_g": 0.6, "sodium_mg": 520, "cholesterol_mg": 40, "serving_size": "1 cup (200g)"},
    "grilled_salmon": {"calories": 208, "protein_g": 20.4, "carbs_g": 0, "fat_g": 13.4, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 59, "cholesterol_mg": 55, "serving_size": "1 fillet (170g)"},
    "chicken_curry": {"calories": 175, "protein_g": 15.2, "carbs_g": 8, "fat_g": 9.5, "fiber_g": 1.5, "sugar_g": 2.3, "sodium_mg": 450, "cholesterol_mg": 65, "serving_size": "1 cup (240g)"},
    "sushi": {"calories": 143, "protein_g": 5.8, "carbs_g": 24, "fat_g": 2.1, "fiber_g": 0.8, "sugar_g": 5.4, "sodium_mg": 480, "cholesterol_mg": 10, "serving_size": "6 pieces (200g)"},
    "tacos": {"calories": 226, "protein_g": 9.4, "carbs_g": 20, "fat_g": 11.7, "fiber_g": 2.6, "sugar_g": 1.8, "sodium_mg": 430, "cholesterol_mg": 30, "serving_size": "1 taco (136g)"},
    "ice_cream": {"calories": 207, "protein_g": 3.5, "carbs_g": 24, "fat_g": 11, "fiber_g": 0.7, "sugar_g": 21, "sodium_mg": 80, "cholesterol_mg": 44, "serving_size": "1 cup (132g)"},
    "chocolate_cake": {"calories": 371, "protein_g": 5, "carbs_g": 50.4, "fat_g": 17, "fiber_g": 2.2, "sugar_g": 36, "sodium_mg": 365, "cholesterol_mg": 55, "serving_size": "1 slice (95g)"},
    "salad": {"calories": 20, "protein_g": 1.5, "carbs_g": 3.5, "fat_g": 0.2, "fiber_g": 2, "sugar_g": 1.3, "sodium_mg": 10, "cholesterol_mg": 0, "serving_size": "1 bowl (200g)"},
    "steak": {"calories": 271, "protein_g": 26, "carbs_g": 0, "fat_g": 18, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 54, "cholesterol_mg": 82, "serving_size": "1 piece (221g)"},
    "pasta": {"calories": 131, "protein_g": 5, "carbs_g": 25, "fat_g": 1.1, "fiber_g": 1.8, "sugar_g": 0.6, "sodium_mg": 1, "cholesterol_mg": 0, "serving_size": "1 cup (140g)"},
    "ramen": {"calories": 188, "protein_g": 5.4, "carbs_g": 27, "fat_g": 7.1, "fiber_g": 1, "sugar_g": 0.6, "sodium_mg": 891, "cholesterol_mg": 0, "serving_size": "1 cup (227g)"},
    "pancakes": {"calories": 227, "protein_g": 6.4, "carbs_g": 28, "fat_g": 10.2, "fiber_g": 0.7, "sugar_g": 6.2, "sodium_mg": 439, "cholesterol_mg": 58, "serving_size": "2 pancakes (154g)"},
    "waffles": {"calories": 291, "protein_g": 7.9, "carbs_g": 33, "fat_g": 14.1, "fiber_g": 0, "sugar_g": 3.4, "sodium_mg": 511, "cholesterol_mg": 72, "serving_size": "1 waffle (75g)"},
    "omelette": {"calories": 154, "protein_g": 11, "carbs_g": 0.7, "fat_g": 12, "fiber_g": 0, "sugar_g": 0.4, "sodium_mg": 290, "cholesterol_mg": 280, "serving_size": "1 large (120g)"},
    "rice_bowl": {"calories": 130, "protein_g": 2.7, "carbs_g": 28, "fat_g": 0.3, "fiber_g": 0.4, "sugar_g": 0, "sodium_mg": 1, "cholesterol_mg": 0, "serving_size": "1 cup (158g)"},
    "broccoli": {"calories": 34, "protein_g": 2.8, "carbs_g": 7, "fat_g": 0.4, "fiber_g": 2.6, "sugar_g": 1.7, "sodium_mg": 33, "cholesterol_mg": 0, "serving_size": "1 cup (91g)"},
    "carrot": {"calories": 41, "protein_g": 0.9, "carbs_g": 10, "fat_g": 0.2, "fiber_g": 2.8, "sugar_g": 4.7, "sodium_mg": 69, "cholesterol_mg": 0, "serving_size": "1 medium (61g)"},
    "egg": {"calories": 155, "protein_g": 13, "carbs_g": 1.1, "fat_g": 11, "fiber_g": 0, "sugar_g": 1.1, "sodium_mg": 124, "cholesterol_mg": 373, "serving_size": "1 large (50g)"},
    "bread": {"calories": 265, "protein_g": 9, "carbs_g": 49, "fat_g": 3.2, "fiber_g": 2.7, "sugar_g": 5, "sodium_mg": 491, "cholesterol_mg": 0, "serving_size": "1 slice (30g)"},
    "milk": {"calories": 61, "protein_g": 3.2, "carbs_g": 4.8, "fat_g": 3.3, "fiber_g": 0, "sugar_g": 5, "sodium_mg": 43, "cholesterol_mg": 10, "serving_size": "1 cup (244ml)"},
    "cheese": {"calories": 402, "protein_g": 25, "carbs_g": 1.3, "fat_g": 33, "fiber_g": 0, "sugar_g": 0.5, "sodium_mg": 621, "cholesterol_mg": 105, "serving_size": "1 oz (28g)"},
    "yogurt": {"calories": 59, "protein_g": 10, "carbs_g": 3.6, "fat_g": 0.4, "fiber_g": 0, "sugar_g": 3.2, "sodium_mg": 36, "cholesterol_mg": 5, "serving_size": "1 cup (245g)"},
}

# ─── ICMR Indian Food Composition Table (per 100g) ───
ICMR_NUTRITION_DB = {
    "biryani": {"calories": 168, "protein_g": 5.2, "carbs_g": 25, "fat_g": 5.5, "fiber_g": 0.8, "sugar_g": 1.2, "sodium_mg": 340, "cholesterol_mg": 25, "serving_size": "1 plate (250g)"},
    "butter_chicken": {"calories": 198, "protein_g": 14.5, "carbs_g": 8, "fat_g": 12.5, "fiber_g": 1.2, "sugar_g": 3.5, "sodium_mg": 520, "cholesterol_mg": 75, "serving_size": "1 cup (240g)"},
    "chapati": {"calories": 120, "protein_g": 3.7, "carbs_g": 25, "fat_g": 0.9, "fiber_g": 3.9, "sugar_g": 0.3, "sodium_mg": 120, "cholesterol_mg": 0, "serving_size": "1 piece (40g)"},
    "dal": {"calories": 104, "protein_g": 6.9, "carbs_g": 16, "fat_g": 1.5, "fiber_g": 3.8, "sugar_g": 1.8, "sodium_mg": 240, "cholesterol_mg": 0, "serving_size": "1 cup (200g)"},
    "dosa": {"calories": 133, "protein_g": 3.9, "carbs_g": 22, "fat_g": 3.7, "fiber_g": 0.9, "sugar_g": 0.8, "sodium_mg": 180, "cholesterol_mg": 0, "serving_size": "1 dosa (100g)"},
    "idli": {"calories": 78, "protein_g": 2.1, "carbs_g": 16, "fat_g": 0.3, "fiber_g": 0.6, "sugar_g": 0.4, "sodium_mg": 160, "cholesterol_mg": 0, "serving_size": "2 pieces (60g each)"},
    "naan": {"calories": 262, "protein_g": 9, "carbs_g": 45, "fat_g": 5.1, "fiber_g": 2, "sugar_g": 3.2, "sodium_mg": 418, "cholesterol_mg": 0, "serving_size": "1 piece (90g)"},
    "palak_paneer": {"calories": 168, "protein_g": 9.8, "carbs_g": 5.6, "fat_g": 12, "fiber_g": 2.5, "sugar_g": 2.1, "sodium_mg": 380, "cholesterol_mg": 35, "serving_size": "1 cup (200g)"},
    "paneer_tikka": {"calories": 220, "protein_g": 15, "carbs_g": 5, "fat_g": 16, "fiber_g": 0.5, "sugar_g": 1.8, "sodium_mg": 320, "cholesterol_mg": 45, "serving_size": "6 pieces (150g)"},
    "paratha": {"calories": 260, "protein_g": 5, "carbs_g": 36, "fat_g": 10.3, "fiber_g": 2.1, "sugar_g": 0.8, "sodium_mg": 290, "cholesterol_mg": 0, "serving_size": "1 piece (80g)"},
    "poha": {"calories": 130, "protein_g": 2.5, "carbs_g": 23, "fat_g": 3.2, "fiber_g": 1.1, "sugar_g": 1.5, "sodium_mg": 300, "cholesterol_mg": 0, "serving_size": "1 plate (200g)"},
    "rajma": {"calories": 127, "protein_g": 8.7, "carbs_g": 23, "fat_g": 0.5, "fiber_g": 6.4, "sugar_g": 0.8, "sodium_mg": 2, "cholesterol_mg": 0, "serving_size": "1 cup (180g)"},
    "roti": {"calories": 104, "protein_g": 3.3, "carbs_g": 21, "fat_g": 0.7, "fiber_g": 3.4, "sugar_g": 0.2, "sodium_mg": 95, "cholesterol_mg": 0, "serving_size": "1 piece (35g)"},
    "sambar": {"calories": 65, "protein_g": 3.4, "carbs_g": 10, "fat_g": 1.2, "fiber_g": 2.5, "sugar_g": 2, "sodium_mg": 330, "cholesterol_mg": 0, "serving_size": "1 cup (200g)"},
    "samosa": {"calories": 262, "protein_g": 4.5, "carbs_g": 28, "fat_g": 14.5, "fiber_g": 2.3, "sugar_g": 1.5, "sodium_mg": 380, "cholesterol_mg": 0, "serving_size": "1 piece (100g)"},
    "tandoori_chicken": {"calories": 148, "protein_g": 22, "carbs_g": 3, "fat_g": 5.1, "fiber_g": 0.5, "sugar_g": 1, "sodium_mg": 420, "cholesterol_mg": 85, "serving_size": "1 piece (150g)"},
    "upma": {"calories": 135, "protein_g": 3.5, "carbs_g": 20, "fat_g": 4.5, "fiber_g": 1.2, "sugar_g": 0.5, "sodium_mg": 250, "cholesterol_mg": 0, "serving_size": "1 cup (200g)"},
    "vada": {"calories": 290, "protein_g": 8, "carbs_g": 30, "fat_g": 15.2, "fiber_g": 3.1, "sugar_g": 1.2, "sodium_mg": 310, "cholesterol_mg": 0, "serving_size": "2 pieces (80g each)"},
    "poori": {"calories": 320, "protein_g": 6.5, "carbs_g": 35, "fat_g": 17.0, "fiber_g": 2.5, "sugar_g": 1.0, "sodium_mg": 350, "cholesterol_mg": 0, "serving_size": "2 pooris (100g)"},
    "khichdi": {"calories": 108, "protein_g": 3.8, "carbs_g": 19, "fat_g": 1.8, "fiber_g": 1.5, "sugar_g": 0.3, "sodium_mg": 200, "cholesterol_mg": 0, "serving_size": "1 cup (200g)"},
    "chole": {"calories": 180, "protein_g": 8.9, "carbs_g": 27, "fat_g": 4.5, "fiber_g": 7.6, "sugar_g": 4.8, "sodium_mg": 410, "cholesterol_mg": 0, "serving_size": "1 cup (200g)"},
    "aloo_gobi": {"calories": 88, "protein_g": 2.5, "carbs_g": 12, "fat_g": 3.5, "fiber_g": 2.8, "sugar_g": 2.5, "sodium_mg": 260, "cholesterol_mg": 0, "serving_size": "1 cup (180g)"},
    "chicken_biryani": {"calories": 290, "protein_g": 18, "carbs_g": 32, "fat_g": 10, "fiber_g": 1.5, "sugar_g": 1, "sodium_mg": 550, "cholesterol_mg": 45, "serving_size": "1 plate (300g)"},
    "mutton_biryani": {"calories": 320, "protein_g": 15, "carbs_g": 30, "fat_g": 16, "fiber_g": 1.5, "sugar_g": 1, "sodium_mg": 580, "cholesterol_mg": 60, "serving_size": "1 plate (300g)"},
    "chicken_curry": {"calories": 240, "protein_g": 22, "carbs_g": 8, "fat_g": 14, "fiber_g": 1, "sugar_g": 2, "sodium_mg": 480, "cholesterol_mg": 70, "serving_size": "1 bowl (250g)"},
    "mutton_curry": {"calories": 280, "protein_g": 20, "carbs_g": 10, "fat_g": 18, "fiber_g": 1, "sugar_g": 2, "sodium_mg": 510, "cholesterol_mg": 85, "serving_size": "1 bowl (250g)"},
    "beef_fry": {"calories": 310, "protein_g": 24, "carbs_g": 4, "fat_g": 22, "fiber_g": 0.5, "sugar_g": 0.5, "sodium_mg": 450, "cholesterol_mg": 90, "serving_size": "150g"},
    "beef_curry": {"calories": 270, "protein_g": 21, "carbs_g": 9, "fat_g": 16, "fiber_g": 1, "sugar_g": 1.5, "sodium_mg": 490, "cholesterol_mg": 80, "serving_size": "250g"},
    "chicken_65": {"calories": 180, "protein_g": 20, "carbs_g": 5, "fat_g": 9, "fiber_g": 0.5, "sugar_g": 0.5, "sodium_mg": 680, "cholesterol_mg": 65, "serving_size": "100g"},
    "tandoori_chicken": {"calories": 265, "protein_g": 32, "carbs_g": 6, "fat_g": 12, "fiber_g": 1, "sugar_g": 1.5, "sodium_mg": 410, "cholesterol_mg": 85, "serving_size": "Half Chicken"},
    "gajar_halwa": {"calories": 156, "protein_g": 2.1, "carbs_g": 24, "fat_g": 6, "fiber_g": 0.8, "sugar_g": 18, "sodium_mg": 45, "cholesterol_mg": 15, "serving_size": "100g"},
    "lassi": {"calories": 120, "protein_g": 3, "carbs_g": 15, "fat_g": 5, "fiber_g": 0, "sugar_g": 14, "sodium_mg": 120, "cholesterol_mg": 15, "serving_size": "1 cup (250ml)"},
    "fish_curry": {"calories": 210, "protein_g": 18, "carbs_g": 6, "fat_g": 12, "fiber_g": 0.5, "sugar_g": 1.2, "sodium_mg": 460, "cholesterol_mg": 60, "serving_size": "1 bowl (200g)"},
    "fish_fry": {"calories": 320, "protein_g": 22, "carbs_g": 5, "fat_g": 23, "fiber_g": 0, "sugar_g": 0.5, "sodium_mg": 580, "cholesterol_mg": 65, "serving_size": "150g"},
    "grilled_fish": {"calories": 180, "protein_g": 24, "carbs_g": 1, "fat_g": 9, "fiber_g": 0, "sugar_g": 0.1, "sodium_mg": 300, "cholesterol_mg": 55, "serving_size": "1 piece (150g)"},
}

# ─── GLOBAL FOODS (Chinese, Mediterranean, etc.) ───
GLOBAL_NUTRITION_DB = {
    "dumplings": {"calories": 140, "protein_g": 6.7, "carbs_g": 18.5, "fat_g": 4.4, "fiber_g": 1, "sugar_g": 0.5, "sodium_mg": 450, "cholesterol_mg": 10, "serving_size": "4 pieces"},
    "pad_thai": {"calories": 178, "protein_g": 7.8, "carbs_g": 26, "fat_g": 5, "fiber_g": 1.2, "sugar_g": 6, "sodium_mg": 440, "cholesterol_mg": 15, "serving_size": "250g"},
    "miso_soup": {"calories": 40, "protein_g": 3, "carbs_g": 5, "fat_g": 1.5, "fiber_g": 1, "sugar_g": 2, "sodium_mg": 850, "cholesterol_mg": 0, "serving_size": "1 bowl (240ml)"},
    "hummus": {"calories": 166, "protein_g": 8, "carbs_g": 14, "fat_g": 10, "fiber_g": 6, "sugar_g": 0.3, "sodium_mg": 380, "cholesterol_mg": 0, "serving_size": "100g"},
    "falafel": {"calories": 333, "protein_g": 13.3, "carbs_g": 31.8, "fat_g": 17.8, "fiber_g": 4.9, "sugar_g": 0.3, "sodium_mg": 294, "cholesterol_mg": 0, "serving_size": "3 pieces (75g)"},
    "enchilada": {"calories": 168, "protein_g": 8, "carbs_g": 14, "fat_g": 9, "fiber_g": 2.2, "sugar_g": 2, "sodium_mg": 410, "cholesterol_mg": 25, "serving_size": "1 piece"},
    "lasagna": {"calories": 135, "protein_g": 10.4, "carbs_g": 9.2, "fat_g": 6.8, "fiber_g": 0.8, "sugar_g": 1.8, "sodium_mg": 320, "cholesterol_mg": 20, "serving_size": "100g"},
    "spring_rolls": {"calories": 150, "protein_g": 3.7, "carbs_g": 20.1, "fat_g": 6, "fiber_g": 1.5, "sugar_g": 1.2, "sodium_mg": 285, "cholesterol_mg": 5, "serving_size": "2 rolls"},
}

# Merged database
ALL_NUTRITION = {**USDA_NUTRITION_DB, **ICMR_NUTRITION_DB, **GLOBAL_NUTRITION_DB}

# Default fallback
DEFAULT_NUTRITION = {
    "calories": 150,
    "protein_g": 5,
    "carbs_g": 20,
    "fat_g": 5,
    "fiber_g": 2,
    "sugar_g": 3,
    "sodium_mg": 200,
    "cholesterol_mg": 10,
    "serving_size": "100g",
}


def get_nutrition(food_name: str) -> dict:
    """Look up nutrition data for a food item."""
    key = food_name.lower().replace(" ", "_").replace("-", "_")

    # Exact match
    if key in ALL_NUTRITION:
        return ALL_NUTRITION[key]

    # Partial match
    for db_key, data in ALL_NUTRITION.items():
        if key in db_key or db_key in key:
            return data

    return DEFAULT_NUTRITION


def search_foods(query: str, limit: int = 20) -> list:
    """Search foods by partial name."""
    q = query.lower()
    results = []
    for name, data in ALL_NUTRITION.items():
        if q in name.lower():
            results.append({"name": name, **data})
            if len(results) >= limit:
                break
    return results
