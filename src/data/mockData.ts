
// Mock data for the IoT dashboard

// Current date/time for consistency
const NOW = new Date();

// Weather data
export const weatherData = {
  current: {
    temperature: 24,
    feelsLike: 26,
    condition: 'Partly Cloudy',
    humidity: 68,
    windSpeed: 5.2,
    windDirection: 'NE',
    pressure: 1012,
    visibility: 10,
    precipitation: 0,
    updatedAt: NOW,
    location: 'Farm Central, Green Valley',
    uv: 4,
  },
  forecast: [
    { day: 'Today', high: 26, low: 18, condition: 'Partly Cloudy', precipitation: 20 },
    { day: 'Tomorrow', high: 28, low: 19, condition: 'Sunny', precipitation: 0 },
    { day: 'Thu', high: 27, low: 20, condition: 'Sunny', precipitation: 0 },
    { day: 'Fri', high: 25, low: 19, condition: 'Cloudy', precipitation: 40 },
    { day: 'Sat', high: 24, low: 18, condition: 'Light Rain', precipitation: 60 },
  ],
  historical: {
    temperature: [
      { time: '00:00', value: 19 },
      { time: '03:00', value: 18 },
      { time: '06:00', value: 18 },
      { time: '09:00', value: 21 },
      { time: '12:00', value: 23 },
      { time: '15:00', value: 24 },
      { time: '18:00', value: 22 },
      { time: '21:00', value: 20 },
    ],
    precipitation: [
      { time: '00:00', value: 0 },
      { time: '03:00', value: 0 },
      { time: '06:00', value: 0 },
      { time: '09:00', value: 0 },
      { time: '12:00', value: 0 },
      { time: '15:00', value: 0 },
      { time: '18:00', value: 0 },
      { time: '21:00', value: 0 },
    ],
  },
};

// Air quality data
export const airQualityData = {
  current: {
    aqi: 62,
    mainPollutant: 'PM2.5',
    status: 'Moderate',
    updatedAt: NOW,
    location: 'Farm Central, Green Valley',
  },
  indicators: [
    { name: 'CO2', value: 420, max: 1000, unit: 'ppm', status: 'good' },
    { name: 'CO', value: 0.8, max: 9, unit: 'ppm', status: 'good' },
    { name: 'NH3', value: 12, max: 50, unit: 'ppm', status: 'good' },
    { name: 'PM2.5', value: 18, max: 35, unit: 'μg/m³', status: 'moderate' },
    { name: 'PM10', value: 45, max: 150, unit: 'μg/m³', status: 'good' },
    { name: 'O3', value: 52, max: 100, unit: 'ppb', status: 'moderate' },
  ],
  historical: {
    aqi: [
      { time: 'Mon', value: 45 },
      { time: 'Tue', value: 52 },
      { time: 'Wed', value: 62 },
      { time: 'Thu', value: 58 },
      { time: 'Fri', value: 65 },
      { time: 'Sat', value: 60 },
      { time: 'Sun', value: 50 },
    ],
    co2: [
      { time: 'Mon', value: 410 },
      { time: 'Tue', value: 405 },
      { time: 'Wed', value: 420 },
      { time: 'Thu', value: 415 },
      { time: 'Fri', value: 425 },
      { time: 'Sat', value: 430 },
      { time: 'Sun', value: 418 },
    ],
  },
};

// Soil and environmental data
export const soilData = {
  current: {
    moisture: 38,
    temperature: 22,
    pH: 6.8,
    nitrogen: 42,
    phosphorus: 38,
    potassium: 45,
    updatedAt: NOW,
    location: 'Field A, North-East Corner',
  },
  zones: [
    { name: 'Field A', moisture: 38, temperature: 22, status: 'Optimal' },
    { name: 'Field B', moisture: 32, temperature: 23, status: 'Needs Water' },
    { name: 'Field C', moisture: 42, temperature: 21, status: 'Optimal' },
    { name: 'Greenhouse', moisture: 45, temperature: 25, status: 'Optimal' },
  ],
  historical: {
    moisture: [
      { time: 'May 1', value: 40 },
      { time: 'May 2', value: 39 },
      { time: 'May 3', value: 37 },
      { time: 'May 4', value: 35 },
      { time: 'May 5', value: 33 },
      { time: 'May 6', value: 36 },
      { time: 'May 7', value: 38 },
    ],
  },
};

// Crop and yield prediction data
export const cropData = {
  current: {
    predictedYield: 85,
    harvestDate: new Date(NOW.getFullYear(), NOW.getMonth() + 1, 15),
    status: 'Healthy',
    growthStage: 'Flowering',
    daysToHarvest: 30,
  },
  risks: [
    { name: 'Drought', probability: 15, impact: 'High', timeframe: '2 weeks' },
    { name: 'Pest Infestation', probability: 25, impact: 'Medium', timeframe: '1 week' },
    { name: 'Nutrient Deficiency', probability: 10, impact: 'Medium', timeframe: 'Current' },
  ],
  recommendations: [
    { action: 'Increase Irrigation', priority: 'High', reason: 'Expected dry period next week' },
    { action: 'Apply Organic Pesticide', priority: 'Medium', reason: 'Preventative measure for potential pests' },
    { action: 'Soil Test', priority: 'Low', reason: 'Routine monitoring' },
  ],
};

