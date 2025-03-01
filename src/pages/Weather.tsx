// src/pages/Weather.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import WeatherCard from "@/components/ui/dashboard/WeatherCard";
import ChartContainer from "@/components/ui/dashboard/ChartContainer";
import Calendar from "@/components/ui/dashboard/Calendar";
import {
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  Sun,
  CloudSun,
  CloudFog,
  Search,
  MapPin,
  RefreshCw,
  Sunrise,
  Sunset,
} from "lucide-react";
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
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import weatherService, { WeatherData } from "../services/weatherService";
import { dataService2 } from "@/services/dataService2";

const Weather = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [coordinates, setCoordinates] = useState({
    lat: 40.7128, // Default to New York
    lon: -74.006,
    locationName: "New York, US",
  });

  // Use react-query to manage API data fetching, caching, and loading states
  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    isError: isWeatherError,
    refetch: refetchWeather,
  } = useQuery({
    queryKey: ["weather", coordinates.lat, coordinates.lon, refreshTrigger],
    queryFn: () =>
      weatherService.getWeatherData(
        coordinates.lat,
        coordinates.lon,
        coordinates.locationName
      ),
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Still use the mock calendar data
  const { data: calendarData, isLoading: isLoadingCalendar } = useQuery({
    queryKey: ["calendar"],
    queryFn: dataService2.getCalendarData,
  });

  // Try to get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({
            lat: latitude,
            lon: longitude,
            locationName: "Current Location", // Will be updated in the API response
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast({
            title: "Location Access Denied",
            description:
              "Using default location. You can search for a specific city.",
            variant: "default",
          });
        }
      );
    }
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    refetchWeather();
    toast({
      title: "Refreshing Weather Data",
      description: "Fetching the latest weather information...",
    });
  };

  // Simple geocoding function - in a real app this would use a geocoding API
  // For demo purposes, we'll just search major cities
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate geocoding search
    // In a real app, you would use a proper geocoding API like OpenWeatherMap's Geocoding API
    let foundLocation = null;

    // Pre-defined set of locations for demo - in real app would come from API
    const cities = [
      { name: "London, GB", lat: 51.5074, lon: -0.1278 },
      { name: "New York, US", lat: 40.7128, lon: -74.006 },
      { name: "Tokyo, JP", lat: 35.6762, lon: 139.6503 },
      { name: "Paris, FR", lat: 48.8566, lon: 2.3522 },
      { name: "Sydney, AU", lat: -33.8688, lon: 151.2093 },
      { name: "Berlin, DE", lat: 52.52, lon: 13.405 },
    ];

    // Simple case-insensitive search
    const searchLower = searchQuery.toLowerCase();
    foundLocation = cities.find((city) =>
      city.name.toLowerCase().includes(searchLower)
    );

    if (foundLocation) {
      setCoordinates({
        lat: foundLocation.lat,
        lon: foundLocation.lon,
        locationName: foundLocation.name,
      });

      toast({
        title: "Location Updated",
        description: `Showing weather for ${foundLocation.name}`,
      });
    } else {
      // For demo purposes, just set the name but use random coordinates
      // In a real app, you would show an error or suggest locations
      setCoordinates({
        lat: 35 + (Math.random() * 20 - 10),
        lon: -100 + Math.random() * 50,
        locationName: searchQuery,
      });

      toast({
        title: "Location Updated",
        description: `Showing weather for ${searchQuery}`,
      });
    }

    setSearchQuery("");
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain")) return <CloudRain size={36} />;
    if (conditionLower.includes("snow")) return <CloudRain size={36} />;
    if (conditionLower.includes("thunder")) return <CloudRain size={36} />;
    if (conditionLower.includes("cloud") && conditionLower.includes("sun"))
      return <CloudSun size={36} />;
    if (conditionLower.includes("cloud") || conditionLower.includes("overcast"))
      return <Cloud size={36} />;
    if (conditionLower.includes("fog") || conditionLower.includes("mist"))
      return <CloudFog size={36} />;
    if (conditionLower.includes("clear")) return <Sun size={36} />;
    return <Sun size={36} />;
  };

  if (isLoadingWeather || !weatherData || isLoadingCalendar || !calendarData) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Weather
          </h1>
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isWeatherError) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Weather
          </h1>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-red-600">
                Error Loading Weather Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                There was a problem fetching weather information. This could be
                due to:
              </p>
              <ul className="list-disc pl-5 mb-6">
                <li>Invalid API key</li>
                <li>Network connection issues</li>
                <li>API service unavailability</li>
              </ul>
              <Button onClick={handleRefresh}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Weather
          </h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-sm items-center gap-2"
            >
              <Input
                placeholder="Search location... (e.g., London)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoadingWeather}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isLoadingWeather ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Location Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4" />
          <span>{weatherData.current.location}</span>
          <span className="text-xs opacity-70">
            (Last updated: {weatherData.current.updatedAt.toLocaleTimeString()})
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Current Weather
                      </h2>
                    </div>
                    <div className="text-stratos-500 dark:text-stratos-400">
                      {getWeatherIcon(weatherData.current.condition)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
                    <div>
                      <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {weatherData.current.temperature}°C
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        {weatherData.current.condition}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Feels like {weatherData.current.feelsLike}°C
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                        <Droplets className="h-4 w-4 mr-1" />
                        <span className="text-xs">Humidity</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {weatherData.current.humidity}%
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                        <Wind className="h-4 w-4 mr-1" />
                        <span className="text-xs">Wind</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {weatherData.current.windSpeed} km/h{" "}
                        {weatherData.current.windDirection}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                        <Umbrella className="h-4 w-4 mr-1" />
                        <span className="text-xs">Precipitation</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {weatherData.current.precipitation}%
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                        <Sun className="h-4 w-4 mr-1" />
                        <span className="text-xs">UV Index</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {weatherData.current.uv} of 10
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weather Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Pressure
                      </span>
                      <span className="font-medium">
                        {weatherData.current.pressure} hPa
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Visibility
                      </span>
                      <span className="font-medium">
                        {weatherData.current.visibility} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Sunrise className="h-4 w-4 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Sunrise
                        </span>
                      </div>
                      <span className="font-medium">06:32 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Sunset className="h-4 w-4 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Sunset
                        </span>
                      </div>
                      <span className="font-medium">06:12 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <WeatherCard
              temperature={weatherData.current.temperature}
              condition={weatherData.current.condition}
              location={weatherData.current.location}
              updatedAt={weatherData.current.updatedAt}
              icon={getWeatherIcon(weatherData.current.condition)}
              extraInfo={[
                {
                  label: "Humidity",
                  value: `${weatherData.current.humidity}%`,
                  icon: <Droplets size={14} />,
                },
                {
                  label: "Wind",
                  value: `${weatherData.current.windSpeed} km/h ${weatherData.current.windDirection}`,
                  icon: <Wind size={14} />,
                },
                {
                  label: "Feels Like",
                  value: `${weatherData.current.feelsLike}°C`,
                  icon: <Thermometer size={14} />,
                },
                {
                  label: "Pressure",
                  value: `${weatherData.current.pressure} hPa`,
                },
                {
                  label: "Visibility",
                  value: `${weatherData.current.visibility} km`,
                },
                { label: "UV Index", value: weatherData.current.uv },
                {
                  label: "Precipitation",
                  value: `${weatherData.current.precipitation}%`,
                  icon: <Umbrella size={14} />,
                },
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
                    name="Precipitation (%)"
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {day.high}°
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {day.low}°
                        </span>
                      </div>
                      <div className="w-full mt-2 flex items-center text-xs">
                        <Umbrella className="h-4 w-4 mr-1 text-gray-500" />
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
                  <Bar
                    dataKey="precipitation"
                    name="Precipitation (%)"
                    fill="#10B981"
                  />
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
                onPrevMonth={() => console.log("Previous month")}
                onNextMonth={() => console.log("Next month")}
                onSelectDate={(date) => console.log("Selected date:", date)}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Weather History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select a date on the calendar to view historical weather
                    data.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Average Temperature:
                      </span>
                      <span className="text-sm">22°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Precipitation:
                      </span>
                      <span className="text-sm">5.2mm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Max Wind Speed:
                      </span>
                      <span className="text-sm">12 km/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Average Humidity:
                      </span>
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Temperature History</CardTitle>
                <CardDescription>24-hour temperature data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weatherData.historical.temperature}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
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
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Weather;
