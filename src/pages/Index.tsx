
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import StatCard from '@/components/ui/dashboard/StatCard';
import WeatherCard from '@/components/ui/dashboard/WeatherCard';
import AirQualityCard from '@/components/ui/dashboard/AirQualityCard';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { dataService } from '@/services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();

  const { data: allData, isLoading } = useQuery({
    queryKey: ['dashboard-all'],
    queryFn: dataService.getAllData,
  });

  const handleRefreshData = () => {
    toast({
      title: "Data Refreshed",
      description: "Farm data has been updated successfully",
      variant: "default",
    });
  };

  if (isLoading || !allData) {
    // Show skeleton loading state
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Extract data
  const { weather, airQuality, soil, crop, system } = allData;

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Farm Dashboard</h1>
          <Button onClick={handleRefreshData} className="self-start">
            Refresh Data
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Temperature" 
            value={`${weather.current.temperature}°C`}
            description="Current farm temperature"
            icon={<Thermometer size={22} />}
            trend={{ value: 2, direction: 'up' }}
          />
          <StatCard 
            title="Humidity" 
            value={`${weather.current.humidity}%`}
            description="Current humidity level"
            icon={<Droplets size={22} />}
            trend={{ value: 5, direction: 'down' }}
          />
          <StatCard 
            title="Air Quality" 
            value={airQuality.current.aqi}
            description={airQuality.current.status}
            icon={<Wind size={22} />}
            trend={{ value: 3, direction: 'up' }}
          />
          <StatCard 
            title="Forecast" 
            value={weather.forecast[0].condition}
            description={`High: ${weather.forecast[0].high}°C, Low: ${weather.forecast[0].low}°C`}
            icon={<Cloud size={22} />}
          />
        </div>

        {/* Weather and Air Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherCard 
            temperature={weather.current.temperature}
            condition={weather.current.condition}
            location={weather.current.location}
            updatedAt={weather.current.updatedAt}
            icon={<Cloud size={36} />}
            extraInfo={[
              { label: 'Humidity', value: `${weather.current.humidity}%`, icon: <Droplets size={14} /> },
              { label: 'Wind', value: `${weather.current.windSpeed} km/h`, icon: <Wind size={14} /> },
              { label: 'Feels Like', value: `${weather.current.feelsLike}°C`, icon: <Thermometer size={14} /> },
              { label: 'Precipitation', value: `${weather.current.precipitation}%`, icon: <Cloud size={14} /> },
            ]}
          />
          
          <AirQualityCard 
            index={airQuality.current.aqi}
            indicators={airQuality.indicators.slice(0, 4)}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer 
            title="Temperature Trend" 
            description="24-hour temperature history"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weather.historical.temperature}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Temperature (°C)"
                  stroke="#3183f5" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <ChartContainer 
            title="Air Quality Trends" 
            description="Weekly air quality index"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={airQuality.historical.aqi}>
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
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Alerts</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {system.alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-4 flex items-start gap-3">
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full mt-1 ${
                    alert.type === 'critical' ? 'bg-red-500' : 
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
