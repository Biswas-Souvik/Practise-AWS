import {
  S3Client,
  S3ServiceException,
  paginateListObjectsV2,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { XMLParser } from 'fast-xml-parser';
import https from 'node:https';
import { once } from 'events';

export const listS3Objects = async (bucketName: string, pageSize: number) => {
  const client = new S3Client({});
  const objects = [];
  try {
    const paginator = paginateListObjectsV2(
      { client, pageSize },
      { Bucket: bucketName }
    );

    for await (const page of paginator) {
      console.log('Page:', page);
      if (page.Contents) objects.push(page.Contents.map((o) => o.Key));
    }
    objects.forEach((objectList, pageNum) => {
      console.log(
        `Page ${pageNum + 1}\n------\n${objectList
          .map((o) => `• ${o}`)
          .join('\n')}\n`
      );
    });
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === 'NoSuchBucket'
    ) {
      console.error(
        `Error from S3 while listing objects for "${bucketName}". The bucket doesn't exist.`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while listing objects for "${bucketName}".  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

export const getS3Object = async (bucketName: string, key: string) => {
  const client = new S3Client({});

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    if (!response)
      throw new Error(`The object "${key}" from "${bucketName}" is empty.`);
    // const str = await response;
    console.log(await response.Body?.transformToString);
  } catch (caught) {
    if (caught instanceof NoSuchKey) {
      console.error(
        `Error from S3 while getting object "${key}" from "${bucketName}". No such key exists.`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while getting object from ${bucketName}.  ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

const createPresignedUrlWithClient = ({ bucket, key }: any) => {
  const client = new S3Client({});
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 300 });
};

export const getPresignedUrl = async (bucketName: string, key: string) => {
  try {
    const clientUrl = await createPresignedUrlWithClient({
      bucket: bucketName,
      key,
    });

    console.log('Presigned URL with client');
    console.log(clientUrl);
    return clientUrl;
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'CredentialsProviderError') {
      console.error(
        `There was an error getting your credentials. Are your local credentials configured?\n${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};

const createPresignedUrlWithClientPut = (bucket: string, key: string) => {
  const client = new S3Client({});
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const put = async (url: string, data: string) => {
  const req = https.request(url, {
    method: 'PUT',
    headers: {
      'Content-Length': Buffer.byteLength(data),
    },
  });

  req.write(data);
  req.end();

  const [res] = await once(req, 'response');

  let body = '';
  for await (const chunk of res) {
    body += chunk;
  }

  if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
    return { success: true };
  }

  throw res.statusCode + ' ' + body;
};

export const getPresignedUrlPut = async (bucketName: string, key: string) => {
  try {
    const clientUrl = await createPresignedUrlWithClientPut(bucketName, key);

    console.log(clientUrl);
    console.log('Calling PUT using presigned URL with client');

    await put(clientUrl, 'Hello World');

    console.log('\nDone. Check your S3 console.');
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'CredentialsProviderError') {
      console.error(
        `There was an error getting your credentials. Are your local credentials configured?\n${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};
