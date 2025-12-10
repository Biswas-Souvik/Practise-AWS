import { handler } from './gif_generator.js';
import dotenv from 'dotenv';
dotenv.config();

const event = {
  rawPath: '/gif-gen/hi-everyone',
};

const gif = await handler(event);
console.log(gif)