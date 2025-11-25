import express from 'express';
import session from 'express-session';
import cors from 'cors';
import db from './database/connection.js';
import { authGuard } from './util/authGuard.js';
import { getUserById } from './database/user/user.js';

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mandatory-ii-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

import authRouter from './routers/authRouter.js';
app.use(authRouter);

app.get('/api/secure/message', authGuard, async (req, res) => {
  const user = await getUserById(req.session.userId);
  res.send({ message: `Welcome back, ${user.email}!`, user });
});

app.get('/api/auth/events', authGuard, async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT type, created_at FROM login_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.session.userId]);
    res.send({ events: rows });
  } catch (error) {
    console.error('Failed to load events', err);
    return res.status(500).send({ error: 'Could not fetch events' });
  }
});

app.use((req, res) => {
  res.status(404).send({ error: 'Not found' });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Auth server listening on port:", PORT);
});
