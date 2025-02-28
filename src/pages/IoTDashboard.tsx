import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Map,
  Sliders,
  Activity,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService2 } from "@/services/dataService2";
import geocodingService from "@/services/geocodingService";

// Default location coordinates for African Leadership University
const DEFAULT_LOCATION = {
  lat: -1.9441,
  lng: 30.0619,
  name: "African Leadership University",
};

const IoTDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timeRange, setTimeRange] = useState([7]); // 7 days by default
  const [thresholdValue, setThresholdValue] = useState([800]); // Default CO2 threshold
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION.name);

  // Fetch real data from Adafruit and OpenWeatherMap using dataService2
  const fetchData = async () => {
    try {
      // Try to get sensor data first
      let sensorData;
      try {
        sensorData = await dataService2.getSensorData();
        console.log("Retrieved sensor data:", sensorData);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        sensorData = null;
        toast({
          title: "Sensor Connection Error",
          description:
            "Could not connect to IoT sensors. Using default location.",
          variant: "destructive",
        });
      }

      // If we have sensor data with valid GPS coordinates
      if (
        sensorData &&
        sensorData.gpsLocation &&
        Math.abs(sensorData.gpsLocation.latitude) > 0.001 &&
        Math.abs(sensorData.gpsLocation.longitude) > 0.001
      ) {
        console.log(
          "Using GPS coordinates from sensor:",
          sensorData.gpsLocation
        );

        // Try to get location name using reverse geocoding
        try {
          const locationString = await geocodingService.reverseGeocode(
            sensorData.gpsLocation.latitude,
            sensorData.gpsLocation.longitude
          );
          setLocationName(locationString);
          console.log("Location name from geocoding:", locationString);
        } catch (error) {
          console.error("Error in reverse geocoding:", error);
          setLocationName("Sensor Location");
        }

        return {
          sensorData: {
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            co2: sensorData.co2,
            co: sensorData.co,
            nh3: sensorData.nh3,
            timestamp: sensorData.timestamp,
          },
          location: {
            lat: sensorData.gpsLocation.latitude,
            lng: sensorData.gpsLocation.longitude,
            name: locationName,
          },
          error: null,
        };
      }

      // If no sensor data is available or GPS coordinates are invalid, return null for sensorData and use default location
      return {
        sensorData: sensorData
          ? {
              temperature: sensorData.temperature,
              humidity: sensorData.humidity,
              co2: sensorData.co2,
              co: sensorData.co,
              nh3: sensorData.nh3,
              timestamp: sensorData.timestamp,
            }
          : null,
        location: DEFAULT_LOCATION,
        error: sensorData
          ? "Invalid GPS data from sensor"
          : "No sensor data available from Adafruit",
      };
    } catch (error) {
      console.error("Error in fetchData:", error);
      // Return default in case of any error
      return {
        sensorData: null,
        location: DEFAULT_LOCATION,
        error: "Error fetching sensor data",
      };
    }
  };

  // Query for all dashboard data
  const {
    data: sensorInfo,
    isLoading,
    refetch,
    error: fetchError,
  } = useQuery({
    queryKey: ["sensor-data"],
    queryFn: fetchData,
    refetchInterval: 60000, // Refetch every minute
  });

  // Since we won't have actual historical data, we'll create empty datasets
  const emptyHistoricalData = (days) => {
    return Array(days[0])
      .fill(0)
      .map((_, i) => ({
        day: new Date(
          Date.now() - (days[0] - 1 - i) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", { weekday: "short" }),
        value: 0,
      }));
  };

  // Fetch historical data
  const { data: historicalData } = useQuery({
    queryKey: ["environmental-history", timeRange[0]],
    queryFn: () => dataService2.getEnvironmentalHistory(timeRange[0]),
    enabled: !!sensorInfo,
  });

  // Use real data or empty data if not available
  const temperatureHistory =
    historicalData?.temperature?.map((item) => ({
      day: item.date || item.time,
      value: item.value,
    })) || emptyHistoricalData(timeRange);

  const humidityHistory =
    historicalData?.humidity?.map((item) => ({
      day: item.date || item.time,
      value: item.value,
    })) || emptyHistoricalData(timeRange);

  const co2History =
    historicalData?.co2?.map((item) => ({
      day: item.time,
      value: item.value,
    })) || emptyHistoricalData(timeRange);

  // Handle refresh button click
  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Fetching the latest IoT sensor readings",
    });
    refetch();
  };

  // Check if we have sensor data
  const hasSensorData = !!sensorInfo?.sensorData;

  // Create status badges based on thresholds
  const getStatusBadge = (value, thresholds) => {
    if (value === undefined || value === null) {
      return <Badge variant="outline">No data</Badge>;
    }

    if (value <= thresholds.low)
      return <Badge className="bg-green-500">Good</Badge>;
    if (value <= thresholds.medium)
      return <Badge className="bg-yellow-500">Moderate</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            IoT Sensor Dashboard
          </h1>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="self-start"
          >
            Refresh Data
          </Button>
        </div>

        {fetchError && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-400">
                    Connection Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Could not connect to IoT sensors. Using cached or fallback
                    data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Temperature Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Thermometer className="mr-2 h-5 w-5" />
                      Temperature
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSensorData ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {sensorInfo.sensorData.temperature}°C
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Last updated:{" "}
                            {sensorInfo.sensorData.timestamp.toLocaleTimeString()}
                          </span>
                          {getStatusBadge(sensorInfo.sensorData.temperature, {
                            low: 20,
                            medium: 30,
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                        <span className="text-lg mb-2">
                          No temperature data available
                        </span>
                        <Badge variant="outline">Sensor offline</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Humidity Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Droplets className="mr-2 h-5 w-5" />
                      Humidity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSensorData ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {sensorInfo.sensorData.humidity}%
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Last updated:{" "}
                            {sensorInfo.sensorData.timestamp.toLocaleTimeString()}
                          </span>
                          {getStatusBadge(sensorInfo.sensorData.humidity, {
                            low: 30,
                            medium: 60,
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                        <span className="text-lg mb-2">
                          No humidity data available
                        </span>
                        <Badge variant="outline">Sensor offline</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CO2 Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Activity className="mr-2 h-5 w-5" />
                      CO₂ Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSensorData ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {sensorInfo.sensorData.co2} ppm
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Last updated:{" "}
                            {sensorInfo.sensorData.timestamp.toLocaleTimeString()}
                          </span>
                          {getStatusBadge(sensorInfo.sensorData.co2, {
                            low: 600,
                            medium: 1000,
                          })}
                        </div>
                        {sensorInfo.sensorData.co2 > thresholdValue[0] && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-sm rounded-md">
                            Warning: CO₂ level above threshold (
                            {thresholdValue[0]} ppm)
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                        <span className="text-lg mb-2">
                          No CO₂ data available
                        </span>
                        <Badge variant="outline">Sensor offline</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CO Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Wind className="mr-2 h-5 w-5" />
                      CO Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSensorData ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {sensorInfo.sensorData.co} ppm
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Last updated:{" "}
                            {sensorInfo.sensorData.timestamp.toLocaleTimeString()}
                          </span>
                          {getStatusBadge(sensorInfo.sensorData.co, {
                            low: 2,
                            medium: 5,
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                        <span className="text-lg mb-2">
                          No CO data available
                        </span>
                        <Badge variant="outline">Sensor offline</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* NH3 Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <CloudRain className="mr-2 h-5 w-5" />
                      NH₃ Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSensorData ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {sensorInfo.sensorData.nh3} ppm
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Last updated:{" "}
                            {sensorInfo.sensorData.timestamp.toLocaleTimeString()}
                          </span>
                          {getStatusBadge(sensorInfo.sensorData.nh3, {
                            low: 10,
                            medium: 20,
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                        <span className="text-lg mb-2">
                          No NH₃ data available
                        </span>
                        <Badge variant="outline">Sensor offline</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sensor Location Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="mr-2 h-5 w-5" />
                      Sensor Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-medium">
                        {sensorInfo?.location?.name || "Unknown Location"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Coordinates:{" "}
                        {sensorInfo?.location?.lat?.toFixed(6) || "N/A"},{" "}
                        {sensorInfo?.location?.lng?.toFixed(6) || "N/A"}
                      </div>
                      {sensorInfo?.error && (
                        <div className="text-amber-600 text-sm italic mt-1">
                          {sensorInfo.error === "Invalid GPS data from sensor"
                            ? "Using default location - invalid GPS data from sensor"
                            : "Using default location - no GPS data available"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Controls Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Sliders className="mr-2 h-5 w-5" />
                  Sensor Settings
                </CardTitle>
                <CardDescription>
                  Adjust time range and CO₂ threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm">
                      Historical Data Time Range
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {timeRange[0]} days
                    </span>
                  </div>
                  <Slider
                    defaultValue={[7]}
                    max={30}
                    min={1}
                    step={1}
                    value={timeRange}
                    onValueChange={setTimeRange}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust to show between 1 and 30 days of historical data
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm">CO₂ Alert Threshold</h3>
                    <span className="text-sm text-muted-foreground">
                      {thresholdValue[0]} ppm
                    </span>
                  </div>
                  <Slider
                    defaultValue={[800]}
                    max={1500}
                    min={400}
                    step={50}
                    value={thresholdValue}
                    onValueChange={setThresholdValue}
                    className="py-4"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Normal (400-800)</span>
                    <span>Warning (800-1200)</span>
                    <span>Danger (1200+)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Map className="mr-2 h-5 w-5" />
                  Map Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="mt-2 h-40 relative">
                    {/* OpenStreetMap iframe for smaller preview */}
                    <iframe
                      title="Location Map Preview"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        (sensorInfo?.location?.lng || DEFAULT_LOCATION.lng) -
                        0.005
                      },${
                        (sensorInfo?.location?.lat || DEFAULT_LOCATION.lat) -
                        0.005
                      },${
                        (sensorInfo?.location?.lng || DEFAULT_LOCATION.lng) +
                        0.005
                      },${
                        (sensorInfo?.location?.lat || DEFAULT_LOCATION.lat) +
                        0.005
                      }&layer=mapnik&marker=${
                        sensorInfo?.location?.lat || DEFAULT_LOCATION.lat
                      },${sensorInfo?.location?.lng || DEFAULT_LOCATION.lng}`}
                      allowFullScreen
                    ></iframe>
                    <small className="absolute bottom-0 right-0 bg-white bg-opacity-70 px-1 text-xs">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${
                          sensorInfo?.location?.lat || DEFAULT_LOCATION.lat
                        }&mlon=${
                          sensorInfo?.location?.lng || DEFAULT_LOCATION.lng
                        }`}
                        target="_blank"
                        rel="noopener"
                      >
                        View larger map
                      </a>
                    </small>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature History ({timeRange[0]} days)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temperatureHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Temperature (°C)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Humidity History ({timeRange[0]} days)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={humidityHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Humidity (%)"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  CO₂ Level History with Threshold ({timeRange[0]} days)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={co2History}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="CO₂ (ppm)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    {/* Threshold reference line */}
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      name="Threshold"
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      dot={false}
                      data={co2History.map((item) => ({
                        ...item,
                        threshold: thresholdValue[0],
                      }))}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>IoT Sensor Location</CardTitle>
                <CardDescription>
                  {hasSensorData && !sensorInfo?.error
                    ? "Current GPS coordinates from sensor"
                    : "Default location shown - sensor GPS data unavailable"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] p-0 relative">
                {/* OpenStreetMap iframe - no API key required */}
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    (sensorInfo?.location?.lng || DEFAULT_LOCATION.lng) - 0.01
                  },${
                    (sensorInfo?.location?.lat || DEFAULT_LOCATION.lat) - 0.01
                  },${
                    (sensorInfo?.location?.lng || DEFAULT_LOCATION.lng) + 0.01
                  },${
                    (sensorInfo?.location?.lat || DEFAULT_LOCATION.lat) + 0.01
                  }&layer=mapnik&marker=${
                    sensorInfo?.location?.lat || DEFAULT_LOCATION.lat
                  },${sensorInfo?.location?.lng || DEFAULT_LOCATION.lng}`}
                  allowFullScreen
                ></iframe>
                <small className="absolute bottom-0 right-0 bg-white bg-opacity-70 px-1">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${
                      sensorInfo?.location?.lat || DEFAULT_LOCATION.lat
                    }&mlon=${
                      sensorInfo?.location?.lng || DEFAULT_LOCATION.lng
                    }`}
                    target="_blank"
                    rel="noopener"
                  >
                    View larger map
                  </a>
                </small>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Location Name:</span>
                    <span className="text-sm">
                      {sensorInfo?.location?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Latitude:</span>
                    <span className="text-sm">
                      {sensorInfo?.location?.lat?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Longitude:</span>
                    <span className="text-sm">
                      {sensorInfo?.location?.lng?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm">
                      {hasSensorData
                        ? sensorInfo.sensorData.timestamp.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  {sensorInfo?.error && (
                    <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-md">
                      <p className="text-amber-800 dark:text-amber-400 text-sm">
                        <AlertTriangle className="inline-block h-4 w-4 mr-2" />
                        {sensorInfo.error === "Invalid GPS data from sensor"
                          ? "Using default location - received invalid GPS coordinates from sensor"
                          : "Using default location - no GPS data available from sensor"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IoTDashboard;
