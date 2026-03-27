import axios from "axios";

export type Weather = {
  temp: number;
  rainfall: number;
};
const WEATHER_KEY="9ef857d22b6baf73a46c07d947fbf0aa"

export const getWeather = async (city: string): Promise<Weather> => {
  try {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: WEATHER_KEY,
          units: "metric",
        },
      }
    );

    return {
      temp: res.data.main.temp,
      rainfall: res.data.rain?.["1h"] || 0,
    };
  } catch (error: unknown) {
    let message = "Unknown weather error";

    if (typeof error === "object" && error !== null) {
      const maybeError = error as {
        message?: string;
        response?: { data?: unknown };
      };
      message = String(maybeError.response?.data ?? maybeError.message ?? message);
    }

    console.error("Weather Error:", message);

    return { temp: 25, rainfall: 0 };
  }
};
