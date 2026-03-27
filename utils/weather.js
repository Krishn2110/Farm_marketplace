// weather.js
import axios from "axios";

const WEATHER_KEY="9ef857d22b6baf73a46c07d947fbf0aa"

const getWeather = async (city) => {
  try {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: WEATHER_KEY,
          units: "metric"
        }
      }
    );

    console.log("API SUCCESS:", res.data.name);

    return {
      temp: res.data.main.temp,
      rainfall: res.data.rain?.["1h"] || 0
    };

  } catch (error) {
    console.error("❌ Weather API Error FULL:", error.response?.data || error.message);

    return {
      temp: 25,
      rainfall: 0
    };
  }
};
export default getWeather;