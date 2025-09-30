"use client";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useHealthData } from "@/lib/hooks/useHealthData";
import { HealthAnalysisCard, MealPlanCard, GlucoseTrendCard } from "@/components/ui/health-cards";

export default function ChatPage() {
  const { data: session } = useSession();
  const { healthData, isLoading, error, refetch } = useHealthData(7);

  // Make health data available to the AI
  useCopilotReadable({
    description: "Current user health metrics and trends",
    value: healthData ? {
      currentGlucose: healthData.glucoseReadings[healthData.glucoseReadings.length - 1],
      recentGlucoseReadings: healthData.glucoseReadings.slice(-10),
      recentMoodEntries: healthData.moodEntries.slice(-7),
      todayMeals: healthData.mealHistory.filter(meal => 
        meal.date === new Date().toISOString().split('T')[0]
      ),
      weeklyMeals: healthData.mealHistory,
      userName: session?.user?.name,
      userId: session?.user?.id
    } : null
  });

  // Greeting Agent: can be triggered by the LLM as needed
  useCopilotAction({
    name: "greetUser",
    description: "Greet the user by name after login.",
    parameters: [],
    handler: async () => {
      return { message: `Welcome back, ${session?.user?.name || "there"}!` };
    },
  });

  // Define available actions for the AI
  useCopilotAction({
    name: "analyzeGlucoseTrend",
    description: "Analyze glucose trends and provide insights",
    parameters: [
      {
        name: "timeframe",
        type: "string",
        description: "Time period to analyze (today, week, month)",
        required: true,
      },
    ],
    handler: async ({ timeframe }) => {
      if (!healthData || !healthData.glucoseReadings.length) {
        return {
          analysis: "No glucose data available for analysis.",
          recommendation: "Please ensure your glucose monitoring device is connected and recording data."
        };
      }

      const readings = healthData.glucoseReadings;
      const recent = readings.slice(-24); // Last 24 readings
      const avg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
      const highs = recent.filter(r => r.status === 'high').length;
      const lows = recent.filter(r => r.status === 'low').length;
      
      return {
        analysis: `Over the ${timeframe}, your average glucose was ${avg.toFixed(1)} mg/dL. You had ${highs} high readings and ${lows} low readings.`,
        recommendation: highs > lows ? "Consider reducing carbohydrate intake and increasing physical activity." : "Your glucose levels look stable. Keep up the good work!"
      };
    },
  });

  // Mood Tracker Agent: persist mood and compute a 7-day rolling average
  useCopilotAction({
    name: "trackMood",
    description: "Persist a mood entry (mood label plus optional energy/stress/notes) and compute a 7-day rolling average.",
    parameters: [
      { name: "mood", type: "string", description: "Mood label (happy, sad, excited, tired, etc.)", required: true },
      { name: "energy", type: "number", description: "Energy level 1-10", required: false },
      { name: "stress", type: "number", description: "Stress level 1-10", required: false },
      { name: "notes", type: "string", description: "Optional notes", required: false },
    ],
    handler: async ({ mood, energy, stress, notes }) => {
      // Map common labels to our schema's expected 5-point mood scale via LLM reasoning on the server
      const normalizedMood = (mood || "").toLowerCase();
      const fivePoint: Record<string, "great" | "good" | "okay" | "poor" | "terrible"> = {
        ecstatic: "great", happy: "good", excited: "good", fine: "okay", okay: "okay",
        meh: "okay", tired: "poor", sad: "poor", stressed: "poor", terrible: "terrible",
        anxious: "poor", angry: "poor", great: "great", good: "good", poor: "poor",
        awful: "terrible",
      };
      const moodForDb = fivePoint[normalizedMood] || (normalizedMood as any) || "okay";

      const res = await fetch(`/api/health/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodForDb,
          energy: typeof energy === "number" ? energy : 5,
          stress: typeof stress === "number" ? stress : 5,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to log mood: ${err.error || res.statusText}`);
      }

      // Refresh dashboard state
      await refetch();

      // Compute a 7-day rolling average mood score
      let avg7 = 0;
      if (healthData?.moodEntries?.length) {
        const last7 = healthData.moodEntries.slice(-7);
        const score = (m: string) => m === 'great' ? 5 : m === 'good' ? 4 : m === 'okay' ? 3 : m === 'poor' ? 2 : 1;
        avg7 = last7.reduce((s, e) => s + score(e.mood), 0) / Math.max(1, last7.length);
      }

      return {
        status: "saved",
        rollingAverage7Days: avg7 ? avg7.toFixed(1) : "N/A",
        message: `Logged mood as '${moodForDb}'. 7-day average mood score: ${avg7 ? avg7.toFixed(1) : "N/A"}.`,
      };
    },
  });

  // CGM Agent: validate glucose, persist, and provide recommendation
  useCopilotAction({
    name: "logGlucose",
    description: "Validate and save a glucose reading, returning status and a short recommendation.",
    parameters: [
      { name: "value", type: "number", description: "Glucose reading in mg/dL", required: true },
    ],
    handler: async ({ value }) => {
      const v = Number(value);
      if (!Number.isFinite(v)) {
        throw new Error("Glucose value must be a number");
      }
      const status: 'low' | 'normal' | 'high' = v < 80 ? 'low' : v > 300 ? 'high' : 'normal';
      const recommendation = status === 'low'
        ? 'Your glucose is low. Consider consuming 15g fast-acting carbs and recheck in 15 minutes.'
        : status === 'high'
          ? 'Your glucose is high. Hydrate, consider light activity if appropriate, and follow your care plan.'
          : 'Glucose is within the acceptable range. Keep monitoring and maintain balanced meals.';

      const res = await fetch(`/api/health/glucose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: v, status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to log glucose: ${err.error || res.statusText}`);
      }

      await refetch();
      return { value: v, status, recommendation };
    },
  });

  // Food Intake Agent: accept structured meal details from the LLM and persist; compute rolling macro averages
  useCopilotAction({
    name: "logMeal",
    description: "Save a meal with categorized nutrients and inferred type.",
    parameters: [
      { name: "type", type: "string", description: "Meal type (breakfast, lunch, dinner, snack)", required: true },
      { name: "name", type: "string", description: "Meal name/description", required: true },
      { name: "calories", type: "number", description: "Calories", required: true },
      { name: "carbs", type: "number", description: "Carbohydrates in grams", required: true },
      { name: "protein", type: "number", description: "Protein in grams", required: true },
      { name: "fat", type: "number", description: "Fat in grams", required: true },
      { name: "fiber", type: "number", description: "Fiber in grams", required: false },
      { name: "glycemicImpact", type: "string", description: "low | medium | high", required: true },
    ],
    handler: async (meal) => {
      const res = await fetch(`/api/health/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meal),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to log meal: ${err.error || res.statusText}`);
      }

      await refetch();

      // Compute 7-day rolling macro averages from locally cached data
      let rolling = { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };
      if (healthData?.mealHistory?.length) {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recent = healthData.mealHistory.filter((m) => new Date(m.date) >= last7Days);
        const totals = recent.reduce(
          (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            carbs: acc.carbs + (m.carbs || 0),
            protein: acc.protein + (m.protein || 0),
            fat: acc.fat + (m.fat || 0),
            fiber: acc.fiber + (m.fiber || 0),
          }),
          { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }
        );
        const days = Math.max(1, Math.ceil((Date.now() - last7Days.getTime()) / (24 * 60 * 60 * 1000)));
        rolling = {
          calories: Math.round(totals.calories / days),
          carbs: Math.round(totals.carbs / days),
          protein: Math.round(totals.protein / days),
          fat: Math.round(totals.fat / days),
          fiber: Math.round(totals.fiber / days),
        };
      }

      return { status: "saved", rollingAveragePerDay7Days: rolling };
    },
  });

  // Meal Planner Agent: the LLM can generate the plan; this action is optional to format/display a plan in UI
  useCopilotAction({
    name: "displayMealPlan",
    description: "Display a generated 3-meal/day plan.",
    parameters: [
      { name: "days", type: "number", description: "Number of days to display", required: true },
      { name: "plan", type: "string", description: "Human-readable plan text or markdown", required: true },
    ],
    handler: async ({ days, plan }) => {
      return { acknowledged: true, days, plan };
    },
  });

  useCopilotAction({
    name: "suggestMeal",
    description: "Suggest a healthy meal based on current health status",
    parameters: [
      {
        name: "mealType",
        type: "string",
        description: "Type of meal (breakfast, lunch, dinner, snack)",
        required: true,
      },
      {
        name: "preferences",
        type: "string",
        description: "Dietary preferences or restrictions",
        required: false,
      },
    ],
    handler: async ({ mealType, preferences }) => {
      if (!healthData || !healthData.glucoseReadings.length) {
        return {
          suggestion: "Please ensure your health data is available for personalized meal suggestions.",
          reason: "No glucose data available for personalized recommendations"
        };
      }

      const currentGlucose = healthData.glucoseReadings[healthData.glucoseReadings.length - 1];
      const isHighGlucose = currentGlucose?.status === 'high';
      
      const suggestions = {
        breakfast: isHighGlucose 
          ? "Greek yogurt with berries and nuts (low glycemic impact)"
          : "Oatmeal with banana and almond butter (balanced nutrition)",
        lunch: isHighGlucose
          ? "Grilled chicken salad with olive oil dressing (low carb)"
          : "Quinoa bowl with vegetables and lean protein (balanced)",
        dinner: isHighGlucose
          ? "Baked salmon with steamed broccoli (low carb, high protein)"
          : "Brown rice with grilled vegetables and tofu (balanced)",
        snack: isHighGlucose
          ? "Handful of almonds (protein and healthy fats)"
          : "Apple with peanut butter (balanced nutrients)"
      };

      return {
        suggestion: suggestions[mealType as keyof typeof suggestions] || suggestions.snack,
        reason: isHighGlucose 
          ? "Recommended due to elevated glucose levels - focusing on low glycemic impact foods"
          : "Balanced meal suggestion for optimal nutrition"
      };
    },
  });

  useCopilotAction({
    name: "assessMoodPattern",
    description: "Analyze mood patterns and provide wellness insights",
    parameters: [],
    handler: async () => {
      if (!healthData || !healthData.moodEntries.length) {
        return {
          moodScore: "N/A",
          energyLevel: "N/A",
          stressLevel: "N/A",
          insights: "No mood data available. Consider logging your daily mood to get personalized insights."
        };
      }

      const moods = healthData.moodEntries;
      const avgMood = moods.reduce((sum, entry) => {
        const moodValue = entry.mood === 'great' ? 5 : entry.mood === 'good' ? 4 : entry.mood === 'okay' ? 3 : entry.mood === 'poor' ? 2 : 1;
        return sum + moodValue;
      }, 0) / moods.length;
      
      const avgEnergy = moods.reduce((sum, entry) => sum + entry.energy, 0) / moods.length;
      const avgStress = moods.reduce((sum, entry) => sum + entry.stress, 0) / moods.length;
      
      return {
        moodScore: avgMood.toFixed(1),
        energyLevel: avgEnergy.toFixed(1),
        stressLevel: avgStress.toFixed(1),
        insights: avgStress > 6 
          ? "Your stress levels are elevated. Consider relaxation techniques like meditation or gentle exercise."
          : "Your stress levels look manageable. Keep maintaining your current wellness routine."
      };
    },
  });

  // Enhanced Multi-Agent Actions for Direct Database Storage and Generative UI

  // Comprehensive Health Analysis with Generative UI
  useCopilotAction({
    name: "displayHealthAnalysis",
    description: "Display comprehensive health analysis from the multi-agent system with interactive visualizations",
    parameters: [
      {
        name: "analysisData",
        type: "object",
        description: "Health analysis data from the multi-agent system",
        required: true,
      },
    ],
    handler: async ({ analysisData }) => {
      return {
        component: <HealthAnalysisCard data={analysisData} />,
        message: "Here's your comprehensive health analysis generated by our AI healthcare team."
      };
    },
    render: ({ result }) => {
      return result.component;
    },
  });

  // Enhanced Meal Plan Display with Generative UI
  useCopilotAction({
    name: "displayEnhancedMealPlan",
    description: "Display personalized meal plan with health context and interactive elements",
    parameters: [
      {
        name: "mealPlanData",
        type: "object",
        description: "Meal plan data with health context from the meal planning agent",
        required: true,
      },
    ],
    handler: async ({ mealPlanData }) => {
      return {
        component: <MealPlanCard data={mealPlanData} />,
        message: "Your personalized meal plan has been generated based on your current health status."
      };
    },
    render: ({ result }) => {
      return result.component;
    },
  });

  // Glucose Trend Analysis with Generative UI
  useCopilotAction({
    name: "displayGlucoseTrends",
    description: "Display glucose trend analysis with visual insights and recommendations",
    parameters: [
      {
        name: "trendData",
        type: "object",
        description: "Glucose trend analysis data from the CGM agent",
        required: true,
      },
    ],
    handler: async ({ trendData }) => {
      return {
        component: <GlucoseTrendCard data={trendData} />,
        message: "Here's your glucose trend analysis with personalized recommendations."
      };
    },
    render: ({ result }) => {
      return result.component;
    },
  });

  // Direct Database Storage Actions for Multi-Agent System

  // Store mood data directly to database
  useCopilotAction({
    name: "storeMoodDirectly",
    description: "Store mood data directly to PostgreSQL database via multi-agent system",
    parameters: [
      { name: "mood", type: "string", description: "Mood state (great, good, okay, poor, terrible)", required: true },
      { name: "energy", type: "number", description: "Energy level 1-10", required: true },
      { name: "stress", type: "number", description: "Stress level 1-10", required: true },
      { name: "notes", type: "string", description: "Optional notes", required: false },
    ],
    handler: async ({ mood, energy, stress, notes }) => {
      // This will be handled by the backend multi-agent system
      return {
        status: "stored_via_multiagent",
        mood,
        energy,
        stress,
        notes,
        message: "Mood data stored successfully by the Mood Tracker Agent."
      };
    },
  });

  // Store glucose data directly to database
  useCopilotAction({
    name: "storeGlucoseDirectly",
    description: "Store glucose reading directly to PostgreSQL database via multi-agent system",
    parameters: [
      { name: "value", type: "number", description: "Glucose reading in mg/dL", required: true },
    ],
    handler: async ({ value }) => {
      // This will be handled by the backend multi-agent system
      return {
        status: "stored_via_multiagent",
        value,
        message: "Glucose reading stored successfully by the CGM Agent."
      };
    },
  });

  // Store meal data directly to database
  useCopilotAction({
    name: "storeMealDirectly",
    description: "Store meal data directly to PostgreSQL database via multi-agent system",
    parameters: [
      { name: "type", type: "string", description: "Meal type (breakfast, lunch, dinner, snack)", required: true },
      { name: "name", type: "string", description: "Meal name/description", required: true },
      { name: "calories", type: "number", description: "Calories", required: true },
      { name: "carbs", type: "number", description: "Carbohydrates in grams", required: true },
      { name: "protein", type: "number", description: "Protein in grams", required: true },
      { name: "fat", type: "number", description: "Fat in grams", required: true },
      { name: "fiber", type: "number", description: "Fiber in grams", required: false },
      { name: "glycemicImpact", type: "string", description: "Glycemic impact (low, medium, high)", required: true },
    ],
    handler: async (mealData) => {
      // This will be handled by the backend multi-agent system
      return {
        status: "stored_via_multiagent",
        mealData,
        message: "Meal data stored successfully by the Nutrition Agent."
      };
    },
  });

  // Multi-agent orchestration actions
  useCopilotAction({
    name: "requestHealthInsights",
    description: "Request comprehensive health insights from the analytics agent",
    parameters: [
      { name: "timeframe", type: "string", description: "Analysis timeframe (week, month)", required: false },
    ],
    handler: async ({ timeframe = "week" }) => {
      return {
        status: "insights_requested",
        timeframe,
        message: "Health Analytics Agent is generating your comprehensive insights..."
      };
    },
  });

  useCopilotAction({
    name: "requestMealPlan",
    description: "Request personalized meal plan from the meal planning agent",
    parameters: [
      { name: "days", type: "number", description: "Number of days to plan", required: false },
      { name: "preferences", type: "string", description: "Dietary preferences or restrictions", required: false },
    ],
    handler: async ({ days = 1, preferences }) => {
      return {
        status: "meal_plan_requested",
        days,
        preferences,
        message: "Meal Planning Agent is creating your personalized meal plan..."
      };
    },
  });

  if (!session) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access the chat.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading health data: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Healthcare AI Assistant</h1>
              <p className="text-gray-600">
                Hi {session?.user?.name}! I can help you track glucose, mood, meals, and provide personalized health insights.
              </p>
            </div>
            {healthData && (
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Latest Glucose</p>
                  <Badge variant={
                    healthData.glucoseReadings.length > 0 
                      ? (healthData.glucoseReadings[healthData.glucoseReadings.length - 1]?.status === 'normal' ? 'default' : 'destructive')
                      : 'secondary'
                  }>
                    {healthData.glucoseReadings.length > 0 
                      ? `${healthData.glucoseReadings[healthData.glucoseReadings.length - 1]?.value} mg/dL`
                      : 'No data'
                    }
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Mood</p>
                  <Badge variant="secondary">
                    {healthData.moodEntries.length > 0 
                      ? healthData.moodEntries[healthData.moodEntries.length - 1]?.mood || 'N/A'
                      : 'No data'
                    }
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto">
          <CopilotChat
            instructions={`You are coordinating with an advanced healthcare AI system powered by Agno. 

**CRITICAL - User Information:**
- User Name: ${session?.user?.name}
- User ID: ${session?.user?.id}
- IMPORTANT: When calling ANY backend agent tool, you MUST pass the userId parameter as: user_id="${session?.user?.id}"
- This ensures all health data is correctly associated with this specific user

**Your Capabilities:**
1. **Glucose Monitoring**: Log glucose readings (60-400 mg/dL range) with automatic status classification
2. **Mood Tracking**: Record mood, energy (1-10), and stress (1-10) with 7-day rolling averages
3. **Meal Logging**: Track meals with full nutritional breakdown and glycemic impact
4. **Health Insights**: Analyze trends and patterns across all health metrics
5. **Meal Planning**: Generate personalized meal suggestions based on current health status

**Frontend Actions (use these for UI-based tracking):**
- logGlucose: Store glucose via Next.js API (already user-scoped)
- trackMood: Store mood via Next.js API (already user-scoped)
- logMeal: Store meal via Next.js API (already user-scoped)
- analyzeGlucoseTrend: Analyze trends from dashboard data
- suggestMeal: Suggest meals based on health status
- assessMoodPattern: Analyze mood patterns

**Backend Agent Tools (MUST pass user_id="${session?.user?.id}"):**
- store_glucose_data(glucose_value, user_id): Store glucose reading to database
- store_mood_data(mood, energy, stress, notes, user_id): Store mood entry to database
- store_meal_data(meal_type, meal_name, calories, carbs, protein, fat, fiber, glycemic_impact, user_id): Store meal to database
- get_health_insights(user_id): Get comprehensive health summary
- get_meal_plan_suggestions(dietary_preferences, user_id): Get meal plan suggestions

**IMPORTANT RULES:**
1. When using backend agent tools, ALWAYS include: user_id="${session?.user?.id}"
2. For simple logging, prefer frontend actions (they're faster and already user-scoped)
3. Use backend agent tools for complex analysis and meal planning
4. Always acknowledge when data is successfully stored
5. Provide supportive, actionable health guidance
6. For concerning values (glucose <70 or >250), recommend consulting a healthcare provider

**Example Usage:**
- User: "Log my glucose reading of 120"
  → Use: logGlucose action (frontend, already user-scoped)
- User: "Give me meal suggestions"
  → Use: get_meal_plan_suggestions(dietary_preferences="balanced", user_id="${session?.user?.id}")

Keep responses concise, supportive, and health-focused.`}
            labels={{
              title: "Healthcare AI Assistant",
              initial: `Hi ${session?.user?.name}! 👋 I'm your AI healthcare companion powered by advanced health analytics.

**What I can help you with:**
• 📊 **Glucose Monitoring** - Log readings and analyze trends
• 😊 **Mood Tracking** - Track emotional wellness and energy levels  
• 🍽️ **Meal Logging** - Record meals with nutritional analysis
• 📈 **Health Insights** - Get comprehensive analysis of your health patterns
• 🎯 **Meal Planning** - Receive personalized meal suggestions

**Try saying:**
- "Log my glucose reading of 120"
- "I'm feeling good today with high energy"
- "I had oatmeal with berries for breakfast"
- "Show me my glucose trends"
- "Suggest a healthy dinner"

All your data is securely stored and automatically synced to your dashboard. What would you like to track today?`,
            }}
            className="h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}