import 'dotenv/config';
import { handler } from './gif_generator.ts';
import {
  getPresignedUrl,
  getPresignedUrlPut,
  getS3Object,
} from './s3_operations.ts';

const output = await getPresignedUrlPut(
  'practise-s3bucket-souvik',
  'Personal/sample.txt'
);
