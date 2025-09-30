"""
Healthcare Services Module
Provides specialized services for the multi-agent healthcare system
"""

import asyncio
import asyncpg
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import numpy as np
from pydantic import BaseModel
import os

class HealthMetrics(BaseModel):
    """Structured health metrics model"""
    glucose_avg: float
    glucose_trend: str
    mood_score: float
    energy_level: float
    stress_level: float
    nutritional_balance: Dict[str, float]
    recommendations: List[str]

class TrendAnalyzer:
    """Analyzes health trends and patterns"""
    
    @staticmethod
    def analyze_glucose_trend(readings: List[Dict]) -> Dict[str, Any]:
        """Analyze glucose trend from readings"""
        if len(readings) < 3:
            return {"trend": "insufficient_data", "direction": "unknown", "stability": "unknown"}
        
        values = [r['value'] for r in readings[-10:]]  # Last 10 readings
        
        # Calculate trend
        x = np.arange(len(values))
        coeffs = np.polyfit(x, values, 1)
        slope = coeffs[0]
        
        # Determine trend direction
        if slope > 5:
            direction = "rising"
        elif slope < -5:
            direction = "falling"
        else:
            direction = "stable"
        
        # Calculate stability (coefficient of variation)
        cv = np.std(values) / np.mean(values) if np.mean(values) > 0 else 0
        
        if cv < 0.1:
            stability = "very_stable"
        elif cv < 0.2:
            stability = "stable"
        elif cv < 0.3:
            stability = "moderate"
        else:
            stability = "variable"
        
        return {
            "trend": f"{direction}_{stability}",
            "direction": direction,
            "stability": stability,
            "slope": slope,
            "coefficient_variation": cv,
            "current_avg": np.mean(values),
            "readings_analyzed": len(values)
        }
    
    @staticmethod
    def analyze_mood_patterns(mood_entries: List[Dict]) -> Dict[str, Any]:
        """Analyze mood patterns and correlations"""
        if not mood_entries:
            return {"pattern": "no_data", "insights": []}
        
        mood_scores = []
        energy_levels = []
        stress_levels = []
        
        for entry in mood_entries:
            # Convert mood to numeric score
            mood_score = {
                'terrible': 1, 'poor': 2, 'okay': 3, 'good': 4, 'great': 5
            }.get(entry['mood'], 3)
            
            mood_scores.append(mood_score)
            energy_levels.append(entry['energy'])
            stress_levels.append(entry['stress'])
        
        avg_mood = np.mean(mood_scores)
        avg_energy = np.mean(energy_levels)
        avg_stress = np.mean(stress_levels)
        
        # Identify patterns
        insights = []
        
        if avg_stress > 7:
            insights.append("High stress levels detected. Consider stress management techniques.")
        
        if avg_energy < 4:
            insights.append("Low energy levels noted. Review sleep patterns and nutrition.")
        
        if avg_mood < 3:
            insights.append("Mood tracking shows lower scores. Consider wellness activities.")
        
        # Check for correlations
        if len(mood_scores) >= 3:
            stress_mood_corr = np.corrcoef(stress_levels, mood_scores)[0, 1]
            if stress_mood_corr < -0.5:
                insights.append("Strong negative correlation between stress and mood detected.")
        
        return {
            "avg_mood_score": avg_mood,
            "avg_energy": avg_energy,
            "avg_stress": avg_stress,
            "insights": insights,
            "pattern": "analyzed",
            "entries_count": len(mood_entries)
        }

