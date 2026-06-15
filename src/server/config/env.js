import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  insforge: {
    url: process.env.INSFORGE_URL,
    serviceKey: process.env.INSFORGE_SERVICE_KEY,
    anonKey: process.env.INSFORGE_ANON_KEY,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
};
