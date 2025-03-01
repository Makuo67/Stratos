
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import Layout from '@/components/Layout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AirQualityCard from '@/components/ui/dashboard/AirQualityCard';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AirQuality = () => {
  const { data: airQualityData, isLoading: isLoadingAirQuality } = useQuery({
    queryKey: ['air-quality'],
    queryFn: dataService.getAirQualityData,
  });

  if (isLoadingAirQuality || !airQualityData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Convert indicators to the expected format
  const formattedIndicators = airQualityData.indicators.map(indicator => ({
    ...indicator,
    status: indicator.status as "good" | "moderate" | "unhealthy"
  }));

  // Helper function to get status from AQI value
  const getAqiStatus = (aqi: number): "good" | "moderate" | "unhealthy" => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    return "unhealthy";
  };

  // Create pollutants data from the indicators for the chart
  const pollutantsData = airQualityData.indicators.map(item => ({
    name: item.name,
    value: item.value,
    limit: item.max,
  }));

  // Create indices data (using a subset of indicators or derived from AQI)
  const indicesData = [
    { name: 'Air Quality Index', value: airQualityData.current.aqi, status: getAqiStatus(airQualityData.current.aqi) },
    { name: 'Pollution Level', value: Math.round(airQualityData.current.aqi * 0.8), status: getAqiStatus(Math.round(airQualityData.current.aqi * 0.8)) },
    { name: 'Health Risk', value: Math.round(airQualityData.current.aqi * 1.2), status: getAqiStatus(Math.round(airQualityData.current.aqi * 1.2)) }
  ];

  // Create recommendations based on AQI
  const recommendationsData = [
    { 
      category: 'General', 
      advice: airQualityData.current.aqi <= 50 
        ? 'Air quality is good. Perfect for outdoor activities.' 
        : airQualityData.current.aqi <= 100 
          ? 'Air quality is moderate. Consider reducing prolonged outdoor exertion if sensitive.' 
          : 'Air quality is unhealthy. Reduce prolonged outdoor activities.'
    },
    {
      category: 'Sensitive Groups',
      advice: airQualityData.current.aqi <= 50
        ? 'No special precautions needed.'
        : airQualityData.current.aqi <= 100
          ? 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
          : 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Air Quality Monitoring</h1>
        
        {/* Main AQI Card */}
        <AirQualityCard 
          index={airQualityData.current.aqi}
          indicators={formattedIndicators}
        />
        
        {/* AQI History Chart */}
        <ChartContainer 
          title="Air Quality Index History" 
          description="7-day trend of air quality measurements"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={airQualityData.historical.aqi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="AQI"
                stroke="#F59E0B" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Pollutants Chart */}
        <ChartContainer 
          title="Air Pollutant Levels" 
          description="Current pollutant concentrations vs. safety limits"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pollutantsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Current Level" fill="#3B82F6" />
              <Bar dataKey="limit" name="Safety Limit" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="h-5 w-5 mr-2" />
                Air Quality Indices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicesData.map((index, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{index.name}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        index.status === "good" ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        index.status === "moderate" ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {index.value} - {index.status}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          index.status === "good" ? 'bg-green-500' :
                          index.status === "moderate" ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${Math.min(100, (index.value / 300) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Health Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendationsData.map((rec, i) => (
                  <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">{rec.category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.advice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AirQuality;
