const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db');
const { sendWelcomeEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 4000;
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
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function createUser(email, passwordHash) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, email });
    });
  });
}

function recordLoginEvent(userId, type) {
  db.run('INSERT INTO login_events (user_id, type) VALUES (?, ?)', [userId, type]);
}

function authGuard(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(email, passwordHash);
    recordLoginEvent(user.id, 'signup');
    sendWelcomeEmail(email);
    req.session.userId = user.id;

    res.status(201).json({ user });
  } catch (error) {
    console.error('Registration failed', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      recordLoginEvent(user.id, 'failed_login');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    recordLoginEvent(user.id, 'login');
    res.json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
  } catch (error) {
    console.error('Login failed', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/auth/me', authGuard, async (req, res) => {
  try {
    const user = await getUserById(req.session.userId);
    res.json({ user });
  } catch (error) {
    console.error('Fetching user failed', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/secure/message', authGuard, async (req, res) => {
  const user = await getUserById(req.session.userId);
  res.json({ message: `Welcome back, ${user.email}!`, user });
});

app.get('/api/auth/events', authGuard, (req, res) => {
  db.all(
    'SELECT type, created_at FROM login_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [req.session.userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to load events', err);
        return res.status(500).json({ error: 'Could not fetch events' });
      }
      res.json({ events: rows });
    }
  );
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
