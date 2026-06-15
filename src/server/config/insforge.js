import { createClient } from '@insforge/sdk';
import { config } from './env.js';

export const insforge = createClient({
  baseUrl: config.insforge.url,
  anonKey: config.insforge.serviceKey,
  isServerMode: true,
});
