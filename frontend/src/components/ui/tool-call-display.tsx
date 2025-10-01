"use client";

import { AlertCircle, CheckCircle2, Clock, Activity, Brain, UtensilsCrossed, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, any>;
  status: "executing" | "inProgress" | "complete" | "error";
  result?: any;
}

const toolIcons: Record<string, any> = {
  store_glucose_data: Activity,
  store_mood_data: Brain,
  store_meal_data: UtensilsCrossed,
  get_health_insights: TrendingUp,
  get_meal_plan_suggestions: Calendar,
};

const toolColors: Record<string, string> = {
  store_glucose_data: "text-red-600 bg-red-50",
  store_mood_data: "text-purple-600 bg-purple-50",
  store_meal_data: "text-green-600 bg-green-50",
  get_health_insights: "text-blue-600 bg-blue-50",
  get_meal_plan_suggestions: "text-orange-600 bg-orange-50",
};

const toolDisplayNames: Record<string, string> = {
  store_glucose_data: "Glucose Monitor",
  store_mood_data: "Mood Tracker",
  store_meal_data: "Nutrition Logger",
  get_health_insights: "Health Analytics",
  get_meal_plan_suggestions: "Meal Planner",
};

export function ToolCallDisplay({ toolName, args, status, result }: ToolCallDisplayProps) {
  const Icon = toolIcons[toolName] || Activity;
  const colorClass = toolColors[toolName] || "text-gray-600 bg-gray-50";
  const displayName = toolDisplayNames[toolName] || toolName;

  return (
    <Card className={cn("my-3 border-l-4 transition-all duration-300", {
      "border-l-blue-500 bg-blue-50/30": status === "executing" || status === "inProgress",
      "border-l-green-500 bg-green-50/30": status === "complete",
      "border-l-red-500 bg-red-50/30": status === "error",
    })}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{displayName}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {(status === "executing" || status === "inProgress") && "Processing..."}
                {status === "complete" && "Completed"}
                {status === "error" && "Error occurred"}
              </CardDescription>
            </div>
          </div>
          {(status === "executing" || status === "inProgress") && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
          {status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Arguments Display */}
        {args && Object.keys(args).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Parameters</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(args).map(([key, value]) => {
                // Skip user_id from display
                if (key === "user_id") return null;
                
                return (
                  <div key={key} className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{String(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Display */}
        {status === "complete" && result && (
          <ToolResultDisplay toolName={toolName} result={result} />
        )}

        {/* Progress Bar for Executing */}
        {(status === "executing" || status === "inProgress") && (
          <div className="space-y-1">
            <Progress value={undefined} className="h-1" />
            <p className="text-xs text-gray-500 italic">Communicating with backend agent...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToolResultDisplay({ toolName, result }: { toolName: string; result: any }) {
  // Parse JSON string if result is a string
  let parsedResult = result;
  if (typeof result === "string") {
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { message: result };
    }
  }

  // Render based on tool type
  if (toolName === "store_glucose_data") {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Glucose Reading Stored</span>
          <Badge variant={parsedResult.data?.status === "normal" ? "default" : "destructive"}>
            {parsedResult.data?.status}
          </Badge>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-medium text-gray-900">{parsedResult.data?.value} mg/dL</p>
          <p className="text-xs text-gray-600">{parsedResult.data?.recommendation}</p>
        </div>
      </div>
    );
  }

  if (toolName === "store_mood_data") {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Mood Entry Saved</span>
            <Badge variant="secondary">{parsedResult.data?.mood}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded">
              <p className="text-gray-500">Energy</p>
              <p className="font-semibold text-purple-600">{parsedResult.data?.energy}/10</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-gray-500">Stress</p>
              <p className="font-semibold text-purple-600">{parsedResult.data?.stress}/10</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-gray-500">7-Day Avg</p>
              <p className="font-semibold text-purple-600">{parsedResult.data?.rolling_average_7days}</p>
            </div>
          </div>
          {parsedResult.insights && (
            <p className="text-xs text-gray-600 italic">{parsedResult.insights}</p>
          )}
        </div>
      </div>
    );
  }

  if (toolName === "store_meal_data") {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Meal Logged</span>
            <Badge variant="outline">{parsedResult.data?.meal_data?.type}</Badge>
          </div>
          <p className="text-sm font-medium text-gray-900">{parsedResult.data?.meal_data?.name}</p>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="bg-white p-1.5 rounded text-center">
              <p className="text-gray-500">Cal</p>
              <p className="font-semibold text-green-600">{parsedResult.data?.meal_data?.calories}</p>
            </div>
            <div className="bg-white p-1.5 rounded text-center">
              <p className="text-gray-500">Carbs</p>
              <p className="font-semibold text-green-600">{parsedResult.data?.meal_data?.carbs}g</p>
            </div>
            <div className="bg-white p-1.5 rounded text-center">
              <p className="text-gray-500">Protein</p>
              <p className="font-semibold text-green-600">{parsedResult.data?.meal_data?.protein}g</p>
            </div>
            <div className="bg-white p-1.5 rounded text-center">
              <p className="text-gray-500">Fat</p>
              <p className="font-semibold text-green-600">{parsedResult.data?.meal_data?.fat}g</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (toolName === "get_health_insights") {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">Health Insights</span>
          {parsedResult.glucose_trend && (
            <div className="bg-white p-2 rounded">
              <p className="text-xs font-medium text-gray-600">Glucose Average</p>
              <p className="text-sm font-semibold text-blue-600">{parsedResult.glucose_trend.average} mg/dL</p>
            </div>
          )}
          {parsedResult.insights && parsedResult.insights.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">Key Insights:</p>
              {parsedResult.insights.map((insight: string, idx: number) => (
                <p key={idx} className="text-xs text-gray-700">• {insight}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (toolName === "get_meal_plan_suggestions") {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Meal Plan</span>
            <Badge variant="secondary">{parsedResult.dietary_preference}</Badge>
          </div>
          {["breakfast", "lunch", "dinner"].map((meal) => {
            const mealData = parsedResult[meal];
            if (!mealData) return null;
            return (
              <div key={meal} className="bg-white p-2 rounded">
                <p className="text-xs font-medium text-gray-600 capitalize">{meal}</p>
                <p className="text-sm font-semibold text-gray-900">{mealData.name}</p>
                <p className="text-xs text-gray-600">{mealData.calories} cal • {mealData.carbs}g carbs</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default rendering for unknown tools
  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-1">Result</p>
      <pre className="text-xs overflow-auto bg-white p-2 rounded">
        {JSON.stringify(parsedResult, null, 2)}
      </pre>
    </div>
  );
}
