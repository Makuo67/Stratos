import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import StatCard from '@/components/ui/dashboard/StatCard';
import AirQualityCard from '@/components/ui/dashboard/AirQualityCard';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { dataService2 } from '@/services/dataService2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Cloud, Droplets, Wind, Thermometer, MapPin, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedSensor, setSelectedSensor] = useState(null);
  
  const { data: allData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-all'],
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
  const { weather, airQuality, soil, system, location } = allData;

  // Create SVG map of farm with sensors
  const MapComponent = () => {
    const viewBoxWidth = 400;
    const viewBoxHeight = 300;
    
    // Calculate map bounds
    const minLat = Math.min(...location.sensorLocations.map(s => s.lat), ...location.zones.map(z => Math.min(...z.coords.map(c => c.lat))));
    const maxLat = Math.max(...location.sensorLocations.map(s => s.lat), ...location.zones.map(z => Math.max(...z.coords.map(c => c.lat))));
    const minLng = Math.min(...location.sensorLocations.map(s => s.lng), ...location.zones.map(z => Math.min(...z.coords.map(c => c.lng))));
    const maxLng = Math.max(...location.sensorLocations.map(s => s.lng), ...location.zones.map(z => Math.max(...z.coords.map(c => c.lng))));
    
    // Function to convert lat/lng to SVG coordinates
    const latLngToPoint = (lat, lng) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * viewBoxWidth;
      const y = viewBoxHeight - ((lat - minLat) / (maxLat - minLat)) * viewBoxHeight;
      return { x, y };
    };
    
    // Create zone polygons
    const renderZones = () => {
      return location.zones.map((zone, index) => {
        const points = zone.coords.map(coord => {
          const point = latLngToPoint(coord.lat, coord.lng);
          return `${point.x},${point.y}`;
        }).join(' ');
        
        const fillColor = zone.type === 'crop' 
          ? (zone.status === 'Healthy' ? '#10B981' : '#F59E0B') 
          : '#3B82F6';
          
        return (
          <polygon 
            key={`zone-${index}`}
            points={points}
            fill={fillColor}
            fillOpacity="0.3"
            stroke={fillColor}
            strokeWidth="2"
          />
        );
      });
    };
    
    // Create sensor markers
    const renderSensors = () => {
      return location.sensorLocations.map((sensor, index) => {
        const point = latLngToPoint(sensor.lat, sensor.lng);
        
        // Determine status color
        const deviceStatus = system.devices.find(d => d.id === sensor.id)?.status || 'Unknown';
        const statusColor = deviceStatus === 'Online' ? '#10B981' : 
                            deviceStatus === 'Warning' ? '#F59E0B' : '#EF4444';
        
        // Determine icon
        let SensorIcon = MapPin;
        if (sensor.type === 'weather') SensorIcon = Cloud;
        if (sensor.type === 'soil') SensorIcon = Droplets;
        if (sensor.type === 'air') SensorIcon = Wind;
        
        return (
          <g 
            key={`sensor-${index}`}
            transform={`translate(${point.x - 12}, ${point.y - 24})`}
            onClick={() => setSelectedSensor(sensor)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="12" cy="12" r="16" fill="white" fillOpacity="0.6" />
            <SensorIcon color={statusColor} size={24} />
            <text
              x="12"
              y="32"
              textAnchor="middle"
              fill="#1F2937"
              fontSize="10"
              fontWeight="bold"
            >
              {sensor.name.split(' ')[0]}
            </text>
          </g>
        );
      });
    };
    
    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
        {/* Background */}
        <rect width={viewBoxWidth} height={viewBoxHeight} fill="#DBEAFE" />
        
        {/* Render farm zones */}
        {renderZones()}
        
        {/* Render farm boundary */}
        <polygon
          points={location.boundaries.map(b => {
            const point = latLngToPoint(b.lat, b.lng);
            return `${point.x},${point.y}`;
          }).join(' ')}
          fill="none"
          stroke="#1E40AF"
          strokeWidth="3"
          strokeDasharray="5,5"
        />
        
        {/* Render sensors */}
        {renderSensors()}
        
        {/* Center marker */}
        <g 
          transform={`translate(${latLngToPoint(location.farmCenter.lat, location.farmCenter.lng).x - 12}, ${latLngToPoint(location.farmCenter.lat, location.farmCenter.lng).y - 12})`}
        >
          <circle cx="12" cy="12" r="6" fill="#EF4444" stroke="white" strokeWidth="2" />
        </g>
      </svg>
    );
  };

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

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Air Quality Card (Left Side) */}
          <AirQualityCard 
            index={airQuality.current.aqi}
            indicators={airQuality.indicators.slice(0, 4).map(indicator => ({
              ...indicator,
              status: indicator.status as 'good' | 'moderate' | 'unhealthy'
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
                Farm Map & Sensor Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <MapComponent />
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
                      const sensor = location.sensorLocations.find(s => s.id === device.id);
                      if (sensor) setSelectedSensor(sensor);
                    }}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        device.status === 'Online' ? 'bg-green-500' : 
                        device.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{device.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={device.status === 'Online' ? 'outline' : 'destructive'}>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Alerts</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {system.alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-4 flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-1 ${
                    alert.type === 'critical' ? 'text-red-500' : 
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}>
                    {alert.type === 'critical' ? <AlertTriangle size={16} /> : 
                     alert.type === 'warning' ? <Info size={16} /> : 
                     <CheckCircle2 size={16} />}
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
