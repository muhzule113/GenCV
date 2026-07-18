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
import { auth } from './config/auth.js';

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
app.set('trust proxy', 1);
const allowedOrigins = config.cors.clientUrls;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

// Health check — no auth, for orchestrator / load balancer
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Custom /me endpoint using Better Auth session
app.get('/api/auth/me', async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  res.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar_url: session.user.image,
      email_verified: session.user.emailVerified,
    },
    authenticated: true,
  });
});

// Tolak daftar manual jika email sudah ada (mis. lewat Google) —
// Better Auth default-nya mengembalikan sukses palsu (anti-enumeration).
app.post('/api/auth/sign-up/email', async (req, res, next) => {
  try {
    const { getEmailRegistrationStatus } = await import('./config/otpRateLimit.js')
    const status = await getEmailRegistrationStatus(req.body?.email)
    if (status.exists) {
      return res.status(400).json({
        message: status.message,
        error: status.message,
        code: 'EMAIL_ALREADY_REGISTERED',
      })
    }
    return next()
  } catch (err) {
    return next(err)
  }
})

// Rate-limit OTP + blokir email yang sudah terverifikasi
app.post('/api/auth/email-otp/send-verification-otp', async (req, res, next) => {
  try {
    const email = req.body?.email
    const type = req.body?.type || 'email-verification'
    const { assertOtpSendAllowed } = await import('./config/otpRateLimit.js')
    const gate = await assertOtpSendAllowed(email, { type })
    if (!gate.ok) {
      const status = gate.code === 'EMAIL_ALREADY_REGISTERED' ? 400 : 429
      return res.status(status).json({
        message: gate.message,
        error: gate.message,
        code: gate.code,
        retryAfterSec: gate.retryAfterSec ?? null,
        remaining: gate.remaining ?? 0,
      })
    }
    return next()
  } catch (err) {
    return next(err)
  }
})

// Better Auth handler — native Web API (Request→Response), bridge from Express
app.use('/api/auth', async (req, res, next) => {
  try {
    const host = req.get('host') || `localhost:${config.port}`;
    const proto = req.protocol || 'http';
    const url = `${proto}://${host}${req.originalUrl}`;

    // Build headers from Express req
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach(v => headers.append(key, v));
      else if (value) headers.set(key, value);
    }

    // Build body
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      body = JSON.stringify(req.body);
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    }

    const nativeReq = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    const nativeRes = await auth.handler(nativeReq);

    // Write Express response from native Response
    res.status(nativeRes.status);
    nativeRes.headers.forEach((value, key) => res.setHeader(key, value));
    const text = await nativeRes.text();
    if (text) res.send(text);
    else res.end();
  } catch (err) {
    next(err);
  }
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GenCV API Docs',
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Production: serve built frontend from dist/
if (config.nodeEnv === 'production') {
  const distPath = new URL('../../../dist', import.meta.url).pathname;
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(distPath + '/index.html');
  });
}

// API Routes
app.use('/api/cv', cvRoutes);
app.use('/api/letter', letterRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/midtrans', midtransRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/profile', profileRoutes);
app.use(Sentry.expressErrorHandler());
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

// Prevent hanging connections on slow upstreams
server.timeout = 30000;
server.keepAliveTimeout = 5000;
server.headersTimeout = 6500;

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
