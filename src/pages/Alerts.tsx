
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Alerts = () => {
  const { data: alertData, isLoading } = useQuery({
    queryKey: ['alert-history'],
    queryFn: dataService.getAlertHistory,
  });

  if (isLoading || !alertData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Layout>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Calculate statistics
  const criticalCount = alertData.filter(alert => alert.type === 'critical').length;
  const warningCount = alertData.filter(alert => alert.type === 'warning').length;
  const infoCount = alertData.filter(alert => alert.type === 'info').length;
  const acknowledgedCount = alertData.filter(alert => alert.acknowledged).length;

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Alerts</h1>
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark All as Read
          </Button>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{criticalCount}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Need review soon
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Info Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{infoCount}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                General notifications
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Acknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{acknowledgedCount}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Of {alertData.length} total alerts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Review and manage system alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Alerts</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {alertData.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </p>
                        <Badge variant="outline" className={cn(
                          getAlertClass(alert.type),
                          "capitalize"
                        )}>
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {alert.acknowledged && (
                          <Badge variant="secondary" className="ml-2">
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="unread" className="space-y-4">
                {alertData
                  .filter(alert => !alert.acknowledged)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {alert.message}
                          </p>
                          <Badge variant="outline" className={cn(
                            getAlertClass(alert.type),
                            "capitalize"
                          )}>
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="critical" className="space-y-4">
                {alertData
                  .filter(alert => alert.type === 'critical')
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {alert.message}
                          </p>
                          <Badge variant="outline" className={cn(
                            getAlertClass(alert.type),
                            "capitalize"
                          )}>
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.acknowledged && (
                            <Badge variant="secondary" className="ml-2">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Alerts;

