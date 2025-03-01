
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import Layout from '@/components/Layout';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertTriangle, TrendingUp, ArrowDown, ArrowUp, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  
  const { data: weatherData } = useQuery({
    queryKey: ['insights-weather'],
    queryFn: dataService.getWeatherData,
  });

  const { data: cropData } = useQuery({
    queryKey: ['insights-crop'],
    queryFn: dataService.getCropData,
  });

  const { data: soilData } = useQuery({
    queryKey: ['insights-soil'],
    queryFn: dataService.getSoilData,
  });

  const { data: predictionData } = useQuery({
    queryKey: ['insights-predictions'],
    queryFn: dataService.getPredictions,
  });

  const { data: alertData } = useQuery({
    queryKey: ['alert-history'],
    queryFn: dataService.getAlertHistory,
  });

  // Loading state
  if (!weatherData || !cropData || !soilData || !predictionData || !alertData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Format alert data by type
  const alertsByType = {
    critical: alertData.filter(alert => alert.type === 'critical').length,
    warning: alertData.filter(alert => alert.type === 'warning').length,
    info: alertData.filter(alert => alert.type === 'info').length,
  };

  const alertPieData = [
    { name: 'Critical', value: alertsByType.critical, color: '#EF4444' },
    { name: 'Warning', value: alertsByType.warning, color: '#F59E0B' },
    { name: 'Info', value: alertsByType.info, color: '#3B82F6' },
  ];

  // Format risk data for chart
  const riskData = [
    { name: 'Flood', value: predictionData.disasterRisk.flood },
    { name: 'Drought', value: predictionData.disasterRisk.drought },
    { name: 'Pest', value: predictionData.disasterRisk.pest },
    { name: 'Disease', value: predictionData.disasterRisk.disease },
  ];

  // Create sample yield trend data since cropData.yield.history is not available
  const yieldTrendData = [
    { month: 'Jan', actual: 65, predicted: 63 },
    { month: 'Feb', actual: 68, predicted: 65 },
    { month: 'Mar', actual: 72, predicted: 70 },
    { month: 'Apr', actual: 75, predicted: 78 },
    { month: 'May', actual: 78, predicted: 80 },
    { month: 'Jun', actual: 82, predicted: 85 },
  ];

  // Calculate alert acknowledgement percentage
  const acknowledgedAlerts = alertData.filter(alert => alert.acknowledged).length;
  const totalAlerts = alertData.length;
  const acknowledgedPercentage = Math.round((acknowledgedAlerts / totalAlerts) * 100);

  // Create sample seasons data
  const seasonsData = [
    { name: 'Spring 2023', yield: 78, rainfall: 120 },
    { name: 'Summer 2023', yield: 85, rainfall: 90 },
    { name: 'Fall 2023', yield: 70, rainfall: 150 },
    { name: 'Winter 2024', yield: 62, rainfall: 180 },
    { name: 'Spring 2024', yield: 80, rainfall: 110 },
  ];

  // Create sample soil moisture history data
  const soilMoistureHistory = [
    { time: 'Day 1', value: 38 },
    { time: 'Day 2', value: 35 },
    { time: 'Day 3', value: 32 },
    { time: 'Day 4', value: 30 },
    { time: 'Day 5', value: 36 },
    { time: 'Day 6', value: 40 },
    { time: 'Day 7', value: 42 },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Insights & Analytics
        </h1>

        {/* Tabs for different insight categories */}
        <Tabs 
          defaultValue="predictions" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="predictions">Predictions & Forecasts</TabsTrigger>
            <TabsTrigger value="alerts">Alert Analytics</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          </TabsList>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            {/* Yield Prediction Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Crop Yield Prediction
                </CardTitle>
                <CardDescription>
                  Forecasted for {predictionData.yieldPrediction.forecastDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Current Projection</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {predictionData.yieldPrediction.current}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Previous Season</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {predictionData.yieldPrediction.previous}%
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Change</div>
                    <div className="text-3xl font-bold flex items-center text-green-600 dark:text-green-400">
                      +{predictionData.yieldPrediction.change}%
                      <ArrowUp className="ml-1 h-5 w-5" />
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={yieldTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3B82F6" 
                      activeDot={{ r: 8 }} 
                      name="Actual Yield"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#10B981" 
                      strokeDasharray="5 5" 
                      name="Predicted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Disaster Risk Assessment"
                description={`Next ${predictionData.disasterRisk.forecast}`}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Risk %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill="#10B981"
                      name="Risk Percentage"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 30 ? "#EF4444" : "#10B981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Based on forecast data and current farm conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictionData.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={cn(
                          "flex-shrink-0 mt-0.5 h-3 w-3 rounded-full",
                          rec.priority === 'High' ? 'bg-red-500' : 
                          rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        )} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">{rec.action}</h3>
                            <Badge variant={
                              rec.priority === 'High' ? 'destructive' : 
                              rec.priority === 'Medium' ? 'default' : 'outline'
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalAlerts}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Acknowledgement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{acknowledgedPercentage}%</div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                    <div 
                      className="h-full rounded-full bg-green-500" 
                      style={{ width: `${acknowledgedPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Critical Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {alertsByType.critical}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((alertsByType.critical / totalAlerts) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Alert Distribution"
                description="By severity level"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={alertPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {alertPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Recent Alert History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                    {alertData.slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 mt-1 h-3 w-3 rounded-full",
                          alert.type === 'critical' ? 'bg-red-500' : 
                          alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                            {!alert.acknowledged && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      View All Alerts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Weather Patterns"
                description="Last 30 days"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weatherData.historical.temperature}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Temperature (°C)"
                      stroke="#3B82F6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <ChartContainer
                title="Soil Moisture Trends"
                description="Last 30 days"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={soilMoistureHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Moisture (%)"
                      stroke="#10B981" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5" />
                  Seasonal Analysis
                </CardTitle>
                <CardDescription>
                  Performance metrics across growing seasons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={seasonsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="yield" name="Yield %" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
