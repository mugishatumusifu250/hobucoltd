import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const frontendRoot = path.resolve(backendRoot, '../frontend');
const clientDist = path.join(frontendRoot, 'dist');
const frontendPublic = path.join(frontendRoot, 'public');
const port = Number(process.env.PORT || 3001);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hobucoltd';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-hobuco-session-secret',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI ? MongoStore.create({ mongoUrl: mongoUri, collectionName: 'sessions' }) : undefined,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'hobucoltd-api', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api', apiRouter);

app.use(express.static(frontendPublic));
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  const indexFile = path.join(clientDist, 'index.html');
  res.sendFile(indexFile, (error) => {
    if (error) next();
  });
});

async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoUri.replace(/:\/\/.*@/, '://***@')}`);
  } catch (error) {
    console.error('MongoDB connection failed. Set MONGODB_URI and make sure MongoDB is running.', error.message);
    process.exitCode = 1;
    return;
  }
  app.listen(port, () => console.log(`HOBUCO server running on http://localhost:${port}`));
}

if (process.env.NODE_ENV !== 'test') start();

export default app;
