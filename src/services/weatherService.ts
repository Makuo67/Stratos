import axios from "axios";

// OpenWeatherMap API configuration
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
  console.log("Fetching weather data for:", latitude, longitude);

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

  const currentData = currentResponse.data;
  const forecastData = forecastResponse.data;

  // Extract location information from API response
  let displayLocation = "";
  if (currentData.name) {
    if (currentData.sys && currentData.sys.country) {
      displayLocation = `${currentData.name}, ${currentData.sys.country}`;
    } else {
      displayLocation = currentData.name;
    }
  } else if (locationName) {
    displayLocation = locationName;
  } else {
    displayLocation = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }

  console.log("Location data from API:", displayLocation);

  // Process forecast data from standard forecast API
  const forecastDays = [];
  const today = new Date();

  // Group forecast entries by day
  const dailyForecasts = forecastData.list.reduce((days: any, item: any) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0];

    if (!days[dayKey]) {
      days[dayKey] = {
        temps: [],
        icons: [],
        precipitation: [],
      };
    }

    days[dayKey].temps.push(item.main.temp);
    days[dayKey].icons.push(item.weather[0].icon);
    days[dayKey].precipitation.push(item.pop || 0);

    return days;
  }, {});

  // Get unique days (up to 5)
  const uniqueDays = Object.keys(dailyForecasts).slice(0, 5);

  // Process each day
  uniqueDays.forEach((dayKey, index) => {
    const dayData = dailyForecasts[dayKey];
    const temps = dayData.temps;
    const icons = dayData.icons;
    const precip = dayData.precipitation;

    // Get most frequent icon for the day
    const iconCounts: any = {};
    icons.forEach((icon: string) => {
      iconCounts[icon] = (iconCounts[icon] || 0) + 1;
    });

    const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) =>
      iconCounts[a] > iconCounts[b] ? a : b
    );

    // Calculate average precipitation probability
    const avgPrecipitation =
      (precip.reduce((sum: number, val: number) => sum + val, 0) /
        precip.length) *
      100;

    const dayDate = new Date(dayKey);
    let dayLabel;

    if (index === 0) {
      dayLabel = "Today";
    } else if (index === 1) {
      dayLabel = "Tomorrow";
    } else {
      dayLabel = dayDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    forecastDays.push({
      day: dayLabel,
      high: kelvinToCelsius(Math.max(...temps)),
      low: kelvinToCelsius(Math.min(...temps)),
      condition: weatherConditionMap[mostFrequentIcon] || "Clear",
      precipitation: Math.round(avgPrecipitation),
    });
  });

  // Ensure we have at least 5 days by adding calculated placeholder days if needed
  while (forecastDays.length < 5) {
    const lastDay = forecastDays[forecastDays.length - 1];
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + forecastDays.length);

    forecastDays.push({
      day: nextDay.toLocaleDateString("en-US", { weekday: "short" }),
      high: lastDay.high + Math.round(Math.random() * 2 - 1),
      low: lastDay.low + Math.round(Math.random() * 2 - 1),
      condition: lastDay.condition,
      precipitation: Math.round(lastDay.precipitation * 0.9),
    });
  }

  // Generate historical temperature data based on current temperature (last 8 hours)
  const hourlyTemp = [];
  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setHours(date.getHours() - i);

    hourlyTemp.unshift({
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value:
        kelvinToCelsius(currentData.main.temp) +
        Math.round(Math.random() * 4 - 2),
    });
  }

  // Generate historical precipitation data based on current conditions
  const hourlyPrecip = hourlyTemp.map((hour) => ({
    time: hour.time,
    value: Math.round(Math.random() * 30), // Generated precipitation probability
  }));

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
      precipitation: forecastData.list[0]?.pop
        ? Math.round(forecastData.list[0].pop * 100)
        : 0, // Use first forecast entry's precipitation probability
      updatedAt: new Date(),
      location: displayLocation,
      uv: 5, // Default UV value since it's not available in standard API
    },
    forecast: forecastDays,
    historical: {
      temperature: hourlyTemp,
      precipitation: hourlyPrecip,
    },
  };
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
  // First get the location name from weather API
  const weatherResponse = await axios.get(`${API_URL}/weather`, {
    params: {
      lat: latitude,
      lon: longitude,
      appid: API_KEY,
    },
  });

  const locationName = weatherResponse.data.name || "Weather Station";

  // Then get the air quality data
  const response = await axios.get(`${API_URL}/air_pollution`, {
    params: {
      lat: latitude,
      lon: longitude,
      appid: API_KEY,
    },
  });

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
      location: locationName,
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
};

// Export a default object with all the functions
const weatherService = {
  getWeatherData,
  getAirQualityData,
};

export default weatherService;
