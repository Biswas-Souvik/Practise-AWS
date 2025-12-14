interface GifAPIResponse {
  statusCode : number;
  isBase64Encoded: boolean;
  headers: {
    'Content-Type': string
  };
  body: string
}

export const createResponse = (
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


