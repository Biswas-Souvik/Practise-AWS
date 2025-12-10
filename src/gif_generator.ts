interface Event {
  readonly rawPath: string
}

interface OriginalImage {
  url: string
}

interface GifImage {
  original: OriginalImage
}

interface GifObject {
  images: GifImage
}

interface GiphyResponse {
  data: GifObject[]
}

const GIF_API_KEY = process.env.GIF_API_KEY;
const GIF_API_BASE_URL = process.env.GIF_API_BASE_URL;

export const handler = async (event: Event) => {
  // TODO implement
  try {
    const [_, path, prompt] = event.rawPath.split('/');
    if (path !== 'gif-gen')
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid path' }),
      };

    const url = `${GIF_API_BASE_URL}?api_key=${GIF_API_KEY}&q=${prompt}&limit=1`;

    const resp = await fetch(url);
    const resp_json: GiphyResponse = await resp.json();

    const gif_url = resp_json?.data?.[0]?.images?.original?.url;

    if (!gif_url)
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No GIF found' }),
      };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: gif_url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', message: err }),
    };
  }
};