class NutritionAnalyzer:
    """Analyzes nutritional intake and provides recommendations"""
    
    @staticmethod
    def analyze_meal_balance(meals: List[Dict]) -> Dict[str, Any]:
        """Analyze nutritional balance from meals"""
        if not meals:
            return {"balance": "no_data", "recommendations": []}
        
        total_calories = sum(meal['calories'] for meal in meals)
        total_carbs = sum(meal['carbs'] for meal in meals)
        total_protein = sum(meal['protein'] for meal in meals)
        total_fat = sum(meal['fat'] for meal in meals)
        total_fiber = sum(meal.get('fiber', 0) for meal in meals)
        
        # Calculate percentages
        carb_percent = (total_carbs * 4) / total_calories * 100 if total_calories > 0 else 0
        protein_percent = (total_protein * 4) / total_calories * 100 if total_calories > 0 else 0
        fat_percent = (total_fat * 9) / total_calories * 100 if total_calories > 0 else 0
        
        recommendations = []
        
        # Diabetes-friendly macronutrient ranges
        if carb_percent > 50:
            recommendations.append("Consider reducing carbohydrate intake for better glucose control.")
        elif carb_percent < 30:
            recommendations.append("Carbohydrate intake is quite low. Ensure adequate energy.")
        
        if protein_percent < 15:
            recommendations.append("Consider increasing protein intake to help stabilize blood sugar.")
        elif protein_percent > 30:
            recommendations.append("Protein intake is high. Ensure kidney health monitoring.")
        
        if total_fiber < 25:
            recommendations.append("Increase fiber intake with vegetables, fruits, and whole grains.")
        
        return {
            "total_calories": total_calories,
            "macronutrient_distribution": {
                "carbs_percent": round(carb_percent, 1),
                "protein_percent": round(protein_percent, 1),
                "fat_percent": round(fat_percent, 1)
            },
            "daily_fiber": total_fiber,
            "recommendations": recommendations,
            "balance_score": NutritionAnalyzer._calculate_balance_score(carb_percent, protein_percent, fat_percent),
            "meals_analyzed": len(meals)
        }
    
    @staticmethod
    def _calculate_balance_score(carb_pct: float, protein_pct: float, fat_pct: float) -> int:
        """Calculate a balance score (1-10) based on macronutrient distribution"""
        # Ideal ranges for diabetes management
        ideal_carb = 40  # 30-50%
        ideal_protein = 20  # 15-25%
        ideal_fat = 35  # 25-40%
        
        carb_score = max(0, 10 - abs(carb_pct - ideal_carb) / 5)
        protein_score = max(0, 10 - abs(protein_pct - ideal_protein) / 5)
        fat_score = max(0, 10 - abs(fat_pct - ideal_fat) / 10)
        
        return round((carb_score + protein_score + fat_score) / 3)

