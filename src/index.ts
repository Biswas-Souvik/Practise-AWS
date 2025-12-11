import 'dotenv/config';
import { handler } from './gif_generator.ts';

const event = {
  rawPath: '/gif-gen/hi-everyone',
};

const gif = await handler(event);
console.log(gif)