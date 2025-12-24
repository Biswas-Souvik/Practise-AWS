import { S3Client, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import { getS3Object, listS3Objects } from '../src/s3.utils';

jest.mock('@aws-sdk/client-s3');

describe('s3.utils', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    S3Client.prototype.send = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gets3object', () => {
    test('gets an object from S3', async () => {
      const bucketName = 'test-bucket';
      const key = 'test-key';
      const mockData = 'Hello, world!';

      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: jest.fn().mockResolvedValueOnce(mockData),
        },
      });

      const objectData = await getS3Object(bucketName, key);
      console.log(objectData);
      expect(objectData).toBe(mockData);
    });
  });

  describe('lists3objects', () => {
    test('lists objects in S3 bucket', async () => {
      const bucketName = 'test-bucket';
      const pageSize = 2;

      const mockPaginator = (async function* () {
        yield { Contents: [{ Key: 'file1.txt' }, { Key: 'file2.txt' }] };
        yield { Contents: [{ Key: 'file3.txt' }] };
      })();

      (paginateListObjectsV2 as jest.Mock).mockReturnValueOnce(mockPaginator);

      await listS3Objects(bucketName, pageSize);

      expect(paginateListObjectsV2).toHaveBeenCalledWith(
        { client: expect.any(Object), pageSize },
        { Bucket: bucketName }
      );
    });
  });
});
