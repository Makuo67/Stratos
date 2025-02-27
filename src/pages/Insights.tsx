
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { dataService } from '@/services/dataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ChartContainer from '@/components/ui/dashboard/ChartContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Calendar, Download, TrendingUp, AlertTriangle, Wind, Thermometer, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3183f5', '#8B5CF6', '#EC4899'];

const Insights = () => {
  const { toast } = useToast();
  
  const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: dataService.getPredictions,
  });

  const { data: allData, isLoading: allDataLoading } = useQuery({
    queryKey: ['all-data'],
    queryFn: dataService.getAllData,
  });

  const handleGeneratePrediction = () => {
    toast({
      title: "Prediction Generated",
      description: "ML model has generated new predictions based on recent data",
      variant: "default",
    });
  };

  if (predictionsLoading || allDataLoading || !predictionsData || !allData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Layout>
    );
  }

  const { weather, airQuality, soil } = allData;

  // Format yield prediction data
  const yieldTrendData = [
    { month: 'Jan', actual: 68, predicted: null },
    { month: 'Feb', actual: 72, predicted: null },
    { month: 'Mar', actual: 75, predicted: null },
    { month: 'Apr', actual: 78, predicted: null },
    { month: 'May', actual: 82, predicted: null },
    { month: 'Jun', actual: null, predicted: 85 },
    { month: 'Jul', actual: null, predicted: 88 },
    { month: 'Aug', actual: null, predicted: 90 },
  ];

  // Risk data for radar chart
  const riskData = [
    { subject: 'Flood', A: predictionsData.disasterRisk.flood, fullMark: 100 },
    { subject: 'Drought', A: predictionsData.disasterRisk.drought, fullMark: 100 },
    { subject: 'Pest', A: predictionsData.disasterRisk.pest, fullMark: 100 },
    { subject: 'Disease', A: predictionsData.disasterRisk.disease, fullMark: 100 },
    { subject: 'Temp', A: 25, fullMark: 100 },
    { subject: 'Wind', A: 15, fullMark: 100 },
  ];

  // Correlation data
  const correlationData = [
    { factor: 'Temperature', correlation: 0.75 },
    { factor: 'Humidity', correlation: 0.65 },
    { factor: 'CO2 Level', correlation: -0.72 },
    { factor: 'Soil Moisture', correlation: 0.81 },
    { factor: 'Sunlight', correlation: 0.62 },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Insights & Predictions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered analytics and forecasting for your farm</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Export Report
            </Button>
            <Button variant="default" onClick={handleGeneratePrediction} className="gap-2">
              <Brain size={16} />
              Generate New Prediction
            </Button>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Yield Prediction</CardTitle>
              <TrendingUp size={16} className="text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{predictionsData.yieldPrediction.current}%</div>
              <div className="flex items-center mt-1">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  predictionsData.yieldPrediction.change > 0 ? 
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {predictionsData.yieldPrediction.change > 0 ? '+' : ''}
                  {predictionsData.yieldPrediction.change}% from last season
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Projected harvest date: {predictionsData.yieldPrediction.forecastDate.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Risk Assessment</CardTitle>
              <AlertTriangle size={16} className="text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.max(
                  predictionsData.disasterRisk.flood,
                  predictionsData.disasterRisk.drought,
                  predictionsData.disasterRisk.pest,
                  predictionsData.disasterRisk.disease
                )}%
              </div>
              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 inline-block mt-1">
                Moderate Risk Level
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Highest risk: Drought ({predictionsData.disasterRisk.drought}%)
              </p>
              <p className="text-xs text-gray-500">
                Time frame: {predictionsData.disasterRisk.forecast}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Actions Needed</CardTitle>
              <Calendar size={16} className="text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{predictionsData.recommendations.length}</div>
              <div className="text-xs font-medium mt-1 text-gray-500">
                Recommended actions
              </div>
              <div className="mt-3 space-y-2">
                {predictionsData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 mt-1 rounded-full",
                      rec.priority === 'High' ? 'bg-red-500' :
                      rec.priority === 'Medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    )}></div>
                    <p className="text-xs">{rec.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for highest risk */}
        <Alert variant="destructive" className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            Models predict a {predictionsData.disasterRisk.drought}% chance of drought conditions in the next {predictionsData.disasterRisk.forecast}. Consider implementing water conservation measures.
          </AlertDescription>
        </Alert>

        {/* Tabs for different insights */}
        <Tabs defaultValue="yield" className="w-full">
          <TabsList>
            <TabsTrigger value="yield">Yield Analysis</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="yield" className="pt-4">
            <ChartContainer 
              title="Yield Trend & Prediction" 
              description="Historical yield data with future projections"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yieldTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Yield (%)"
                    stroke="#3183f5" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    name="Predicted Yield (%)"
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Factors Affecting Yield</CardTitle>
                  <CardDescription>Primary factors that are impacting crop yield predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {correlationData.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          {item.factor === 'Temperature' && <Thermometer size={16} />}
                          {item.factor === 'Humidity' && <Droplets size={16} />}
                          {item.factor === 'CO2 Level' && <Wind size={16} />}
                          {item.factor === 'Soil Moisture' && <Droplets size={16} />}
                          {item.factor === 'Sunlight' && <Thermometer size={16} />}
                          {item.factor}
                        </span>
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              item.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(item.correlation > 0 ? '+' : '') + item.correlation.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>AI-generated recommendations to improve yield</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictionsData.recommendations.map((rec, index) => (
                      <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">{rec.action}</h4>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            rec.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          )}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="risks" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Radar</CardTitle>
                  <CardDescription>Comprehensive view of all potential risks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={riskData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Risk Level" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Breakdown of potential threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Flood', value: predictionsData.disasterRisk.flood },
                            { name: 'Drought', value: predictionsData.disasterRisk.drought },
                            { name: 'Pest', value: predictionsData.disasterRisk.pest },
                            { name: 'Disease', value: predictionsData.disasterRisk.disease },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Flood', value: predictionsData.disasterRisk.flood },
                            { name: 'Drought', value: predictionsData.disasterRisk.drought },
                            { name: 'Pest', value: predictionsData.disasterRisk.pest },
                            { name: 'Disease', value: predictionsData.disasterRisk.disease },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Risk Mitigation Plans</CardTitle>
                <CardDescription>Recommended strategies for addressing identified risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Drought Mitigation</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Install rainwater harvesting systems to collect and store precipitation</li>
                      <li>Implement drip irrigation to maximize water efficiency</li>
                      <li>Plant drought-resistant crop varieties in vulnerable areas</li>
                      <li>Apply mulch to reduce soil evaporation and retain moisture</li>
                      <li>Schedule irrigation during early morning or evening to minimize evaporation</li>
                    </ul>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">Pest Control Strategy</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Implement integrated pest management (IPM) practices</li>
                      <li>Install insect monitoring traps to detect early infestations</li>
                      <li>Use biological control agents like beneficial insects</li>
                      <li>Practice crop rotation to disrupt pest life cycles</li>
                      <li>Schedule preventative organic pesticide application based on historical data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Disease Prevention</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Maintain proper plant spacing to improve air circulation</li>
                      <li>Implement sanitation practices to remove infected plant material</li>
                      <li>Apply biological fungicides as preventative measures</li>
                      <li>Select disease-resistant crop varieties</li>
                      <li>Monitor plant health with regular inspections and soil testing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="correlations" className="pt-4">
            <ChartContainer 
              title="Environmental Correlations" 
              description="How environmental factors affect crop yield and growth"
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={correlationData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[-1, 1]} />
                  <YAxis dataKey="factor" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="correlation" 
                    name="Correlation Coefficient" 
                    fill={(entry) => entry.correlation > 0 ? '#10B981' : '#EF4444'}
                  >
                    {correlationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.correlation > 0 ? '#10B981' : '#EF4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
                <CardDescription>How environmental factors are correlated with crop yield</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our AI models have analyzed the relationship between various environmental factors and your crop yield. 
                    A positive correlation (towards +1.0) means that as the factor increases, yield tends to increase. 
                    A negative correlation (towards -1.0) means that as the factor increases, yield tends to decrease.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Positive Correlations</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Droplets size={16} />
                            Soil Moisture
                          </span>
                          <span className="font-medium text-green-600">+0.81</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Thermometer size={16} />
                            Temperature
                          </span>
                          <span className="font-medium text-green-600">+0.75</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Droplets size={16} />
                            Humidity
                          </span>
                          <span className="font-medium text-green-600">+0.65</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Negative Correlations</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Wind size={16} />
                            CO₂ Level
                          </span>
                          <span className="font-medium text-red-600">-0.72</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Pest Presence
                          </span>
                          <span className="font-medium text-red-600">-0.68</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Wind size={16} />
                            Wind Speed
                          </span>
                          <span className="font-medium text-red-600">-0.45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg mt-4">
                    <h4 className="font-medium mb-1">Recommendation</h4>
                    <p className="text-sm">
                      Based on correlation analysis, focus on maintaining optimal soil moisture levels and 
                      controlling CO₂ levels to potentially improve yield. Our models suggest that a 10% increase in 
                      soil moisture management effectiveness could result in a 8.1% yield improvement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
