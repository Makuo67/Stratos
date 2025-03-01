interface SensorData {
    temperature: number;
    humidity: number;
    co2: number;
    nh3: number;
    // will add more more later
  }
  
  interface Alert {
    id: string;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }
  
  const TEMPERATURE_THRESHOLD = 35;
  const HUMIDITY_THRESHOLD = 80;
  const CO2_THRESHOLD = 1000;
  const NH3_THRESHOLD = 25;
  
  export function generateAlertsFromSensorData(data: SensorData): Alert[] {
    const alerts: Alert[] = [];
  
    if (data.temperature > TEMPERATURE_THRESHOLD) {
      alerts.push({
        id: `temp-${Date.now()}`,
        message: `High temperature detected: ${data.temperature}°C`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  
    if (data.humidity > HUMIDITY_THRESHOLD) {
      alerts.push({
        id: `humid-${Date.now()}`,
        message: `High humidity detected: ${data.humidity}%`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  
    if (data.co2 > CO2_THRESHOLD) {
      alerts.push({
        id: `co2-${Date.now()}`,
        message: `CO₂ level above safe limit: ${data.co2} ppm`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  
    if (data.nh3 > NH3_THRESHOLD) {
      alerts.push({
        id: `nh3-${Date.now()}`,
        message: `NH₃ level above safe limit: ${data.nh3} ppb`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  
    return alerts;
  }
  