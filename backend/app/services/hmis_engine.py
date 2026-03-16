import json
import google.generativeai as genai
from app.config import settings
from app.models import MedicalProvider
from sqlalchemy.orm import Session

def get_care_recommendations(user_profile: dict, db: Session) -> list:
    """
    HMIS AI Module: Analyzes user health conditions and matches with the 
    Medical Provider database for high-level care recommendations.
    """
    # 1. Fetch relevant providers from DB
    conditions = user_profile.get("health_conditions", [])
    if not conditions:
        return []

    # Simple matching logic to get potential providers for the AI to rank/refine
    potential_providers = []
    for cond in conditions:
        matches = db.query(MedicalProvider).filter(
            MedicalProvider.associated_conditions.contains(cond)
        ).all()
        potential_providers.extend(matches)
    
    # De-duplicate
    potential_providers = {p.id: p for p in potential_providers}.values()
    
    if not potential_providers:
        return []

    # 2. Use High-Level AI to rank and explain recommendations
    if not settings.GEMINI_API_KEY:
        # Fallback to simple list if no AI key
        return [
            {
                "provider_name": p.name,
                "type": p.type,
                "specialty": p.specialty,
                "reason": f"Specializes in conditions related to {', '.join(conditions)}."
            } for p in list(potential_providers)[:3]
        ]

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        providers_info = [
            {
                "id": p.id,
                "name": p.name,
                "type": p.type,
                "specialty": p.specialty,
                "description": p.description,
                "rating": p.rating
            } for p in potential_providers
        ]

        prompt = f"""
        You are a Health Management Information System (HMIS) AI assistant.
        Analyze the following user's health profile and the list of available medical providers.
        Recommend the top 3 best providers based on their specialties and the user's conditions.

        User Profile:
        - Name: {user_profile.get('full_name')}
        - Health Conditions: {conditions}
        - Age: {user_profile.get('age')}
        
        Available Providers:
        {json.dumps(providers_info)}

        Respond ONLY with a JSON array of objects:
        [
          {{
            "provider_id": 1,
            "provider_name": "Name",
            "reason": "Explain accurately why this specific doctor/hospital is recommended for the user's specific conditions.",
            "urgency": "High/Medium/Routine"
          }}
        ]
        """

        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"[HMIS AI] Error: {e}")
        return []
