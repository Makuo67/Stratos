import axios from "axios";

// This should be stored in environment variables in a real application
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Searches for a location by name and returns geocoding results
 * @param query Location query string (e.g., "London", "New York,US")
 * @param limit Maximum number of results to return
 * @returns Array of geocoding results
 */
export async function searchLocation(
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: query,
          limit,
          appid: API_KEY,
        },
      }
    );

    return response.data.map((item: any) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
    }));
  } catch (error) {
    console.error("Error searching for location:", error);
    throw new Error("Failed to search for location");
  }
}

/**
 * Gets the location name from coordinates using reverse geocoding
 * @param lat Latitude
 * @param lon Longitude
 * @returns Location name
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/geo/1.0/reverse",
      {
        params: {
          lat,
          lon,
          limit: 1,
          appid: API_KEY,
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return location.state
        ? `${location.name}, ${location.state}, ${location.country}`
        : `${location.name}, ${location.country}`;
    }

    return "Unknown Location";
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return "Unknown Location";
  }
}

// Export default object with all functions
const geocodingService = {
  searchLocation,
  reverseGeocode,
};

export default geocodingService;
