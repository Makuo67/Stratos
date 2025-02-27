
import { 
  weatherData, 
  airQualityData, 
  soilData, 
  cropData, 
  systemData,
  calendarData,
  locationData
} from '../data/mockData';

// Service to simulate API calls with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dataService = {
  // Weather data
  getWeatherData: async () => {
    await delay(800);
    return { ...weatherData };
  },

  // Air quality data
  getAirQualityData: async () => {
    await delay(600);
    return { ...airQualityData };
  },

  // Soil and environmental data
  getSoilData: async () => {
    await delay(700);
    return { ...soilData };
  },

  // Crop and yield prediction data
  getCropData: async () => {
    await delay(900);
    return { ...cropData };
  },

  // System stats data
  getSystemData: async () => {
    await delay(500);
    return { ...systemData };
  },

  // Calendar data
  getCalendarData: async () => {
    await delay(400);
    return { ...calendarData };
  },

  // Location data
  getLocationData: async () => {
    await delay(600);
    return { ...locationData };
  },

  // Fetch all data at once
  getAllData: async () => {
    await delay(1000);
    return {
      weather: { ...weatherData },
      airQuality: { ...airQualityData },
      soil: { ...soilData },
      crop: { ...cropData },
      system: { ...systemData },
      calendar: { ...calendarData },
      location: { ...locationData },
    };
  },

  // Mock endpoints for additional predictions
  getPredictions: async () => {
    await delay(1200);
    return {
      yieldPrediction: {
        current: 85,
        previous: 78,
        change: 9,
        forecastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      disasterRisk: {
        flood: 15,
        drought: 35,
        pest: 20,
        disease: 10,
        forecast: '30 days',
      },
      recommendations: [
        { action: 'Increase Irrigation', priority: 'High', reason: 'Expected dry period' },
        { action: 'Apply Organic Pesticide', priority: 'Medium', reason: 'Preventative measure' },
        { action: 'Soil Testing', priority: 'Low', reason: 'Regular monitoring' },
      ],
    };
  },

  // Mock endpoint for alert history
  getAlertHistory: async () => {
    await delay(700);
    return [
      ...systemData.alerts,
      { id: 'alert-005', type: 'critical', message: 'Excessive rainfall detected', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), acknowledged: true },
      { id: 'alert-006', type: 'warning', message: 'Temperature below optimal for crop growth', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), acknowledged: true },
      { id: 'alert-007', type: 'info', message: 'Harvest conditions optimal next week', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), acknowledged: true },
    ];
  },
};
