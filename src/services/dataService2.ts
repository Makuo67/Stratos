import adafruitService, { SensorData } from './adafruitService';
import weatherService, { WeatherData } from './weatherService';
import { 
  weatherData as mockWeatherData, 
  airQualityData as mockAirQualityData, 
  soilData as mockSoilData, 
  cropData as mockCropData, 
  systemData as mockSystemData,
  calendarData as mockCalendarData,
  locationData as mockLocationData
} from '../data/mockData';

// Cache for sensor data
let cachedSensorData: SensorData | null = null;
let lastSensorFetchTime = 0;

// Cache for weather data
let cachedWeatherData: WeatherData | null = null;
let lastWeatherFetchTime = 0;

// Cache for environmental history
let cachedEnvironmentalHistory: any = null;
let lastEnvironmentalHistoryFetchTime = 0;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Fetches the latest sensor data from Adafruit IO
 * @returns The latest sensor data
 */
const fetchSensorData = async (): Promise<SensorData> => {
  const now = Date.now();
  
  // If we have cached data and it's not expired, use it
  if (cachedSensorData && now - lastSensorFetchTime < CACHE_DURATION) {
    return cachedSensorData;
  }
  
  // Otherwise, fetch fresh data
  try {
    const data = await adafruitService.getAllSensorData();
    
    // Update cache
    cachedSensorData = data;
    lastSensorFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    
    // If we have cached data, return it even if expired
    if (cachedSensorData) {
      return cachedSensorData;
    }
    
    // Otherwise, throw the error
    throw error;
  }
};

/**
 * Fetches the latest weather data for the farm location
 * @returns The latest weather data
 */
const fetchWeatherData = async (): Promise<WeatherData> => {
  const now = Date.now();
  
  // If we have cached data and it's not expired, use it
  if (cachedWeatherData && now - lastWeatherFetchTime < CACHE_DURATION) {
    return cachedWeatherData;
  }
  
  // Otherwise, fetch fresh data
  try {
    // Get the sensor data to get the GPS location
    let latitude, longitude;
    
    try {
      const sensorData = await fetchSensorData();
      latitude = sensorData.gpsLocation.latitude;
      longitude = sensorData.gpsLocation.longitude;
    } catch (error) {
      console.error('Error getting GPS coordinates from sensor, using default:', error);
      // Default coordinates if sensor data is unavailable
      latitude = 37.7749;
      longitude = -122.4194;
    }
    
    const data = await weatherService.getWeatherData(
      latitude,
      longitude,
      'Farm Central, Green Valley'
    );
    
    // Update cache
    cachedWeatherData = data;
    lastWeatherFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // If we have cached data, return it even if expired
    if (cachedWeatherData) {
      return cachedWeatherData;
    }
    
    // Otherwise, return mock data as absolute fallback
    return mockWeatherData;
  }
};

/**
 * Fetches air quality data for the farm location
 * @returns Air quality data
 */
const fetchAirQualityData = async () => {
  try {
    // Get the sensor data for real readings
    const sensorData = await fetchSensorData();
    let latitude = sensorData.gpsLocation.latitude;
    let longitude = sensorData.gpsLocation.longitude;
    
    // Get weather API air quality data 
    const airQualityData = await weatherService.getAirQualityData(latitude, longitude);
    
    // Update with real sensor data from Adafruit
    airQualityData.indicators.find(i => i.name === 'CO2')!.value = sensorData.co2;
    airQualityData.indicators.find(i => i.name === 'CO')!.value = sensorData.co;
    airQualityData.indicators.find(i => i.name === 'NH3')!.value = sensorData.nh3;
    
    return airQualityData;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    // Use mock data only as last resort
    return mockAirQualityData;
  }
};

/**
 * Fetches environmental history data
 * @param days Number of days to fetch history for
 * @returns Environmental history data
 */
