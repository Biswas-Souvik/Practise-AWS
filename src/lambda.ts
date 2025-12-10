import dotenv from 'dotenv';

dotenv.config();
const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = process.env.WEATHER_API_BASE_URL;

interface WeatherResponse {
  location : {
    name: string;
    region: string;
    country: string;
    localtime: string;
  }
  current: {
    temp_c: number;
    condition: {
      text: string;
    }
    humidity: number;
    wind_kph: number;
  }
}

export const handler = async (event) => {
  // TODO implement
  try {
    const { city } = event;
    const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`;

    const resp = await fetch(url);
    const data: WeatherResponse = await resp.json()
    
    const output = `
      Weather in ${data.location.name}, ${data.location.country}
      Temperature: ${data.current.temp_c}°C
      Condition: ${data.current.condition.text}
      Humidity: ${data.current.humidity}%
      Wind: ${data.current.wind_kph} km/h
    `;

    return output;
  } catch (err) {
    console.error("Fetch Weather Error: ", err)
  }
};

const event = {
  city: 'bengaluru',
};

const resp = await handler(event);
console.log(resp)