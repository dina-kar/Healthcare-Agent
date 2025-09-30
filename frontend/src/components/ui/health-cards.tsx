import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Brain, 
  Utensils,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface HealthAnalysisData {
  glucose_insights?: {
    direction: string;
    stability: string;
    current_avg: number;
    readings_analyzed: number;
  };
  mood_insights?: {
    avg_mood_score: number;
    avg_energy: number;
    avg_stress: number;
    insights: string[];
  };
  nutrition_insights?: {
    balance_score: number;
    macronutrient_distribution: {
      carbs_percent: number;
      protein_percent: number;
      fat_percent: number;
    };
    recommendations: string[];
  };
  recommendations?: string[];
  priority_areas?: string[];
}

interface MealPlanData {
  meal_plan?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
    focus: string;
  };
  health_context?: {
    glucose_status: string;
    recent_mood: string;
  };
}

interface HealthAnalysisProps {
  data: HealthAnalysisData;
}

interface MealPlanProps {
  data: MealPlanData;
}

interface GlucoseTrendProps {
  data: {
    trend_analysis?: {
      direction: string;
      stability: string;
      current_avg: number;
      readings_analyzed: number;
    };
    recommendations?: string[];
  };
}

export const HealthAnalysisCard: React.FC<HealthAnalysisProps> = ({ data }) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-green-500" />;
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'very_stable':
      case 'stable':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Comprehensive Health Analysis</span>
        </CardTitle>
        <CardDescription>
          AI-powered insights from your health data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="glucose">Glucose</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Priority Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.priority_areas?.map((area, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {area.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )) || <p className="text-sm text-gray-500">All areas looking good!</p>}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.recommendations?.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">Keep up the great work!</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="glucose" className="space-y-4">
            {data.glucose_insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getTrendIcon(data.glucose_insights.direction)}
                    <span>Glucose Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Average Reading</p>
                      <p className="text-2xl font-bold">{data.glucose_insights.current_avg?.toFixed(1)} mg/dL</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stability</p>
                      <p className={`text-lg font-semibold ${getStabilityColor(data.glucose_insights.stability)}`}>
                        {data.glucose_insights.stability.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Analysis based on {data.glucose_insights.readings_analyzed} readings
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="mood" className="space-y-4">
            {data.mood_insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Mood & Wellness</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">Mood Score</p>
                      <p className={`text-2xl font-bold ${getMoodColor(data.mood_insights.avg_mood_score)}`}>
                        {data.mood_insights.avg_mood_score?.toFixed(1)}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Energy Level</p>
                      <p className="text-2xl font-bold">{data.mood_insights.avg_energy?.toFixed(1)}/10</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Stress Level</p>
                      <p className="text-2xl font-bold">{data.mood_insights.avg_stress?.toFixed(1)}/10</p>
                    </div>
                  </div>
                  
                  {data.mood_insights.insights?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Insights</p>
                      {data.mood_insights.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="nutrition" className="space-y-4">
            {data.nutrition_insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5" />
                    <span>Nutritional Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">Balance Score</p>
                    <p className="text-3xl font-bold">{data.nutrition_insights.balance_score}/10</p>
                    <Progress value={data.nutrition_insights.balance_score * 10} className="mt-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Macronutrient Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Carbohydrates</span>
                        <span className="text-sm font-medium">
                          {data.nutrition_insights.macronutrient_distribution?.carbs_percent}%
                        </span>
                      </div>
                      <Progress value={data.nutrition_insights.macronutrient_distribution?.carbs_percent} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Protein</span>
                        <span className="text-sm font-medium">
                          {data.nutrition_insights.macronutrient_distribution?.protein_percent}%
                        </span>
                      </div>
                      <Progress value={data.nutrition_insights.macronutrient_distribution?.protein_percent} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fat</span>
                        <span className="text-sm font-medium">
                          {data.nutrition_insights.macronutrient_distribution?.fat_percent}%
                        </span>
                      </div>
                      <Progress value={data.nutrition_insights.macronutrient_distribution?.fat_percent} />
                    </div>
                  </div>
                  
                  {data.nutrition_insights.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recommendations</p>
                      {data.nutrition_insights.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export const MealPlanCard: React.FC<MealPlanProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great':
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'okay':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  // Early return if no data
  if (!data.meal_plan || !data.health_context) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Meal Plan</CardTitle>
          <CardDescription>No meal plan data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Utensils className="h-5 w-5" />
          <span>Personalized Meal Plan</span>
        </CardTitle>
        <CardDescription>
          Tailored to your current health status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Context */}
        <div className="flex space-x-4">
          <Badge className={getStatusColor(data.health_context.glucose_status)}>
            Glucose: {data.health_context.glucose_status}
          </Badge>
          <Badge className={getMoodColor(data.health_context.recent_mood)}>
            Mood: {data.health_context.recent_mood}
          </Badge>
        </div>
        
        {/* Focus Message */}
        {data.meal_plan.focus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">{data.meal_plan.focus}</p>
          </div>
        )}
        
        {/* Meal Plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Breakfast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{data.meal_plan.breakfast}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Lunch</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{data.meal_plan.lunch}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Dinner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{data.meal_plan.dinner}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Snacks */}
        {data.meal_plan.snacks && data.meal_plan.snacks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Healthy Snack Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.meal_plan.snacks.map((snack, index) => (
                  <Badge key={index} variant="outline">{snack}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export const GlucoseTrendCard: React.FC<GlucoseTrendProps> = ({ data }) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising':
        return <TrendingUp className="h-6 w-6 text-red-500" />;
      case 'falling':
        return <TrendingDown className="h-6 w-6 text-blue-500" />;
      default:
        return <Minus className="h-6 w-6 text-green-500" />;
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'very_stable':
      case 'stable':
        return 'text-green-600 bg-green-50';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  // Early return if no data
  if (!data.trend_analysis) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Glucose Trend Analysis</CardTitle>
          <CardDescription>No glucose trend data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Glucose Trend Analysis</span>
        </CardTitle>
        <CardDescription>
          Based on {data.trend_analysis.readings_analyzed} recent readings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTrendIcon(data.trend_analysis.direction)}
            <div>
              <p className="font-semibold">Trend: {data.trend_analysis.direction}</p>
              <p className="text-sm text-gray-600">
                Average: {data.trend_analysis.current_avg?.toFixed(1)} mg/dL
              </p>
            </div>
          </div>
          <Badge className={getStabilityColor(data.trend_analysis.stability)}>
            {data.trend_analysis.stability.replace('_', ' ')}
          </Badge>
        </div>
        
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations</p>
            {data.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};