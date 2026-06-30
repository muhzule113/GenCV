import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import cvRoutes from './routes/cvRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';

const app = express();

app.disable('etag');
app.use(cors({ origin: config.cors.clientUrl }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GenerateCV Backend' });
});

app.use('/api/cv', cvRoutes);
app.use('/api/letter', letterRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/tokens', tokenRoutes);
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

export default app;
