interface Event {
  headers: { origin: string };
  queryStringParameters: { city: string };
}

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.API_BASE_URL;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

export const handler = async (event: Event) => {
  // TODO implement
  try {
    console.log(event);

    const origin = event?.headers?.origin;
    let corsHeader = '';

    if (allowedOrigins.includes(origin)) {
      corsHeader = origin;
    }
    const { city } = event.queryStringParameters;
    const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`;

    const resp = await fetch(url);
    const data = await resp.json();

    const output = {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      wind: data.current.wind_kph + ' km/h',
    };
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsHeader,
      },
      body: JSON.stringify(output),
    };
  } catch (err) {
    console.error('Fetch Weather Error: ', err);
  }
};