class MealRecommendationEngine:
    """Generates personalized meal recommendations"""
    
    @staticmethod
    def generate_meal_plan(
        glucose_status: str,
        recent_mood: str,
        dietary_preferences: Optional[str] = None,
        restrictions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate a personalized meal plan"""
        
        restrictions = restrictions or []
        
        # Base meal templates
        breakfast_options = {
            "low_glycemic": [
                "Greek yogurt with berries and nuts",
                "Avocado toast on whole grain bread",
                "Scrambled eggs with spinach and tomato"
            ],
            "moderate_glycemic": [
                "Oatmeal with banana and almond butter",
                "Whole grain cereal with milk and fruit",
                "Smoothie with protein powder and vegetables"
            ],
            "comfort": [
                "Whole grain pancakes with sugar-free syrup",
                "Egg and cheese sandwich on whole grain bread",
                "French toast made with whole grain bread"
            ]
        }
        
        lunch_options = {
            "low_glycemic": [
                "Grilled chicken salad with olive oil dressing",
                "Vegetable soup with protein",
                "Quinoa bowl with roasted vegetables"
            ],
            "moderate_glycemic": [
                "Turkey and hummus wrap",
                "Lentil soup with whole grain roll",
                "Brown rice bowl with grilled protein"
            ],
            "comfort": [
                "Whole grain pasta with marinara and lean protein",
                "Grilled cheese on whole grain bread with tomato soup",
                "Bean and cheese quesadilla"
            ]
        }
        
        dinner_options = {
            "low_glycemic": [
                "Baked salmon with steamed broccoli",
                "Grilled chicken with roasted vegetables",
                "Tofu stir-fry with non-starchy vegetables"
            ],
            "moderate_glycemic": [
                "Lean beef with sweet potato and green beans",
                "Baked cod with quinoa and asparagus",
                "Turkey meatballs with zucchini noodles"
            ],
            "comfort": [
                "Whole grain pasta with meat sauce",
                "Baked chicken with mashed cauliflower",
                "Shepherd's pie with cauliflower topping"
            ]
        }
        
        # Determine meal category based on health status
        if glucose_status == "high":
            category = "low_glycemic"
        elif recent_mood in ["poor", "terrible"]:
            category = "comfort"
        else:
            category = "moderate_glycemic"
        
        # Select meals
        import random
        
        plan = {
            "breakfast": random.choice(breakfast_options[category]),
            "lunch": random.choice(lunch_options[category]),
            "dinner": random.choice(dinner_options[category]),
            "snacks": [
                "Handful of nuts",
                "Apple with peanut butter",
                "Greek yogurt",
                "Vegetable sticks with hummus"
            ],
            "category": category,
            "focus": MealRecommendationEngine._get_focus_message(category, glucose_status, recent_mood)
        }
        
        return plan
    
    @staticmethod
    def _get_focus_message(category: str, glucose_status: str, mood: str) -> str:
        """Get focus message for the meal plan"""
        if category == "low_glycemic":
            return "Focus on blood sugar stability with low glycemic index foods"
        elif category == "comfort":
            return "Comforting, balanced meals to support mood and energy"
        else:
            return "Balanced nutrition for overall wellness and stable energy"

class HealthInsightGenerator:
    """Generates comprehensive health insights and recommendations"""
    
    @staticmethod
    async def generate_comprehensive_insights(health_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive health insights from all available data"""
        
        insights = {
            "glucose_insights": {},
            "mood_insights": {},
            "nutrition_insights": {},
            "correlations": {},
            "recommendations": [],
            "priority_areas": []
        }
        
        # Analyze glucose trends
        if health_data.get('glucose_readings'):
            glucose_analysis = TrendAnalyzer.analyze_glucose_trend(health_data['glucose_readings'])
            insights["glucose_insights"] = glucose_analysis
            
            if glucose_analysis['stability'] == 'variable':
                insights["priority_areas"].append("glucose_stability")
                insights["recommendations"].append("Focus on consistent meal timing and carbohydrate counting")
        
        # Analyze mood patterns
        if health_data.get('mood_entries'):
            mood_analysis = TrendAnalyzer.analyze_mood_patterns(health_data['mood_entries'])
            insights["mood_insights"] = mood_analysis
            
            if mood_analysis['avg_stress'] > 6:
                insights["priority_areas"].append("stress_management")
                insights["recommendations"].append("Consider stress reduction techniques like meditation or yoga")
        
        # Analyze nutrition
        if health_data.get('recent_meals'):
            nutrition_analysis = NutritionAnalyzer.analyze_meal_balance(health_data['recent_meals'])
            insights["nutrition_insights"] = nutrition_analysis
            
            if nutrition_analysis['balance_score'] < 6:
                insights["priority_areas"].append("nutritional_balance")
                insights["recommendations"].extend(nutrition_analysis['recommendations'])
        
        # Generate correlations if enough data
        insights["correlations"] = HealthInsightGenerator._analyze_correlations(health_data)
        
        return insights
    
    @staticmethod
    def _analyze_correlations(health_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze correlations between different health metrics"""
        correlations = {}
        
        # This is a simplified example - in a real system you'd do more sophisticated analysis
        glucose_readings = health_data.get('glucose_readings', [])
        mood_entries = health_data.get('mood_entries', [])
        
        if len(glucose_readings) >= 5 and len(mood_entries) >= 5:
            # Simple correlation analysis could be implemented here
            correlations["glucose_mood"] = "Sufficient data for correlation analysis"
        else:
            correlations["glucose_mood"] = "Insufficient data for correlation analysis"
        
        return correlations