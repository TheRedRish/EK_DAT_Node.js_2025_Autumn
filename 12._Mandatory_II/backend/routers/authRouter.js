import { Router } from 'express';
import { sendWelcomeEmail } from '../util/mailer.js';
import { authGuard } from '../util/authGuard.js';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserById, createUser } from '../database/user/user.js';
import { recordLoginEvent } from '../database/login/login.js';

const router = Router();

router.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required' });
    }

    try {
        console.log("getting user");
        const existingUser = await getUserByEmail(email);
        console.log(existingUser);
        if (existingUser) {
            return res.status(409).send({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await createUser(email, passwordHash);
        recordLoginEvent(user.id, 'signup');
        sendWelcomeEmail(email);
        req.session.userId = user.id;

        res.status(201).send({ user });
    } catch (error) {
        console.error('Registration failed', error);
        res.status(500).send({ error: 'Failed to register' });
    }
});

router.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required' });
    }

    try {
        const user = await db.all('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            recordLoginEvent(user.id, 'failed_login');
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        recordLoginEvent(user.id, 'login');
        res.send({ user: { id: user.id, email: user.email, created_at: user.created_at } });
    } catch (error) {
        console.error('Login failed', error);
        res.status(500).send({ error: 'Failed to login' });
    }
});

router.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.send({ message: 'Logged out' });
    });
});

router.get('/api/auth/session', authGuard, async (req, res) => {
    try {
        const user = await getUserById(req.session.userId);
        res.send({ user });
    } catch (error) {
        console.error('Fetching user failed', error);
        res.status(500).send({ error: 'Failed to fetch user' });
    }
});

export default router;