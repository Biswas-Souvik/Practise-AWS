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
};

export const handler = async (event: Event): Promise<GifAPIResponse> => {
  // TODO implement
  try {
    if (!GIF_API_KEY || !GIF_API_BASE_URL) return createResponse({ error: 'Missing Environment Variables' }, 400)
    
    if (!event.rawPath) return createResponse({ error: 'Missing Path' }, 400)
    const paths = event.rawPath.split('/').filter(Boolean);

    if (paths.length > 2) return createResponse({ error: 'Invalid path: too many segments' }, 400)
    
    if (paths[0] !== 'gif-gen') return createResponse({ error: 'Invalid path' }, 400)
    if ( !paths[1] ) return createResponse({ error: 'Missing Prompt' }, 400)
    
    const prompt = decodeURIComponent(paths[1]);
    const url = `${GIF_API_BASE_URL}?api_key=${GIF_API_KEY}&q=${prompt}&limit=1`;

    const resp = await fetch(url);
    if (!resp.ok) {
      return createResponse({ error: `Giphy API Error: ${resp.statusText}` }, 502);
    }

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
