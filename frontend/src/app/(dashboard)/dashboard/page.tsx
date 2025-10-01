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
          <p className="text-gray-600">Loading ...</p>
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
    <div className="space-y-6 lg:space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome back, {session?.user?.name}! Here's your comprehensive health overview</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Updated: {new Date().toLocaleTimeString()}</span>
            <span className="sm:hidden">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </Badge>
          <Button onClick={refetch} variant="outline" size="sm" className="text-xs sm:text-sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Current Glucose</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {recentGlucose?.value ? `${recentGlucose.value}` : 'No data'}
            </div>
            <p className="text-xs text-muted-foreground mb-2">mg/dL</p>
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
                    <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-chart-2 mr-1" />
                  )}
                  <span className={glucoseTrend > 0 ? "text-destructive font-semibold" : "text-chart-2 font-semibold"}>
                    {Math.abs(glucoseTrend).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Average Glucose</CardTitle>
            <Target className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgGlucose}</div>
            <p className="text-xs text-muted-foreground mb-2">mg/dL</p>
            <Progress value={(avgGlucose / 200) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2 font-medium">7-day average</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Mood Score</CardTitle>
            <Brain className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgMood.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mb-2">out of 5.0</p>
            <Progress value={(avgMood / 5) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2 font-medium">Weekly average</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Today's Calories</CardTitle>
            <Utensils className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalCaloriesToday}</div>
            <p className="text-xs text-muted-foreground mb-2">kcal consumed</p>
            <Progress value={(totalCaloriesToday / 2000) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2 font-medium">Target: 2000 kcal</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="glucose" className="space-y-6">
        <TabsList className="bg-card border border-border shadow-sm">
          <TabsTrigger value="glucose" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            📊 Glucose Trends
          </TabsTrigger>
          <TabsTrigger value="mood" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            😊 Mood & Wellness
          </TabsTrigger>
          <TabsTrigger value="meals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🍽️ Meal Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glucose" className="space-y-4">
          <Card className="shadow-xl border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl text-foreground">Glucose Levels (Last 48 Hours)</CardTitle>
              <CardDescription className="text-muted-foreground">
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
            <Card className="shadow-xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl text-foreground">Mood Trends</CardTitle>
                <CardDescription className="text-muted-foreground">Daily mood, energy, and stress levels over time</CardDescription>
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

            <Card className="shadow-xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl text-foreground">Recent Mood Entries</CardTitle>
                <CardDescription className="text-muted-foreground">Your latest emotional wellness check-ins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {healthData.moodEntries.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold capitalize text-lg text-foreground">
                          {entry.mood === 'great' ? '😄' : entry.mood === 'good' ? '🙂' : entry.mood === 'okay' ? '😐' : entry.mood === 'poor' ? '😔' : '😢'} 
                          {' '}{entry.mood}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(entry.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground italic mt-1">"{entry.notes}"</p>
                      )}
                    </div>
                    <div className="text-right text-sm space-y-1 ml-4">
                      <p className="flex items-center justify-end space-x-1">
                        <span className="text-muted-foreground">Energy:</span>
                        <span className="font-semibold text-chart-4">{entry.energy}/10</span>
                      </p>
                      <p className="flex items-center justify-end space-x-1">
                        <span className="text-muted-foreground">Stress:</span>
                        <span className="font-semibold text-destructive">{entry.stress}/10</span>
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
            <Card className="shadow-xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl text-foreground">Meal Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">Breakdown of meal types over the past week</CardDescription>
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

            <Card className="shadow-xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl text-foreground">Recent Meals</CardTitle>
                <CardDescription className="text-muted-foreground">Your latest meal entries with nutritional info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {healthData.mealHistory.slice(-5).reverse().map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-foreground">{meal.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-muted-foreground capitalize font-medium">{meal.type}</p>
                        <Badge 
                          variant={meal.glycemicImpact === 'low' ? 'default' : meal.glycemicImpact === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {meal.glycemicImpact} GI
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <p className="font-bold text-lg text-primary">{meal.calories} kcal</p>
                      <p className="text-sm text-muted-foreground">{meal.carbs}g carbs</p>
                      <p className="text-xs text-muted-foreground">{meal.protein}g protein • {meal.fat}g fat</p>
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