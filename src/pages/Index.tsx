import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import StatCard from "@/components/ui/dashboard/StatCard";
import AirQualityCard from "@/components/ui/dashboard/AirQualityCard";
import ChartContainer from "@/components/ui/dashboard/ChartContainer";
import { dataService2 } from "@/services/dataService2";
import adafruitService from "@/services/adafruitService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Info,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import geocodingService from "@/services/geocodingService";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [gpsData, setGpsData] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isGpsLoading, setIsGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState(false);

  const {
    data: allData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-all"],
    queryFn: dataService2.getAllData,
  });

  // Function to fetch GPS data directly from Adafruit
  const fetchGpsData = async () => {
    try {
      setIsGpsLoading(true);
      setGpsError(false);

      // Get the latest GPS data from the feed
      const gpsDataResponse = await adafruitService.getLatestFeedData(
        "gps-location"
      );
      console.log("Raw GPS data:", gpsDataResponse);

      // Parse the GPS string into coordinates
      const parsedGpsData = adafruitService.parseGpsData(gpsDataResponse.value);
      console.log("Parsed GPS data:", parsedGpsData);

      // Update state with the GPS data
      setGpsData({
        latitude: parsedGpsData.latitude,
        longitude: parsedGpsData.longitude,
        altitude: parsedGpsData.altitude,
        timestamp: new Date(gpsDataResponse.created_at),
        raw: gpsDataResponse.value,
      });

      // Try to get location name using reverse geocoding
      try {
        const name = await geocodingService.reverseGeocode(
          parsedGpsData.latitude,
          parsedGpsData.longitude
        );
        setLocationName(name);
      } catch (geocodeError) {
        console.error("Error in reverse geocoding:", geocodeError);
        // Default name if geocoding fails
        setLocationName("Current Location");
      }

      setIsGpsLoading(false);
    } catch (error) {
      console.error("Error fetching GPS data:", error);
      setIsGpsLoading(false);
      setGpsError(true);

      toast({
        title: "GPS Data Error",
        description: "Couldn't fetch latest GPS data. Using default location.",
        variant: "destructive",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchGpsData();

    // Set up interval to refresh GPS data periodically (every 15 seconds)
    const gpsInterval = setInterval(() => {
      fetchGpsData();
    }, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(gpsInterval);
  }, []);

  // Handle refresh button click
  const handleRefreshData = async () => {
    toast({
      title: "Refreshing Data",
      description: "Please wait while we update all sensor data...",
      variant: "default",
    });

    // Refresh both dashboard data and GPS data
    await Promise.all([refetch(), fetchGpsData()]);

    toast({
      title: "Data Refreshed",
      description: "Dashboard and location data updated successfully",
      variant: "default",
    });
  };

  // Show loading state while data is being fetched
  if (isLoading || !allData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
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
  const { weather, airQuality, soil, system, location } = allData;

  // Create real OpenStreetMap component
  const RealMapComponent = () => {
    // Use real-time GPS coordinates if available, otherwise use default
    const centerLat = gpsData ? gpsData.latitude : -1.9441; // Default if no GPS data
    const centerLng = gpsData ? gpsData.longitude : 30.0619;

    // Calculate map bounds for the iframe URL
    const mapBounds = {
      minLon: centerLng - 0.01,
      minLat: centerLat - 0.01,
      maxLon: centerLng + 0.01,
      maxLat: centerLat + 0.01,
    };

    // Construct the OpenStreetMap iframe URL with marker at the GPS coordinates
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLon}%2C${mapBounds.minLat}%2C${mapBounds.maxLon}%2C${mapBounds.maxLat}&layer=mapnik&marker=${centerLat}%2C${centerLng}`;

    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="relative w-full h-full flex-grow overflow-hidden">
          {isGpsLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Updating location...
                </span>
              </div>
            </div>
          )}

          {gpsError && (
            <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 text-xs p-1 text-center">
              Error loading latest GPS data
            </div>
          )}

          {/* Real map using OpenStreetMap */}
          <iframe
            src={mapUrl}
            title="Live GPS Map"
            className="w-full h-full border-0"
            loading="lazy"
          />

          {/* Map controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-700 font-bold">
              +
            </button>
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-700 font-bold">
              -
            </button>
          </div>

          {/* GPS Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 flex justify-between items-center text-xs text-gray-700">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-blue-500 mr-1" />
              <span>
                {centerLat.toFixed(6)}, {centerLng.toFixed(6)}
              </span>
            </div>
            <div>
              {gpsData ? (
                <>Updated: {gpsData.timestamp.toLocaleTimeString()}</>
              ) : (
                <>Waiting for GPS data...</>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Stratos Dashboard
          </h1>
          <Button onClick={handleRefreshData} className="self-start">
            <RefreshCw className="mr-2 h-4 w-4" />
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
            trend={{ value: 2, direction: "up" }}
          />
          <StatCard
            title="Humidity"
            value={`${weather.current.humidity}%`}
            description="Current humidity level"
            icon={<Droplets size={22} />}
            trend={{ value: 5, direction: "down" }}
          />
          <StatCard
            title="Air Quality"
            value={airQuality.current.aqi}
            description={airQuality.current.status}
            icon={<Wind size={22} />}
            trend={{ value: 3, direction: "up" }}
          />
          <StatCard
            title="Forecast"
            value={weather.forecast[0].condition}
            description={`High: ${weather.forecast[0].high}°C, Low: ${weather.forecast[0].low}°C`}
            icon={<Cloud size={22} />}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Air Quality Card (Left Side) */}
          <AirQualityCard
            index={airQuality.current.aqi}
            indicators={airQuality.indicators.slice(0, 4).map((indicator) => ({
              ...indicator,
              status: indicator.status as "good" | "moderate" | "unhealthy",
            }))}
          />

          {/* Air Quality Trends Chart (Right Side) */}
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

        {/* Real-time Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Live Location Map
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isGpsLoading
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span>{isGpsLoading ? "Updating..." : "Live"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] p-0 overflow-hidden">
              <RealMapComponent />
            </CardContent>
            <div className="px-6 py-2 text-xs text-gray-500 text-center border-t">
              © OpenStreetMap contributors{" "}
              {locationName ? `• ${locationName}` : ""}
            </div>
          </Card>

          {/* Device Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sensor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* GPS Tracker as first item */}
                <div className="p-3 border rounded-lg flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                      isGpsLoading
                        ? "bg-yellow-500"
                        : gpsError
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">GPS Tracker</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {isGpsLoading
                          ? "Updating"
                          : gpsError
                          ? "Error"
                          : "Online"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {gpsData
                          ? `Last: ${gpsData.timestamp.toLocaleTimeString()}`
                          : "No data"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Other devices */}
                {system.devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-3 border rounded-lg flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedSensor(device)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        device.status === "Online"
                          ? "bg-green-500"
                          : device.status === "Warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{device.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            device.status === "Online"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {device.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Battery: {device.battery}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Alerts
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {system.alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-4 flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 mt-1 ${
                      alert.type === "critical"
                        ? "text-red-500"
                        : alert.type === "warning"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  >
                    {alert.type === "critical" ? (
                      <AlertTriangle size={16} />
                    ) : alert.type === "warning" ? (
                      <Info size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
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