const fetchEnvironmentalHistory = async (days: number = 7) => {
  const now = Date.now();
  
  // If we have cached data and it's not expired, use it
  if (cachedEnvironmentalHistory && now - lastEnvironmentalHistoryFetchTime < CACHE_DURATION) {
    return cachedEnvironmentalHistory;
  }
  
  try {
    const data = await adafruitService.getEnvironmentalHistory(days);
    
    // Update cache
    cachedEnvironmentalHistory = data;
    lastEnvironmentalHistoryFetchTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching environmental history:', error);
    
    // If we have cached data, return it even if expired
    if (cachedEnvironmentalHistory) {
      return cachedEnvironmentalHistory;
    }
    
    // Otherwise, return fallback data
    return {
      temperature: mockWeatherData.historical.temperature,
      humidity: Array(7).fill(0).map((_, i) => ({
        time: `${i * 3}:00`,
        value: 60 + Math.random() * 20,
      })),
    };
  }
};

/**
 * Fetches soil data for the farm with real temperature
 * @returns Soil data
 */
const fetchSoilData = async () => {
  try {
    const sensorData = await fetchSensorData();
    // Create soil data and update with real sensor values
    const soilData = { ...mockSoilData };
    
    // Update with real temperature from sensor data
    soilData.current.temperature = sensorData.temperature;
    
    // Optional: you could also update soil moisture if your sensor provides it
    
    return soilData;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    return mockSoilData;
  }
};

/**
 * Fetches all data required for the dashboard using real sensor data when possible
 * @returns All dashboard data
 */
