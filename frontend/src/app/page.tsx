"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Shield, 
  MessageSquare, 
  BarChart3,
  Calendar,
  Utensils,
  Sparkles
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { UserButton } from "@/components/auth/UserButton";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 sticky top-0 backdrop-blur-sm bg-white/70 z-50 rounded-b-2xl shadow-sm">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HealthCare AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Healthcare Assistant
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Intelligent
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> Health Companion</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Monitor your glucose levels, track meals, analyze health trends, and get personalized insights 
            with our advanced AI-powered healthcare assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={session?.user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
                {session?.user ? "Go to Dashboard" : "Start Your Health Journey"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI with personalized healthcare monitoring
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Activity className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Continuous Glucose Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Real-time glucose level tracking with intelligent alerts and trend analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Utensils className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-xl">Meal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Log your meals effortlessly and understand their impact on your health metrics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Health Trends Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                AI-powered insights to identify patterns and predict health outcomes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-200 hover:-translate-y-1 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">AI Health Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Chat with your personal AI assistant for health advice and support 24/7
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200 hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Comprehensive Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Visualize your health data with beautiful charts and actionable insights
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200 hover:-translate-y-1 bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-red-600" />
              </div>
              <CardTitle className="text-xl">Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your health data is encrypted and secure with enterprise-grade protection
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust HealthCare AI for their wellness journey
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center text-gray-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold text-gray-900">HealthCare AI</span>
          </div>
          <p>&copy; 2024 HealthCare AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}