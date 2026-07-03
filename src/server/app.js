import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { config } from './config/env.js';
import logger, { LoggerStream } from './config/logger.js';
import cvRoutes from './routes/cvRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [nodeProfilingIntegration()],
});

const app = express();
app.disable('etag');
app.use(helmet());
app.use(cors({ origin: config.cors.clientUrl }));
app.use(express.json({ limit: '5mb' }));

// HTTP Request Logging via Winston
app.use(morgan('combined', { stream: new LoggerStream() }));

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
});
app.use('/api/', limiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Batas AI generation tercapai. Silakan coba lagi nanti.' },
});
app.use('/api/cv/generate-summary', aiLimiter);
app.use('/api/cv/analyze-job-match', aiLimiter);
app.use('/api/letter/generate', aiLimiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GenCV API Docs',
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/cv', cvRoutes);
app.use('/api/letter', letterRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/profile', profileRoutes);

app.use(Sentry.expressErrorHandler());
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

export default app;
