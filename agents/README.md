# Healthcare AI Agent System

A comprehensive healthcare management system powered by **Agno** with direct PostgreSQL integration and generative UI components.

## 🏗️ System Architecture

### Single Agent Design (Updated)

**Previously:** Multi-agent Team with orchestrator (had event ordering issues)  
**Now:** Single comprehensive agent with all tools ✅

```
Healthcare Assistant (Single Agent - Gemini 2.0 Flash)
├── Mood Tracking Tools
├── Glucose Monitoring Tools
├── Meal Logging Tools
├── Health Insights Tools
└── Meal Planning Tools
```

### Key Features

- **✅ Direct Database Operations**: Agent stores data directly to PostgreSQL via async tools
- **✅ No Event Ordering Issues**: Single agent architecture resolves CopilotKit streaming conflicts
- **✅ Generative UI**: Rich, interactive health visualizations in the chat interface
- **✅ Real-time Analytics**: Comprehensive health insights and trend analysis
- **✅ Personalized Recommendations**: Context-aware meal planning and health guidance

## 🚀 Agent Capabilities

### Comprehensive Healthcare Assistant

The single agent combines all healthcare capabilities:

#### 1. **Mood Tracking** 
- Store mood, energy, and stress levels
- Calculate 7-day rolling averages
- Provide wellness recommendations
- Identify patterns and correlations
- **Tool**: `store_mood_data(mood, energy, stress, notes="")`

#### 2. **Glucose Monitoring**
- Validate glucose readings (60-400 mg/dL)
- Classify status (low/normal/high)
- Provide immediate recommendations
- Store readings with timestamps
- **Tool**: `store_glucose_data(glucose_value)`

#### 3. **Meal Logging & Nutrition**
- Track meals with full nutritional breakdown
- Assess glycemic impact (low/medium/high)
- Calculate 7-day nutritional averages
- Provide dietary recommendations
- **Tool**: `store_meal_data(meal_type, meal_name, calories, carbs, protein, fat, fiber, glycemic_impact)`

#### 4. **Health Insights & Analytics**
- Comprehensive health summary
- Glucose trend analysis
- Mood pattern analysis
- Nutrition trend analysis
- Cross-metric correlations
- **Tool**: `get_health_insights()`

#### 5. **Meal Planning**
- Personalized meal suggestions
- Dietary preference support (balanced/low-carb/high-protein/vegetarian)
- Glucose-aware recommendations
- Complete nutritional breakdowns
- **Tool**: `get_meal_plan_suggestions(dietary_preferences="")`

## 📊 Data Flow

```
User Input → CopilotKit → Healthcare Agent
    ↓
Tool Selection & Execution
    ↓
Direct PostgreSQL Operations (asyncpg)
    ↓
Analysis & Insights Generation
    ↓
Structured JSON Response → Generative UI
    ↓
Rich Interactive Response → User Interface
```

## 🔧 Setup Instructions

### 1. Environment Configuration

```bash
# Copy and configure environment
cp .env.example .env

# Required environment variables:
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/healthcare_db
GOOGLE_API_KEY=your_google_api_key_here  # For Gemini model
```

### 2. Install Dependencies

```bash
cd agents
uv sync
```

### 3. Database Setup

Ensure PostgreSQL is running with the healthcare schema:
- `user` table (for authentication)
- `mood_entry` table
- `glucose_reading` table
- `meal_entry` table

Default user (`default-user-id`) is created automatically for testing.

### 4. Run the Agent

**Option 1: Using Helper Script (Recommended)**
```bash
cd agents
./run_agent.sh
```
Press `Ctrl+C` to stop.

**Option 2: Direct Execution**
```bash
cd agents
uv run python agent.py
```

**Option 3: Stop Agent**
```bash
cd agents
./stop_agent.sh
```

## 🧪 Testing the Agent

### Test Mood Tracking
```
User: "I'm feeling great today with high energy level 8 and low stress level 2"

Expected: Mood stored, 7-day average calculated, wellness insights provided
```

### Test Glucose Monitoring
```
User: "My glucose reading is 125 mg/dL"

Expected: Reading stored, status classified, immediate recommendations provided
```

