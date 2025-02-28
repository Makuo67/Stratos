import axios from "axios";

// OpenWeatherMap API configuration
// You should store this in an environment variable in a real application
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;
const API_URL = "https://api.openweathermap.org/data/2.5";

// OpenWeatherMap weather condition mapping to our format
const weatherConditionMap: { [key: string]: string } = {
  "01d": "Sunny",
  "01n": "Clear",
  "02d": "Partly Cloudy",
  "02n": "Partly Cloudy",
  "03d": "Cloudy",
  "03n": "Cloudy",
  "04d": "Overcast",
  "04n": "Overcast",
  "09d": "Light Rain",
  "09n": "Light Rain",
  "10d": "Rain",
  "10n": "Rain",
  "11d": "Thunderstorm",
  "11n": "Thunderstorm",
  "13d": "Snow",
  "13n": "Snow",
  "50d": "Fog",
  "50n": "Fog",
};

// Interfaces for the weather data
export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    precipitation: number;
    updatedAt: Date;
    location: string;
    uv: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
  historical: {
    temperature: Array<{ time: string; value: number }>;
    precipitation: Array<{ time: string; value: number }>;
  };
}

/**
 * Converts wind direction in degrees to cardinal direction
 * @param deg Wind direction in degrees
 * @returns Cardinal direction (e.g., 'N', 'NE', 'E', etc.)
 */
const getWindDirection = (deg: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
  return directions[index];
};

/**
 * Converts temperature from Kelvin to Celsius
 * @param kelvin Temperature in Kelvin
 * @returns Temperature in Celsius
 */
const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

/**
 * Fetches current weather and forecast for a given location
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @param locationName Optional name of the location
 * @returns Weather data including current conditions and forecast
 */
