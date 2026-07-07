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
import midtransRoutes from './routes/midtransRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import authRoutes from './routes/authRoutes.js';


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

// General rate limiting (excludes high-frequency polling endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
});
app.use('/api/', (req, res, next) => {
  // Skip general limiter for status polling (has its own limiter below)
  if (req.path.match(/^\/tokens\/purchase\/[^/]+\/status$/)) return next();
  limiter(req, res, next);
});

// Higher limit for payment status polling (legitimate 3s interval)
const pollLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cek status terlalu sering. Silakan tunggu sebentar.' },
});
app.use('/api/tokens/purchase/:orderId/status', pollLimiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan AI. Silakan coba lagi.' },
});
app.use('/api/cv/generate-summary', aiLimiter);
app.use('/api/cv/analyze-job-match', aiLimiter);
app.use('/api/letter/generate', aiLimiter);

// Stricter rate limit for registration (account farming prevention)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 10,                   // maks 10 registrasi per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.' },
});
app.use('/api/auth/register', registerLimiter);

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
app.use('/api/midtrans', midtransRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use(Sentry.expressErrorHandler());
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

// Prevent hanging connections on slow upstreams
server.timeout = 30000;       // 30s per request
server.keepAliveTimeout = 5000;
server.headersTimeout = 6500; // > keepAliveTimeout

export default app;
