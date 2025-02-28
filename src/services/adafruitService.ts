import axios from 'axios';

// Adafruit IO configuration
const AIO_USERNAME = import.meta.env.VITE_ADAFRUIT_USERNAME;
const AIO_KEY = import.meta.env.VITE_ADAFRUIT_KEY;
const AIO_URL = 'https://io.adafruit.com/api/v2';

// Define the interfaces for the Adafruit IO feed data
export interface AdafruitFeedData {
  id: string;
  value: string;
  feed_id: number;
  feed_key: string;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  co2: number;
  co: number;
  nh3: number;
  gpsLocation: {
    speed: number;
    latitude: number;
    longitude: number;
    altitude: number;
  };
  timestamp: Date;
}

// Create an axios instance with the Adafruit IO API base URL and authentication
const adafruitApi = axios.create({
  baseURL: AIO_URL,
  headers: {
    'X-AIO-Key': AIO_KEY,
  },
});

/**
 * Fetches the latest data for a specific feed from Adafruit IO
 * @param feedKey The key of the feed to fetch
 * @returns The latest data for the specified feed
 */
export const getLatestFeedData = async (feedKey: string): Promise<AdafruitFeedData> => {
  try {
    const response = await adafruitApi.get(`/${AIO_USERNAME}/feeds/${feedKey}/data/last`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for feed ${feedKey}:`, error);
    throw error;
  }
};

/**
 * Fetches data for a specific feed for a given time period
 * @param feedKey The key of the feed to fetch
 * @param startTime The start time to fetch data from (ISO string)
 * @param endTime The end time to fetch data to (ISO string)
 * @returns An array of data points for the specified feed and time period
 */
export const getFeedDataHistory = async (
  feedKey: string,
  startTime: string,
  endTime: string
): Promise<AdafruitFeedData[]> => {
  try {
    const response = await adafruitApi.get(
      `/${AIO_USERNAME}/feeds/${feedKey}/data`,
      {
        params: {
          start_time: startTime,
          end_time: endTime,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for feed ${feedKey}:`, error);
    throw error;
  }
};

/**
 * Fetches the latest data for all the sensor feeds
 * @returns A consolidated object with all the sensor data
 */
export const getAllSensorData = async (): Promise<SensorData> => {
  try {
    // Fetch data from all the feeds in parallel
    const [temperatureData, humidityData, co2Data, coData, nh3Data, gpsData] = await Promise.all([
      getLatestFeedData('temperature'),
      getLatestFeedData('humidity'),
      getLatestFeedData('gas-co2'),
      getLatestFeedData('gas-co'),
      getLatestFeedData('gas-nh3'),
      getLatestFeedData('gps-location'),
    ]);

    // Parse GPS location data (format: "speed,latitude,longitude,altitude")
    const gpsValues = gpsData.value.split(',').map(parseFloat);

    // Create a consolidated object with all the sensor data
    return {
      temperature: parseFloat(temperatureData.value),
      humidity: parseFloat(humidityData.value),
      co2: parseFloat(co2Data.value),
      co: parseFloat(coData.value),
      nh3: parseFloat(nh3Data.value),
      gpsLocation: {
        speed: gpsValues[0],
        latitude: gpsValues[1],
        longitude: gpsValues[2],
        altitude: gpsValues[3],
      },
      timestamp: new Date(temperatureData.created_at),
    };
  } catch (error) {
    console.error('Error fetching all sensor data:', error);
    throw error;
  }
};

/**
 * Fetches historical data for temperature and humidity
 * @param days Number of days to fetch data for
 * @returns An object with historical data for temperature and humidity
 */
export const getEnvironmentalHistory = async (days: number = 7) => {
  // Calculate start and end times
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Fetch historical data for temperature and humidity in parallel
    const [temperatureHistory, humidityHistory, co2History, coHistory, nh3History] = await Promise.all([
      getFeedDataHistory('temperature', startTime, endTime),
      getFeedDataHistory('humidity', startTime, endTime),
      getFeedDataHistory('gas-co2', startTime, endTime),
      getFeedDataHistory('gas-co', startTime, endTime),
      getFeedDataHistory('gas-nh3', startTime, endTime),
    ]);

    // Process temperature history data
    const temperature = temperatureHistory.map(item => ({
      time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(item.value),
      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })).reverse();

    // Process humidity history data
    const humidity = humidityHistory.map(item => ({
      time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(item.value),
      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })).reverse();

    // Process gas history data
    const co2 = co2History.map(item => ({
      time: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      value: parseFloat(item.value),
    })).reverse();

    const co = coHistory.map(item => ({
      time: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      value: parseFloat(item.value),
    })).reverse();

    const nh3 = nh3History.map(item => ({
      time: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      value: parseFloat(item.value),
    })).reverse();

    return {
      temperature,
      humidity,
      co2,
      co,
      nh3
    };
  } catch (error) {
    console.error('Error fetching environmental history:', error);
    throw error;
  }
};

// Export a default object with all the functions
const adafruitService = {
  getLatestFeedData,
  getFeedDataHistory,
  getAllSensorData,
  getEnvironmentalHistory,
};

export default adafruitService;