export const getWeatherData = async (
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<WeatherData> => {
  try {
    // Fetch current weather
    const currentResponse = await axios.get(`${API_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: API_KEY,
      },
    });

    // Fetch 5-day forecast
    const forecastResponse = await axios.get(`${API_URL}/forecast`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: API_KEY,
      },
    });

    // Fetch UV index from OneCall API
    const oneCallResponse = await axios.get(
      `${API_URL}/onecall`, // Fixed URL path
      {
        params: {
          lat: latitude,
          lon: longitude,
          exclude: "minutely",
          appid: API_KEY,
        },
      }
    );

    const currentData = currentResponse.data;
    const forecastData = forecastResponse.data;
    const oneCallData = oneCallResponse.data;

    // Process forecast data
    const forecastDays = [];
    const dailyData = oneCallData.daily.slice(0, 5);

    // Add today
    forecastDays.push({
      day: "Today",
      high: kelvinToCelsius(dailyData[0].temp.max),
      low: kelvinToCelsius(dailyData[0].temp.min),
      condition:
        weatherConditionMap[dailyData[0].weather[0].icon] ||
        dailyData[0].weather[0].main,
      precipitation: dailyData[0].pop * 100, // Probability of precipitation (0-1)
    });

    // Add tomorrow
    forecastDays.push({
      day: "Tomorrow",
      high: kelvinToCelsius(dailyData[1].temp.max),
      low: kelvinToCelsius(dailyData[1].temp.min),
      condition:
        weatherConditionMap[dailyData[1].weather[0].icon] ||
        dailyData[1].weather[0].main,
      precipitation: dailyData[1].pop * 100,
    });

    // Add remaining days
    for (let i = 2; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecastDays.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        high: kelvinToCelsius(dailyData[i].temp.max),
        low: kelvinToCelsius(dailyData[i].temp.min),
        condition:
          weatherConditionMap[dailyData[i].weather[0].icon] ||
          dailyData[i].weather[0].main,
        precipitation: dailyData[i].pop * 100,
      });
    }

    // Process historical temperature data (using hourly forecast as a proxy)
    const hourlyTemp = oneCallData.hourly
      .slice(0, 8)
      .map((hour: any, index: number) => {
        const date = new Date(hour.dt * 1000);
        return {
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: kelvinToCelsius(hour.temp),
        };
      });

    // Process precipitation data
    const hourlyPrecip = oneCallData.hourly
      .slice(0, 8)
      .map((hour: any, index: number) => {
        const date = new Date(hour.dt * 1000);
        return {
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          value: hour.pop * 100 || 0, // Probability of precipitation (0-1)
        };
      });

    return {
      current: {
        temperature: kelvinToCelsius(currentData.main.temp),
        feelsLike: kelvinToCelsius(currentData.main.feels_like),
        condition:
          weatherConditionMap[currentData.weather[0].icon] ||
          currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: getWindDirection(currentData.wind.deg),
        pressure: currentData.main.pressure,
        visibility: currentData.visibility / 1000, // Convert meters to kilometers
        precipitation: oneCallData.hourly[0].pop * 100 || 0,
        updatedAt: new Date(),
        location:
          locationName || `${currentData.name}, ${currentData.sys.country}`,
        uv: oneCallData.current.uvi,
      },
      forecast: forecastDays,
      historical: {
        temperature: hourlyTemp,
        precipitation: hourlyPrecip,
      },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

/**
 * Fetches air quality data for a given location
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @returns Air quality data
 */
export const getAirQualityData = async (
  latitude: number,
  longitude: number
) => {
  try {
    const response = await axios.get(
      `${API_URL}/air_pollution`, // Using the API_URL constant
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
        },
      }
    );

    const aqiData = response.data.list[0];

    // Map AQI value to status
    const getAqiStatus = (aqi: number) => {
      switch (aqi) {
        case 1:
          return "good";
        case 2:
          return "good";
        case 3:
          return "moderate";
        case 4:
          return "moderate";
        case 5:
          return "unhealthy";
        default:
          return "good";
      }
    };

    // Process the response to match our API format
    return {
      current: {
        aqi: Math.round(aqiData.main.aqi * 20), // Scale from 1-5 to AQI scale
        mainPollutant: "PM2.5",
        status: getAqiStatus(aqiData.main.aqi),
        updatedAt: new Date(),
        location: "Weather Station",
      },
      indicators: [
        {
          name: "CO2",
          value: 420, // Placeholder, not provided by OpenWeatherMap
          max: 1000,
          unit: "ppm",
          status: "good",
        },
        {
          name: "CO",
          value: Math.round(aqiData.components.co),
          max: 9,
          unit: "ppm",
          status: aqiData.components.co > 4 ? "moderate" : "good",
        },
        {
          name: "NH3",
          value: Math.round(aqiData.components.nh3),
          max: 50,
          unit: "ppm",
          status: aqiData.components.nh3 > 25 ? "moderate" : "good",
        },
        {
          name: "PM2.5",
          value: Math.round(aqiData.components.pm2_5),
          max: 35,
          unit: "μg/m³",
          status: aqiData.components.pm2_5 > 15 ? "moderate" : "good",
        },
        {
          name: "PM10",
          value: Math.round(aqiData.components.pm10),
          max: 150,
          unit: "μg/m³",
          status: aqiData.components.pm10 > 75 ? "moderate" : "good",
        },
        {
          name: "O3",
          value: Math.round(aqiData.components.o3),
          max: 100,
          unit: "ppb",
          status: aqiData.components.o3 > 50 ? "moderate" : "good",
        },
      ],
      historical: {
        aqi: Array(7)
          .fill(0)
          .map((_, i) => ({
            time: new Date(
              Date.now() - i * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", { weekday: "short" }),
            value: Math.round(40 + Math.random() * 30),
          }))
          .reverse(),
        co2: Array(7)
          .fill(0)
          .map((_, i) => ({
            time: new Date(
              Date.now() - i * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", { weekday: "short" }),
            value: Math.round(400 + Math.random() * 30),
          }))
          .reverse(),
      },
    };
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    throw error;
  }
};

// Export a default object with all the functions
const weatherService = {
  getWeatherData,
  getAirQualityData,
};

export default weatherService;
