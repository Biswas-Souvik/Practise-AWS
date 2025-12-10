import handler from './src/gif_generator.ts';
import dotenv from 'dotenv';
dotenv.config();

const event = {
  rawPath: '/gif-gen/hi-everyone',
};

const gif = await handler(event);
