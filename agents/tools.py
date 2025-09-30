"""
Specialized Tools for Healthcare Multi-Agent System
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import uuid
from services import (
    HealthInsightGenerator, 
    MealRecommendationEngine, 
    TrendAnalyzer, 
    NutritionAnalyzer,
    HealthMetrics
)

class HealthcareTools:
    """Collection of specialized healthcare tools for agents"""
    
    def __init__(self, health_db_manager):
        self.health_db = health_db_manager
    
    async def comprehensive_health_analysis(self, user_id: str) -> Dict[str, Any]:
        """
        Perform comprehensive health analysis across all metrics
        This tool provides deep insights combining glucose, mood, and nutrition data
        """
        try:
            # Get all health data
            health_data = await self.health_db.get_user_health_summary(user_id)
            
            # Generate comprehensive insights
            insights = await HealthInsightGenerator.generate_comprehensive_insights(health_data)
            
            # Add timestamp and user context
            analysis = {
                "user_id": user_id,
                "analysis_timestamp": datetime.now().isoformat(),
                "health_insights": insights,
                "data_summary": {
                    "glucose_readings_count": len(health_data.get('glucose_readings', [])),
                    "mood_entries_count": len(health_data.get('mood_entries', [])),
                    "meals_logged_count": len(health_data.get('recent_meals', []))
                },
                "status": "analysis_complete"
            }
            
            return analysis
            
        except Exception as e:
            return {
                "error": f"Failed to generate health analysis: {str(e)}",
                "status": "analysis_failed"
            }
    
    async def generate_personalized_meal_plan(
        self, 
        user_id: str, 
        days: int = 1,
        dietary_preferences: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized meal plan based on current health status
        """
        try:
            # Get current health status
            health_data = await self.health_db.get_user_health_summary(user_id)
            
            # Determine current glucose status
            glucose_status = "normal"
            if health_data.get('glucose_readings'):
                latest_glucose = health_data['glucose_readings'][0]
                glucose_status = latest_glucose.get('status', 'normal')
            
            # Determine recent mood
            recent_mood = "okay"
            if health_data.get('mood_entries'):
                latest_mood = health_data['mood_entries'][0]
                recent_mood = latest_mood.get('mood', 'okay')
            
            # Generate meal plan
            meal_plan = MealRecommendationEngine.generate_meal_plan(
                glucose_status=glucose_status,
                recent_mood=recent_mood,
                dietary_preferences=dietary_preferences
            )
            
            # Add multiple days if requested
            plan_result = {
                "user_id": user_id,
                "plan_generated": datetime.now().isoformat(),
                "days_planned": days,
                "meal_plan": meal_plan,
                "health_context": {
                    "glucose_status": glucose_status,
                    "recent_mood": recent_mood,
                    "dietary_preferences": dietary_preferences
                },
                "status": "plan_generated"
            }
            
            return plan_result
            
        except Exception as e:
            return {
                "error": f"Failed to generate meal plan: {str(e)}",
                "status": "plan_failed"
            }
    
    async def glucose_trend_analysis(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """
        Analyze glucose trends over specified time period
        """
        try:
            health_data = await self.health_db.get_user_health_summary(user_id)
            glucose_readings = health_data.get('glucose_readings', [])
            
            if not glucose_readings:
                return {
                    "message": "No glucose data available for analysis",
                    "status": "no_data"
                }
            
            # Filter readings by date range
            cutoff_date = datetime.now() - timedelta(days=days)
            recent_readings = [
                r for r in glucose_readings 
                if datetime.fromisoformat(r.get('timestamp', datetime.now().isoformat()).replace('Z', '+00:00')) >= cutoff_date
            ]
            
            # Analyze trends
            trend_analysis = TrendAnalyzer.analyze_glucose_trend(recent_readings)
            
            # Add recommendations based on trend
            recommendations = []
            if trend_analysis['direction'] == 'rising':
                recommendations.append("Consider reviewing recent meals and carbohydrate intake")
                recommendations.append("Increase physical activity if medically appropriate")
            elif trend_analysis['direction'] == 'falling':
                recommendations.append("Monitor for hypoglycemia symptoms")
                recommendations.append("Have fast-acting carbohydrates available")
            
            if trend_analysis['stability'] == 'variable':
                recommendations.append("Focus on consistent meal timing and portion sizes")
                recommendations.append("Consider keeping a detailed food and activity log")
            
            return {
                "user_id": user_id,
                "analysis_period_days": days,
                "readings_analyzed": len(recent_readings),
                "trend_analysis": trend_analysis,
                "recommendations": recommendations,
                "status": "analysis_complete"
            }
            
        except Exception as e:
            return {
                "error": f"Failed to analyze glucose trends: {str(e)}",
                "status": "analysis_failed"
            }
    
    async def mood_pattern_insights(self, user_id: str, days: int = 14) -> Dict[str, Any]:
        """
        Analyze mood patterns and provide wellness insights
        """
        try:
            health_data = await self.health_db.get_user_health_summary(user_id)
            mood_entries = health_data.get('mood_entries', [])
            
            if not mood_entries:
                return {
                    "message": "No mood data available for analysis",
                    "status": "no_data"
                }
            
            # Analyze mood patterns
            mood_analysis = TrendAnalyzer.analyze_mood_patterns(mood_entries)
            
            # Generate wellness recommendations
            wellness_recommendations = []
            
            if mood_analysis['avg_stress'] > 6:
                wellness_recommendations.extend([
                    "Practice deep breathing exercises for 5-10 minutes daily",
                    "Consider mindfulness or meditation apps",
                    "Ensure adequate sleep (7-9 hours per night)"
                ])
            
            if mood_analysis['avg_energy'] < 4:
                wellness_recommendations.extend([
                    "Review sleep quality and duration",
                    "Consider light exercise or short walks",
                    "Evaluate nutrition for sustained energy"
                ])
            
            if mood_analysis['avg_mood_score'] < 3:
                wellness_recommendations.extend([
                    "Engage in enjoyable activities or hobbies",
                    "Connect with friends or family",
                    "Consider speaking with a healthcare provider"
                ])
            
            return {
                "user_id": user_id,
                "analysis_period_days": days,
                "entries_analyzed": mood_analysis['entries_count'],
                "mood_analysis": mood_analysis,
                "wellness_recommendations": wellness_recommendations,
                "status": "analysis_complete"
            }
            
        except Exception as e:
            return {
                "error": f"Failed to analyze mood patterns: {str(e)}",
                "status": "analysis_failed"
            }
    
    async def nutrition_balance_report(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """
        Generate comprehensive nutrition balance report
        """
        try:
            health_data = await self.health_db.get_user_health_summary(user_id)
            recent_meals = health_data.get('recent_meals', [])
            
            if not recent_meals:
                return {
                    "message": "No meal data available for analysis",
                    "status": "no_data"
                }
            
            # Filter meals by date range
            cutoff_date = datetime.now() - timedelta(days=days)
            period_meals = [
                m for m in recent_meals 
                if datetime.fromisoformat(m.get('date', datetime.now().isoformat()).replace('Z', '+00:00')) >= cutoff_date
            ]
            
            # Analyze nutritional balance
            nutrition_analysis = NutritionAnalyzer.analyze_meal_balance(period_meals)
            
            # Add meal type distribution
            meal_types = {}
            for meal in period_meals:
                meal_type = meal.get('type', 'unknown')
                meal_types[meal_type] = meal_types.get(meal_type, 0) + 1
            
            return {
                "user_id": user_id,
                "analysis_period_days": days,
                "meals_analyzed": len(period_meals),
                "nutrition_analysis": nutrition_analysis,
                "meal_distribution": meal_types,
                "status": "analysis_complete"
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate nutrition report: {str(e)}",
                "status": "analysis_failed"
            }
    
    async def health_correlation_analysis(self, user_id: str) -> Dict[str, Any]:
        """
        Analyze correlations between glucose, mood, and nutrition metrics
        """
        try:
            health_data = await self.health_db.get_user_health_summary(user_id)
            
            glucose_readings = health_data.get('glucose_readings', [])
            mood_entries = health_data.get('mood_entries', [])
            recent_meals = health_data.get('recent_meals', [])
            
            correlations = {}
            insights = []
            
            # Check data availability
            if len(glucose_readings) < 5:
                insights.append("More glucose readings needed for correlation analysis")
            if len(mood_entries) < 5:
                insights.append("More mood entries needed for correlation analysis")
            if len(recent_meals) < 10:
                insights.append("More meal data needed for correlation analysis")
            
            # Simple correlation analysis (placeholder for more sophisticated analysis)
            if len(glucose_readings) >= 5 and len(mood_entries) >= 5:
                # Simplified correlation logic
                avg_glucose = sum(r['value'] for r in glucose_readings) / len(glucose_readings)
                avg_mood_score = sum(
                    {'terrible': 1, 'poor': 2, 'okay': 3, 'good': 4, 'great': 5}.get(m['mood'], 3)
                    for m in mood_entries
                ) / len(mood_entries)
                
                if avg_glucose > 150 and avg_mood_score < 3:
                    insights.append("Higher glucose levels may be associated with lower mood scores")
                elif avg_glucose < 100 and avg_mood_score > 4:
                    insights.append("Well-controlled glucose levels correlate with better mood")
            
            return {
                "user_id": user_id,
                "correlation_analysis": correlations,
                "insights": insights,
                "data_points": {
                    "glucose_readings": len(glucose_readings),
                    "mood_entries": len(mood_entries),
                    "meal_entries": len(recent_meals)
                },
                "status": "analysis_complete"
            }
            
        except Exception as e:
            return {
                "error": f"Failed to analyze correlations: {str(e)}",
                "status": "analysis_failed"
            }

# Tool functions for agents to use
async def get_health_analysis(user_id: str) -> str:
    """Get comprehensive health analysis (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.comprehensive_health_analysis(user_id)
    return json.dumps(result, indent=2)

async def get_meal_plan(user_id: str, days: int = 1, preferences: str = None) -> str:
    """Generate personalized meal plan (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.generate_personalized_meal_plan(user_id, days, preferences)
    return json.dumps(result, indent=2)

async def get_glucose_trends(user_id: str, days: int = 7) -> str:
    """Analyze glucose trends (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.glucose_trend_analysis(user_id, days)
    return json.dumps(result, indent=2)

async def get_mood_insights(user_id: str, days: int = 14) -> str:
    """Analyze mood patterns (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.mood_pattern_insights(user_id, days)
    return json.dumps(result, indent=2)

async def get_nutrition_report(user_id: str, days: int = 7) -> str:
    """Generate nutrition balance report (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.nutrition_balance_report(user_id, days)
    return json.dumps(result, indent=2)

async def get_correlation_analysis(user_id: str) -> str:
    """Analyze health correlations (for use in agent tools)"""
    from agent import health_db
    tools = HealthcareTools(health_db)
    result = await tools.health_correlation_analysis(user_id)
    return json.dumps(result, indent=2)