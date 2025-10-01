import asyncio
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
from agno.agent.agent import Agent
from agno.models.google import Gemini
from agno.os.interfaces.agui import AGUI
from agno.os import AgentOS
from agno.db.postgres import PostgresDb
from dotenv import load_dotenv
import asyncpg
import json
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Load environment variables from a .env file
load_dotenv()

port = int(os.environ.get("PORT", 8000)) # default to 8000
env = os.getenv("ENV", "dev")        # default to dev

host = "0.0.0.0" if env == "prod" else "localhost"

# Database connection
db_url = os.getenv("DATABASE_URL", "postgresql+psycopg://user:password@localhost:5432/healthcare_db")
db = PostgresDb(db_url=db_url)

# Global context variable to store current user_id
current_user_id: ContextVar[str] = ContextVar('current_user_id', default='default-user-id')

# Database tools for direct PostgreSQL operations
class HealthDataManager:
    """Direct database manager for health data operations"""
    
    def __init__(self, db_url: str):
        # Extract connection parameters for asyncpg
        if db_url.startswith("postgresql+psycopg://"):
            self.db_url = db_url.replace("postgresql+psycopg://", "postgresql://")
        else:
            self.db_url = db_url
    
    async def get_connection(self):
        """Get database connection"""
        return await asyncpg.connect(self.db_url)
    
    async def store_mood_entry(self, user_id: str, mood: str, energy: int, stress: int, notes: Optional[str] = None) -> Dict[str, Any]:
        """Store mood entry directly to database"""
        conn = await self.get_connection()
        try:
            mood_id = str(uuid.uuid4())
            query = """
                INSERT INTO mood_entry (id, user_id, mood, energy, stress, notes, date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            """
            result = await conn.fetchrow(
                query, mood_id, user_id, mood, energy, stress, notes, datetime.now()
            )
            
            # Calculate 7-day rolling average
            avg_query = """
                SELECT mood FROM mood_entry 
                WHERE user_id = $1 AND date >= $2 
                ORDER BY date DESC LIMIT 7
            """
            recent_moods = await conn.fetch(avg_query, user_id, datetime.now() - timedelta(days=7))
            
            mood_scores = []
            for row in recent_moods:
                score = {'great': 5, 'good': 4, 'okay': 3, 'poor': 2, 'terrible': 1}.get(row['mood'], 3)
                mood_scores.append(score)
            
            avg_score = sum(mood_scores) / len(mood_scores) if mood_scores else 3.0
            
            return {
                'id': mood_id,
                'mood': mood,
                'energy': energy,
                'stress': stress,
                'notes': notes,
                'rolling_average_7days': round(avg_score, 2),
                'status': 'stored_successfully'
            }
        finally:
            await conn.close()
    
    async def store_glucose_reading(self, user_id: str, value: float) -> Dict[str, Any]:
        """Store glucose reading with validation and status determination"""
        # Validate range
        if not (60 <= value <= 400):
            raise ValueError(f"Glucose value {value} is outside valid range (60-400 mg/dL)")
        
        # Determine status
        if value < 80:
            status = 'low'
            recommendation = 'Your glucose is low. Consider consuming 15g fast-acting carbs and recheck in 15 minutes.'
        elif value > 180:
            status = 'high'
            recommendation = 'Your glucose is elevated. Consider light activity if appropriate and monitor closely.'
        else:
            status = 'normal'
            recommendation = 'Glucose is in target range. Keep up the good work!'
        
        conn = await self.get_connection()
        try:
            glucose_id = str(uuid.uuid4())
            query = """
                INSERT INTO glucose_reading (id, user_id, value, status, timestamp)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            """
            result = await conn.fetchrow(
                query, glucose_id, user_id, value, status, datetime.now()
            )
            
            return {
                'id': glucose_id,
                'value': value,
                'status': status,
                'recommendation': recommendation,
                'timestamp': datetime.now().isoformat(),
                'stored': True
            }
        finally:
            await conn.close()
    
    async def store_meal_entry(self, user_id: str, meal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store meal entry with nutritional analysis"""
        conn = await self.get_connection()
        try:
            meal_id = str(uuid.uuid4())
            query = """
                INSERT INTO meal_entry (id, user_id, type, name, calories, carbs, protein, fat, fiber, glycemic_impact, date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            """
            result = await conn.fetchrow(
                query, 
                meal_id, user_id, meal_data['type'], meal_data['name'],
                meal_data['calories'], meal_data['carbs'], meal_data['protein'],
                meal_data['fat'], meal_data.get('fiber', 0), meal_data['glycemic_impact'],
                datetime.now()
            )
            
            # Calculate 7-day rolling averages
            avg_query = """
                SELECT AVG(calories) as avg_calories, AVG(carbs) as avg_carbs, 
                       AVG(protein) as avg_protein, AVG(fat) as avg_fat, AVG(fiber) as avg_fiber
                FROM meal_entry 
                WHERE user_id = $1 AND date >= $2
            """
            avg_result = await conn.fetchrow(avg_query, user_id, datetime.now() - timedelta(days=7))
            
            return {
                'id': meal_id,
                'stored': True,
                'meal_data': meal_data,
                'rolling_averages_7days': {
                    'calories': round(avg_result['avg_calories'] or 0, 1),
                    'carbs': round(avg_result['avg_carbs'] or 0, 1),
                    'protein': round(avg_result['avg_protein'] or 0, 1),
                    'fat': round(avg_result['avg_fat'] or 0, 1),
                    'fiber': round(avg_result['avg_fiber'] or 0, 1)
                }
            }
        finally:
            await conn.close()
    
    async def get_user_health_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive health summary for user"""
        conn = await self.get_connection()
        try:
            # Get recent glucose readings
            glucose_query = """
                SELECT * FROM glucose_reading 
                WHERE user_id = $1 
                ORDER BY timestamp DESC LIMIT 10
            """
            glucose_data = await conn.fetch(glucose_query, user_id)
            
            # Get recent mood entries
            mood_query = """
                SELECT * FROM mood_entry 
                WHERE user_id = $1 
                ORDER BY date DESC LIMIT 7
            """
            mood_data = await conn.fetch(mood_query, user_id)
            
            # Get recent meals
            meal_query = """
                SELECT * FROM meal_entry 
                WHERE user_id = $1 
                ORDER BY date DESC LIMIT 20
            """
            meal_data = await conn.fetch(meal_query, user_id)
            
            return {
                'glucose_readings': [dict(row) for row in glucose_data],
                'mood_entries': [dict(row) for row in mood_data],
                'recent_meals': [dict(row) for row in meal_data],
                'summary_generated_at': datetime.now().isoformat()
            }
        finally:
            await conn.close()

# Initialize health data manager
health_db = HealthDataManager(db_url)

# ============================================================================
# TOOL FUNCTIONS - All healthcare tools in one place
# ============================================================================

async def store_mood_data(mood: str, energy: int, stress: int, notes: str = "", user_id: str = "") -> str:
    """Store mood data and provide wellness insights.
    
    Args:
        mood: Current mood state (great/good/okay/poor/terrible)
        energy: Energy level 1-10
        stress: Stress level 1-10
        notes: Optional notes about mood
        user_id: User ID for data association (optional, will use context if not provided)
    
    Returns:
        JSON string with mood analysis and recommendations
    """
    # Use provided user_id or fall back to context
    actual_user_id = user_id or current_user_id.get()
    print(f"[MOOD] Storing mood data for user: {actual_user_id}")
    result = await health_db.store_mood_entry(actual_user_id, mood, energy, stress, notes)
    
    # Generate insights
    insights = {
        'status': 'success',
        'data': result,
        'insights': f"Mood '{mood}' recorded with energy level {energy}/10 and stress level {stress}/10.",
        'recommendations': []
    }
    
    if stress > 7:
        insights['recommendations'].append("High stress detected. Consider deep breathing exercises or a short walk.")
    if energy < 4:
        insights['recommendations'].append("Low energy. Ensure adequate sleep and nutrition.")
    if mood in ['poor', 'terrible']:
        insights['recommendations'].append("Consider engaging in activities you enjoy or talking with someone you trust.")
    
    return json.dumps(insights, indent=2)


async def store_glucose_data(glucose_value: float, user_id: str = "") -> str:
    """Store glucose reading and provide diabetes management guidance.
    
    Args:
        glucose_value: Glucose reading in mg/dL (valid range: 60-400)
        user_id: User ID for data association (optional, will use context if not provided)
    
    Returns:
        JSON string with glucose status and recommendations
    """
    # Use provided user_id or fall back to context
    actual_user_id = user_id or current_user_id.get()
    print(f"[GLUCOSE] Storing glucose reading for user: {actual_user_id}")
    result = await health_db.store_glucose_reading(actual_user_id, glucose_value)
    
    response = {
        'status': 'success',
        'data': result,
        'analysis': f"Glucose reading of {glucose_value} mg/dL is {result['status']}.",
        'recommendation': result['recommendation']
    }
    
    return json.dumps(response, indent=2)


async def store_meal_data(meal_type: str, meal_name: str, calories: int, 
                         carbs: float, protein: float, fat: float, 
                         fiber: float = 0, glycemic_impact: str = "medium", 
                         user_id: str = "") -> str:
    """Store meal data and provide nutritional analysis.
    
    Args:
        meal_type: Type of meal (breakfast/lunch/dinner/snack)
        meal_name: Name of the meal
        calories: Calorie content
        carbs: Carbohydrates in grams
        protein: Protein in grams
        fat: Fat in grams
        fiber: Fiber in grams (optional)
        glycemic_impact: Glycemic impact (low/medium/high)
        user_id: User ID for data association (optional, will use context if not provided)
    
    Returns:
        JSON string with nutritional analysis
    """
    # Use provided user_id or fall back to context
    actual_user_id = user_id or current_user_id.get()
    print(f"[MEAL] Storing meal data for user: {actual_user_id}")
    meal_data = {
        'type': meal_type,
        'name': meal_name,
        'calories': calories,
        'carbs': carbs,
        'protein': protein,
        'fat': fat,
        'fiber': fiber,
        'glycemic_impact': glycemic_impact
    }
    result = await health_db.store_meal_entry(actual_user_id, meal_data)
    
    analysis = {
        'status': 'success',
        'data': result,
        'nutritional_breakdown': f"{meal_name}: {calories} cal, {carbs}g carbs, {protein}g protein, {fat}g fat, {fiber}g fiber",
        'glycemic_impact': glycemic_impact,
        'recommendations': []
    }
    
    # Add nutritional recommendations
    if carbs > 60:
        analysis['recommendations'].append("High carb content. Monitor glucose levels after eating.")
    if fiber > 5:
        analysis['recommendations'].append("Great fiber content! This helps with blood sugar control.")
    if protein < 10:
        analysis['recommendations'].append("Consider adding more protein for sustained energy.")
    
    return json.dumps(analysis, indent=2)


async def get_health_insights(user_id: str = "") -> str:
    """Get comprehensive health insights from stored data.
    
    Args:
        user_id: User ID for data retrieval (optional, will use context if not provided)
    
    Returns:
        JSON string with comprehensive health summary and trends
    """
    # Use provided user_id or fall back to context
    actual_user_id = user_id or current_user_id.get()
    print(f"[INSIGHTS] Getting health insights for user: {actual_user_id}")
    summary = await health_db.get_user_health_summary(actual_user_id)
    
    # Analyze the data
    insights = {
        'data_summary': {
            'glucose_readings': len(summary['glucose_readings']),
            'mood_entries': len(summary['mood_entries']),
            'meals_logged': len(summary['recent_meals'])
        },
        'insights': [],
        'recommendations': []
    }
    
    # Glucose analysis
    if summary['glucose_readings']:
        recent_glucose = summary['glucose_readings'][:5]
        avg_glucose = sum(r['value'] for r in recent_glucose) / len(recent_glucose)
        insights['glucose_trend'] = {
            'average': round(avg_glucose, 1),
            'recent_readings': [r['value'] for r in recent_glucose]
        }
        
        if avg_glucose > 150:
            insights['insights'].append("Recent glucose levels are elevated.")
            insights['recommendations'].append("Review carbohydrate intake and consider physical activity.")
        elif avg_glucose < 90:
            insights['insights'].append("Recent glucose levels are on the lower side.")
            insights['recommendations'].append("Ensure regular meals and monitor for hypoglycemia symptoms.")
    
    # Mood analysis
    if summary['mood_entries']:
        recent_moods = summary['mood_entries'][:7]
        mood_scores = [{'great': 5, 'good': 4, 'okay': 3, 'poor': 2, 'terrible': 1}.get(m['mood'], 3) for m in recent_moods]
        avg_mood = sum(mood_scores) / len(mood_scores)
        avg_stress = sum(m['stress'] for m in recent_moods) / len(recent_moods)
        
        insights['mood_trend'] = {
            'average_mood_score': round(avg_mood, 1),
            'average_stress': round(avg_stress, 1)
        }
        
        if avg_stress > 6:
            insights['insights'].append("Stress levels have been elevated.")
            insights['recommendations'].append("Practice stress-reduction techniques like meditation or yoga.")
    
    # Meal analysis
    if summary['recent_meals']:
        recent_meals = summary['recent_meals'][:7]
        avg_calories = sum(m['calories'] for m in recent_meals) / len(recent_meals)
        avg_carbs = sum(m['carbs'] for m in recent_meals) / len(recent_meals)
        
        insights['nutrition_trend'] = {
            'average_calories_per_meal': round(avg_calories, 1),
            'average_carbs_per_meal': round(avg_carbs, 1)
        }
    
    insights['generated_at'] = summary['summary_generated_at']
    
    return json.dumps(insights, indent=2)


async def get_meal_plan_suggestions(dietary_preferences: str = "balanced", user_id: str = "") -> str:
    """Generate personalized meal plan suggestions.
    
    Args:
        dietary_preferences: Dietary preference (balanced/low-carb/high-protein/vegetarian)
        user_id: User ID for data retrieval (optional, will use context if not provided)
    
    Returns:
        JSON string with meal suggestions
    """
    # Use provided user_id or fall back to context
    actual_user_id = user_id or current_user_id.get()
    print(f"[MEAL_PLAN] Getting meal plan for user: {actual_user_id}")
    summary = await health_db.get_user_health_summary(actual_user_id)
    
    # Determine glucose status
    glucose_status = "normal"
    if summary['glucose_readings']:
        latest = summary['glucose_readings'][0]
        glucose_status = latest.get('status', 'normal')
    
    # Generate meal suggestions based on preferences and health status
    meal_plan = {
        'dietary_preference': dietary_preferences,
        'glucose_consideration': glucose_status,
        'breakfast': {},
        'lunch': {},
        'dinner': {},
        'snacks': []
    }
    
    if dietary_preferences == "low-carb" or glucose_status == "high":
        meal_plan['breakfast'] = {
            'name': 'Greek Yogurt with Berries and Almonds',
            'calories': 250,
            'carbs': 20,
            'protein': 15,
            'fat': 12,
            'glycemic_impact': 'low'
        }
        meal_plan['lunch'] = {
            'name': 'Grilled Chicken Salad with Olive Oil',
            'calories': 350,
            'carbs': 15,
            'protein': 30,
            'fat': 18,
            'glycemic_impact': 'low'
        }
        meal_plan['dinner'] = {
            'name': 'Baked Salmon with Roasted Vegetables',
            'calories': 400,
            'carbs': 20,
            'protein': 35,
            'fat': 20,
            'glycemic_impact': 'low'
        }
        meal_plan['snacks'] = ['Handful of nuts', 'Celery with almond butter', 'Hard-boiled egg']
    else:
        meal_plan['breakfast'] = {
            'name': 'Oatmeal with Berries and Nuts',
            'calories': 300,
            'carbs': 45,
            'protein': 10,
            'fat': 8,
            'glycemic_impact': 'medium'
        }
        meal_plan['lunch'] = {
            'name': 'Whole Grain Wrap with Turkey and Veggies',
            'calories': 400,
            'carbs': 40,
            'protein': 25,
            'fat': 15,
            'glycemic_impact': 'medium'
        }
        meal_plan['dinner'] = {
            'name': 'Grilled Chicken with Quinoa and Broccoli',
            'calories': 450,
            'carbs': 45,
            'protein': 35,
            'fat': 15,
            'glycemic_impact': 'medium'
        }
        meal_plan['snacks'] = ['Apple with peanut butter', 'Greek yogurt', 'Trail mix']
    
    return json.dumps(meal_plan, indent=2)


# ============================================================================
# SINGLE COMPREHENSIVE HEALTHCARE AGENT
# ============================================================================

healthcare_agent = Agent(
    name="Healthcare Assistant",
    model=Gemini(id="gemini-2.5-flash"),
    role="Comprehensive AI healthcare assistant for diabetes management and wellness",
    tools=[
        store_mood_data,
        store_glucose_data,
        store_meal_data,
        get_health_insights,
        get_meal_plan_suggestions
    ],
    instructions=[
        "You are a comprehensive healthcare AI assistant specializing in diabetes management and overall wellness.",
        "You help users track mood, glucose levels, and nutrition while providing personalized insights.",
        "",
        "**NOTE: User Authentication**",
        "- User authentication is handled automatically via headers",
        "- You do NOT need to pass user_id parameters to tool functions",
        "- All data is automatically stored for the currently logged-in user",
        "- Simply call the tools with the required data parameters",
        "",
        "**Core Capabilities:**",
        "1. Mood Tracking: Store mood, energy, and stress levels with wellness recommendations",
        "2. Glucose Monitoring: Record glucose readings with immediate status assessment (60-400 mg/dL range)",
        "3. Meal Logging: Track meals with nutritional breakdown and glycemic impact analysis",
        "4. Health Insights: Provide comprehensive analysis of trends across all health metrics",
        "5. Meal Planning: Generate personalized meal suggestions based on health status and preferences",
        "",
        "**When to Use Each Tool:**",
        "- store_mood_data(mood, energy, stress, notes): When user shares how they're feeling",
        "- store_glucose_data(glucose_value): When user provides a glucose/blood sugar reading",
        "- store_meal_data(meal_type, meal_name, calories, carbs, protein, fat, fiber, glycemic_impact): When user logs food",
        "- get_health_insights(): When user asks about trends, patterns, or overall health status",
        "- get_meal_plan_suggestions(dietary_preferences): When user asks for meal ideas or dietary guidance",
        "",
        "**Important Guidelines:**",
        "- ALWAYS wait for tool execution to complete before providing your response",
        "- After storing data, acknowledge the storage and provide relevant insights from the tool result",
        "- Be supportive, empathetic, and encouraging in all interactions",
        "- Provide actionable recommendations based on the data",
        "- For concerning values (very high/low glucose, severe stress), emphasize consulting healthcare providers",
        "- Keep responses informative but concise",
        "- Focus on helping users build healthy habits and understand their health patterns",
        "",
        "**Response Format:**",
        "1. Acknowledge what the user shared",
        "2. Confirm data was stored (if applicable)",
        "3. Provide key insights from the tool result",
        "4. Offer 1-2 actionable recommendations",
        "5. Ask if they need anything else or have questions"
    ],
    add_datetime_to_context=True,
    db=db,
)

# Middleware to extract user_id from headers and set in context
class UserIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract user_id from headers
        user_id = request.headers.get("X-User-Id", "default-user-id")
        user_name = request.headers.get("X-User-Name", "User")
        
        print(f"\n{'='*60}")
        print(f"[MIDDLEWARE] Request received")
        print(f"[MIDDLEWARE] User ID from header: {user_id}")
        print(f"[MIDDLEWARE] User Name from header: {user_name}")
        print(f"{'='*60}\n")
        
        # Set user_id in context for this request
        token = current_user_id.set(user_id)
        try:
            response = await call_next(request)
            return response
        finally:
            # Reset context
            current_user_id.reset(token)

# Serve the single agent using AGUI
# For single agents, we create an AgentOS with the agent directly
agent_os = AgentOS(
    agents=[healthcare_agent], 
    interfaces=[AGUI(agent=healthcare_agent)],
    os_id="healthcare-single-agent-system"
)

app = agent_os.get_app()

# Add health endpoint for Docker healthchecks
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "healthcare-backend"}

# Add middleware to extract user_id from headers
app.add_middleware(UserIdMiddleware)

if __name__ == "__main__":
    print("=" * 50)
    print("Healthcare AI Agent System")
    print("=" * 50)
    print("✅ All tools integrated into one comprehensive agent")
    print("✅ Mood tracking, glucose monitoring, meal logging")
    print("✅ Health insights and meal planning")
    print("=" * 50)
    agent_os.serve(app="agent:app", reload=(env == "dev"), host=host, port=port)