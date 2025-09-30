"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Utensils,
  Brain,
  Target,
  Calendar,
  Clock,
  Loader2
} from "lucide-react";
import { useHealthData } from "@/lib/hooks/useHealthData";
import { useSession } from "@/lib/auth-client";


export default function DashboardPage() {
  const { data: session } = useSession();
  const { healthData, isLoading, error, refetch } = useHealthData(7);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading health data: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!healthData || (!healthData.glucoseReadings.length && !healthData.moodEntries.length && !healthData.mealHistory.length) || (!healthData.glucoseReadings.length && !healthData.moodEntries.length && !healthData.mealHistory.length)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No health data available yet.</p>
          <p className="text-sm text-gray-500">Start logging your glucose readings, mood, and meals to see your dashboard.</p>
        </div>
      </div>
    );
  }

  // Process data for charts
  const glucoseChartData = healthData.glucoseReadings.slice(-48).map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }),
    value: reading.value,
    status: reading.status
  }));

  const moodChartData = healthData.moodEntries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood === 'great' ? 5 : entry.mood === 'good' ? 4 : entry.mood === 'okay' ? 3 : entry.mood === 'poor' ? 2 : 1,
    energy: entry.energy,
    stress: entry.stress
  }));

  const mealTypeData = healthData.mealHistory.reduce((acc, meal) => {
    acc[meal.type] = (acc[meal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(mealTypeData).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Calculate metrics with null checks
  const avgGlucose = healthData.glucoseReadings.length > 0 ? Math.round(
    healthData.glucoseReadings.reduce((sum, reading) => sum + reading.value, 0) / 
    healthData.glucoseReadings.length
  ) : 0;

  const recentGlucose = healthData.glucoseReadings.length > 0 ? healthData.glucoseReadings[healthData.glucoseReadings.length - 1] : null;
  const glucoseStatus = recentGlucose?.status || 'normal';
  const glucoseTrend = healthData.glucoseReadings.length > 1 
    ? healthData.glucoseReadings[healthData.glucoseReadings.length - 1].value - 
      healthData.glucoseReadings[healthData.glucoseReadings.length - 2].value
    : 0;

  const avgMood = healthData.moodEntries.length > 0 ? healthData.moodEntries.reduce((sum, entry) => {
    const moodValue = entry.mood === 'great' ? 5 : entry.mood === 'good' ? 4 : entry.mood === 'okay' ? 3 : entry.mood === 'poor' ? 2 : 1;
    return sum + moodValue;
  }, 0) / healthData.moodEntries.length : 0;

  const todayMeals = healthData.mealHistory.filter(meal => 
    meal.date === new Date().toISOString().split('T')[0]
  );

  const totalCaloriesToday = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Health Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}! Here's your comprehensive health overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1 px-3 py-2">
            <Clock className="h-4 w-4" />
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </Badge>
          <Button onClick={refetch} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Current Glucose</CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {recentGlucose?.value ? `${recentGlucose.value}` : 'No data'}
            </div>
            <p className="text-xs text-blue-700 mb-2">mg/dL</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge 
                variant={glucoseStatus === 'normal' ? 'default' : glucoseStatus === 'high' ? 'destructive' : 'secondary'}
                className="font-semibold"
              >
                {glucoseStatus.toUpperCase()}
              </Badge>
              {recentGlucose && glucoseTrend !== 0 && (
                <div className="flex items-center text-sm">
                  {glucoseTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={glucoseTrend > 0 ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
                    {Math.abs(glucoseTrend).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Average Glucose</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{avgGlucose}</div>
            <p className="text-xs text-purple-700 mb-2">mg/dL</p>
            <Progress value={(avgGlucose / 200) * 100} className="mt-2 h-2" />
            <p className="text-xs text-purple-700 mt-2 font-medium">7-day average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Mood Score</CardTitle>
            <Brain className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{avgMood.toFixed(1)}</div>
            <p className="text-xs text-green-700 mb-2">out of 5.0</p>
            <Progress value={(avgMood / 5) * 100} className="mt-2 h-2" />
            <p className="text-xs text-green-700 mt-2 font-medium">Weekly average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Today's Calories</CardTitle>
            <Utensils className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{totalCaloriesToday}</div>
            <p className="text-xs text-orange-700 mb-2">kcal consumed</p>
            <Progress value={(totalCaloriesToday / 2000) * 100} className="mt-2 h-2" />
            <p className="text-xs text-orange-700 mt-2 font-medium">Target: 2000 kcal</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="glucose" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 shadow-sm">
          <TabsTrigger value="glucose" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            📊 Glucose Trends
          </TabsTrigger>
          <TabsTrigger value="mood" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            😊 Mood & Wellness
          </TabsTrigger>
          <TabsTrigger value="meals" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            🍽️ Meal Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glucose" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-xl text-blue-900">Glucose Levels (Last 48 Hours)</CardTitle>
              <CardDescription className="text-blue-700">
                Continuous glucose monitoring with target range indicators (80-140 mg/dL)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={glucoseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    domain={[60, 200]} 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#dbeafe" 
                    strokeWidth={3}
                  />
                  {/* Target range indicators */}
                  <Line y={80} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                  <Line y={140} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <CardTitle className="text-xl text-green-900">Mood Trends</CardTitle>
                <CardDescription className="text-green-700">Daily mood, energy, and stress levels over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} name="Mood" />
                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={3} name="Energy" />
                    <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} name="Stress" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <CardTitle className="text-xl text-green-900">Recent Mood Entries</CardTitle>
                <CardDescription className="text-green-700">Your latest emotional wellness check-ins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {healthData.moodEntries.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold capitalize text-lg">
                          {entry.mood === 'great' ? '😄' : entry.mood === 'good' ? '🙂' : entry.mood === 'okay' ? '😐' : entry.mood === 'poor' ? '😔' : '😢'} 
                          {' '}{entry.mood}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(entry.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 italic mt-1">"{entry.notes}"</p>
                      )}
                    </div>
                    <div className="text-right text-sm space-y-1 ml-4">
                      <p className="flex items-center justify-end space-x-1">
                        <span className="text-gray-500">Energy:</span>
                        <span className="font-semibold text-orange-600">{entry.energy}/10</span>
                      </p>
                      <p className="flex items-center justify-end space-x-1">
                        <span className="text-gray-500">Stress:</span>
                        <span className="font-semibold text-red-600">{entry.stress}/10</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
                <CardTitle className="text-xl text-orange-900">Meal Distribution</CardTitle>
                <CardDescription className="text-orange-700">Breakdown of meal types over the past week</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
                <CardTitle className="text-xl text-orange-900">Recent Meals</CardTitle>
                <CardDescription className="text-orange-700">Your latest meal entries with nutritional info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {healthData.mealHistory.slice(-5).reverse().map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900">{meal.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-600 capitalize font-medium">{meal.type}</p>
                        <Badge 
                          variant={meal.glycemicImpact === 'low' ? 'default' : meal.glycemicImpact === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {meal.glycemicImpact} GI
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <p className="font-bold text-lg text-orange-600">{meal.calories} kcal</p>
                      <p className="text-sm text-gray-600">{meal.carbs}g carbs</p>
                      <p className="text-xs text-gray-500">{meal.protein}g protein • {meal.fat}g fat</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}