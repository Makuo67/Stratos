import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Weather from "./pages/Weather";
import AirQuality from "./pages/AirQuality";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

import IoTDashboard from "./pages/IoTDashboard"; // Import the IoT Dashboard page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/air-quality" element={<AirQuality />} />
          <Route path="/insights" element={<Insights />} />
          {/* Add the new route */}
          <Route path="/iot-dashboard" element={<IoTDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
