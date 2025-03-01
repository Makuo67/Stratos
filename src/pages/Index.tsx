import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import StatCard from "@/components/ui/dashboard/StatCard";
import AirQualityCard from "@/components/ui/dashboard/AirQualityCard";
import ChartContainer from "@/components/ui/dashboard/ChartContainer";
import { dataService2 } from "@/services/dataService2";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedSensor, setSelectedSensor] = useState(null);

  const {
    data: allData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-all"],
    queryFn: dataService2.getAllData,
  });

  const handleRefreshData = async () => {
    await refetch();
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

  // Create SVG map visualization that resembles an actual map
  const MapComponent = () => {
    const viewBoxWidth = 400;
    const viewBoxHeight = 300;

    // Real coordinates from Adafruit GPS data
    const centerLat = -1.9441; // ALU Campus
    const centerLng = 30.0619;

    // Calculate map bounds
    const spanLat = 0.015; // Smaller span to focus more tightly on the area
    const spanLng = 0.02;

    const minLat = centerLat - spanLat;
    const maxLat = centerLat + spanLat;
    const minLng = centerLng - spanLng;
    const maxLng = centerLng + spanLng;

    // Function to convert lat/lng to SVG coordinates
    const latLngToPoint = (lat, lng) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * viewBoxWidth;
      const y =
        viewBoxHeight - ((lat - minLat) / (maxLat - minLat)) * viewBoxHeight;
      return { x, y };
    };

    // Create roads pattern
    const renderRoads = () => {
      // Main roads around ALU campus
      const roads = [
        // East-West road (horizontally across the map)
        {
          path: `M 0,${latLngToPoint(centerLat - 0.003, 0).y} 
                 L ${viewBoxWidth},${latLngToPoint(centerLat - 0.003, 0).y}`,
          width: 4,
        },
        // North-South road (vertically through the map)
        {
          path: `M ${latLngToPoint(0, centerLng + 0.004).x},0 
                 L ${latLngToPoint(0, centerLng + 0.004).x},${viewBoxHeight}`,
          width: 5,
        },
        // Secondary roads
        {
          path: `M 0,${latLngToPoint(centerLat + 0.008, 0).y} 
                 L ${viewBoxWidth},${latLngToPoint(centerLat + 0.008, 0).y}`,
          width: 2.5,
        },
        {
          path: `M ${latLngToPoint(0, centerLng - 0.008).x},0 
                 L ${latLngToPoint(0, centerLng - 0.008).x},${viewBoxHeight}`,
          width: 3,
        },
        // Campus access road
        {
          path: `M ${latLngToPoint(0, centerLng).x},${
            latLngToPoint(centerLat - 0.003, 0).y
          }
                 L ${latLngToPoint(0, centerLng).x},${
            latLngToPoint(centerLat, 0).y
          }`,
          width: 2,
        },
      ];

      return roads.map((road, index) => (
        <path
          key={`road-${index}`}
          d={road.path}
          stroke="#FFFFFF"
          strokeWidth={road.width}
          fill="none"
        />
      ));
    };

    // Create campus buildings
    const renderBuildings = () => {
      // Define campus buildings in relation to the center point
      const buildings = [
        // Main ALU building
        {
          points: [
            { lat: centerLat + 0.001, lng: centerLng - 0.005 },
            { lat: centerLat + 0.001, lng: centerLng + 0.005 },
            { lat: centerLat - 0.001, lng: centerLng + 0.005 },
            { lat: centerLat - 0.001, lng: centerLng - 0.005 },
          ],
          fill: "#D1D5DB",
        },
        // Secondary buildings
        {
          points: [
            { lat: centerLat - 0.006, lng: centerLng - 0.004 },
            { lat: centerLat - 0.006, lng: centerLng },
            { lat: centerLat - 0.004, lng: centerLng },
            { lat: centerLat - 0.004, lng: centerLng - 0.004 },
          ],
          fill: "#D1D5DB",
        },
        {
          points: [
            { lat: centerLat - 0.006, lng: centerLng + 0.002 },
            { lat: centerLat - 0.006, lng: centerLng + 0.006 },
            { lat: centerLat - 0.004, lng: centerLng + 0.006 },
            { lat: centerLat - 0.004, lng: centerLng + 0.002 },
          ],
          fill: "#D1D5DB",
        },
      ];

      return buildings.map((building, index) => {
        const points = building.points
          .map((point) => {
            const svgPoint = latLngToPoint(point.lat, point.lng);
            return `${svgPoint.x},${svgPoint.y}`;
          })
          .join(" ");

        return (
          <polygon
            key={`building-${index}`}
            points={points}
            fill={building.fill}
            stroke="#A1A1AA"
            strokeWidth="1"
          />
        );
      });
    };

    // Render green spaces/parks
    const renderGreenSpaces = () => {
      const greenSpaces = [
        // Main campus green space
        {
          center: { lat: centerLat + 0.005, lng: centerLng },
          radiusX: 0.005,
          radiusY: 0.008,
          fill: "#BBDBB8",
        },
        // Secondary green space
        {
          center: { lat: centerLat - 0.002, lng: centerLng - 0.01 },
          radiusX: 0.004,
          radiusY: 0.004,
          fill: "#BBDBB8",
        },
      ];

      return greenSpaces.map((space, index) => {
        const centerPoint = latLngToPoint(space.center.lat, space.center.lng);
        const rxPixels = (space.radiusX / (maxLng - minLng)) * viewBoxWidth;
        const ryPixels = (space.radiusY / (maxLat - minLat)) * viewBoxHeight;

        return (
          <ellipse
            key={`green-${index}`}
            cx={centerPoint.x}
            cy={centerPoint.y}
            rx={rxPixels}
            ry={ryPixels}
            fill={space.fill}
            stroke="#8FBC8F"
            strokeWidth="1"
          />
        );
      });
    };

    // Create sensor markers with realistic positioning
    const renderSensors = () => {
      // Define sensor positions in relation to the campus
      const sensorOffsets = [
        { type: "weather", lat: 0.004, lng: 0.006 }, // Weather station on roof
        { type: "soil", lat: 0.006, lng: -0.003 }, // Soil sensor in green space
        { type: "air", lat: -0.003, lng: -0.005 }, // Air quality monitor
        { type: "field", lat: -0.007, lng: 0.006 }, // Field camera
        { type: "irrigation", lat: 0.003, lng: -0.008 }, // Irrigation control
      ];

      // Match each sensor with its respective system device
      return system.devices.map((device, index) => {
        // Find matching offset or use a default position
        const offset = sensorOffsets[index % sensorOffsets.length];
        const sensorLat = centerLat + offset.lat;
        const sensorLng = centerLng + offset.lng;
        const point = latLngToPoint(sensorLat, sensorLng);

        // Determine status color
        const statusColor =
          device.status === "Online"
            ? "#10B981"
            : device.status === "Warning"
            ? "#F59E0B"
            : "#EF4444";

        // Determine icon based on device name or type
        let SensorIcon = MapPin;
        const deviceName = device.name.toLowerCase();
        if (deviceName.includes("weather")) SensorIcon = Cloud;
        if (deviceName.includes("soil")) SensorIcon = Droplets;
        if (deviceName.includes("air") || deviceName.includes("quality"))
          SensorIcon = Wind;

        return (
          <g
            key={`sensor-${device.id}`}
            transform={`translate(${point.x - 12}, ${point.y - 24})`}
            onClick={() => setSelectedSensor(device)}
            style={{ cursor: "pointer" }}
          >
            {/* Sensor visualization */}
            <circle
              cx="12"
              cy="12"
              r="16"
              fill="#FFFFFF"
              fillOpacity="0.9"
              stroke={statusColor}
              strokeWidth="2"
            />
            <SensorIcon color={statusColor} size={20} />
            <text
              x="12"
              y="32"
              textAnchor="middle"
              fill="#1F2937"
              fontSize="9"
              fontWeight="bold"
            >
              {device.name.split(" ")[0]}
            </text>
          </g>
        );
      });
    };

    // Create map grid lines
    const renderGrid = () => {
      const gridLines = [];
      const gridStep = 0.005;

      // Latitude grid lines
      for (
        let lat = Math.ceil(minLat / gridStep) * gridStep;
        lat <= maxLat;
        lat += gridStep
      ) {
        const y = latLngToPoint(lat, 0).y;
        gridLines.push(
          <line
            key={`lat-${lat}`}
            x1="0"
            y1={y}
            x2={viewBoxWidth}
            y2={y}
            stroke="#CCCCCC"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            strokeOpacity="0.5"
          />
        );
      }

      // Longitude grid lines
      for (
        let lng = Math.ceil(minLng / gridStep) * gridStep;
        lng <= maxLng;
        lng += gridStep
      ) {
        const x = latLngToPoint(0, lng).x;
        gridLines.push(
          <line
            key={`lng-${lng}`}
            x1={x}
            y1="0"
            x2={x}
            y2={viewBoxHeight}
            stroke="#CCCCCC"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            strokeOpacity="0.5"
          />
        );
      }

      return gridLines;
    };

    return (
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full"
      >
        {/* Map background */}
        <rect width={viewBoxWidth} height={viewBoxHeight} fill="#EEF5FA" />

        {/* Base map elements */}
        {renderGrid()}
        {renderGreenSpaces()}
        {renderRoads()}
        {renderBuildings()}

        {/* Campus boundary */}
        <path
          d={`M ${latLngToPoint(centerLat - 0.009, centerLng - 0.012).x},${
            latLngToPoint(centerLat - 0.009, centerLng - 0.012).y
          }
             L ${latLngToPoint(centerLat - 0.009, centerLng + 0.012).x},${
            latLngToPoint(centerLat - 0.009, centerLng + 0.012).y
          }
             L ${latLngToPoint(centerLat + 0.009, centerLng + 0.012).x},${
            latLngToPoint(centerLat + 0.009, centerLng + 0.012).y
          }
             L ${latLngToPoint(centerLat + 0.009, centerLng - 0.012).x},${
            latLngToPoint(centerLat + 0.009, centerLng - 0.012).y
          }
             Z`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />

        {/* Render sensor positions */}
        {renderSensors()}

        {/* Main GPS location marker with pulsing effect */}
        <g
          transform={`translate(${
            latLngToPoint(centerLat, centerLng).x - 10
          }, ${latLngToPoint(centerLat, centerLng).y - 10})`}
        >
          <circle
            cx="10"
            cy="10"
            r="5"
            fill="#EF4444"
            stroke="#FFFFFF"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="5;8;5"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="1;0.6;1"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Map title and scale */}
        <text
          x={viewBoxWidth / 2}
          y="16"
          textAnchor="middle"
          fill="#1E40AF"
          fontSize="11"
          fontWeight="bold"
        >
          African Leadership University Campus
        </text>

        {/* Scale bar */}
        <g transform={`translate(${viewBoxWidth - 50}, ${viewBoxHeight - 15})`}>
          <line x1="0" y1="0" x2="40" y2="0" stroke="#333333" strokeWidth="2" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#333333" strokeWidth="2" />
          <line
            x1="40"
            y1="-3"
            x2="40"
            y2="3"
            stroke="#333333"
            strokeWidth="2"
          />
          <text x="20" y="-5" textAnchor="middle" fill="#333333" fontSize="7">
            100m
          </text>
        </g>

        {/* North arrow */}
        <g transform="translate(20, 30)">
          <path d="M0,12 L6,0 L12,12 L6,8 Z" fill="#1E3A8A" />
          <text
            x="6"
            y="22"
            textAnchor="middle"
            fill="#1E3A8A"
            fontSize="8"
            fontWeight="bold"
          >
            N
          </text>
        </g>
      </svg>
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

        {/* Farm Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Stratos Sensor Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <MapComponent />
              <div className="text-xs text-gray-500 mt-2 text-center">
                Latitude: -1.9441, Longitude: 30.0619 • African Leadership
                University Campus
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sensor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {system.devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-3 border rounded-lg flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      const sensor = location.sensorLocations.find(
                        (s) => s.id === device.id
                      );
                      if (sensor) setSelectedSensor(sensor);
                    }}
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
