
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import WeatherCard from '@/components/ui/dashboard/WeatherCard';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import Calendar from '@/components/ui/dashboard/Calendar';
import { dataService } from '@/services/dataService';
import { 
  Cloud, 
  CloudRain, 
  Droplets, 
  Wind, 
  Thermometer, 
  Umbrella,
  Sun,
  CloudSun,
  CloudFog
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Weather = () => {
  const [activeTab, setActiveTab] = useState('current');

  const { data: weatherData, isLoading: isLoadingWeather } = useQuery({
    queryKey: ['weather'],
    queryFn: dataService.getWeatherData,
  });

  const { data: calendarData, isLoading: isLoadingCalendar } = useQuery({
    queryKey: ['calendar'],
    queryFn: dataService.getCalendarData,
  });

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain')) return <CloudRain size={36} />;
    if (conditionLower.includes('cloud') && conditionLower.includes('sun')) return <CloudSun size={36} />;
    if (conditionLower.includes('cloud')) return <Cloud size={36} />;
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return <CloudFog size={36} />;
    return <Sun size={36} />;
  };

  if (isLoadingWeather || !weatherData || isLoadingCalendar || !calendarData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Weather</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-6 mt-6">
            <WeatherCard 
              temperature={weatherData.current.temperature}
              condition={weatherData.current.condition}
              location={weatherData.current.location}
              updatedAt={weatherData.current.updatedAt}
              icon={getWeatherIcon(weatherData.current.condition)}
              extraInfo={[
                { label: 'Humidity', value: `${weatherData.current.humidity}%`, icon: <Droplets size={14} /> },
                { label: 'Wind', value: `${weatherData.current.windSpeed} km/h`, icon: <Wind size={14} /> },
                { label: 'Feels Like', value: `${weatherData.current.feelsLike}°C`, icon: <Thermometer size={14} /> },
                { label: 'Pressure', value: `${weatherData.current.pressure} hPa` },
                { label: 'Visibility', value: `${weatherData.current.visibility} km` },
                { label: 'UV Index', value: weatherData.current.uv },
                { label: 'Precipitation', value: `${weatherData.current.precipitation}%`, icon: <Umbrella size={14} /> },
              ]}
              className="mb-6"
            />
            
            <ChartContainer 
              title="Temperature & Precipitation (24h)" 
              description="Today's weather patterns"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={weatherData.historical.temperature}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    name="Temperature (°C)" 
                    stroke="#3183f5" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="value" 
                    name="Precipitation (mm)" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 6 }} 
                    data={weatherData.historical.precipitation}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{day.day}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center">
                      <div className="text-stratos-500 dark:text-stratos-400 mb-2">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <p className="text-sm font-medium">{day.condition}</p>
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{day.high}°</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{day.low}°</span>
                      </div>
                      <div className="w-full mt-2 flex items-center text-xs">
                        <Umbrella size={14} className="mr-1 text-gray-500" />
                        <span>{day.precipitation}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <ChartContainer 
              title="5-Day Temperature Forecast" 
              description="Temperature range predictions"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={weatherData.forecast}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="high" name="High (°C)" fill="#3183f5" />
                  <Bar dataKey="low" name="Low (°C)" fill="#93c5fd" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer 
              title="Precipitation Forecast" 
              description="Expected rainfall"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={weatherData.forecast}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="precipitation" name="Precipitation (%)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Calendar 
                month={calendarData.month}
                year={calendarData.year}
                days={calendarData.days}
                onPrevMonth={() => console.log('Previous month')}
                onNextMonth={() => console.log('Next month')}
                onSelectDate={(date) => console.log('Selected date:', date)}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Weather History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select a date on the calendar to view historical weather data.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Temperature:</span>
                      <span className="text-sm">22°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Precipitation:</span>
                      <span className="text-sm">5.2mm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Max Wind Speed:</span>
                      <span className="text-sm">12 km/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Humidity:</span>
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Weather;