const fetchAllData = async () => {
  try {
    // Fetch sensor data first
    let sensorData;
    try {
      sensorData = await fetchSensorData();
    } catch (error) {
      console.error('Error fetching sensor data, continuing with other data:', error);
      sensorData = null;
    }
    
    // Fetch all other data in parallel
    const [weatherData, airQualityData, soilData] = await Promise.all([
      fetchWeatherData(),
      fetchAirQualityData(),
      fetchSoilData(),
    ]);
    
    return {
      weather: weatherData,
      airQuality: airQualityData,
      soil: soilData,
      crop: mockCropData, // No real crop data yet
      system: {
        ...mockSystemData,
        devices: mockSystemData.devices.map(device => ({
          ...device,
          // Update device status based on sensor data availability
          status: sensorData ? 'Online' : device.status,
          lastUpdate: sensorData ? new Date() : device.lastUpdate
        }))
      },
      calendar: mockCalendarData, // No real calendar data yet
      location: {
        ...mockLocationData,
        // Update location data with real GPS coordinates if available
        farmCenter: sensorData ? {
          lat: sensorData.gpsLocation.latitude,
          lng: sensorData.gpsLocation.longitude,
        } : mockLocationData.farmCenter,
        sensorLocations: [
          {
            id: 'sensor-gps',
            name: 'GPS Tracker',
            lat: sensorData ? sensorData.gpsLocation.latitude : mockLocationData.farmCenter.lat,
            lng: sensorData ? sensorData.gpsLocation.longitude : mockLocationData.farmCenter.lng,
            type: 'location',
          },
          ...mockLocationData.sensorLocations,
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    
    // Return mock data as absolute last resort fallback
    return {
      weather: mockWeatherData,
      airQuality: mockAirQualityData,
      soil: mockSoilData,
      crop: mockCropData,
      system: mockSystemData,
      calendar: mockCalendarData,
      location: mockLocationData
    };
  }
};

/**
 * Generates alert history based on sensor thresholds for Temperature, Humidity, CO₂, and NH₃.
 * Thresholds used:
 * - Temperature: Alert if > 30°C or < 15°C
 * - Humidity: Alert if < 40% or > 80%
 * - CO₂: Alert if > 1000 ppm
 * - NH₃: Alert if > 25 ppb
 */
const getAlertHistory = async () => {
  try {
    const sensorData = await fetchSensorData();
    // Start with any existing alerts (from mock data) if needed, or an empty array
    const alerts = [...mockSystemData.alerts];
    
    // Temperature Alerts
    if (sensorData.temperature > 35) {
      alerts.unshift({
        id: `alert-temp-${Date.now()}`,
        type: 'warning',
        message: `High temperature detected: ${sensorData.temperature}°C`,
        timestamp: new Date(),
        acknowledged: false,
      });
    } else if (sensorData.temperature < 15) {
      alerts.unshift({
        id: `alert-temp-${Date.now()}`,
        type: 'warning',
        message: `Low temperature detected: ${sensorData.temperature}°C`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
    
    // Humidity Alerts
    if (sensorData.humidity < 40) {
      alerts.unshift({
        id: `alert-humidity-${Date.now()}`,
        type: 'warning',
        message: `Low humidity detected: ${sensorData.humidity}%`,
        timestamp: new Date(),
        acknowledged: false,
      });
    } else if (sensorData.humidity > 80) {
      alerts.unshift({
        id: `alert-humidity-${Date.now()}`,
        type: 'warning',
        message: `High humidity detected: ${sensorData.humidity}%`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
    
    // CO₂ Alert
    if (sensorData.co2 > 1000) {
      alerts.unshift({
        id: `alert-co2-${Date.now()}`,
        type: 'warning',
        message: `Elevated CO₂ levels: ${sensorData.co2} ppm`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
    
    // NH₃ Alert
    if (sensorData.nh3 > 25) {
      alerts.unshift({
        id: `alert-nh3-${Date.now()}`,
        type: 'warning',
        message: `Elevated NH₃ levels: ${sensorData.nh3} ppb`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('Error generating alert history:', error);
    return mockSystemData.alerts;
  }
};

// Service API
export const dataService2 = {
  // Weather data
  getWeatherData: async () => {
    return await fetchWeatherData();
  },

  // Air quality data
  getAirQualityData: async () => {
    return await fetchAirQualityData();
  },

  // Soil and environmental data
  getSoilData: async () => {
    return await fetchSoilData();
  },

  // Raw sensor data from Adafruit
  getSensorData: async () => {
    return await fetchSensorData();
  },

  // Environmental history
  getEnvironmentalHistory: async (days = 7) => {
    return await fetchEnvironmentalHistory(days);
  },

  // Crop and yield prediction data (still using mock data)
  getCropData: async () => {
    return { ...mockCropData };
  },

  // System stats data (updated with sensor status)
  getSystemData: async () => {
    try {
      const sensorData = await fetchSensorData();
      return {
        ...mockSystemData,
        devices: mockSystemData.devices.map(device => ({
          ...device,
          // Update device status based on sensor data availability
          status: sensorData ? 'Online' : device.status,
          lastUpdate: sensorData ? new Date() : device.lastUpdate
        }))
      };
    } catch (error) {
      return mockSystemData;
    }
  },

  // Calendar data (still using mock data)
  getCalendarData: async () => {
    return { ...mockCalendarData };
  },

  // Location data (updated with real GPS data)
  getLocationData: async () => {
    try {
      const sensorData = await fetchSensorData();
      return {
        ...mockLocationData,
        farmCenter: {
          lat: sensorData.gpsLocation.latitude,
          lng: sensorData.gpsLocation.longitude,
        },
        sensorLocations: [
          {
            id: 'sensor-gps',
            name: 'GPS Tracker',
            lat: sensorData.gpsLocation.latitude,
            lng: sensorData.gpsLocation.longitude,
            type: 'location',
          },
          ...mockLocationData.sensorLocations,
        ],
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return mockLocationData;
    }
  },

  // Fetch all data at once (prioritizing real data)
  getAllData: async () => {
    return await fetchAllData();
  },

  // Alert history (updated threshold logic for sensor-related alerts)
  getAlertHistory: async () => {
    return await getAlertHistory();
  },
};

export default dataService2;