// System stats data
export const systemData = {
  devices: [
    { id: 'sensor-001', name: 'Weather Station', status: 'Online', battery: 82, lastUpdate: NOW },
    { id: 'sensor-002', name: 'Soil Sensor Array', status: 'Online', battery: 65, lastUpdate: NOW },
    { id: 'sensor-003', name: 'Air Quality Monitor', status: 'Online', battery: 78, lastUpdate: NOW },
    { id: 'sensor-004', name: 'Field Camera', status: 'Warning', battery: 30, lastUpdate: new Date(NOW.getTime() - 3600000) },
    { id: 'sensor-005', name: 'Irrigation Controller', status: 'Online', battery: 90, lastUpdate: NOW },
  ],
  alerts: [
    { id: 'alert-001', type: 'warning', message: 'Field Camera battery low (30%)', timestamp: new Date(NOW.getTime() - 1800000), acknowledged: false },
    { id: 'alert-002', type: 'info', message: 'System update available for Weather Station', timestamp: new Date(NOW.getTime() - 86400000), acknowledged: true },
    { id: 'alert-003', type: 'critical', message: 'Potential water leak detected in Irrigation Zone B', timestamp: new Date(NOW.getTime() - 3600000), acknowledged: false },
    { id: 'alert-004', type: 'warning', message: 'Soil moisture below threshold in Field B', timestamp: new Date(NOW.getTime() - 7200000), acknowledged: true },
  ],
};

// Calendar with agricultural events
export const calendarData = {
  month: 'November',
  year: 2024,
  days: Array.from({ length: 35 }, (_, i) => {
    const day = i - 3; // Start with last days of previous month
    const isCurrentMonth = day > 0 && day <= 30;
    const date = isCurrentMonth ? day : (day <= 0 ? 31 + day : day - 30);
    const isToday = isCurrentMonth && date === 15; // Just for example

    let events = [];
    if (isCurrentMonth) {
      if (date === 3) events.push({ name: 'Fertilize Field A', color: 'bg-stratos-500' });
      if (date === 10) events.push({ name: 'Irrigation Maintenance', color: 'bg-blue-500' });
      if (date === 15) events.push({ name: 'Crop Inspection', color: 'bg-green-500' });
      if (date === 22) events.push({ name: 'Harvest Planning', color: 'bg-orange-500' });
    }

    return {
      date,
      isCurrentMonth,
      isToday,
      events,
    };
  }),
};

// Location data for the farm map
export const locationData = {
  farmCenter: { lat: 37.7749, lng: -122.4194 }, // Example coordinates
  sensorLocations: [
    { id: 'sensor-001', name: 'Weather Station', lat: 37.7749, lng: -122.4184, type: 'weather' },
    { id: 'sensor-002', name: 'Soil Sensor A', lat: 37.7739, lng: -122.4194, type: 'soil' },
    { id: 'sensor-003', name: 'Air Quality Monitor', lat: 37.7749, lng: -122.4204, type: 'air' },
    { id: 'sensor-004', name: 'Field Camera', lat: 37.7759, lng: -122.4194, type: 'camera' },
    { id: 'sensor-005', name: 'Irrigation Controller', lat: 37.7749, lng: -122.4174, type: 'irrigation' },
  ],
  boundaries: [
    { lat: 37.7769, lng: -122.4214 },
    { lat: 37.7769, lng: -122.4174 },
    { lat: 37.7729, lng: -122.4174 },
    { lat: 37.7729, lng: -122.4214 },
  ],
  zones: [
    { 
      name: 'Field A', 
      type: 'crop',
      crop: 'Corn',
      status: 'Healthy',
      coords: [
        { lat: 37.7769, lng: -122.4214 },
        { lat: 37.7769, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4214 },
      ] 
    },
    { 
      name: 'Field B', 
      type: 'crop',
      crop: 'Wheat',
      status: 'Needs Water',
      coords: [
        { lat: 37.7769, lng: -122.4194 },
        { lat: 37.7769, lng: -122.4174 },
        { lat: 37.7749, lng: -122.4174 },
        { lat: 37.7749, lng: -122.4194 },
      ] 
    },
    { 
      name: 'Field C', 
      type: 'crop',
      crop: 'Soybeans',
      status: 'Healthy',
      coords: [
        { lat: 37.7749, lng: -122.4214 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7729, lng: -122.4194 },
        { lat: 37.7729, lng: -122.4214 },
      ] 
    },
    { 
      name: 'Greenhouse', 
      type: 'structure',
      status: 'Active',
      coords: [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4174 },
        { lat: 37.7729, lng: -122.4174 },
        { lat: 37.7729, lng: -122.4194 },
      ] 
    },
  ],
};
