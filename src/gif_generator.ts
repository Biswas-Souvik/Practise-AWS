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


interface GifAPIResponse {
  statusCode : number;
  isBase64Encoded: boolean;
  headers: {
    'Content-Type': string
  };
  body: string
}

const GIF_API_KEY = process.env.GIF_API_KEY;
const GIF_API_BASE_URL = process.env.GIF_API_BASE_URL;

const createResponse = (
  respBody: string, 
  statusCode: number = 200, 
  contentType: string = 'application/json', 
  isBase64Encoded: boolean = false
): GifAPIResponse => {
  return {
    statusCode,
    headers: { 'Content-Type': contentType },
    isBase64Encoded,
    body: JSON.stringify(respBody),
  };
};

export const handler = async (event: Event): Promise<GifAPIResponse> => {
  // TODO implement
  try {
    if (!GIF_API_KEY || !GIF_API_BASE_URL) return createResponse('Missing Environment Variables', 400)
    
    if (!event.rawPath) return createResponse('Missing Path', 400)
    const paths = event.rawPath.split('/').filter(Boolean);

    if (paths.length > 2) return createResponse('Invalid path: too many segments', 400)
    
    if (paths[0] !== 'gif-gen') return createResponse('Invalid path', 400)
    if ( !paths[1] ) return createResponse('Missing Prompt', 400)
    
    const prompt = decodeURIComponent(paths[1]);
    const url = `${GIF_API_BASE_URL}?api_key=${GIF_API_KEY}&q=${prompt}&limit=1`;

    const resp = await fetch(url);
    if (!resp.ok) {
      return createResponse(`Giphy API Error: ${resp.statusText}`, 502);
    }

    const resp_json: GiphyResponse = await resp.json();

    const gif_url = resp_json?.data?.[0]?.images?.original?.url;
    if (!gif_url)
      return createResponse('No GIF found', 404)

    const gif = await fetch(gif_url)

    if (!gif.ok) {
      return createResponse('Failed to Download Gif', 502);
    }
    const arrayBuffer = await gif.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return createResponse(base64, 200, "image/gif", true)
  
  } catch (err) {
    console.error(err);
    return createResponse('Internal server error: ' + err, 500)
  }
};
