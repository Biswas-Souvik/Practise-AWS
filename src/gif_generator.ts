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

type ResponseBody = { url: string; error?: never } | { error: string; url?: never };

interface GifAPIResponse {
  statusCode : number;
  headers: {
    'Content-Type': 'application/json'
  };
  body: string
}

const GIF_API_KEY = process.env.GIF_API_KEY;
const GIF_API_BASE_URL = process.env.GIF_API_BASE_URL;

const createResponse = (respBody: ResponseBody, statusCode: number = 200): GifAPIResponse => {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(respBody),
  };
}

export const handler = async (event: Event): Promise<GifAPIResponse> => {
  // TODO implement
  try {
    const [_, path, prompt] = event.rawPath.split('/');
    if (path !== 'gif-gen')
      return createResponse({ error: 'Invalid path' }, 400)

    const url = `${GIF_API_BASE_URL}?api_key=${GIF_API_KEY}&q=${prompt}&limit=1`;

    const resp = await fetch(url);
    const resp_json: GiphyResponse = await resp.json();

    const gif_url = resp_json?.data?.[0]?.images?.original?.url;

    if (!gif_url)
      return createResponse({ error: 'No GIF found' }, 404)

    return createResponse({ url: gif_url })
  } catch (err) {
    console.error(err);
    return createResponse({ error: 'Internal server error: ' + err}, 500)
  }
};

