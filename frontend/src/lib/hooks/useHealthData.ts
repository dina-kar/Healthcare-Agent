import { useState, useEffect } from 'react';

export interface GlucoseReading {
  timestamp: string;
  value: number;
  status: 'normal' | 'high' | 'low';
}

export interface MoodEntry {
  date: string;
  mood: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  energy: number; // 1-10
  stress: number; // 1-10
  notes?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemicImpact: 'low' | 'medium' | 'high';
}

export interface HealthMetrics {
  glucoseReadings: GlucoseReading[];
  moodEntries: MoodEntry[];
  mealHistory: MealEntry[];
}

export const useHealthData = (days: number = 7) => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/health/data?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching health data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [days]);

  const refetch = () => {
    fetchHealthData();
  };

  return {
    healthData,
    isLoading,
    error,
    refetch
  };
};

export const useGlucoseData = (limit: number = 50) => {
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlucoseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/health/glucose?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch glucose data');
        }
        
        const data = await response.json();
        setGlucoseReadings(data.map((reading: any) => ({
          timestamp: reading.timestamp,
          value: reading.value,
          status: reading.status
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching glucose data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlucoseData();
  }, [limit]);

  return { glucoseReadings, isLoading, error };
};

export const useMoodData = (limit: number = 30) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/health/mood?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch mood data');
        }
        
        const data = await response.json();
        setMoodEntries(data.map((entry: any) => ({
          date: entry.date.split('T')[0],
          mood: entry.mood,
          energy: entry.energy,
          stress: entry.stress,
          notes: entry.notes
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching mood data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, [limit]);

  return { moodEntries, isLoading, error };
};

export const useMealData = (limit: number = 50) => {
  const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/health/meals?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch meal data');
        }
        
        const data = await response.json();
        setMealHistory(data.map((meal: any) => ({
          id: meal.id,
          date: meal.date.split('T')[0],
          type: meal.type,
          name: meal.name,
          calories: meal.calories,
          carbs: meal.carbs,
          protein: meal.protein,
          fat: meal.fat,
          fiber: meal.fiber,
          glycemicImpact: meal.glycemicImpact
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching meal data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealData();
  }, [limit]);

  return { mealHistory, isLoading, error };
};