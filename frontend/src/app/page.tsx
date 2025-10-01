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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6 sticky top-0 backdrop-blur-md bg-card/80 z-50 border-b border-border shadow-sm">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-destructive animate-pulse" />
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary absolute -top-1 -right-1" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              HealthCare AI
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-xs sm:text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 sm:mb-6 bg-primary text-primary-foreground border-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Healthcare Assistant
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Your Intelligent
            <span className="text-primary"> Health Companion</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Monitor your glucose levels, track meals, analyze health trends, and get personalized insights 
            with our advanced AI-powered healthcare assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href={session?.user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-7 text-base sm:text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all">
                {session?.user ? "Go to Dashboard" : "Start Your Health Journey"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Our comprehensive platform combines cutting-edge AI with personalized healthcare monitoring
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Continuous Glucose Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Real-time glucose level tracking with intelligent alerts and trend analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4 group-hover:bg-chart-2/20 transition-colors">
                <Utensils className="h-7 w-7 text-chart-2" />
              </div>
              <CardTitle className="text-xl">Meal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Log your meals effortlessly and understand their impact on your health metrics
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-chart-3/10 flex items-center justify-center mb-4 group-hover:bg-chart-3/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-chart-3" />
              </div>
              <CardTitle className="text-xl">Health Trends Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                AI-powered insights to identify patterns and predict health outcomes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">AI Health Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Chat with your personal AI assistant for health advice and support 24/7
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-chart-4/10 flex items-center justify-center mb-4 group-hover:bg-chart-4/20 transition-colors">
                <BarChart3 className="h-7 w-7 text-chart-4" />
              </div>
              <CardTitle className="text-xl">Comprehensive Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Visualize your health data with beautiful charts and actionable insights
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:-translate-y-1 bg-card group">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <Shield className="h-7 w-7 text-destructive" />
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
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <Card className="bg-primary text-primary-foreground border-0 shadow-2xl">
          <CardContent className="p-8 sm:p-10 md:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
              Join thousands of users who trust HealthCare AI for their wellness journey
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg shadow-lg">
                Get Started Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-destructive" />
            <span className="text-xl font-bold text-foreground">HealthCare AI</span>
          </div>
          <p>&copy; 2025 HealthCare AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}