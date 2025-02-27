
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { dataService } from '@/services/dataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AirQualityCard from '@/components/ui/dashboard/AirQualityCard';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { CircleHelp, Download, Filter, Map, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const AirQuality = () => {
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ['air-quality'],
    queryFn: dataService.getAirQualityData,
  });

  const handleDownloadData = () => {
    toast({
      title: "Data Downloaded",
      description: "Air quality data has been downloaded successfully",
      variant: "default",
    });
  };

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Air Quality</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and analyze air quality data from multiple sensors</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDownloadData} className="gap-2">
              <Download size={16} />
              Download Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter size={16} />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Map size={16} />
              View Map
            </Button>
          </div>
        </div>

        {/* Main AQI Card */}
        <AirQualityCard 
          index={data.current.aqi}
          indicators={data.indicators.slice(0, 4)}
          className="w-full"
        />

        {/* Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="pollutants">Pollutants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer 
                title="AQI Trend" 
                description="Weekly air quality index"
                action={
                  <Button variant="ghost" size="icon">
                    <CircleHelp size={16} />
                  </Button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.aqi}>
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
              
              <ChartContainer 
                title="CO₂ Concentration" 
                description="Weekly carbon dioxide levels"
                action={
                  <Button variant="ghost" size="icon">
                    <CircleHelp size={16} />
                  </Button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.historical.co2}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="CO₂ (ppm)"
                      stroke="#3183f5" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Comparison</CardTitle>
                <CardDescription>Air quality comparison across different farm zones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={[
                      { name: 'Field A', aqi: 45, co2: 415, pm25: 12 },
                      { name: 'Field B', aqi: 56, co2: 425, pm25: 15 },
                      { name: 'Field C', aqi: 38, co2: 405, pm25: 10 },
                      { name: 'Greenhouse', aqi: 62, co2: 450, pm25: 18 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aqi" name="AQI" fill="#F59E0B" />
                    <Bar dataKey="co2" name="CO₂ (ppm)" fill="#3183f5" />
                    <Bar dataKey="pm25" name="PM2.5 (μg/m³)" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pollutants" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.indicators.map((indicator, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{indicator.name}</CardTitle>
                    <Wind size={18} className="text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {indicator.value} <span className="text-sm font-normal text-gray-500">{indicator.unit}</span>
                    </div>
                    <p className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full inline-block",
                      indicator.status === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      indicator.status === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                      {indicator.status?.charAt(0).toUpperCase() + indicator.status?.slice(1) || 'Normal'}
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0</span>
                        <span>{indicator.max}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            indicator.status === 'good' ? 'bg-green-500' :
                            indicator.status === 'moderate' ? 'bg-yellow-500' :
                            'bg-red-500'
                          )}
                          style={{ width: `${Math.min(100, (indicator.value / indicator.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Air Quality Information</CardTitle>
            <CardDescription>Understanding Air Quality Index (AQI) and pollutant levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">What is AQI?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  The Air Quality Index (AQI) is a standardized indicator for reporting air quality. It tells you how clean or polluted your air is, and what associated health effects might be a concern.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">AQI Levels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>0-50: Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>51-100: Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>101-150: Unhealthy for Sensitive Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>151-200: Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>201-300: Very Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-900"></div>
                      <span>301+: Hazardous</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">Common Pollutants</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">CO₂:</span> Carbon dioxide, a greenhouse gas
                    </div>
                    <div>
                      <span className="font-medium">CO:</span> Carbon monoxide, a toxic gas
                    </div>
                    <div>
                      <span className="font-medium">NH₃:</span> Ammonia, common in agricultural settings
                    </div>
                    <div>
                      <span className="font-medium">PM2.5:</span> Fine particulate matter (2.5 micrometers or smaller)
                    </div>
                    <div>
                      <span className="font-medium">PM10:</span> Coarse particulate matter (10 micrometers or smaller)
                    </div>
                    <div>
                      <span className="font-medium">O₃:</span> Ozone, can be harmful at ground level
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AirQuality;