### Test Meal Logging
```
User: "I had oatmeal with berries for breakfast, about 300 calories, 45g carbs, 10g protein, 8g fat, 6g fiber"

Expected: Meal stored, nutritional analysis, glycemic impact assessment, recommendations
```

### Test Health Insights
```
User: "Show me my health trends"

Expected: Comprehensive summary of glucose, mood, and nutrition trends with insights
```

### Test Meal Planning
```
User: "Suggest a low-carb meal plan for today"

Expected: Personalized breakfast, lunch, dinner, and snack suggestions with nutritional info
```

## 📱 Frontend Integration

### CopilotKit Configuration

The agent is served at `http://localhost:8000/agui` and integrates with CopilotKit via:

```typescript
// frontend/src/app/api/copilotkit/route.ts
const runtime = new CopilotRuntime({
  agents: {
    "agno_agent": new AgnoAgent({
      url: "http://localhost:8000/agui"
    }),
  }
});
```

### User Context

The frontend passes user context via `useCopilotReadable`:

```typescript
useCopilotReadable({
  description: "Current user health metrics",
  value: {
    userId: session?.user?.id,
    userName: session?.user?.name,
    // ... health data
  }
});
```

## 🎯 Tool Response Format

All tools return structured JSON strings for easy parsing and rendering:

```json
{
  "status": "success",
  "data": { /* tool-specific data */ },
  "insights": "Human-readable analysis",
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}
```

## 🔍 Troubleshooting

### Agent Won't Start

```bash
# Kill any existing processes
./stop_agent.sh

# Verify port is free
lsof -i:8000

# Start fresh
./run_agent.sh
```

### Event Ordering Errors

The single-agent architecture should eliminate `TEXT_MESSAGE_START` after `TOOL_CALL_START` errors. If issues persist:

1. Check agent logs: `tail -f agent.log`
2. Verify tools return values (not streams)
3. See `EVENT_ORDERING_ISSUE.md` for details

### Database Connection Issues

```bash
# Verify PostgreSQL is running
docker compose ps

# Check database URL
cat .env | grep DATABASE_URL

# Test connection
docker compose exec postgres psql -U user -d healthcare_db -c "\dt"
```

### Tool Execution Failures

```bash
# Check agent logs
tail -50 agent.log

# Verify default user exists
docker compose exec postgres psql -U user -d healthcare_db -c "SELECT * FROM \"user\" WHERE id='default-user-id';"
```

## 📈 Performance & Scalability

- **Response Time**: < 2 seconds for tool execution + insights
- **Database**: Direct async PostgreSQL operations (asyncpg)
- **Concurrent Users**: Supported via async/await architecture
- **Data Retention**: Configurable via database policies

## 🔐 Security Notes

- Current implementation uses a default user ID for testing
- **Production**: Implement proper user authentication and session management
- **TODO**: Extract user ID from CopilotKit session/context
- **Database**: Use connection pooling and prepared statements (asyncpg handles this)

## 📚 Additional Documentation

- `SINGLE_AGENT_SYSTEM.md` - Detailed single-agent architecture explanation
- `EVENT_ORDERING_ISSUE.md` - Why we migrated from multi-agent Team
- `run_agent.sh` - Helper script to start the agent
- `stop_agent.sh` - Helper script to stop the agent

## 🎉 Success Criteria

✅ Agent starts without errors  
✅ Responds to user messages  
✅ No event ordering errors  
✅ Tools execute successfully  
✅ Data stored to database  
✅ Insights generated correctly  
✅ All 5 tool categories functional  
✅ Comprehensive health tracking  

## 🚀 Next Steps

1. **Test thoroughly** with various user inputs
2. **Implement real user authentication** (extract from session)
3. **Add more dietary preferences** (vegetarian, vegan, keto, etc.)
4. **Enhance insights** with ML-based pattern recognition
5. **Add export functionality** (PDF reports, CSV data)
6. **Implement notification system** for concerning health metrics

---

**Built with:**
- [Agno](https://docs.agno.com) - Multi-agent framework
- [CopilotKit](https://copilotkit.ai) - AI chat interface
- [Google Gemini](https://ai.google.dev) - LLM model
- [PostgreSQL](https://postgresql.org) - Database
- [asyncpg](https://magicstack.github.io/asyncpg) - Async database driver